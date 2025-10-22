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
