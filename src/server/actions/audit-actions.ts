"use server";

import { db } from "@/drizzle/db";
import { audits, findings, notifications } from "@/drizzle/schema";
import { eq, and, not, isNull } from "drizzle-orm";
import type { ActionResponse, User } from "@/lib/types";
import { 
  withAuth, 
  requireAdmin,
  requireCreatorOrAdmin,
  createNotFoundError,
  createPermissionError,
  createValidationError,
  revalidateAuditPaths,
} from "@/lib/helpers";
import { startWorkflow } from "@/server/actions/workflow-actions";
import { getAuditCompletionWorkflowId, buildAuditMetadata } from "@/lib/workflow/workflow-integration";

/**
 * Yeni denetim oluştur
 */
export async function createAudit(data: {
  title: string;
  description?: string;
  auditDate?: Date;
}): Promise<ActionResponse<{ id: string }>> {
  return withAuth<{ id: string }>(async (user: User) => {
    if (!requireAdmin(user)) {
      return createPermissionError<{ id: string }>("Only auditors can create audits");
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

    revalidateAuditPaths({ audits: true });
    return { success: true, data: { id: audit!.id } };
  });
}

/**
 * Denetimi tamamla (Active → InReview)
 * WORKFLOW INTEGRATION: Starts audit completion workflow for manager approval
 */
export async function completeAudit(auditId: string): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    const audit = await db.query.audits.findFirst({
      where: eq(audits.id, auditId),
    });

    if (!audit) {
      return createNotFoundError("Audit");
    }

    if (audit.status !== "Active") {
      return createValidationError("Only active audits can be completed");
    }

    if (!requireCreatorOrAdmin(user, audit.createdById ?? '')) {
      return createPermissionError("Only audit creator can complete the audit");
    }

    // Check all findings are assigned
    const unassignedFindings = await db.query.findings.findMany({
      where: and(
        eq(findings.auditId, auditId),
        isNull(findings.assignedToId)
      ),
    });

    if (unassignedFindings.length > 0) {
      return createValidationError(
        `${unassignedFindings.length} bulguya henüz sorumlu atanmamış. Tüm bulgulara sorumlu atanmalıdır.`
      );
    }

    // Get findings count for workflow decision
    const allFindings = await db.query.findings.findMany({
      where: eq(findings.auditId, auditId),
    });

    // Update audit status to InReview
    await db
      .update(audits)
      .set({ 
        status: "InReview",
        updatedAt: new Date(),
      })
      .where(eq(audits.id, auditId));

    // Start workflow for audit completion approval
    const workflowId = await getAuditCompletionWorkflowId();
    if (workflowId) {
      await startWorkflow({
        workflowDefinitionId: workflowId,
        entityType: "Audit",
        entityId: auditId,
        entityMetadata: buildAuditMetadata({
          ...audit,
          findingsCount: allFindings.length,
        }),
      });
    }

    revalidateAuditPaths({ audits: true, specificAudit: auditId });
    return { success: true, data: undefined };
  });
}

/**
 * Denetimi kapat (PendingClosure → Closed)
 * WORKFLOW INTEGRATION: Triggered by workflow approval
 * Can also be called manually for backward compatibility
 */
export async function closeAudit(auditId: string): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    const audit = await db.query.audits.findFirst({
      where: eq(audits.id, auditId),
    });

    if (!audit) {
      return createNotFoundError("Audit");
    }

    if (audit.status !== "PendingClosure") {
      return createValidationError("Only audits pending closure can be closed");
    }

    if (!requireCreatorOrAdmin(user, audit.createdById ?? '')) {
      return createPermissionError("Only audit creator can close the audit");
    }

    const openFindings = await db.query.findings.findMany({
      where: and(
        eq(findings.auditId, auditId),
        not(eq(findings.status, "Completed"))
      ),
    });

    if (openFindings.length > 0) {
      return createValidationError(
        `${openFindings.length} bulgu hala açık. Tüm bulgular tamamlanmalı.`
      );
    }

    await db
      .update(audits)
      .set({ 
        status: "Closed",
        updatedAt: new Date(),
      })
      .where(eq(audits.id, auditId));

    revalidateAuditPaths({ audits: true, specificAudit: auditId });
    return { success: true, data: undefined };
  });
}

/**
 * Otomatik kontrol: Tüm bulgular tamamlandıysa InReview → PendingClosure
 * Bu fonksiyon her bulgu kapandığında çağrılabilir
 */
export async function checkAuditCompletionStatus(auditId: string): Promise<ActionResponse> {
  const audit = await db.query.audits.findFirst({
    where: eq(audits.id, auditId),
  });

  if (!audit || audit.status !== "InReview") {
    return { success: true, data: undefined };
  }

  const openFindings = await db.query.findings.findMany({
    where: and(
      eq(findings.auditId, auditId),
      not(eq(findings.status, "Completed"))
    ),
  });

  if (openFindings.length === 0) {
    await db
      .update(audits)
      .set({ 
        status: "PendingClosure",
        updatedAt: new Date(),
      })
      .where(eq(audits.id, auditId));

    revalidateAuditPaths({ audits: true, specificAudit: auditId });
    
    if (audit.auditorId) {
      await db.insert(notifications).values({
        userId: audit.auditorId,
        category: "audit_completed",
        title: "Denetim Tamamlandı",
        message: `Tüm bulgular kapatıldı. Denetim kapatılmayı bekliyor.`,
        relatedEntityType: "audit",
        relatedEntityId: auditId,
        isRead: false,
      });
    }
  }

  return { success: true, data: undefined };
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
  return withAuth(async (user: User) => {
    const audit = await db.query.audits.findFirst({
      where: eq(audits.id, auditId),
    });

    if (!audit) {
      return createNotFoundError("Audit");
    }

    if (!requireCreatorOrAdmin(user, audit.createdById ?? '')) {
      return createPermissionError("Only audit creator or admin can update");
    }

    if (audit.status === "Closed") {
      return createValidationError("Closed audits cannot be edited");
    }

    await db
      .update(audits)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(audits.id, auditId));

    revalidateAuditPaths({ audits: true, all: true, specificAudit: auditId });
    return { success: true, data: undefined };
  });
}

/**
 * Denetimi arşivle (pasife al)
 */
export async function archiveAudit(auditId: string): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    const audit = await db.query.audits.findFirst({
      where: eq(audits.id, auditId),
    });

    if (!audit) {
      return createNotFoundError("Audit");
    }

    if (!requireCreatorOrAdmin(user, audit.createdById ?? '')) {
      return createPermissionError("Only audit creator or admin can archive");
    }

    if (audit.status !== "Active" && audit.status !== "InReview") {
      return createValidationError("Only active or in-review audits can be archived");
    }

    await db
      .update(audits)
      .set({
        status: "Archived",
        updatedAt: new Date(),
      })
      .where(eq(audits.id, auditId));

    revalidateAuditPaths({ audits: true, all: true, specificAudit: auditId });
    return { success: true, data: undefined };
  });
}

/**
 * Denetimi aktife al (arşivden çıkar)
 */
export async function reactivateAudit(auditId: string): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    const audit = await db.query.audits.findFirst({
      where: eq(audits.id, auditId),
    });

    if (!audit) {
      return createNotFoundError("Audit");
    }

    if (!requireCreatorOrAdmin(user, audit.createdById ?? '')) {
      return createPermissionError("Only audit creator or admin can reactivate");
    }

    if (audit.status !== "Archived") {
      return createValidationError("Only archived audits can be reactivated");
    }

    await db
      .update(audits)
      .set({
        status: "Active",
        updatedAt: new Date(),
      })
      .where(eq(audits.id, auditId));

    revalidateAuditPaths({ audits: true, all: true, specificAudit: auditId });
    return { success: true, data: undefined };
  });
}

/**
 * Denetimi sil (soft delete)
 */
export async function deleteAudit(auditId: string): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    const audit = await db.query.audits.findFirst({
      where: eq(audits.id, auditId),
    });

    if (!audit) {
      return createNotFoundError("Audit");
    }

    if (!requireCreatorOrAdmin(user, audit.createdById ?? '')) {
      return createPermissionError("Only audit creator or admin can delete");
    }

    if (audit.status === "Closed") {
      return createValidationError("Closed audits cannot be deleted");
    }

    await db
      .update(audits)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(audits.id, auditId));

    revalidateAuditPaths({ audits: true, all: true });
    return { success: true, data: undefined };
  });
}
