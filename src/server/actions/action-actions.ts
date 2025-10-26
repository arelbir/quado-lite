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
}): Promise<ActionResponse<{ id: string }>> {
  return withAuth<{ id: string }>(async (user: User) => {
    const finding = await db.query.findings.findFirst({
      where: eq(findings.id, data.findingId),
    });

    if (!finding) {
      return createNotFoundError<{ id: string }>("Finding");
    }

    // Check permission: Process owner or admin
    const isAdmin = user.userRoles?.some((ur: any) => ur.role?.code === 'ADMIN' || ur.role?.code === 'SUPER_ADMIN');
    if (finding.assignedToId !== user.id && !isAdmin) {
      return createPermissionError<{ id: string }>("Only process owner can create actions");
    }

    const [action] = await db
      .insert(actions)
      .values({
        findingId: data.findingId,
        details: data.details,
        assignedToId: data.assignedToId,
        managerId: data.managerId,
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

    // Check permission: DOF owner or admin
    const isAdmin = user.userRoles?.some((ur: any) => ur.role?.code === 'ADMIN' || ur.role?.code === 'SUPER_ADMIN');
    if (dof.assignedToId !== user.id && !isAdmin) {
      return createPermissionError<{ id: string }>("Only DÖF owner can create actions");
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

    // Check permission: Assigned user or admin
    const isAdmin = user.userRoles?.some((ur: any) => ur.role?.code === 'ADMIN' || ur.role?.code === 'SUPER_ADMIN');
    if (action.assignedToId !== user.id && !isAdmin) {
      return createPermissionError("Only assigned user can complete this action");
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

    // Check permission: Manager or admin
    const isAdmin = user.userRoles?.some((ur: any) => 
      ur.role?.code === 'ADMIN' || ur.role?.code === 'SUPER_ADMIN'
    );
    
    if (action.managerId !== user.id && !isAdmin) {
      return createPermissionError("Only assigned manager can approve this action");
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

    // Check permission: Manager or admin
    const isAdmin = user.userRoles?.some((ur: any) => 
      ur.role?.code === 'ADMIN' || ur.role?.code === 'SUPER_ADMIN'
    );
    
    if (action.managerId !== user.id && !isAdmin) {
      return createPermissionError("Only assigned manager can reject this action");
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

    if (action.managerId !== user.id && action.createdById !== user.id) {
      return createPermissionError("Only manager or creator can cancel this action");
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

    if (action.assignedToId !== user.id) {
      return createPermissionError<{ id: string }>("Only assigned user can add progress notes");
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
  const result = await withAuth(async () => {
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
 */
export async function getMyActions() {
  const result = await withAuth(async (user: User) => {
    // Check if user is admin
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
