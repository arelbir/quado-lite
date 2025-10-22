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
}): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only admins can create plans" };
    }

    const [plan] = await db
      .insert(auditPlans)
      .values({
        title: data.title,
        description: data.description,
        scheduleType: "Scheduled",
        status: "Pending",
        templateId: data.templateId,
        scheduledDate: data.scheduledDate,
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
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error cancelling audit plan:", error);
    return { success: false, error: "Failed to cancel audit plan" };
  }
}
