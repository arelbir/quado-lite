"use server";

import { db } from "@/drizzle/db";
import { questionBanks } from "@/drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";
import type { ActionResponse, User } from "@/lib/types";
import { 
  withAuth, 
  requireAdmin,
  createPermissionError,
  revalidateAuditPaths,
} from "@/lib/helpers";

/**
 * Soru havuzu oluştur
 */
export async function createQuestionBank(data: {
  name: string;
  description?: string;
  category: "Kalite" | "Çevre" | "İSG" | "Bilgi Güvenliği" | "Gıda Güvenliği" | "Diğer";
}): Promise<ActionResponse<{ id: string }>> {
  return withAuth<{ id: string }>(async (user: User) => {
    if (!requireAdmin(user)) {
      return createPermissionError<{ id: string }>("Only admins can create question banks");
    }

    const [bank] = await db
      .insert(questionBanks)
      .values({
        name: data.name,
        description: data.description,
        category: data.category,
        isActive: true,
        createdById: user.id,
      })
      .returning({ id: questionBanks.id });

    revalidateAuditPaths({ plans: true });
    return { success: true, data: { id: bank!.id } };
  });
}

/**
 * Tüm soru havuzlarını listele
 */
export async function getQuestionBanks() {
  const result = await withAuth(async () => {
    const data = await db.query.questionBanks.findMany({
      where: isNull(questionBanks.deletedAt),
      with: {
        createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        questions: {
          where: (questions, { isNull }) => isNull(questions.deletedAt),
        },
      },
      orderBy: (questionBanks, { desc }) => [desc(questionBanks.createdAt)],
    });

    return { success: true, data };
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}

/**
 * Tek bir soru havuzunu detaylı getir
 */
export async function getQuestionBankById(bankId: string) {
  const result = await withAuth(async () => {
    const data = await db.query.questionBanks.findFirst({
      where: and(
        eq(questionBanks.id, bankId),
        isNull(questionBanks.deletedAt)
      ),
      with: {
        createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        questions: {
          where: (questions, { isNull }) => isNull(questions.deletedAt),
          orderBy: (questions, { asc }) => [asc(questions.orderIndex)],
          with: {
            createdBy: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return { success: true, data };
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}

/**
 * Soru havuzunu güncelle
 */
export async function updateQuestionBank(
  bankId: string,
  data: {
    name?: string;
    description?: string;
    category?: "Kalite" | "Çevre" | "İSG" | "Bilgi Güvenliği" | "Gıda Güvenliği" | "Diğer";
    isActive?: boolean;
  }
): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    if (!requireAdmin(user)) {
      return createPermissionError("Only admins can update question banks");
    }

    await db
      .update(questionBanks)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(questionBanks.id, bankId));

    revalidateAuditPaths({ plans: true });
    return { success: true, data: undefined };
  });
}

/**
 * Soru havuzunu sil (soft delete)
 */
export async function deleteQuestionBank(bankId: string): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    if (!requireAdmin(user)) {
      return createPermissionError("Only admins can delete question banks");
    }

    await db
      .update(questionBanks)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(questionBanks.id, bankId));

    revalidateAuditPaths({ plans: true });
    return { success: true, data: undefined };
  });
}

/**
 * Aktif soru havuzlarını getir (şablon oluştururken kullanılır)
 */
export async function getActiveQuestionBanks() {
  const result = await withAuth(async () => {
    const data = await db.query.questionBanks.findMany({
      where: and(
        eq(questionBanks.isActive, true),
        isNull(questionBanks.deletedAt)
      ),
      columns: {
        id: true,
        name: true,
        category: true,
        description: true,
      },
      orderBy: (questionBanks, { asc }) => [asc(questionBanks.name)],
    });

    return { success: true, data };
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}
