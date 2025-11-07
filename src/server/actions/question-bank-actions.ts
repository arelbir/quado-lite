"use server";

import { db } from "@/drizzle/db";
import { questionBanks } from "@/drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";
import type { ActionResponse, User } from "@/lib/types";
import { 
  withAuth, 
  createPermissionError,
  revalidateAuditPaths,
} from "@/lib/helpers";
import { checkPermission } from "@/lib/permissions/unified-permission-checker";

/**
 * Soru havuzu oluştur
 */
export async function createQuestionBank(data: {
  name: string;
  description?: string;
  category: "Kalite" | "Çevre" | "İSG" | "Bilgi Güvenliği" | "Gıda Güvenliği" | "Diğer";
}): Promise<ActionResponse<{ id: string }>> {
  return withAuth<{ id: string }>(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "question-bank",
      action: "create",
    });

    if (!perm.allowed) {
      return createPermissionError<{ id: string }>(perm.reason || "Permission denied");
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
export async function getQuestionBanks(): Promise<any> {
  const result = await withAuth<any[]>(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "question-bank",
      action: "read",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

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
        // @ts-expect-error - Drizzle relation type inference limitation
        questions: {
          where: (questions: any, { isNull }: any) => isNull(questions.deletedAt),
        },
      },
      orderBy: (questionBanks: any, { desc }: any) => [desc(questionBanks.createdAt)],
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
export async function getQuestionBankById(bankId: string): Promise<any> {
  const result = await withAuth<any>(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "question-bank",
      action: "read",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

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
        // @ts-expect-error - Drizzle relation type inference limitation
        questions: {
          where: (questions: any, { isNull }: any) => isNull(questions.deletedAt),
          orderBy: (questions: any, { asc }: any) => [asc(questions.orderIndex)],
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
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "question-bank",
      action: "update",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
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
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "question-bank",
      action: "delete",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
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
export async function getActiveQuestionBanks(): Promise<any[]> {
  const result = await withAuth<any[]>(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "question-bank",
      action: "read",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

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
