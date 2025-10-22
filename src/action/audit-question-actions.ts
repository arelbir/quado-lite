"use server";

import { db } from "@/drizzle/db";
import { auditQuestions, findings } from "@/drizzle/schema";
import { currentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResponse<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Denetim sorularını getir
 */
export async function getAuditQuestions(auditId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const auditQuestionsData = await db.query.auditQuestions.findMany({
      where: eq(auditQuestions.auditId, auditId),
      with: {
        question: {
          with: {
            bank: {
              columns: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
        answeredBy: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: (auditQuestions, { asc }) => [asc(auditQuestions.createdAt)],
    });

    // checklistOptions'ı parse et
    return auditQuestionsData.map((aq) => ({
      ...aq,
      question: {
        ...aq.question,
        checklistOptions: aq.question?.checklistOptions
          ? JSON.parse(aq.question.checklistOptions)
          : null,
      },
    }));
  } catch (error) {
    console.error("Error fetching audit questions:", error);
    throw error;
  }
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
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Soruyu güncelle
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

    // Eğer uygunsuzluk varsa, otomatik Finding oluştur
    if (data.isNonCompliant) {
      const auditQuestion = await db.query.auditQuestions.findFirst({
        where: eq(auditQuestions.id, data.auditQuestionId),
        with: {
          question: true,
          audit: true,
        },
      });

      if (auditQuestion) {
        await db.insert(findings).values({
          auditId: auditQuestion.auditId,
          details: `[Otomatik Bulgu] Soru: ${auditQuestion.question?.questionText}\nCevap: ${data.answer}\n${data.notes ? `Not: ${data.notes}` : ""}`,
          status: "New",
          riskType: "Orta", // Default risk
          createdById: user.id,
        });
      }
    }

    revalidatePath(`/denetim/audits`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error answering audit question:", error);
    return { success: false, error: "Failed to answer question" };
  }
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
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
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

      // Uygunsuzluk varsa Finding oluştur
      if (answerData.isNonCompliant) {
        nonCompliantCount++;

        const auditQuestion = await db.query.auditQuestions.findFirst({
          where: eq(auditQuestions.id, answerData.auditQuestionId),
          with: {
            question: true,
          },
        });

        if (auditQuestion) {
          await db.insert(findings).values({
            auditId: auditQuestion.auditId,
            details: `[Otomatik Bulgu] Soru: ${auditQuestion.question?.questionText}\nCevap: ${answerData.answer}\n${answerData.notes ? `Not: ${answerData.notes}` : ""}`,
            status: "New",
            riskType: "Orta",
            createdById: user.id,
          });
        }
      }
    }

    revalidatePath("/denetim/audits");
    return {
      success: true,
      data: { nonCompliantCount },
    };
  } catch (error) {
    console.error("Error answering multiple questions:", error);
    return { success: false, error: "Failed to answer questions" };
  }
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
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(auditQuestions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(auditQuestions.id, auditQuestionId));

    revalidatePath("/denetim/audits");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating question answer:", error);
    return { success: false, error: "Failed to update answer" };
  }
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
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    let nonCompliantCount = 0;
    let saved = 0;

    // Batch update için hazırla
    for (const answerData of data.answers) {
      if (!answerData.answer) continue; // Boş cevapları atla

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

      // Uygunsuzluk varsa ve daha önce bulgu oluşturulmamışsa Finding oluştur
      if (answerData.isNonCompliant) {
        const auditQuestion = await db.query.auditQuestions.findFirst({
          where: eq(auditQuestions.id, answerData.auditQuestionId),
          with: {
            question: true,
          },
        });

        if (auditQuestion) {
          // Aynı soru için bulgu var mı kontrol et
          const existingFinding = await db.query.findings.findFirst({
            where: and(
              eq(findings.auditId, data.auditId),
              eq(findings.details, `[Otomatik Bulgu] Soru: ${auditQuestion.question?.questionText}\nCevap: ${answerData.answer}\n${answerData.notes ? `Not: ${answerData.notes}` : ""}`)
            ),
          });

          if (!existingFinding) {
            await db.insert(findings).values({
              auditId: data.auditId,
              details: `[Otomatik Bulgu] Soru: ${auditQuestion.question?.questionText}\nCevap: ${answerData.answer}\n${answerData.notes ? `Not: ${answerData.notes}` : ""}`,
              status: "New",
              riskType: "Orta",
              createdById: user.id,
            });
            nonCompliantCount++;
          }
        }
      }
    }

    revalidatePath(`/denetim/audits/${data.auditId}`);
    revalidatePath(`/denetim/audits/${data.auditId}/questions`);
    revalidatePath("/denetim/audits");
    
    return {
      success: true,
      data: { saved, nonCompliantCount },
    };
  } catch (error) {
    console.error("Error saving audit answers:", error);
    return { success: false, error: "Cevaplar kaydedilirken hata oluştu" };
  }
}

/**
 * Denetim tamamlama durumunu kontrol et
 */
export async function checkAuditCompletion(auditId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const allQuestions = await db.query.auditQuestions.findMany({
      where: eq(auditQuestions.auditId, auditId),
    });

    const answeredQuestions = allQuestions.filter((q) => q.answer !== null);
    const nonCompliantQuestions = allQuestions.filter((q) => q.isNonCompliant);

    return {
      total: allQuestions.length,
      answered: answeredQuestions.length,
      unanswered: allQuestions.length - answeredQuestions.length,
      nonCompliant: nonCompliantQuestions.length,
      completionPercentage: allQuestions.length > 0 
        ? Math.round((answeredQuestions.length / allQuestions.length) * 100)
        : 0,
    };
  } catch (error) {
    console.error("Error checking audit completion:", error);
    throw error;
  }
}
