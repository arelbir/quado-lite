"use server";

import { db } from "@/drizzle/db";
import { auditPlans, audits, auditQuestions, questions } from "@/drizzle/schema";
import { currentUser } from "@/lib/auth";
import { eq, and, isNull, lte, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResponse<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

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
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only admins can create plans" };
    }

    // Bir sonraki oluşturulma tarihini hesapla
    const calculateNextScheduledDate = (date: Date, type?: string, interval: number = 1): Date | null => {
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
    };

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

    revalidatePath("/denetim/plans");
    return { success: true, data: { id: plan!.id } };
  } catch (error) {
    console.error("Error creating scheduled plan:", error);
    return { success: false, error: "Failed to create scheduled plan" };
  }
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
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only auditors can start audits" };
    }

    // 1. Şablonu getir
    const template = await db.query.auditTemplates.findFirst({
      where: eq(audits.id, data.templateId),
    });

    if (!template) {
      return { success: false, error: "Template not found" };
    }

    const questionBankIds = JSON.parse(template.questionBankIds) as string[];

    // 2. Denetim oluştur
    const [audit] = await db
      .insert(audits)
      .values({
        title: data.title,
        description: data.description,
        auditDate: data.auditDate || new Date(),
        createdById: user.id,
      })
      .returning({ id: audits.id });

    // 3. Şablondaki soru havuzlarından soruları çek ve denetim'e ekle
    const allQuestions = await db.query.questions.findMany({
      where: (questions, { inArray, and, isNull }) =>
        and(
          inArray(questions.bankId, questionBankIds),
          isNull(questions.deletedAt)
        ),
      orderBy: (questions, { asc }) => [asc(questions.orderIndex)],
    });

    // 4. Soruları audit_questions tablosuna ekle
    if (allQuestions.length > 0) {
      await db.insert(auditQuestions).values(
        allQuestions.map((q) => ({
          auditId: audit!.id,
          questionId: q.id,
        }))
      );
    }

    // 5. Plan kaydı oluştur
    const [plan] = await db
      .insert(auditPlans)
      .values({
        title: data.title,
        description: data.description,
        scheduleType: "Adhoc",
        status: "Created",
        templateId: data.templateId,
        createdAuditId: audit!.id,
        createdById: user.id,
      })
      .returning({ id: auditPlans.id });

    revalidatePath("/denetim/audits");
    revalidatePath("/denetim/plans");
    return {
      success: true,
      data: {
        auditId: audit!.id,
        planId: plan!.id,
      },
    };
  } catch (error) {
    console.error("Error starting adhoc audit:", error);
    return { success: false, error: "Failed to start adhoc audit" };
  }
}

/**
 * Planlanmış denetimleri otomatik oluştur (CRON JOB için)
 * Bugünkü tarihteki tüm pending planları işler
 */
export async function createScheduledAudits(): Promise<ActionResponse<{ created: number }>> {
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
        template: true,
      },
    });

    let createdCount = 0;

    for (const plan of pendingPlans) {
      if (!plan.template) continue;

      const questionBankIds = JSON.parse(plan.template.questionBankIds) as string[];

      // Denetim oluştur
      const [audit] = await db
        .insert(audits)
        .values({
          title: plan.title,
          description: plan.description,
          auditDate: plan.scheduledDate,
          createdById: plan.createdById,
        })
        .returning({ id: audits.id });

      // Soruları çek ve ekle
      const allQuestions = await db.query.questions.findMany({
        where: (questions, { inArray, and, isNull }) =>
          and(
            inArray(questions.bankId, questionBankIds),
            isNull(questions.deletedAt)
          ),
      });

      if (allQuestions.length > 0) {
        await db.insert(auditQuestions).values(
          allQuestions.map((q) => ({
            auditId: audit!.id,
            questionId: q.id,
          }))
        );
      }

      // Plan durumunu güncelle
      await db
        .update(auditPlans)
        .set({
          status: "Created",
          createdAuditId: audit!.id,
          updatedAt: new Date(),
        })
        .where(eq(auditPlans.id, plan.id));

      createdCount++;
    }

    revalidatePath("/denetim/audits");
    revalidatePath("/denetim/plans");
    
    return { success: true, data: { created: createdCount } };
  } catch (error) {
    console.error("Error creating scheduled audits:", error);
    return { success: false, error: "Failed to create scheduled audits" };
  }
}

/**
 * Tüm planları listele
 */
export async function getAuditPlans() {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const plans = await db.query.auditPlans.findMany({
      where: isNull(auditPlans.deletedAt),
      with: {
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

    return plans;
  } catch (error) {
    console.error("Error fetching audit plans:", error);
    throw error;
  }
}

/**
 * Planı iptal et
 */
export async function cancelAuditPlan(planId: string): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only admins can cancel plans" };
    }

    await db
      .update(auditPlans)
      .set({
        status: "Cancelled",
        updatedAt: new Date(),
      })
      .where(eq(auditPlans.id, planId));

    revalidatePath("/denetim/plans");
    revalidatePath("/denetim/all");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error cancelling audit plan:", error);
    return { success: false, error: "Failed to cancel audit plan" };
  }
}

/**
 * Planı manuel olarak başlat (vaktinden önce)
 */
export async function startPlanManually(planId: string): Promise<ActionResponse<{ auditId: string }>> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const plan = await db.query.auditPlans.findFirst({
      where: eq(auditPlans.id, planId),
    });

    if (!plan) {
      return { success: false, error: "Plan not found" };
    }

    // Sadece Pending durumundaki planlar başlatılabilir
    if (plan.status !== "Pending") {
      return { success: false, error: "Only pending plans can be started" };
    }

    // Sadece creator veya admin başlatabilir
    if (plan.createdById !== user.id && user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only plan creator or admin can start manually" };
    }

    // Denetim oluştur (createAdhocPlan logic'ini kullan)
    const [audit] = await db
      .insert(audits)
      .values({
        title: plan.title,
        description: plan.description,
        auditDate: new Date(), // Manuel başlatma - şimdi
        createdById: user.id,
      })
      .returning({ id: audits.id });

    // Plan'ı güncelle
    await db
      .update(auditPlans)
      .set({
        status: "Created",
        createdAuditId: audit!.id,
        updatedAt: new Date(),
      })
      .where(eq(auditPlans.id, planId));

    revalidatePath("/denetim/plans");
    revalidatePath("/denetim/all");
    revalidatePath("/denetim/audits");

    return { success: true, data: { auditId: audit!.id } };
  } catch (error) {
    console.error("Error starting plan manually:", error);
    return { success: false, error: "Failed to start plan manually" };
  }
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
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const plan = await db.query.auditPlans.findFirst({
      where: eq(auditPlans.id, planId),
    });

    if (!plan) {
      return { success: false, error: "Plan not found" };
    }

    // Sadece creator veya admin düzenleyebilir
    if (plan.createdById !== user.id && user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only plan creator or admin can update" };
    }

    // Sadece Pending durumundaki planlar düzenlenebilir
    if (plan.status !== "Pending") {
      return { success: false, error: "Only pending plans can be edited" };
    }

    await db
      .update(auditPlans)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(auditPlans.id, planId));

    revalidatePath(`/denetim/plans/${planId}`);
    revalidatePath("/denetim/plans");
    revalidatePath("/denetim/all");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating audit plan:", error);
    return { success: false, error: "Failed to update audit plan" };
  }
}

/**
 * Planı sil (soft delete)
 */
export async function deletePlan(planId: string): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const plan = await db.query.auditPlans.findFirst({
      where: eq(auditPlans.id, planId),
    });

    if (!plan) {
      return { success: false, error: "Plan not found" };
    }

    // Sadece creator veya admin silebilir
    if (plan.createdById !== user.id && user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only plan creator or admin can delete" };
    }

    // Created durumundaki planlar silinemez (denetim oluşturulmuş)
    if (plan.status === "Created") {
      return { success: false, error: "Plans with created audits cannot be deleted" };
    }

    // Soft delete
    await db
      .update(auditPlans)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(auditPlans.id, planId));

    revalidatePath("/denetim/plans");
    revalidatePath("/denetim/all");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting plan:", error);
    return { success: false, error: "Failed to delete plan" };
  }
}
