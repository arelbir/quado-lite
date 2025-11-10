"use server";

import { db } from "@/drizzle/db";
import { auditPlans, audits, auditQuestions, questions, auditTemplates } from "@/drizzle/schema";
import { eq, and, isNull, lte, gte, inArray, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { ActionResponse, User, Plan } from "@/lib/types";
import { 
  withAuth, 
  requireCreatorOrAdmin, 
  createActionError,
  revalidateAuditPaths,
  createPermissionError,
} from "@/lib/helpers";
import { checkPermission } from "@/lib/permissions/unified-permission-checker";
import { startWorkflow } from "@/server/actions/workflow-actions";
import { getAuditWorkflowId, buildAuditMetadata } from "@/lib/workflow/workflow-integration";

// ============================================
// HELPER FUNCTIONS - LOCAL (Plan-specific)
// ============================================

/**
 * HELPER: Plan getir ve validate et
 */
async function getPlanWithValidation(
  planId: string,
  options?: {
    requirePending?: boolean;
    requireNotCreated?: boolean;
    withTemplate?: boolean;
  }
): Promise<{ plan: Plan } | { error: string }> {
  const plan = await db.query.auditPlans.findFirst({
    where: eq(auditPlans.id, planId),
    // @ts-ignore - Drizzle with clause type inference limitation
    with: options?.withTemplate ? { template: true } : undefined,
  });

  if (!plan) {
    return { error: "Plan not found" as string };
  }

  if (options?.requirePending && plan.status !== "Pending") {
    return { error: "Only pending plans can be modified" as string };
  }

  if (options?.requireNotCreated && plan.status === "Created") {
    return { error: "Plans with created audits cannot be modified" as string };
  }

  return { plan };
}

/**
 * HELPER: Recurring plan için bir sonraki tarihi hesapla
 */
function calculateNextScheduledDate(
  date: Date,
  type?: "None" | "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly",
  interval: number = 1
): Date | null {
  if (!type || type === "None") return null;
  
  const nextDate = new Date(date);
  switch (type) {
    case "Daily":
      nextDate.setDate(nextDate.getDate() + interval);
      break;
    case "Weekly":
      nextDate.setDate(nextDate.getDate() + (7 * interval));
      break;
    case "Monthly":
      nextDate.setMonth(nextDate.getMonth() + interval);
      break;
    case "Quarterly":
      nextDate.setMonth(nextDate.getMonth() + (3 * interval));
      break;
    case "Yearly":
      nextDate.setFullYear(nextDate.getFullYear() + interval);
      break;
  }
  return nextDate;
}

/**
 * HELPER: Plan status güncelle
 */
async function updatePlanStatus(
  planId: string,
  status: "Pending" | "Created" | "Cancelled",
  auditId?: string
): Promise<void> {
  await db
    .update(auditPlans)
    .set({
      status,
      ...(auditId && { createdAuditId: auditId }),
      updatedAt: new Date(),
    })
    .where(eq(auditPlans.id, planId));
}

/**
 * HELPER: Audit oluştur ve soruları yükle
 */
async function createAuditFromPlan(plan: {
  title: string;
  description?: string | null;
  auditDate: Date;
  createdById: string;
  templateId?: string | null;
  auditorId?: string | null;
}): Promise<{ auditId: string }> {
  // 1. Audit oluştur
  const [audit] = await db
    .insert(audits)
    .values({
      title: plan.title,
      description: plan.description,
      auditDate: plan.auditDate,
      createdById: plan.createdById,
      auditorId: plan.auditorId, // 🔥 FIX: Plan'dan denetçi aktar
    })
    .returning();

  // 2. Template varsa soruları yükle
  if (plan.templateId) {
    await loadQuestionsFromTemplate(audit!.id, plan.templateId);
  }

  // 3. Workflow başlat
  try {
    const workflowId = await getAuditWorkflowId({
      riskLevel: (audit as any).riskLevel,
      totalScore: 0,
    });

    if (workflowId) {
      await startWorkflow({
        workflowDefinitionId: workflowId,
        entityType: "Audit",
        entityId: audit!.id,
        entityMetadata: buildAuditMetadata(audit),
      });
    }
  } catch (error) {
    console.error("Workflow start failed:", error);
    // Continue - workflow is optional
  }

  return { auditId: audit!.id };
}

/**
 * HELPER: Template'ten soruları yükle ve audit'e ekle
 * DRY: startAdhocAudit, startPlanManually, createScheduledAudits tarafından kullanılır
 */
async function loadQuestionsFromTemplate(
  auditId: string, 
  templateId: string
): Promise<{ success: boolean; questionCount: number }> {
  try {
    // 1. Template'i getir
    const template = await db.query.auditTemplates.findFirst({
      where: eq(auditTemplates.id, templateId),
    });

    if (!template || !template.questionBankIds) {
      return { success: false, questionCount: 0 };
    }

    // 2. Question bank IDs parse et
    const bankIds = JSON.parse(template.questionBankIds) as string[];
    
    if (bankIds.length === 0) {
      return { success: true, questionCount: 0 };
    }

    // 3. Her bank'ten soruları çek (aktif ve silinmemiş)
    const allQuestions = await db.query.questions.findMany({
      where: and(
        inArray(questions.bankId, bankIds),
        isNull(questions.deletedAt)
      ),
      orderBy: [asc(questions.orderIndex)],
    });

    // 4. Soruları audit_questions tablosuna ekle
    if (allQuestions.length > 0) {
      await db.insert(auditQuestions).values(
        allQuestions.map((q) => ({
          auditId,
          questionId: q.id,
          response: null,
          notes: null,
        }))
      );
    }

    return { success: true, questionCount: allQuestions.length };
  } catch (error) {
    console.error("Error loading questions from template:", error);
    return { success: false, questionCount: 0 };
  }
}

/**
 * Planlı denetim planı oluştur (tarih belirtilir)
 */
export async function createScheduledPlan(data: {
  title: string;
  description?: string;
  templateId: string;
  scheduledDate: Date;
  auditorId?: string;
  recurrenceType?: "None" | "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly";
  recurrenceInterval?: number;
  maxOccurrences?: number;
}): Promise<ActionResponse<{ id: string }>> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "plan",
      action: "create",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    const [plan] = await db
      .insert(auditPlans)
      .values({
        title: data.title,
        description: data.description,
        scheduleType: "Scheduled",
        status: "Pending",
        templateId: data.templateId,
        auditorId: data.auditorId,
        scheduledDate: data.scheduledDate,
        recurrenceType: data.recurrenceType || "None",
        recurrenceInterval: data.recurrenceInterval || 1,
        nextScheduledDate: calculateNextScheduledDate(
          data.scheduledDate, 
          data.recurrenceType, 
          data.recurrenceInterval
        ),
        maxOccurrences: data.maxOccurrences,
        occurrenceCount: 0,
        createdById: user.id,
      })
      .returning({ id: auditPlans.id });

    revalidateAuditPaths({ plans: true });
    
    return { success: true, data: { id: plan!.id } };
  });
}

/**
 * Plansız denetim başlat (hemen denetim oluşturur)
 */
export async function startAdhocAudit(data: {
  title: string;
  description?: string;
  templateId: string;
  auditDate?: Date;
}): Promise<ActionResponse<{ auditId: string; planId: string }>> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "plan",
      action: "create",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    const { auditId } = await createAuditFromPlan({
      title: data.title,
      description: data.description,
      auditDate: data.auditDate || new Date(),
      createdById: user.id,
      templateId: data.templateId,
      auditorId: undefined, // Adhoc'ta denetçi yok (sonra atanır)
    });

    const [plan] = await db
      .insert(auditPlans)
      .values({
        title: data.title,
        description: data.description,
        scheduleType: "Adhoc",
        status: "Created",
        templateId: data.templateId,
        createdAuditId: auditId,
        createdById: user.id,
      })
      .returning({ id: auditPlans.id });

    revalidateAuditPaths({ audits: true, plans: true });
    
    return {
      success: true,
      data: {
        auditId,
        planId: plan!.id,
      },
    };
  });
}

/**
 * Planlanmış denetimleri otomatik oluştur (CRON JOB için)
 * Bugünkü tarihteki tüm pending planları işler
 */
export async function createScheduledAudits(): Promise<ActionResponse<{ created: number; skipped: number }>> {
  try {
    // Bugünün başlangıcı ve bitişi
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Bugün için pending olan planları getir
    const pendingPlans = await db.query.auditPlans.findMany({
      where: and(
        eq(auditPlans.status, "Pending"),
        eq(auditPlans.scheduleType, "Scheduled"),
        gte(auditPlans.scheduledDate, today),
        lte(auditPlans.scheduledDate, tomorrow),
        isNull(auditPlans.deletedAt)
      ),
      with: {
        // @ts-ignore - Drizzle relation type inference limitation
        template: true,
      },
    });

    let createdCount = 0;
    let skippedCount = 0;

    for (const plan of pendingPlans) {
      // 🔥 VALIDATION: Denetçisi olmayan planları atla
      if (!plan.auditorId) {
        console.warn(`Plan ${plan.id} skipped: No auditor assigned`);
        skippedCount++;
        continue;
      }

      // DRY: Audit oluştur ve soruları yükle
      const { auditId } = await createAuditFromPlan({
        title: plan.title,
        description: plan.description,
        auditDate: plan.scheduledDate || new Date(),
        createdById: plan.createdById!,
        templateId: plan.templateId,
        auditorId: plan.auditorId, // 🔥 FIX: Plan'dan denetçi aktar
      });

      // DRY: Plan durumunu güncelle
      await updatePlanStatus(plan.id, "Created", auditId);

      createdCount++;
    }

    // DRY: Revalidate paths
    revalidateAuditPaths({ audits: true, plans: true });
    
    return { 
      success: true, 
      data: { 
        created: createdCount,
        skipped: skippedCount // Denetçisi olmayan planlar
      } 
    };
  } catch (error) {
    console.error("Error creating scheduled audits:", error);
    return { success: false, error: "Failed to create scheduled audits" };
  }
}

/**
 * Tüm planları listele
 * Note: Bu fonksiyon ActionResponse yerine direkt data döndürüyor (eski API uyumluluğu için)
 */
export async function getAuditPlans() {
  const user = await withAuth(async (user) => {
    const plans = await db.query.auditPlans.findMany({
      where: isNull(auditPlans.deletedAt),
      with: {
        // @ts-ignore - Drizzle relation type inference limitation
        template: {
          columns: {
            id: true,
            name: true,
            category: true,
          },
        },
        createdAudit: {
          columns: {
            id: true,
            title: true,
          },
        },
        createdBy: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: (auditPlans, { desc }) => [desc(auditPlans.createdAt)],
    });

    return { success: true, data: plans };
  });

  if (!user.success) {
    throw new Error(user.error);
  }

  return user.data;
}

/**
 * Planı iptal et
 */
export async function cancelAuditPlan(planId: string): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "plan",
      action: "update",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    await updatePlanStatus(planId, "Cancelled");
    revalidateAuditPaths({ plans: true, all: true });
    return { success: true, data: undefined };
  });
}

/**
 * Planı manuel olarak başlat (vaktinden önce)
 */
export async function startPlanManually(planId: string): Promise<ActionResponse<{ auditId: string }>> {
  return withAuth(async (user: User) => {
    const planResult = await getPlanWithValidation(planId, { requirePending: true });
    if ('error' in planResult) {
      return { success: false, error: planResult.error };
    }
    const { plan } = planResult;

    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "plan",
      action: "update",
      entity: {
        id: plan.id,
        createdById: plan.createdById,
      },
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    // 🔥 VALIDATION: Denetçi atanmış olmalı
    if (!plan.auditorId) {
      return { success: false, error: "Denetim başlatılamıyor: Denetçi atanmalıdır" };
    }

    const { auditId } = await createAuditFromPlan({
      title: plan.title,
      description: plan.description,
      auditDate: new Date(),
      createdById: user.id,
      templateId: plan.templateId,
      auditorId: plan.auditorId, // 🔥 FIX: Plan'dan denetçi aktar
    });

    await updatePlanStatus(planId, "Created", auditId);
    revalidateAuditPaths({ plans: true, all: true, audits: true });

    return { success: true, data: { auditId } };
  });
}

/**
 * Planı güncelle
 */
export async function updateAuditPlan(
  planId: string,
  data: {
    title?: string;
    description?: string;
    scheduledDate?: Date;
    templateId?: string;
  }
): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    const planResult = await getPlanWithValidation(planId, { requirePending: true });
    if ('error' in planResult) {
      return { success: false, error: planResult.error };
    }
    const { plan } = planResult;

    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "plan",
      action: "update",
      entity: {
        id: plan.id,
        createdById: plan.createdById,
      },
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    await db
      .update(auditPlans)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(auditPlans.id, planId));

    revalidateAuditPaths({ plans: true, all: true, specificPlan: planId });

    return { success: true, data: undefined };
  });
}

/**
 * Planı sil (soft delete)
 */
export async function deletePlan(planId: string): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    const planResult = await getPlanWithValidation(planId, { requireNotCreated: true });
    if ('error' in planResult) {
      return { success: false, error: planResult.error };
    }
    const { plan } = planResult;

    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "plan",
      action: "delete",
      entity: {
        id: plan.id,
        createdById: plan.createdById,
      },
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    await db
      .update(auditPlans)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(auditPlans.id, planId));

    revalidateAuditPaths({ plans: true, all: true });

    return { success: true, data: undefined };
  });
}
