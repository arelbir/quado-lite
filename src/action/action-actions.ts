"use server";

import { db } from "@/drizzle/db";
import { actions, findings, dofs } from "@/drizzle/schema";
import { currentUser } from "@/lib/auth";
import { eq, and, not, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResponse<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

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
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Bulgunun Süreç Sahibi olduğunu kontrol et
    const finding = await db.query.findings.findFirst({
      where: eq(findings.id, data.findingId),
    });

    if (!finding) {
      return { success: false, error: "Finding not found" };
    }

    if (finding.assignedToId !== user.id && user.role !== "admin") {
      return { 
        success: false, 
        error: "Only process owner can create actions" 
      };
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

    // Finding'i InProgress durumuna getir
    await db
      .update(findings)
      .set({
        status: "InProgress",
        updatedAt: new Date(),
      })
      .where(eq(findings.id, data.findingId));

    revalidatePath("/findings");
    revalidatePath("/actions");
    return { success: true, data: { id: action!.id } };
  } catch (error) {
    console.error("Error creating action:", error);
    return { success: false, error: "Failed to create action" };
  }
}

/**
 * FR-004: Aksiyon Sorumlusu, Aksiyonu Tamamlayabilir
 * Sorumlu, aksiyonu tamamladığını işaretler (Yönetici onayına gider)
 */
export async function completeAction(
  actionId: string,
  completionNotes: string
): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const action = await db.query.actions.findFirst({
      where: eq(actions.id, actionId),
    });

    if (!action) {
      return { success: false, error: "Action not found" };
    }

    // Sadece atanan Sorumlu tamamlayabilir
    if (action.assignedToId !== user.id && user.role !== "admin") {
      return { 
        success: false, 
        error: "Only assigned user can complete this action" 
      };
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

    revalidatePath("/actions");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error completing action:", error);
    return { success: false, error: "Failed to complete action" };
  }
}

/**
 * FR-004: Aksiyon Yöneticisi, Aksiyonu Onaylayabilir
 */
export async function approveAction(
  actionId: string
): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const action = await db.query.actions.findFirst({
      where: eq(actions.id, actionId),
    });

    if (!action) {
      return { success: false, error: "Action not found" };
    }

    // Sadece atanan Yönetici onaylayabilir
    if (action.managerId !== user.id && user.role !== "admin") {
      return { 
        success: false, 
        error: "Only assigned manager can approve this action" 
      };
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

    // Bulgunun diğer alt görevlerini kontrol et (eğer finding varsa)
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

      // Hiç bekleyen görev yoksa bulguyu güncelle
      if (remainingTasks === 0) {
        await db
          .update(findings)
          .set({
            status: "InProgress", // Süreç sahibi artık kapanışa gönderebilir
            updatedAt: new Date(),
          })
          .where(eq(findings.id, action.findingId));
      }
    }

    revalidatePath("/actions");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error approving action:", error);
    return { success: false, error: "Failed to approve action" };
  }
}

/**
 * FR-004: Aksiyon Yöneticisi, Aksiyonu Reddedebilir
 */
export async function rejectAction(
  actionId: string,
  reason?: string
): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const action = await db.query.actions.findFirst({
      where: eq(actions.id, actionId),
    });

    if (!action) {
      return { success: false, error: "Action not found" };
    }

    // Sadece atanan Yönetici reddedebilir
    if (action.managerId !== user.id && user.role !== "admin") {
      return { 
        success: false, 
        error: "Only assigned manager can reject this action" 
      };
    }

    await db
      .update(actions)
      .set({
        status: "Rejected",
        rejectionReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(actions.id, actionId));

    revalidatePath("/actions");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error rejecting action:", error);
    return { success: false, error: "Failed to reject action" };
  }
}

/**
 * Belirli bir bulguya ait aksiyonları getir
 */
export async function getActionsByFinding(findingId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    return await db.query.actions.findMany({
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
  } catch (error) {
    console.error("Error fetching actions:", error);
    throw error;
  }
}

/**
 * Kullanıcının aksiyonlarını getir (Sorumlu veya Yönetici olarak)
 */
export async function getMyActions() {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Admin tüm aksiyonları görebilir
    if (user.role === "admin" || user.role === "superAdmin") {
      return await db.query.actions.findMany({
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
    }

    // Kullanıcının sorumlusu veya yöneticisi olduğu aksiyonlar
    return await db.query.actions.findMany({
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
  } catch (error) {
    console.error("Error fetching my actions:", error);
    throw error;
  }
}
