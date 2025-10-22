"use server";

import { db } from "@/drizzle/db";
import { dofs, dofActivities, findings } from "@/drizzle/schema";
import { currentUser } from "@/lib/auth";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResponse<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * FR-003: Süreç Sahibi, DÖF Oluşturabilir
 * Bulguya bağlı bir DÖF (CAPA) kaydı başlatır
 */
export async function createDof(data: {
  findingId: string;
  problemTitle: string;
  problemDetails?: string;
  assignedToId: string;
  managerId: string;
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
        error: "Only process owner can create DOF" 
      };
    }

    const [dof] = await db
      .insert(dofs)
      .values({
        findingId: data.findingId,
        problemTitle: data.problemTitle,
        problemDetails: data.problemDetails,
        assignedToId: data.assignedToId,
        managerId: data.managerId,
        status: "Step1_Problem",
        createdById: user.id,
      })
      .returning({ id: dofs.id });

    // Finding'i InProgress durumuna getir
    await db
      .update(findings)
      .set({
        status: "InProgress",
        updatedAt: new Date(),
      })
      .where(eq(findings.id, data.findingId));

    revalidatePath("/findings");
    revalidatePath("/dofs");
    return { success: true, data: { id: dof!.id } };
  } catch (error) {
    console.error("Error creating DOF:", error);
    return { success: false, error: "Failed to create DOF" };
  }
}

/**
 * FR-007-FR-012: DÖF Sorumlusu, DÖF Adımlarını Güncelleyebilir
 * 7 adımlı süreci ilerletir
 */
export async function updateDofStep(
  dofId: string,
  stepData: {
    step: "Step1_Problem" | "Step2_TempMeasures" | "Step3_RootCause" | 
          "Step4_Activities" | "Step5_Implementation" | "Step6_EffectivenessCheck";
    data: Record<string, any>;
  }
): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const dof = await db.query.dofs.findFirst({
      where: eq(dofs.id, dofId),
    });

    if (!dof) {
      return { success: false, error: "DOF not found" };
    }

    // Sadece atanan Sorumlu veya Admin güncelleyebilir
    if (dof.assignedToId !== user.id && user.role !== "admin") {
      return { 
        success: false, 
        error: "Only assigned user can update DOF steps" 
      };
    }

    // Adım verilerine göre güncelleme
    const updateData: any = {
      status: stepData.step,
      updatedAt: new Date(),
    };

    switch (stepData.step) {
      case "Step1_Problem":
        updateData.problemTitle = stepData.data.problemTitle;
        updateData.problemDetails = stepData.data.problemDetails;
        break;
      case "Step2_TempMeasures":
        updateData.tempMeasures = stepData.data.tempMeasures;
        break;
      case "Step3_RootCause":
        updateData.rootCauseAnalysis = stepData.data.rootCauseAnalysis;
        updateData.rootCauseFileUrl = stepData.data.rootCauseFileUrl;
        break;
      case "Step6_EffectivenessCheck":
        updateData.effectivenessCheck = stepData.data.effectivenessCheck;
        updateData.effectivenessCheckDate = stepData.data.effectivenessCheckDate;
        break;
    }

    await db
      .update(dofs)
      .set(updateData)
      .where(eq(dofs.id, dofId));

    revalidatePath("/dofs");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating DOF step:", error);
    return { success: false, error: "Failed to update DOF step" };
  }
}

/**
 * FR-010: DÖF Adım 4 - Faaliyet Ekleme
 * Düzeltici veya Önleyici faaliyetler ekler
 */
export async function addDofActivity(data: {
  dofId: string;
  description: string;
  type: "Düzeltici" | "Önleyici";
  dueDate?: Date;
  responsibleId: string;
}): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const dof = await db.query.dofs.findFirst({
      where: eq(dofs.id, data.dofId),
    });

    if (!dof) {
      return { success: false, error: "DOF not found" };
    }

    if (dof.assignedToId !== user.id && user.role !== "admin") {
      return { 
        success: false, 
        error: "Only assigned user can add activities" 
      };
    }

    const [activity] = await db
      .insert(dofActivities)
      .values({
        dofId: data.dofId,
        description: data.description,
        type: data.type,
        dueDate: data.dueDate,
        responsibleId: data.responsibleId,
        isCompleted: false,
      })
      .returning({ id: dofActivities.id });

    // DOF'u Step4_Activities durumuna getir
    await db
      .update(dofs)
      .set({
        status: "Step4_Activities",
        updatedAt: new Date(),
      })
      .where(eq(dofs.id, data.dofId));

    revalidatePath("/dofs");
    return { success: true, data: { id: activity!.id } };
  } catch (error) {
    console.error("Error adding DOF activity:", error);
    return { success: false, error: "Failed to add activity" };
  }
}

/**
 * FR-011: Faaliyet Sorumlusu, Faaliyeti Tamamlayabilir
 */
export async function completeDofActivity(
  activityId: string
): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const activity = await db.query.dofActivities.findFirst({
      where: eq(dofActivities.id, activityId),
    });

    if (!activity) {
      return { success: false, error: "Activity not found" };
    }

    if (activity.responsibleId !== user.id && user.role !== "admin") {
      return { 
        success: false, 
        error: "Only responsible user can complete this activity" 
      };
    }

    await db
      .update(dofActivities)
      .set({
        isCompleted: true,
        completedAt: new Date(),
      })
      .where(eq(dofActivities.id, activityId));

    revalidatePath("/dofs");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error completing activity:", error);
    return { success: false, error: "Failed to complete activity" };
  }
}

/**
 * DÖF Sorumlusu, Tüm Adımları Tamamlayınca Yönetici Onayına Gönderir
 */
export async function submitDofForApproval(
  dofId: string
): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const dof = await db.query.dofs.findFirst({
      where: eq(dofs.id, dofId),
    });

    if (!dof) {
      return { success: false, error: "DOF not found" };
    }

    if (dof.assignedToId !== user.id && user.role !== "admin") {
      return { 
        success: false, 
        error: "Only assigned user can submit for approval" 
      };
    }

    // Tüm faaliyetlerin tamamlandığını kontrol et
    const [pendingActivitiesCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(dofActivities)
      .where(
        and(
          eq(dofActivities.dofId, dofId),
          eq(dofActivities.isCompleted, false)
        )
      );

    if ((pendingActivitiesCount?.count || 0) > 0) {
      return {
        success: false,
        error: `${pendingActivitiesCount?.count} faaliyet henüz tamamlanmadı. Tüm faaliyetler tamamlanmalıdır.`
      };
    }

    await db
      .update(dofs)
      .set({
        status: "PendingManagerApproval",
        updatedAt: new Date(),
      })
      .where(eq(dofs.id, dofId));

    revalidatePath("/dofs");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error submitting DOF for approval:", error);
    return { success: false, error: "Failed to submit DOF" };
  }
}

/**
 * FR-013: DÖF Yöneticisi, DÖF'ü Onaylayabilir
 */
export async function approveDof(
  dofId: string
): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const dof = await db.query.dofs.findFirst({
      where: eq(dofs.id, dofId),
    });

    if (!dof) {
      return { success: false, error: "DOF not found" };
    }

    if (dof.managerId !== user.id && user.role !== "admin") {
      return { 
        success: false, 
        error: "Only assigned manager can approve DOF" 
      };
    }

    if (dof.status !== "PendingManagerApproval") {
      return { 
        success: false, 
        error: "DOF must be submitted for approval first" 
      };
    }

    await db
      .update(dofs)
      .set({
        status: "Completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(dofs.id, dofId));

    revalidatePath("/dofs");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error approving DOF:", error);
    return { success: false, error: "Failed to approve DOF" };
  }
}

/**
 * FR-013: DÖF Yöneticisi, DÖF'ü Reddedebilir
 */
export async function rejectDof(
  dofId: string,
  reason?: string
): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const dof = await db.query.dofs.findFirst({
      where: eq(dofs.id, dofId),
    });

    if (!dof) {
      return { success: false, error: "DOF not found" };
    }

    if (dof.managerId !== user.id && user.role !== "admin") {
      return { 
        success: false, 
        error: "Only assigned manager can reject DOF" 
      };
    }

    await db
      .update(dofs)
      .set({
        status: "Rejected",
        updatedAt: new Date(),
      })
      .where(eq(dofs.id, dofId));

    revalidatePath("/dofs");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error rejecting DOF:", error);
    return { success: false, error: "Failed to reject DOF" };
  }
}

/**
 * Belirli bir bulguya ait DÖF'leri getir
 */
export async function getDofsByFinding(findingId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    return await db.query.dofs.findMany({
      where: eq(dofs.findingId, findingId),
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
      orderBy: (dofs, { desc }) => [desc(dofs.createdAt)],
    });
  } catch (error) {
    console.error("Error fetching DOFs:", error);
    throw error;
  }
}

/**
 * DÖF'ün faaliyetlerini getir
 */
export async function getDofActivities(dofId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    return await db.query.dofActivities.findMany({
      where: eq(dofActivities.dofId, dofId),
      with: {
        responsible: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: (dofActivities, { asc }) => [asc(dofActivities.createdAt)],
    });
  } catch (error) {
    console.error("Error fetching DOF activities:", error);
    throw error;
  }
}

/**
 * Kullanıcının DÖF'lerini getir
 */
export async function getMyDofs() {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Admin tüm DÖF'leri görebilir
    if (user.role === "admin" || user.role === "superAdmin") {
      return await db.query.dofs.findMany({
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
        orderBy: (dofs, { desc }) => [desc(dofs.createdAt)],
      });
    }

    // Kullanıcının sorumlusu veya yöneticisi olduğu DÖF'ler
    return await db.query.dofs.findMany({
      where: (dofs, { or, eq }) =>
        or(
          eq(dofs.assignedToId, user.id),
          eq(dofs.managerId, user.id)
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
      orderBy: (dofs, { desc }) => [desc(dofs.createdAt)],
    });
  } catch (error) {
    console.error("Error fetching my DOFs:", error);
    throw error;
  }
}

/**
 * DÖF Activity Oluştur
 */
export async function createDofActivity(data: {
  dofId: string;
  description: string;
  type: "Düzeltici" | "Önleyici";
  responsibleId?: string | null;
  dueDate?: Date | null;
}): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const [activity] = await db
      .insert(dofActivities)
      .values({
        dofId: data.dofId,
        description: data.description,
        type: data.type,
        responsibleId: data.responsibleId,
        dueDate: data.dueDate,
        isCompleted: false,
      })
      .returning({ id: dofActivities.id });

    revalidatePath(`/dofs/${data.dofId}`);
    return { success: true, data: { id: activity!.id } };
  } catch (error) {
    console.error("Error creating DOF activity:", error);
    return { success: false, error: "Failed to create activity" };
  }
}
