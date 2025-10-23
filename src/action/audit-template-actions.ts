"use server";

import { db } from "@/drizzle/db";
import { auditTemplates } from "@/drizzle/schema";
import { currentUser } from "@/lib/auth";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResponse<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Denetim şablonu oluştur
 */
export async function createAuditTemplate(data: {
  name: string;
  description?: string;
  category: "Kalite" | "Çevre" | "İSG" | "Bilgi Güvenliği" | "Gıda Güvenliği" | "Diğer";
  questionBankIds?: string[]; // Optional - can be added later
  estimatedDurationMinutes?: string;
}): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only admins can create templates" };
    }

    const [template] = await db
      .insert(auditTemplates)
      .values({
        name: data.name,
        description: data.description,
        category: data.category,
        questionBankIds: JSON.stringify(data.questionBankIds || []),
        estimatedDurationMinutes: data.estimatedDurationMinutes,
        createdById: user.id,
      })
      .returning({ id: auditTemplates.id });

    revalidatePath("/denetim/templates");
    return { success: true, data: { id: template!.id } };
  } catch (error) {
    console.error("Error creating audit template:", error);
    return { success: false, error: "Failed to create audit template" };
  }
}

/**
 * Tüm şablonları listele
 */
export async function getAuditTemplates() {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const templates = await db.query.auditTemplates.findMany({
      where: isNull(auditTemplates.deletedAt),
      with: {
        createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: (auditTemplates, { desc }) => [desc(auditTemplates.createdAt)],
    });

    // questionBankIds JSON string'den parse et
    return templates.map((template) => ({
      ...template,
      questionBankIds: JSON.parse(template.questionBankIds) as string[],
    }));
  } catch (error) {
    console.error("Error fetching audit templates:", error);
    throw error;
  }
}

/**
 * Tek bir şablonu detaylı getir
 */
export async function getAuditTemplateById(templateId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const template = await db.query.auditTemplates.findFirst({
      where: and(
        eq(auditTemplates.id, templateId),
        isNull(auditTemplates.deletedAt)
      ),
      with: {
        createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!template) {
      return null;
    }

    return {
      ...template,
      questionBankIds: JSON.parse(template.questionBankIds) as string[],
    };
  } catch (error) {
    console.error("Error fetching audit template:", error);
    throw error;
  }
}

/**
 * Şablonu güncelle
 */
export async function updateAuditTemplate(
  templateId: string,
  data: {
    name?: string;
    description?: string;
    category?: "Kalite" | "Çevre" | "İSG" | "Bilgi Güvenliği" | "Gıda Güvenliği" | "Diğer";
    questionBankIds?: string[];
    estimatedDurationMinutes?: string;
  }
): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only admins can update templates" };
    }

    const questionBankIdsJson = data.questionBankIds
      ? JSON.stringify(data.questionBankIds)
      : undefined;

    await db
      .update(auditTemplates)
      .set({
        ...data,
        questionBankIds: questionBankIdsJson,
        updatedAt: new Date(),
      })
      .where(eq(auditTemplates.id, templateId));

    revalidatePath("/denetim/templates");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating audit template:", error);
    return { success: false, error: "Failed to update audit template" };
  }
}

/**
 * Şablonu sil (soft delete)
 */
export async function deleteAuditTemplate(templateId: string): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only admins can delete templates" };
    }

    await db
      .update(auditTemplates)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(auditTemplates.id, templateId));

    revalidatePath("/denetim/templates");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting audit template:", error);
    return { success: false, error: "Failed to delete audit template" };
  }
}
