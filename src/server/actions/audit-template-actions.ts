"use server";

import { db } from "@/drizzle/db";
import { auditTemplates } from "@/drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";
import type { ActionResponse, User } from "@/lib/types";
import { 
  withAuth, 
  createPermissionError,
  revalidateAuditPaths,
} from "@/lib/helpers";
import { checkPermission } from "@/lib/permissions/unified-permission-checker";

/**
 * Denetim şablonu oluştur
 */
export async function createAuditTemplate(data: {
  name: string;
  description?: string;
  category: "Kalite" | "Çevre" | "İSG" | "Bilgi Güvenliği" | "Gıda Güvenliği" | "Diğer";
  questionBankIds?: string[];
  estimatedDurationMinutes?: string;
}): Promise<ActionResponse<{ id: string }>> {
  return withAuth<{ id: string }>(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "template",
      action: "create",
    });

    if (!perm.allowed) {
      return createPermissionError<{ id: string }>(perm.reason || "Permission denied");
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

    revalidateAuditPaths({ plans: true });
    return { success: true, data: { id: template!.id } };
  });
}

/**
 * Tüm şablonları listele
 */
export async function getAuditTemplates(): Promise<any> {
  const result = await withAuth<any[]>(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "template",
      action: "read",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
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

    const data = templates.map((template) => ({
      ...template,
      questionBankIds: JSON.parse(template.questionBankIds) as string[],
    }));

    return { success: true, data };
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}

/**
 * Tek bir şablonu detaylı getir
 */
export async function getAuditTemplateById(templateId: string): Promise<any> {
  const result = await withAuth<any>(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "template",
      action: "read",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
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
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        ...template,
        questionBankIds: JSON.parse(template.questionBankIds) as string[],
      },
    };
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
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
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "template",
      action: "update",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
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

    revalidateAuditPaths({ plans: true });
    return { success: true, data: undefined };
  });
}

/**
 * Şablonu sil (soft delete)
 */
export async function deleteAuditTemplate(templateId: string): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "template",
      action: "delete",
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    await db
      .update(auditTemplates)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(auditTemplates.id, templateId));

    revalidateAuditPaths({ plans: true });
    return { success: true, data: undefined };
  });
}
