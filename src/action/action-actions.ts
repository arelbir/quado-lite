"use server";

import { db } from "@/drizzle/db";
import { actions, findings, dofs } from "@/drizzle/schema";
import { actionProgress } from "@/drizzle/schema/action-progress";
import { eq, and, not, sql } from "drizzle-orm";
import type { ActionResponse, User, Action } from "@/lib/types";
import { 
  withAuth, 
  createNotFoundError, 
  createPermissionError,
  revalidateActionPaths,
  revalidateFindingPaths,
  revalidateDOFPaths,
} from "@/lib/helpers";

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

    if (finding.assignedToId !== user.id && user.role !== "admin") {
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
      .returning({ id: actions.id });

    await db
      .update(findings)
      .set({
        status: "InProgress",
        updatedAt: new Date(),
      })
      .where(eq(findings.id, data.findingId));

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

    if (dof.assignedToId !== user.id && user.role !== "admin") {
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
 * FR-004: Aksiyon Sorumlusu, Aksiyonu Tamamlayabilir
 * Sorumlu, aksiyonu tamamladığını işaretler (Yönetici onayına gider)
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

    if (action.assignedToId !== user.id && user.role !== "admin") {
      return createPermissionError("Only assigned user can complete this action");
    }

    await db
      .update(actions)
      .set({
        status: "PendingManagerApproval",
        completionNotes,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(actions.id, actionId));

    revalidateActionPaths({ list: true });
    return { success: true, data: undefined };
  });
}

/**
 * FR-004: Aksiyon Yöneticisi, Aksiyonu Onaylayabilir
 */
export async function approveAction(
  actionId: string
): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    const action = await db.query.actions.findFirst({
      where: eq(actions.id, actionId),
    });

    if (!action) {
      return createNotFoundError("Action");
    }

    if (action.managerId !== user.id && user.role !== "admin") {
      return createPermissionError("Only assigned manager can approve this action");
    }

    if (action.status !== "PendingManagerApproval") {
      return { 
        success: false, 
        error: "Action must be completed by responsible first" 
      };
    }

    await db
      .update(actions)
      .set({
        status: "Completed",
        updatedAt: new Date(),
      })
      .where(eq(actions.id, actionId));

    // Bulgunun diğer alt görevlerini kontrol et
    if (action.findingId) {
      const [remainingActionsCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(actions)
        .where(
          and(
            eq(actions.findingId, action.findingId),
            not(eq(actions.status, "Completed"))
          )
        );

      const [remainingDofsCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(dofs)
        .where(
          and(
            eq(dofs.findingId, action.findingId),
            not(eq(dofs.status, "Completed"))
          )
        );

      const remainingTasks = (remainingActionsCount?.count || 0) + (remainingDofsCount?.count || 0);

      if (remainingTasks === 0) {
        await db
          .update(findings)
          .set({
            status: "InProgress",
            updatedAt: new Date(),
          })
          .where(eq(findings.id, action.findingId));
      }
    }

    revalidateActionPaths({ list: true });
    return { success: true, data: undefined };
  });
}

/**
 * FR-004: Aksiyon Yöneticisi, Aksiyonu Reddedebilir
 * 
 * WORKFLOW: Reject → Assigned (Döngü)
 * - Status "Assigned"a döner
 * - Sorumlu tekrar çalışabilir
 * - Red nedeni kaydedilir (timeline'da görünür)
 */
export async function rejectAction(
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

    if (action.managerId !== user.id) {
      return createPermissionError("Only assigned manager can reject this action");
    }

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
        assignedTo: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        manager: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
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
    if (user.role === "admin" || user.role === "superAdmin") {
      const data = await db.query.actions.findMany({
        with: {
          finding: true,
          assignedTo: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
          manager: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
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
        finding: true,
        assignedTo: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        manager: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
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
