"use server";

import { db } from "@/drizzle/db";
import { findings, actions, dofs } from "@/drizzle/schema";
import { currentUser } from "@/lib/auth";
import { eq, and, not, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { checkAuditCompletionStatus } from "./audit-actions";

// Response Types
type ActionResponse<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * FR-001: Denetçi, Bulgu Oluşturabilir
 * Yeni bir bulgu oluşturur ve isteğe bağlı olarak Süreç Sahibine atar
 */
export async function createFinding(data: {
  auditId: string;
  details: string;
  riskType?: string;
  assignedToId?: string;
}): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Sadece Denetçi veya Admin bulgu oluşturabilir
    if (user.role !== "admin" && user.role !== "superAdmin") {
      // TODO: Denetçi rolü eklendiğinde kontrol et
      return { success: false, error: "Only auditors can create findings" };
    }

    const [finding] = await db
      .insert(findings)
      .values({
        auditId: data.auditId,
        details: data.details,
        riskType: data.riskType,
        assignedToId: data.assignedToId,
        status: data.assignedToId ? "Assigned" : "New",
        createdById: user.id,
      })
      .returning({ id: findings.id });

    revalidatePath("/findings");
    return { success: true, data: { id: finding!.id } };
  } catch (error) {
    console.error("Error creating finding:", error);
    return { success: false, error: "Failed to create finding" };
  }
}

/**
 * FR-002: Denetçi, Bulguyu Süreç Sahibine Atayabilir
 */
export async function assignFinding(
  findingId: string,
  assignedToId: string
): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Sadece Denetçi veya bulguyu oluşturan kişi atayabilir
    const finding = await db.query.findings.findFirst({
      where: eq(findings.id, findingId),
    });

    if (!finding) {
      return { success: false, error: "Finding not found" };
    }

    if (finding.createdById !== user.id && user.role !== "admin") {
      return { success: false, error: "Permission denied" };
    }

    await db
      .update(findings)
      .set({
        assignedToId,
        status: "Assigned",
        updatedAt: new Date(),
      })
      .where(eq(findings.id, findingId));

    revalidatePath("/findings");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error assigning finding:", error);
    return { success: false, error: "Failed to assign finding" };
  }
}

/**
 * FR-005: Süreç Sahibi, Tüm Alt Görevler Tamamlandığında Bulguyu Denetçi Onayına Gönderir
 */
export async function submitFindingForClosure(
  findingId: string
): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Bulgunun Süreç Sahibi olup olmadığını kontrol et
    const finding = await db.query.findings.findFirst({
      where: eq(findings.id, findingId),
    });

    if (!finding) {
      return { success: false, error: "Finding not found" };
    }

    if (finding.assignedToId !== user.id && user.role !== "admin") {
      return { success: false, error: "Only process owner can submit for closure" };
    }

    // Tüm alt görevlerin (actions + dofs) tamamlandığını kontrol et
    const [actionsCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(actions)
      .where(
        and(
          eq(actions.findingId, findingId),
          not(eq(actions.status, "Completed"))
        )
      );

    const [dofsCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(dofs)
      .where(
        and(
          eq(dofs.findingId, findingId),
          not(eq(dofs.status, "Completed"))
        )
      );

    const pendingTasks = (actionsCount?.count || 0) + (dofsCount?.count || 0);

    if (pendingTasks > 0) {
      return {
        success: false,
        error: `${pendingTasks} alt görev henüz tamamlanmadı. Tüm aksiyonlar ve DÖF'ler tamamlanmalıdır.`
      };
    }

    await db
      .update(findings)
      .set({
        status: "PendingAuditorClosure",
        updatedAt: new Date(),
      })
      .where(eq(findings.id, findingId));

    revalidatePath("/findings");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error submitting finding for closure:", error);
    return { success: false, error: "Failed to submit finding" };
  }
}

/**
 * FR-006: Denetçi, Bulguyu Kapatabilir (Onayla)
 */
export async function closeFinding(
  findingId: string
): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Sadece Denetçi veya Admin kapatabilir
    if (user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only auditors can close findings" };
    }

    const finding = await db.query.findings.findFirst({
      where: eq(findings.id, findingId),
    });

    if (!finding) {
      return { success: false, error: "Finding not found" };
    }

    if (finding.status !== "PendingAuditorClosure") {
      return { 
        success: false, 
        error: "Finding must be submitted for closure first" 
      };
    }

    await db
      .update(findings)
      .set({
        status: "Completed",
        updatedAt: new Date(),
      })
      .where(eq(findings.id, findingId));

    // Denetim otomatik kontrolü - tüm bulgular tamamlandıysa PendingClosure'a al
    if (finding.auditId) {
      await checkAuditCompletionStatus(finding.auditId);
    }

    revalidatePath("/findings");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error closing finding:", error);
    return { success: false, error: "Failed to close finding" };
  }
}

/**
 * FR-006: Denetçi, Bulguyu Reddedebilir (Yetersiz)
 */
export async function rejectFinding(
  findingId: string,
  reason?: string
): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Sadece Denetçi veya Admin reddedebilir
    if (user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Only auditors can reject findings" };
    }

    await db
      .update(findings)
      .set({
        status: "Rejected",
        updatedAt: new Date(),
        // TODO: Ret nedeni için ayrı bir alan eklenebilir
      })
      .where(eq(findings.id, findingId));

    revalidatePath("/findings");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error rejecting finding:", error);
    return { success: false, error: "Failed to reject finding" };
  }
}

/**
 * Bulgu listesini getir (Kullanıcı rolüne göre filtrelenmiş)
 */
export async function getFindings() {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Admin tüm bulguları görebilir
    if (user.role === "admin" || user.role === "superAdmin") {
      return await db.query.findings.findMany({
        with: {
          audit: true,
          assignedTo: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
          createdBy: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: (findings, { desc }) => [desc(findings.createdAt)],
      });
    }

    // Kullanıcı sadece kendine atanan bulguları görebilir
    return await db.query.findings.findMany({
      where: eq(findings.assignedToId, user.id),
      with: {
        audit: true,
        assignedTo: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: (findings, { desc }) => [desc(findings.createdAt)],
    });
  } catch (error) {
    console.error("Error fetching findings:", error);
    throw error;
  }
}

/**
 * Bulguyu güncelle (Risk değerlendirmesi ve atama)
 */
export async function updateFinding(
  findingId: string,
  data: {
    details?: string;
    riskType?: string;
    assignedToId?: string;
  }
): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Bulguyu kontrol et
    const finding = await db.query.findings.findFirst({
      where: eq(findings.id, findingId),
    });

    if (!finding) {
      return { success: false, error: "Finding not found" };
    }

    // Yetki kontrolü: Sadece oluşturan veya admin düzenleyebilir
    if (finding.createdById !== user.id && user.role !== "admin" && user.role !== "superAdmin") {
      return { success: false, error: "Permission denied" };
    }

    // Güncelleme yap
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.details !== undefined) {
      updateData.details = data.details;
    }

    if (data.riskType !== undefined) {
      updateData.riskType = data.riskType;
    }

    if (data.assignedToId !== undefined) {
      updateData.assignedToId = data.assignedToId;
      // Eğer atama yapılıyorsa status'u güncelle
      if (data.assignedToId && finding.status === "New") {
        updateData.status = "Assigned";
      }
    }

    await db
      .update(findings)
      .set(updateData)
      .where(eq(findings.id, findingId));

    revalidatePath("/denetim/findings");
    revalidatePath(`/denetim/findings/${findingId}`);
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating finding:", error);
    return { success: false, error: "Failed to update finding" };
  }
}

/**
 * Tek bir bulguyu ID ile getir
 */
export async function getFindingById(findingId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const finding = await db.query.findings.findFirst({
      where: eq(findings.id, findingId),
      with: {
        audit: true,
        assignedTo: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!finding) {
      throw new Error("Finding not found");
    }

    // Yetki kontrolü
    if (
      user.role !== "admin" &&
      user.role !== "superAdmin" &&
      finding.assignedToId !== user.id &&
      finding.createdById !== user.id
    ) {
      throw new Error("Permission denied");
    }

    return finding;
  } catch (error) {
    console.error("Error fetching finding:", error);
    throw error;
  }
}
