"use server";

import { db } from "@/drizzle/db";
import { questionBanks } from "@/drizzle/schema";
import { currentUser } from "@/lib/auth";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResponse<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Soru havuzu oluştur
 */
export async function createQuestionBank(data: {
  name: string;
  description?: string;
  category: "Kalite" | "Çevre" | "İSG" | "Bilgi Güvenliği" | "Gıda Güvenliği" | "Diğer";
}): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Sadece admin oluşturabilir
    if (user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only admins can create question banks" };
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

    revalidatePath("/denetim/question-banks");
    return { success: true, data: { id: bank!.id } };
  } catch (error) {
    console.error("Error creating question bank:", error);
    return { success: false, error: "Failed to create question bank" };
  }
}

/**
 * Tüm soru havuzlarını listele
 */
export async function getQuestionBanks() {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const banks = await db.query.questionBanks.findMany({
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

    return banks;
  } catch (error) {
    console.error("Error fetching question banks:", error);
    throw error;
  }
}

/**
 * Tek bir soru havuzunu detaylı getir
 */
export async function getQuestionBankById(bankId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const bank = await db.query.questionBanks.findFirst({
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

    return bank;
  } catch (error) {
    console.error("Error fetching question bank:", error);
    throw error;
  }
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
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only admins can update question banks" };
    }

    await db
      .update(questionBanks)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(questionBanks.id, bankId));

    revalidatePath("/denetim/question-banks");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating question bank:", error);
    return { success: false, error: "Failed to update question bank" };
  }
}

/**
 * Soru havuzunu sil (soft delete)
 */
export async function deleteQuestionBank(bankId: string): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only admins can delete question banks" };
    }

    await db
      .update(questionBanks)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(questionBanks.id, bankId));

    revalidatePath("/denetim/question-banks");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting question bank:", error);
    return { success: false, error: "Failed to delete question bank" };
  }
}

/**
 * Aktif soru havuzlarını getir (şablon oluştururken kullanılır)
 */
export async function getActiveQuestionBanks() {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const banks = await db.query.questionBanks.findMany({
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

    return banks;
  } catch (error) {
    console.error("Error fetching active question banks:", error);
    throw error;
  }
}
