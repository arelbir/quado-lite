"use server";

import { db } from "@/drizzle/db";
import { questions } from "@/drizzle/schema";
import { currentUser } from "@/lib/auth";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResponse<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Soru oluştur
 */
export async function createQuestion(data: {
  bankId: string;
  questionText: string;
  questionType: "YesNo" | "Scale" | "Text" | "SingleChoice" | "Checklist";
  helpText?: string;
  checklistOptions?: string[]; // Array olarak gelecek
  isMandatory?: boolean;
  orderIndex?: string;
}): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only admins can create questions" };
    }

    // Checklist options'ı JSON string'e çevir
    const checklistOptionsJson = data.checklistOptions
      ? JSON.stringify(data.checklistOptions)
      : null;

    const [question] = await db
      .insert(questions)
      .values({
        bankId: data.bankId,
        questionText: data.questionText,
        questionType: data.questionType,
        helpText: data.helpText,
        checklistOptions: checklistOptionsJson,
        isMandatory: data.isMandatory ?? true,
        orderIndex: data.orderIndex ?? "0",
        createdById: user.id,
      })
      .returning({ id: questions.id });

    revalidatePath(`/denetim/question-banks/${data.bankId}`);
    return { success: true, data: { id: question!.id } };
  } catch (error) {
    console.error("Error creating question:", error);
    return { success: false, error: "Failed to create question" };
  }
}

/**
 * Soruyu güncelle
 */
export async function updateQuestion(
  questionId: string,
  data: {
    questionText?: string;
    questionType?: "YesNo" | "Scale" | "Text" | "SingleChoice" | "Checklist";
    helpText?: string;
    checklistOptions?: string[];
    isMandatory?: boolean;
    orderIndex?: string;
  }
): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only admins can update questions" };
    }

    const checklistOptionsJson = data.checklistOptions
      ? JSON.stringify(data.checklistOptions)
      : undefined;

    await db
      .update(questions)
      .set({
        ...data,
        checklistOptions: checklistOptionsJson,
        updatedAt: new Date(),
      })
      .where(eq(questions.id, questionId));

    revalidatePath("/denetim/question-banks");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating question:", error);
    return { success: false, error: "Failed to update question" };
  }
}

/**
 * Soruyu sil (soft delete)
 */
export async function deleteQuestion(questionId: string): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only admins can delete questions" };
    }

    await db
      .update(questions)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(questions.id, questionId));

    revalidatePath("/denetim/question-banks");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting question:", error);
    return { success: false, error: "Failed to delete question" };
  }
}

/**
 * Tek bir soruyu getir (düzenleme için)
 */
export async function getQuestionById(questionId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const question = await db.query.questions.findFirst({
      where: eq(questions.id, questionId),
      with: {
        bank: {
          columns: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!question) {
      return null;
    }

    // checklistOptions'ı parse et
    return {
      ...question,
      checklistOptions: question.checklistOptions
        ? JSON.parse(question.checklistOptions)
        : null,
    };
  } catch (error) {
    console.error("Error fetching question:", error);
    throw error;
  }
}

/**
 * Soruyu başka bir havuza kopyala veya aynı havuzda türet
 */
export async function copyQuestion(data: {
  questionId: string;
  targetBankId: string;
  duplicate?: boolean; // Aynı havuzda türetme mi?
}): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only admins can copy questions" };
    }

    // Orijinal soruyu getir
    const originalQuestion = await db.query.questions.findFirst({
      where: eq(questions.id, data.questionId),
    });

    if (!originalQuestion) {
      return { success: false, error: "Question not found" };
    }

    // Yeni soruyu oluştur
    const questionText = data.duplicate 
      ? `${originalQuestion.questionText} (Kopya)`
      : originalQuestion.questionText;

    const [newQuestion] = await db
      .insert(questions)
      .values({
        bankId: data.targetBankId,
        questionText,
        questionType: originalQuestion.questionType,
        helpText: originalQuestion.helpText,
        checklistOptions: originalQuestion.checklistOptions,
        isMandatory: originalQuestion.isMandatory,
        orderIndex: "999", // En sona ekle
        createdById: user.id,
      })
      .returning({ id: questions.id });

    revalidatePath(`/denetim/question-banks/${data.targetBankId}`);
    return { success: true, data: { id: newQuestion!.id } };
  } catch (error) {
    console.error("Error copying question:", error);
    return { success: false, error: "Failed to copy question" };
  }
}

/**
 * Soru sıralamasını güncelle (bulk update)
 */
export async function updateQuestionOrder(
  updates: Array<{ id: string; orderIndex: string }>
): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only admins can reorder questions" };
    }

    // Her soruyu ayrı ayrı güncelle
    for (const update of updates) {
      await db
        .update(questions)
        .set({
          orderIndex: update.orderIndex,
          updatedAt: new Date(),
        })
        .where(eq(questions.id, update.id));
    }

    revalidatePath("/denetim/question-banks");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating question order:", error);
    return { success: false, error: "Failed to update question order" };
  }
}
