"use server";

import { db } from "@/drizzle/db";
import { dofs, dofActivities, findings } from "@/drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import type { ActionResponse, User, DOF } from "@/lib/types";
import { 
  withAuth, 
  requireAdmin,
  createNotFoundError,
  createPermissionError,
  createValidationError,
  revalidateDOFPaths,
  revalidateFindingPaths,
} from "@/lib/helpers";
import { startWorkflow } from "@/server/actions/workflow-actions";
import { getDofWorkflowId, buildDofMetadata } from "@/lib/workflow/workflow-integration";

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
  return withAuth<{ id: string }>(async (user: User) => {
    const finding = await db.query.findings.findFirst({
      where: eq(findings.id, data.findingId),
    });

    if (!finding) {
      return createNotFoundError<{ id: string }>("Finding");
    }

    if (finding.assignedToId !== user.id && user.role !== "admin") {
      return createPermissionError<{ id: string }>("Only process owner can create DOF");
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
      const workflowId = await getDofWorkflowId();

      if (workflowId) {
        await startWorkflow({
          workflowDefinitionId: workflowId,
          entityType: "DOF",
          entityId: dof!.id,
          entityMetadata: buildDofMetadata(dof),
        });
      }
    } catch (error) {
      console.error("Workflow start failed:", error);
    }

    revalidateFindingPaths({ list: true });
    revalidateDOFPaths({ list: true });
    return { success: true, data: { id: dof!.id } };
  });
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
  return withAuth(async (user: User) => {
    const dof = await db.query.dofs.findFirst({
      where: eq(dofs.id, dofId),
    });

    if (!dof) {
      return createNotFoundError("DOF");
    }

    if (dof.assignedToId !== user.id && user.role !== "admin") {
      return createPermissionError("Only assigned user can update DOF steps");
    }

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

    revalidateDOFPaths({ list: true });
    return { success: true, data: undefined };
  });
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
  return withAuth<{ id: string }>(async (user: User) => {
    const dof = await db.query.dofs.findFirst({
      where: eq(dofs.id, data.dofId),
    });

    if (!dof) {
      return createNotFoundError<{ id: string }>("DOF");
    }

    if (dof.assignedToId !== user.id && user.role !== "admin") {
      return createPermissionError<{ id: string }>("Only assigned user can add activities");
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

    await db
      .update(dofs)
      .set({
        status: "Step4_Activities",
        updatedAt: new Date(),
      })
      .where(eq(dofs.id, data.dofId));

    revalidateDOFPaths({ list: true });
    return { success: true, data: { id: activity!.id } };
  });
}

/**
 * FR-011: Faaliyet Sorumlusu, Faaliyeti Tamamlayabilir
 */
export async function completeDofActivity(
  activityId: string
): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    const activity = await db.query.dofActivities.findFirst({
      where: eq(dofActivities.id, activityId),
    });

    if (!activity) {
      return createNotFoundError("Activity");
    }

    if (activity.responsibleId !== user.id && user.role !== "admin") {
      return createPermissionError("Only responsible user can complete this activity");
    }

    await db
      .update(dofActivities)
      .set({
        isCompleted: true,
        completedAt: new Date(),
      })
      .where(eq(dofActivities.id, activityId));

    revalidateDOFPaths({ list: true });
    return { success: true, data: undefined };
  });
}

/**
 * WORKFLOW INTEGRATION: Submit DOF for Approval
 * Status: Step6 (workflow will handle approval)
 * Tüm adımlar tamamlandıktan sonra workflow başlatılır
 */
export async function submitDofForApproval(
  dofId: string
): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    const dof = await db.query.dofs.findFirst({
      where: eq(dofs.id, dofId),
    });

    if (!dof) {
      return createNotFoundError("DOF");
    }

    if (dof.assignedToId !== user.id && user.role !== "admin") {
      return createPermissionError("Only assigned user can submit for approval");
    }

    // Check all activities completed
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
      return createValidationError(
        `${pendingActivitiesCount?.count} faaliyet henüz tamamlanmadı. Tüm faaliyetler tamamlanmalıdır.`
      );
    }

    // Keep at Step6, workflow will handle approval process
    // No status change needed - workflow system takes over
    revalidateDOFPaths({ list: true });
    return { success: true, data: undefined, message: "DOF ready for workflow approval" };
  });
}

/**
 * DEPRECATED: Use workflow system instead
 * This function is kept for backward compatibility
 * Use transitionWorkflow() from workflow-actions.ts
 */
export async function approveDof(
  dofId: string
): Promise<ActionResponse> {
  console.warn('⚠️ approveDof() is deprecated. Use workflow system instead.');
  
  return withAuth(async (user: User) => {
    const dof = await db.query.dofs.findFirst({
      where: eq(dofs.id, dofId),
    });

    if (!dof) {
      return createNotFoundError("DOF");
    }

    // Complete via workflow instead
    await db
      .update(dofs)
      .set({
        status: "Completed",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(dofs.id, dofId));

    revalidateDOFPaths({ list: true });
    return { success: true, data: undefined };
  });
}

/**
 * DEPRECATED: Use workflow system instead
 * This function is kept for backward compatibility
 * Use transitionWorkflow() from workflow-actions.ts
 */
export async function rejectDof(
  dofId: string,
  reason?: string
): Promise<ActionResponse> {
  console.warn('⚠️ rejectDof() is deprecated. Use workflow system instead.');
  
  return withAuth(async (user: User) => {
    const dof = await db.query.dofs.findFirst({
      where: eq(dofs.id, dofId),
    });

    if (!dof) {
      return createNotFoundError("DOF");
    }

    // Reject: Back to Step6 for rework (not "Rejected" status)
    await db
      .update(dofs)
      .set({
        status: "Step6_EffectivenessCheck",
        updatedAt: new Date(),
      })
      .where(eq(dofs.id, dofId));

    revalidateDOFPaths({ list: true });
    return { success: true, data: undefined };
  });
}

/**
 * Belirli bir bulguya ait DÖF'leri getir
 */
export async function getDofsByFinding(findingId: string) {
  const result = await withAuth(async () => {
    const data = await db.query.dofs.findMany({
      where: eq(dofs.findingId, findingId),
      with: {
        manager: true,
        createdBy: true,
      },
      orderBy: (dofs, { desc }) => [desc(dofs.createdAt)],
    });
    return { success: true, data };
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}

/**
 * DÖF'ün faaliyetlerini getir
 */
export async function getDofActivities(dofId: string) {
  const result = await withAuth(async () => {
    const data = await db.query.dofActivities.findMany({
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
    return { success: true, data };
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}

/**
 * Kullanıcının DÖF'lerini getir
 */
export async function getMyDofs() {
  const result = await withAuth(async (user: User) => {
    if (user.role === "admin" || user.role === "superAdmin") {
      const data = await db.query.dofs.findMany({
        with: {
          manager: true,
          createdBy: true,
        },
        orderBy: (dofs, { desc }) => [desc(dofs.createdAt)],
      });
      return { success: true, data };
    }

    const data = await db.query.dofs.findMany({
      where: (dofs, { or, eq }) =>
        or(
          eq(dofs.assignedToId, user.id),
          eq(dofs.managerId, user.id)
        ),
      with: {
        manager: true,
        createdBy: true,
      },
      orderBy: (dofs, { desc }) => [desc(dofs.createdAt)],
    });
    return { success: true, data };
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
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
  return withAuth<{ id: string }>(async (user: User) => {
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

    revalidateDOFPaths({ specific: data.dofId });
    return { success: true, data: { id: activity!.id } };
  });
}
