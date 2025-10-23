"use server";

import { db } from "@/drizzle/db";
import { audits, findings } from "@/drizzle/schema";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, and, not } from "drizzle-orm";

type ActionResponse<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Yeni denetim oluştur
 */
export async function createAudit(data: {
  title: string;
  description?: string;
  auditDate?: Date;
}): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Sadece admin veya denetçi oluşturabilir
    if (user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only auditors can create audits" };
    }

    const [audit] = await db
      .insert(audits)
      .values({
        title: data.title,
        description: data.description,
        auditDate: data.auditDate,
        createdById: user.id,
      })
      .returning({ id: audits.id });

    revalidatePath("/denetim/audits");
    return { success: true, data: { id: audit!.id } };
  } catch (error) {
    console.error("Error creating audit:", error);
    return { success: false, error: "Failed to create audit" };
  }
}

/**
 * Denetimi tamamla (Active → InReview)
 * Denetçi sorumluluğunu bırakır, bulgular süreç sahiplerince tamamlanır
 */
export async function completeAudit(auditId: string): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Denetimi kontrol et
    const audit = await db.query.audits.findFirst({
      where: eq(audits.id, auditId),
    });

    if (!audit) {
      return { success: false, error: "Audit not found" };
    }

    // Sadece Active denetimler tamamlanabilir
    if (audit.status !== "Active") {
      return { success: false, error: "Only active audits can be completed" };
    }

    // Denetçi veya admin olmalı
    if (audit.createdById !== user.id && user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only audit creator can complete the audit" };
    }

    // Status'u InReview'e al
    await db
      .update(audits)
      .set({ 
        status: "InReview",
        updatedAt: new Date(),
      })
      .where(eq(audits.id, auditId));

    revalidatePath(`/denetim/audits/${auditId}`);
    revalidatePath("/denetim/audits");
    
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error completing audit:", error);
    return { success: false, error: "Failed to complete audit" };
  }
}

/**
 * Denetimi kapat (PendingClosure → Closed)
 * Denetçi tüm bulguların tamamlandığını onaylar ve denetimi kapatır
 */
export async function closeAudit(auditId: string): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Denetimi kontrol et
    const audit = await db.query.audits.findFirst({
      where: eq(audits.id, auditId),
    });

    if (!audit) {
      return { success: false, error: "Audit not found" };
    }

    // Sadece PendingClosure denetimler kapatılabilir
    if (audit.status !== "PendingClosure") {
      return { success: false, error: "Only audits pending closure can be closed" };
    }

    // Denetçi veya admin olmalı
    if (audit.createdById !== user.id && user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only audit creator can close the audit" };
    }

    // Tüm bulguların Completed olduğunu kontrol et
    const openFindings = await db.query.findings.findMany({
      where: and(
        eq(findings.auditId, auditId),
        not(eq(findings.status, "Completed"))
      ),
    });

    if (openFindings.length > 0) {
      return { 
        success: false, 
        error: `${openFindings.length} bulgu hala açık. Tüm bulgular tamamlanmalı.` 
      };
    }

    // Status'u Closed'a al
    await db
      .update(audits)
      .set({ 
        status: "Closed",
        updatedAt: new Date(),
      })
      .where(eq(audits.id, auditId));

    revalidatePath(`/denetim/audits/${auditId}`);
    revalidatePath("/denetim/audits");
    
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error closing audit:", error);
    return { success: false, error: "Failed to close audit" };
  }
}

/**
 * Otomatik kontrol: Tüm bulgular tamamlandıysa InReview → PendingClosure
 * Bu fonksiyon her bulgu kapandığında çağrılabilir
 */
export async function checkAuditCompletionStatus(auditId: string): Promise<ActionResponse> {
  try {
    // Denetimi kontrol et
    const audit = await db.query.audits.findFirst({
      where: eq(audits.id, auditId),
    });

    if (!audit || audit.status !== "InReview") {
      return { success: true, data: undefined }; // İşlem yapmaya gerek yok
    }

    // Açık bulgu var mı kontrol et
    const openFindings = await db.query.findings.findMany({
      where: and(
        eq(findings.auditId, auditId),
        not(eq(findings.status, "Completed"))
      ),
    });

    // Tüm bulgular tamamlandıysa PendingClosure'a al
    if (openFindings.length === 0) {
      await db
        .update(audits)
        .set({ 
          status: "PendingClosure",
          updatedAt: new Date(),
        })
        .where(eq(audits.id, auditId));

      revalidatePath(`/denetim/audits/${auditId}`);
      revalidatePath("/denetim/audits");
      
      // TODO: Denetçiye bildirim gönder
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error checking audit completion:", error);
    return { success: false, error: "Failed to check completion status" };
  }
}

/**
 * Denetimi güncelle
 */
export async function updateAudit(
  auditId: string,
  data: {
    title?: string;
    description?: string;
    auditDate?: Date;
  }
): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Denetimi kontrol et
    const audit = await db.query.audits.findFirst({
      where: eq(audits.id, auditId),
    });

    if (!audit) {
      return { success: false, error: "Audit not found" };
    }

    // Sadece creator veya admin düzenleyebilir
    if (audit.createdById !== user.id && user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only audit creator or admin can update" };
    }

    // Closed denetimler düzenlenemez
    if (audit.status === "Closed") {
      return { success: false, error: "Closed audits cannot be edited" };
    }

    await db
      .update(audits)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(audits.id, auditId));

    revalidatePath(`/denetim/audits/${auditId}`);
    revalidatePath("/denetim/audits");
    revalidatePath("/denetim/all");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating audit:", error);
    return { success: false, error: "Failed to update audit" };
  }
}

/**
 * Denetimi arşivle (pasife al)
 */
export async function archiveAudit(auditId: string): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Denetimi kontrol et
    const audit = await db.query.audits.findFirst({
      where: eq(audits.id, auditId),
    });

    if (!audit) {
      return { success: false, error: "Audit not found" };
    }

    // Sadece creator veya admin arşivleyebilir
    if (audit.createdById !== user.id && user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only audit creator or admin can archive" };
    }

    // Sadece Active veya InReview durumundaki denetimler arşivlenebilir
    if (audit.status !== "Active" && audit.status !== "InReview") {
      return { success: false, error: "Only active or in-review audits can be archived" };
    }

    await db
      .update(audits)
      .set({
        status: "Archived",
        updatedAt: new Date(),
      })
      .where(eq(audits.id, auditId));

    revalidatePath(`/denetim/audits/${auditId}`);
    revalidatePath("/denetim/audits");
    revalidatePath("/denetim/all");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error archiving audit:", error);
    return { success: false, error: "Failed to archive audit" };
  }
}

/**
 * Denetimi aktife al (arşivden çıkar)
 */
export async function reactivateAudit(auditId: string): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Denetimi kontrol et
    const audit = await db.query.audits.findFirst({
      where: eq(audits.id, auditId),
    });

    if (!audit) {
      return { success: false, error: "Audit not found" };
    }

    // Sadece creator veya admin aktive edebilir
    if (audit.createdById !== user.id && user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only audit creator or admin can reactivate" };
    }

    // Sadece Archived durumundaki denetimler aktive edilebilir
    if (audit.status !== "Archived") {
      return { success: false, error: "Only archived audits can be reactivated" };
    }

    await db
      .update(audits)
      .set({
        status: "Active",
        updatedAt: new Date(),
      })
      .where(eq(audits.id, auditId));

    revalidatePath(`/denetim/audits/${auditId}`);
    revalidatePath("/denetim/audits");
    revalidatePath("/denetim/all");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error reactivating audit:", error);
    return { success: false, error: "Failed to reactivate audit" };
  }
}

/**
 * Denetimi sil (soft delete)
 */
export async function deleteAudit(auditId: string): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Denetimi kontrol et
    const audit = await db.query.audits.findFirst({
      where: eq(audits.id, auditId),
    });

    if (!audit) {
      return { success: false, error: "Audit not found" };
    }

    // Sadece creator veya admin silebilir
    if (audit.createdById !== user.id && user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only audit creator or admin can delete" };
    }

    // Closed denetimler silinemez (güvenlik)
    if (audit.status === "Closed") {
      return { success: false, error: "Closed audits cannot be deleted" };
    }

    // Soft delete
    await db
      .update(audits)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(audits.id, auditId));

    revalidatePath("/denetim/audits");
    revalidatePath("/denetim/all");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting audit:", error);
    return { success: false, error: "Failed to delete audit" };
  }
}
