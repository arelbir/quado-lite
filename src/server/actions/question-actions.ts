"use server";

import { db } from "@/drizzle/db";
import { questions } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import type { ActionResponse, User } from "@/lib/types";
import { 
  withAuth, 
  createPermissionError,
  createNotFoundError,
  revalidateAuditPaths,
} from "@/lib/helpers";
import { checkPermission } from "@/lib/permissions/unified-permission-checker";

/**
 * Soru oluştur
 */
export async function createQuestion(data: {
  bankId: string;
  questionText: string;
  questionType: "YesNo" | "Scale" | "Text" | "SingleChoice" | "Checklist";
  helpText?: string;
  checklistOptions?: string[];
  isMandatory?: boolean;
  orderIndex?: string;
}): Promise<ActionResponse<{ id: string }>> {
  return withAuth<{ id: string }>(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "question",
      action: "create",
    });

    if (!perm.allowed) {
      return createPermissionError<{ id: string }>(perm.reason || "Permission denied");
    }

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

    revalidateAuditPaths({ plans: true });
    return { success: true, data: { id: question!.id } };
  });
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
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "question",
      action: "update",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
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

    revalidateAuditPaths({ plans: true });
    return { success: true, data: undefined };
  });
}

/**
 * Soruyu sil (soft delete)
 */
export async function deleteQuestion(questionId: string): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "question",
      action: "delete",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    await db
      .update(questions)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(questions.id, questionId));

    revalidateAuditPaths({ plans: true });
    return { success: true, data: undefined };
  });
}

/**
 * Tek bir soruyu getir (düzenleme için)
 */
export async function getQuestionById(questionId: string): Promise<any> {
  const result = await withAuth<any>(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "question",
      action: "read",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    const question = await db.query.questions.findFirst({
      where: eq(questions.id, questionId),
      with: {
        // @ts-expect-error - Drizzle relation type inference limitation
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
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        ...question,
        checklistOptions: question.checklistOptions
          ? JSON.parse(question.checklistOptions)
          : null,
      },
    };
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}

/**
 * Soruyu başka bir havuza kopyala veya aynı havuzda türet
 */
export async function copyQuestion(data: {
  questionId: string;
  targetBankId: string;
  duplicate?: boolean;
}): Promise<ActionResponse<{ id: string }>> {
  return withAuth<{ id: string }>(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "question",
      action: "create",
    });

    if (!perm.allowed) {
      return createPermissionError<{ id: string }>(perm.reason || "Permission denied");
    }

    const originalQuestion = await db.query.questions.findFirst({
      where: eq(questions.id, data.questionId),
    });

    if (!originalQuestion) {
      return createNotFoundError<{ id: string }>("Question");
    }

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
        orderIndex: "999",
        createdById: user.id,
      })
      .returning({ id: questions.id });

    revalidateAuditPaths({ plans: true });
    return { success: true, data: { id: newQuestion!.id } };
  });
}

/**
 * Soru sıralamasını güncelle (bulk update)
 */
export async function updateQuestionOrder(
  updates: Array<{ id: string; orderIndex: string }>
): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "question",
      action: "update",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    for (const update of updates) {
      await db
        .update(questions)
        .set({
          orderIndex: update.orderIndex,
          updatedAt: new Date(),
        })
        .where(eq(questions.id, update.id));
    }

    revalidateAuditPaths({ plans: true });
    return { success: true, data: undefined };
  });
}
