"use server";

import { db } from "@/drizzle/db";
import { auditQuestions, findings, questions, questionBanks } from "@/drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";
import type { ActionResponse, User } from "@/lib/types";
import { withAuth, revalidateAuditPaths, createPermissionError } from "@/lib/helpers";
import { getAuditQuestionsWithDetails } from "@/lib/db/query-helpers";
import { checkPermission } from "@/lib/permissions/unified-permission-checker";

/**
 * Denetim sorularını getir
 */
export async function getAuditQuestions(auditId: string): Promise<any[]> {
  const result = await withAuth<any[]>(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "audit-question",
      action: "read",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    const data = await getAuditQuestionsWithDetails(auditId);
    return { success: true, data };
  });

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch audit questions');
  }

  return result.data;
}

/**
 * Soruyu cevapla
 */
export async function answerAuditQuestion(data: {
  auditQuestionId: string;
  answer: string;
  notes?: string;
  isNonCompliant: boolean;
}): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "audit-question",
      action: "answer",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    await db
      .update(auditQuestions)
      .set({
        answer: data.answer,
        notes: data.notes,
        isNonCompliant: data.isNonCompliant,
        answeredById: user.id,
        answeredAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(auditQuestions.id, data.auditQuestionId));

    if (data.isNonCompliant) {
      const auditQuestion = await db.query.auditQuestions.findFirst({
        where: eq(auditQuestions.id, data.auditQuestionId),
        with: {
          question: true,
          audit: true,
        },
      });

      if (auditQuestion) {
        const aq = auditQuestion as any; // Type assertion for Drizzle with clause
        await db.insert(findings).values({
          auditId: aq.auditId,
          details: `[Otomatik Bulgu] Soru: ${aq.question?.questionText} | Cevap: ${data.answer}${data.notes ? ` | Not: ${data.notes}` : ""}`,
          status: "New",
          riskType: "Orta",
          createdById: user.id,
        });
      }
    }

    revalidateAuditPaths({ audits: true });
    return { success: true, data: undefined };
  });
}

/**
 * Birden fazla soruyu toplu cevapla
 */
export async function answerMultipleQuestions(
  answers: Array<{
    auditQuestionId: string;
    answer: string;
    notes?: string;
    isNonCompliant: boolean;
  }>
): Promise<ActionResponse<{ nonCompliantCount: number }>> {
  return withAuth<{ nonCompliantCount: number }>(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "audit-question",
      action: "answer",
    });

    if (!perm.allowed) {
      return createPermissionError<{ nonCompliantCount: number }>(perm.reason || "Permission denied");
    }

    let nonCompliantCount = 0;

    for (const answerData of answers) {
      await db
        .update(auditQuestions)
        .set({
          answer: answerData.answer,
          notes: answerData.notes,
          isNonCompliant: answerData.isNonCompliant,
          answeredById: user.id,
          answeredAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(auditQuestions.id, answerData.auditQuestionId));

      if (answerData.isNonCompliant) {
        nonCompliantCount++;

        const auditQuestion = await db.query.auditQuestions.findFirst({
          where: eq(auditQuestions.id, answerData.auditQuestionId),
          with: {
            question: true,
          },
        });

        if (auditQuestion) {
          const aq = auditQuestion as any; // Type assertion for Drizzle with clause
          await db.insert(findings).values({
            auditId: aq.auditId,
            details: `[Otomatik Bulgu] Soru: ${aq.question?.questionText} | Cevap: ${answerData.answer}${answerData.notes ? ` | Not: ${answerData.notes}` : ""}`,
            status: "New",
            riskType: "Orta",
            createdById: user.id,
          });
        }
      }
    }

    revalidateAuditPaths({ audits: true });
    return {
      success: true,
      data: { nonCompliantCount },
    };
  });
}

/**
 * Soru cevabını güncelle
 */
export async function updateQuestionAnswer(
  auditQuestionId: string,
  data: {
    answer?: string;
    notes?: string;
    isNonCompliant?: boolean;
  }
): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "audit-question",
      action: "answer",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    await db
      .update(auditQuestions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(auditQuestions.id, auditQuestionId));

    revalidateAuditPaths({ audits: true });
    return { success: true, data: undefined };
  });
}

/**
 * Tüm cevapları toplu kaydet (Auto-save ve Manuel kaydet için)
 */
export async function saveAllAuditAnswers(data: {
  auditId: string;
  answers: Array<{
    auditQuestionId: string;
    answer: string;
    notes?: string;
    isNonCompliant: boolean;
  }>;
}): Promise<ActionResponse<{ saved: number; nonCompliantCount: number }>> {
  return withAuth<{ saved: number; nonCompliantCount: number }>(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "audit-question",
      action: "answer",
    });

    if (!perm.allowed) {
      return createPermissionError<{ saved: number; nonCompliantCount: number }>(perm.reason || "Permission denied");
    }

    let nonCompliantCount = 0;
    let saved = 0;

    for (const answerData of data.answers) {
      if (!answerData.answer) continue;

      await db
        .update(auditQuestions)
        .set({
          answer: answerData.answer,
          notes: answerData.notes || null,
          isNonCompliant: answerData.isNonCompliant,
          answeredById: user.id,
          answeredAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(auditQuestions.id, answerData.auditQuestionId));

      saved++;

      if (answerData.isNonCompliant) {
        const auditQuestion = await db.query.auditQuestions.findFirst({
          where: eq(auditQuestions.id, answerData.auditQuestionId),
          with: {
            question: true,
          },
        });

        if (auditQuestion) {
          const aq = auditQuestion as any; // Type assertion for Drizzle with clause
          const existingFinding = await db.query.findings.findFirst({
            where: and(
              eq(findings.auditId, data.auditId),
              eq(findings.details, `[Otomatik Bulgu] Soru: ${aq.question?.questionText} | Cevap: ${answerData.answer}${answerData.notes ? ` | Not: ${answerData.notes}` : ""}`)
            ),
          });

          if (!existingFinding) {
            await db.insert(findings).values({
              auditId: data.auditId,
              details: `[Otomatik Bulgu] Soru: ${aq.question?.questionText} | Cevap: ${answerData.answer}${answerData.notes ? ` | Not: ${answerData.notes}` : ""}`,
              status: "New",
              riskType: "Orta",
              createdById: user.id,
            });
            nonCompliantCount++;
          }
        }
      }
    }

    revalidateAuditPaths({ audits: true, specificAudit: data.auditId });
    return {
      success: true,
      data: { saved, nonCompliantCount },
    };
  });
}

/**
 * Denetim tamamlama durumunu kontrol et
 */
export async function checkAuditCompletion(auditId: string): Promise<{
  total: number;
  answered: number;
  unanswered: number;
  nonCompliant: number;
  completionPercentage: number;
}> {
  const result = await withAuth<{
    total: number;
    answered: number;
    unanswered: number;
    nonCompliant: number;
    completionPercentage: number;
  }>(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "audit-question",
      action: "read",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    const allQuestions = await db.query.auditQuestions.findMany({
      where: eq(auditQuestions.auditId, auditId),
    });

    const answeredQuestions = allQuestions.filter((q) => q.answer !== null);
    const nonCompliantQuestions = allQuestions.filter((q) => q.isNonCompliant);

    const data = {
      total: allQuestions.length,
      answered: answeredQuestions.length,
      unanswered: allQuestions.length - answeredQuestions.length,
      nonCompliant: nonCompliantQuestions.length,
      completionPercentage: allQuestions.length > 0 
        ? Math.round((answeredQuestions.length / allQuestions.length) * 100)
        : 0,
    };

    return { success: true, data };
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}
