"use server";

import { db } from "@/drizzle/db";
import { actions, findings, dofs } from "@/drizzle/schema";
import { actionProgress } from "@/drizzle/schema/action-progress";
import { eq, and, not, sql } from "drizzle-orm";
import type { ActionResponse, User, Action } from "@/lib/types";
import { 
  withAuth, 
  requireAdmin,
  createNotFoundError, 
  createPermissionError,
  revalidateActionPaths,
  revalidateFindingPaths,
  revalidateDOFPaths,
} from "@/lib/helpers";
import { checkPermission } from "@/lib/permissions/unified-permission-checker";
import { startWorkflow } from "@/server/actions/workflow-actions";
import { getActionWorkflowId, buildActionMetadata } from "@/lib/workflow/workflow-integration";

/**
 * FR-003: Süreç Sahibi, Aksiyon Oluşturabilir
 * Bulguya bağlı basit bir aksiyon oluşturur
 */
export async function createAction(data: {
  findingId: string;
  details: string;
  assignedToId: string;
  managerId?: string | null;
  dueDate?: Date;
}): Promise<ActionResponse<{ id: string }>> {
  return withAuth<{ id: string }>(async (user: User) => {
    const finding = await db.query.findings.findFirst({
      where: eq(findings.id, data.findingId),
    });

    if (!finding) {
      return createNotFoundError<{ id: string }>("Finding");
    }

    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "action",
      action: "create",
      entity: {
        id: finding.id,
        assignedToId: finding.assignedToId,
        createdById: finding.createdById,
        status: finding.status,
      },
    });

    if (!perm.allowed) {
      return createPermissionError<{ id: string }>(perm.reason || "Permission denied");
    }

    const [action] = await db
      .insert(actions)
      .values({
        findingId: data.findingId,
        details: data.details,
        assignedToId: data.assignedToId,
        managerId: data.managerId,
        dueDate: data.dueDate,
        status: "Assigned",
        createdById: user.id,
      })
      .returning();

    await db
      .update(findings)
      .set({
        status: "InProgress",
        updatedAt: new Date(),
      })
      .where(eq(findings.id, data.findingId));

    // Workflow başlat
    try {
      const workflowId = await getActionWorkflowId({
        priority: (action as any).priority,
        type: (action as any).type,
        findingId: data.findingId,
      });

      if (workflowId) {
        await startWorkflow({
          workflowDefinitionId: workflowId,
          entityType: "Action",
          entityId: action!.id,
          entityMetadata: buildActionMetadata(action),
        });
      }
    } catch (error) {
      console.error("Workflow start failed:", error);
    }

    revalidateFindingPaths({ list: true });
    revalidateActionPaths({ list: true });
    
    return { success: true, data: { id: action!.id } };
  });
}

/**
 * HYBRID: DÖF'e Aksiyon Ekle (Corrective/Preventive)
 * DÖF Step 4'te kullanılır - Action modülünü tekrar kullanır (DRY)
 */
export async function createDofAction(data: {
  dofId: string;
  type: "Corrective" | "Preventive";
  details: string;
  assignedToId: string;
  managerId?: string | null;
}): Promise<ActionResponse<{ id: string }>> {
  return withAuth<{ id: string }>(async (user: User) => {
    const dof = await db.query.dofs.findFirst({
      where: eq(dofs.id, data.dofId),
    });

    if (!dof) {
      return createNotFoundError<{ id: string }>("DÖF");
    }

    // ✅ UNIFIED PERMISSION CHECK (DOF update permission)
    const perm = await checkPermission({
      user: user as any,
      resource: "dof",
      action: "update",
      entity: {
        id: dof.id,
        assignedToId: dof.assignedToId,
        createdById: dof.createdById,
        status: dof.status,
      },
    });

    if (!perm.allowed) {
      return createPermissionError<{ id: string }>(perm.reason || "Permission denied");
    }

    const [action] = await db
      .insert(actions)
      .values({
        dofId: data.dofId,
        findingId: null,
        type: data.type,
        details: data.details,
        assignedToId: data.assignedToId,
        managerId: data.managerId,
        status: "Assigned",
        createdById: user.id,
      })
      .returning({ id: actions.id });

    revalidateDOFPaths({ list: true, specific: data.dofId });
    revalidateActionPaths({ list: true });
    
    return { success: true, data: { id: action!.id } };
  });
}

/**
 * FR-004: Mark Action as Complete (Workflow Integration)
 * Status: Assigned → InProgress
 * Sorumlu aksiyonu tamamladığını işaretler, workflow başlatılır
 */
export async function completeAction(
  actionId: string,
  completionNotes: string
): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    const action = await db.query.actions.findFirst({
      where: eq(actions.id, actionId),
    });

    if (!action) {
      return createNotFoundError("Action");
    }

    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "action",
      action: "complete",
      entity: {
        id: action.id,
        assignedToId: action.assignedToId,
        createdById: action.createdById,
        status: action.status,
      },
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    // Update action to InProgress
    await db
      .update(actions)
      .set({
        status: "InProgress",
        completionNotes,
        updatedAt: new Date(),
      })
      .where(eq(actions.id, actionId));

    revalidateActionPaths({ list: true });
    return { success: true, data: undefined };
  });
}

/**
 * FR-004: Yönetici Aksiyonu Onayla
 * Manager approves completed action → Completed (final)
 * CAPA COMPLIANCE: Manager approval step
 */
export async function managerApproveAction(actionId: string): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    const action = await db.query.actions.findFirst({
      where: eq(actions.id, actionId),
    });

    if (!action) {
      return createNotFoundError("Action");
    }

    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "action",
      action: "approve",
      entity: {
        id: action.id,
        assignedToId: action.assignedToId,
        managerId: action.managerId,
        createdById: action.createdById,
        status: action.status,
      },
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    if (action.status !== "InProgress") {
      return createPermissionError("Only InProgress actions can be approved");
    }

    // Approve: InProgress → Completed
    await db
      .update(actions)
      .set({
        status: "Completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(actions.id, actionId));

    revalidateActionPaths({ list: true, specific: actionId });
    return { success: true, data: undefined };
  });
}

/**
 * FR-004: Yönetici Aksiyonu Reddet
 * Manager rejects action → Back to Assigned for rework
 * CAPA COMPLIANCE: Reject loop - action returns to assignee
 */
export async function managerRejectAction(
  actionId: string,
  reason: string
): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    const action = await db.query.actions.findFirst({
      where: eq(actions.id, actionId),
    });

    if (!action) {
      return createNotFoundError("Action");
    }

    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "action",
      action: "reject",
      entity: {
        id: action.id,
        assignedToId: action.assignedToId,
        managerId: action.managerId,
        createdById: action.createdById,
        status: action.status,
      },
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    if (action.status !== "InProgress") {
      return createPermissionError("Only InProgress actions can be rejected");
    }

    // Reject: InProgress → Assigned (back to assignee for rework)
    await db
      .update(actions)
      .set({
        status: "Assigned",
        rejectionReason: reason,
        completedAt: null,
        completionNotes: null,
        updatedAt: new Date(),
      })
      .where(eq(actions.id, actionId));

    revalidateActionPaths({ list: true, specific: actionId });
    return { success: true, data: undefined };
  });
}

/**
 * FR-005: Aksiyon İptal Et
 * 
 * EXIT STRATEGY: Döngüyü kırmak için
 * - Yönetici veya Oluşturan iptal edebilir
 * - Status "Cancelled" olur (final state)
 * - Tekrar açılamaz, döngüden çıkış
 */
export async function cancelAction(
  actionId: string,
  reason?: string
): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    const action = await db.query.actions.findFirst({
      where: eq(actions.id, actionId),
    });

    if (!action) {
      return createNotFoundError("Action");
    }

    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "action",
      action: "cancel",
      entity: {
        id: action.id,
        assignedToId: action.assignedToId,
        managerId: action.managerId,
        createdById: action.createdById,
        status: action.status,
      },
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    await db
      .update(actions)
      .set({
        status: "Cancelled",
        rejectionReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(actions.id, actionId));

    revalidateActionPaths({ list: true, specific: actionId });
    return { success: true, data: undefined };
  });
}

/**
 * Aksiyon İlerleme Notu Ekle
 * 
 * Kullanım: Aksiyon henüz tamamlanmadı ama bir şeyler yapıldı
 * - "Bugün hata analizi yaptım"
 * - "Yarın fix uygulayacağım"
 * - Timeline'da görünür
 */
export async function addActionProgress(
  actionId: string,
  note: string
): Promise<ActionResponse<{ id: string }>> {
  return withAuth<{ id: string }>(async (user: User) => {
    const action = await db.query.actions.findFirst({
      where: eq(actions.id, actionId),
    });

    if (!action) {
      return createNotFoundError<{ id: string }>("Action");
    }

    // ✅ UNIFIED PERMISSION CHECK (action update permission)
    const perm = await checkPermission({
      user: user as any,
      resource: "action",
      action: "update",
      entity: {
        id: action.id,
        assignedToId: action.assignedToId,
        createdById: action.createdById,
        status: action.status,
      },
    });

    if (!perm.allowed) {
      return createPermissionError<{ id: string }>(perm.reason || "Permission denied");
    }

    const [progressNote] = await db
      .insert(actionProgress)
      .values({
        actionId,
        note,
        createdById: user.id,
      })
      .returning({ id: actionProgress.id });

    revalidateActionPaths({ specific: actionId });
    return { success: true, data: { id: progressNote!.id } };
  });
}

/**
 * Belirli bir bulguya ait aksiyonları getir
 */
export async function getActionsByFinding(findingId: string) {
  const result = await withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK (finding read permission)
    const finding = await db.query.findings.findFirst({
      where: eq(findings.id, findingId),
    });

    if (finding) {
      const perm = await checkPermission({
        user: user as any,
        resource: "finding",
        action: "read",
        entity: {
          id: finding.id,
          assignedToId: finding.assignedToId,
          createdById: finding.createdById,
          status: finding.status,
        },
      });

      if (!perm.allowed) {
        return { success: false, error: perm.reason || "Permission denied" };
      }
    }

    const data = await db.query.actions.findMany({
      where: eq(actions.findingId, findingId),
      with: {
        createdBy: true,
        manager: true,
      },
      orderBy: (actions, { desc }) => [desc(actions.createdAt)],
    });
    return { success: true, data };
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}

/**
 * Kullanıcının aksiyonlarını getir (Sorumlu veya Yönetici olarak)
 * ✅ UNIFIED: Uses admin bypass from checkPermission
 */
export async function getMyActions() {
  const result = await withAuth(async (user: User) => {
    // ✅ Admin check via role system (already filtered in withAuth)
    const isAdmin = user.userRoles?.some((ur: any) => ur.role?.code === 'ADMIN' || ur.role?.code === 'SUPER_ADMIN');
    if (isAdmin) {
      const data = await db.query.actions.findMany({
        with: {
          createdBy: true,
          manager: true,
        },
        orderBy: (actions, { desc }) => [desc(actions.createdAt)],
      });
      return { success: true, data };
    }

    const data = await db.query.actions.findMany({
      where: (actions, { or, eq }) =>
        or(
          eq(actions.assignedToId, user.id),
          eq(actions.managerId, user.id)
        ),
      with: {
        createdBy: true,
        manager: true,
      },
      orderBy: (actions, { desc }) => [desc(actions.createdAt)],
    });
    return { success: true, data };
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}
