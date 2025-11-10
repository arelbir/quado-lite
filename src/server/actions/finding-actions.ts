"use server";

import { db } from "@/drizzle/db";
import { findings, actions, dofs, audits } from "@/drizzle/schema";
import { eq, and, not, sql } from "drizzle-orm";
import type { ActionResponse, User, Finding } from "@/lib/types";
import { 
  withAuth, 
  requireAdmin,
  requireCreatorOrAdmin,
  createNotFoundError,
  createPermissionError,
  createValidationError,
  revalidateFindingPaths,
  revalidateAuditPaths,
} from "@/lib/helpers";
import { checkPermission } from "@/lib/permissions/unified-permission-checker";
import { startWorkflow } from "@/server/actions/workflow-actions";
import { getFindingWorkflowId, buildFindingMetadata } from "@/lib/workflow/workflow-integration";
import { checkAuditCompletionStatus } from "./audit-actions";

/**
 * FR-001: Denetçi, Bulgu Oluşturabilir
 * 
 * Yeni bir bulgu oluşturur ve isteğe bağlı olarak Süreç Sahibine atar.
 * 
 * @param data - Bulgu bilgileri
 * @param data.auditId - Denetim ID
 * @param data.details - Bulgu detayları
 * @param data.riskType - Risk seviyesi (optional)
 * @param data.assignedToId - Atanacak kullanıcı ID (optional)
 * @returns ActionResponse with finding ID
 * @throws Error if user is not an auditor/admin
 * 
 * @example
 * ```ts
 * const result = await createFinding({
 *   auditId: '123',
 *   details: 'Uygunsuzluk tespit edildi',
 *   riskType: 'High',
 *   assignedToId: 'user-456'
 * });
 * ```
 */
export async function createFinding(data: {
  auditId: string;
  details: string;
  riskType?: string;
  assignedToId?: string;
}): Promise<ActionResponse<{ id: string }>> {
  return withAuth<{ id: string }>(async (user: User) => {
    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "finding",
      action: "create",
    });

    if (!perm.allowed) {
      return createPermissionError<{ id: string }>(perm.reason || "Permission denied");
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

    revalidateFindingPaths({ list: true });
    return { success: true, data: { id: finding!.id } };
  });
}

/**
 * FR-002: Denetçi, Bulguyu Süreç Sahibine Atayabilir
 * 
 * Bulguyu belirtilen süreç sahibine atar ve durumunu günceller.
 * 
 * @param findingId - Bulgu ID
 * @param assignedToId - Atanacak kullanıcı ID
 * @returns ActionResponse
 * @throws Error if finding not found or user lacks permission
 * 
 * @example
 * ```ts
 * await assignFinding('finding-123', 'user-456');
 * ```
 */
export async function assignFinding(
  findingId: string,
  assignedToId: string
): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    const finding = await db.query.findings.findFirst({
      where: eq(findings.id, findingId),
    });

    if (!finding) {
      return createNotFoundError("Finding");
    }

    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "finding",
      action: "update",
      entity: {
        id: finding.id,
        assignedToId: finding.assignedToId,
        createdById: finding.createdById,
        status: finding.status,
      },
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    await db
      .update(findings)
      .set({
        assignedToId,
        status: "Assigned",
        updatedAt: new Date(),
      })
      .where(eq(findings.id, findingId));

    revalidateFindingPaths({ list: true });
    return { success: true, data: undefined };
  });
}

/**
 * FR-005: Süreç Sahibi, Bulguyu Denetçi Onayına Gönderir
 * 
 * Tüm aksiyonlar tamamlandığında bulguyu kapatma için denetçi onayına gönderir.
 * 
 * @param findingId - Bulgu ID
 * @returns ActionResponse
 * @throws Error if finding not found, incomplete actions exist, or user lacks permission
 * 
 * @example
 * ```ts
 * await submitFindingForClosure('finding-123');
 * ```
 */
export async function submitFindingForClosure(
  findingId: string
): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    const finding = await db.query.findings.findFirst({
      where: eq(findings.id, findingId),
    });

    if (!finding) {
      return createNotFoundError("Finding");
    }

    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "finding",
      action: "submit",
      entity: {
        id: finding.id,
        assignedToId: finding.assignedToId,
        createdById: finding.createdById,
        status: finding.status,
      },
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

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
      return createValidationError(
        `${pendingTasks} alt görev henüz tamamlanmadı. Tüm aksiyonlar ve DÖF'ler tamamlanmalıdır.`
      );
    }

    await db
      .update(findings)
      .set({
        status: "PendingAuditorClosure",
        updatedAt: new Date(),
      })
      .where(eq(findings.id, findingId));

    // Workflow başlat
    try {
      const workflowId = await getFindingWorkflowId();

      if (workflowId) {
        await startWorkflow({
          workflowDefinitionId: workflowId,
          entityType: "Finding",
          entityId: findingId,
          entityMetadata: buildFindingMetadata(finding),
        });
      }
    } catch (error) {
      console.error("Workflow start failed:", error);
    }

    revalidateFindingPaths({ list: true });
    return { success: true, data: undefined };
  });
}

/**
 * FR-006: Denetçi, Bulguyu Kapatabilir (Onayla)
 */
export async function closeFinding(
  findingId: string
): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    const finding = await db.query.findings.findFirst({
      where: eq(findings.id, findingId),
    });

    if (!finding) {
      return createNotFoundError("Finding");
    }

    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "finding",
      action: "approve",
      entity: {
        id: finding.id,
        assignedToId: finding.assignedToId,
        createdById: finding.createdById,
        status: finding.status,
      },
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    if (finding.status !== "PendingAuditorClosure") {
      return createValidationError("Finding must be submitted for closure first");
    }

    await db
      .update(findings)
      .set({
        status: "Completed",
        updatedAt: new Date(),
      })
      .where(eq(findings.id, findingId));

    if (finding.auditId) {
      await checkAuditCompletionStatus(finding.auditId);
    }

    revalidateFindingPaths({ list: true });
    return { success: true, data: undefined };
  });
}

/**
 * FR-006: Denetçi, Bulguyu Reddedebilir (Yetersiz)
 */
export async function rejectFinding(
  findingId: string,
  reason?: string
): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    const finding = await db.query.findings.findFirst({
      where: eq(findings.id, findingId),
    });

    if (!finding) {
      return createNotFoundError("Finding");
    }

    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "finding",
      action: "reject",
      entity: {
        id: finding.id,
        assignedToId: finding.assignedToId,
        createdById: finding.createdById,
        status: finding.status,
      },
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

    await db
      .update(findings)
      .set({
        status: "Rejected",
        rejectionReason: reason || null,
        updatedAt: new Date(),
      })
      .where(eq(findings.id, findingId));

    revalidateFindingPaths({ list: true });
    return { success: true, data: undefined };
  });
}

/**
 * Bulgu listesini getir (Kullanıcı rolüne göre filtrelenmiş)
 */
export async function getFindings() {
  const result = await withAuth(async (user: User) => {
    // Check if user is admin using multi-role system
    const isAdmin = user.userRoles?.some((ur: any) => 
      ur.role?.code === 'ADMIN' || ur.role?.code === 'SUPER_ADMIN'
    );
    
    if (isAdmin) {
      const data = await db.query.findings.findMany({
        with: {
          createdBy: true,
        },
        orderBy: (findings, { desc }) => [desc(findings.createdAt)],
      });
      return { success: true, data };
    }

    const data = await db.query.findings.findMany({
      where: eq(findings.assignedToId, user.id),
      with: {
        createdBy: true,
      },
      orderBy: (findings, { desc }) => [desc(findings.createdAt)],
    });
    return { success: true, data };
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
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
  return withAuth(async (user: User) => {
    const finding = await db.query.findings.findFirst({
      where: eq(findings.id, findingId),
    });

    if (!finding) {
      return createNotFoundError("Finding");
    }

    // ✅ UNIFIED PERMISSION CHECK
    const perm = await checkPermission({
      user: user as any,
      resource: "finding",
      action: "update",
      entity: {
        id: finding.id,
        assignedToId: finding.assignedToId,
        createdById: finding.createdById,
        status: finding.status,
      },
    });

    if (!perm.allowed) {
      return createPermissionError(perm.reason || "Permission denied");
    }

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
      if (data.assignedToId && finding.status === "New") {
        updateData.status = "Assigned";
      }
    }

    await db
      .update(findings)
      .set(updateData)
      .where(eq(findings.id, findingId));

    revalidateFindingPaths({ list: true, specific: findingId });
    return { success: true, data: undefined };
  });
}

/**
 * Tek bir bulguyu ID ile getir
 */
export async function getFindingById(findingId: string) {
  const result = await withAuth(async (user: User) => {
    const finding = await db.query.findings.findFirst({
      where: eq(findings.id, findingId),
      with: {
        createdBy: {
          columns: {
            id: true,
            name: true,
          },
        },
        // @ts-expect-error - Drizzle relation type inference limitation
        assignedTo: {
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

    // Check permission: Admin, assignee, or creator
    const isAdmin = user.userRoles?.some((ur: any) => ur.role?.code === 'ADMIN' || ur.role?.code === 'SUPER_ADMIN');
    if (
      !isAdmin &&
      finding.assignedToId !== user.id &&
      finding.createdById !== user.id
    ) {
      throw new Error("Permission denied");
    }

    return { success: true, data: finding };
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}
