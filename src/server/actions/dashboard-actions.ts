"use server";

import { db } from "@/drizzle/db";
import { audits, findings, actions as actionsTable, dofs } from "@/drizzle/schema";
import { eq, and, or, inArray, sql } from "drizzle-orm";
import { withAuth } from "@/lib/helpers";
import type { ActionResponse, User } from "@/lib/types";

/**
 * Dashboard istatistikleri için server action
 */
export async function getDashboardStats(): Promise<ActionResponse<{
  audits: { total: number; mine: number };
  findings: { total: number; mine: number };
  actions: { total: number; mine: number };
  dofs: { total: number; mine: number };
}>> {
  return withAuth(async (user: User) => {
    const userId = user.id;

    // Paralel sorgular ile performans optimize edildi
    const [
      totalAudits,
      myAudits,
      totalFindings,
      myFindings,
      totalActions,
      myActions,
      totalDofs,
      myDofs,
    ] = await Promise.all([
      // Toplam denetimler
      db.select().from(audits).then((rows) => rows.length),

      // Benim denetimlerim (oluşturan veya atanan)
      db
        .select()
        .from(audits)
        .where(
          or(
            eq(audits.createdById, userId),
            eq(audits.auditorId, userId)
          )
        )
        .then((rows) => rows.length),

      // Toplam bulgular
      db.select().from(findings).then((rows) => rows.length),

      // Benim bulgularım (atanan)
      db
        .select()
        .from(findings)
        .where(
          and(
            eq(findings.assignedToId, userId),
            inArray(findings.status, ["New", "Assigned", "InProgress"])
          )
        )
        .then((rows) => rows.length),

      // Toplam aksiyonlar
      db.select().from(actionsTable).then((rows) => rows.length),

      // Benim aksiyonlarım (atanan veya bekleyen onay)
      db
        .select()
        .from(actionsTable)
        .where(
          and(
            or(
              eq(actionsTable.assignedToId, userId),
              eq(actionsTable.managerId, userId)
            ),
            sql`${actionsTable.status} IN ('Assigned', 'PendingManagerApproval')`
          )
        )
        .then((rows) => rows.length),

      // Toplam DÖF'ler
      db.select().from(dofs).then((rows) => rows.length),

      // Benim DÖF'lerim (atanan veya bekleyen onay)
      db
        .select()
        .from(dofs)
        .where(
          and(
            or(
              eq(dofs.assignedToId, userId),
              eq(dofs.managerId, userId)
            ),
            sql`${dofs.status} IN ('Step1_Problem', 'Step2_TempMeasures', 'Step3_RootCause', 'Step4_Activities', 'Step5_Implementation', 'Step6_Effectiveness', 'Step7_Approval')`
          )
        )
        .then((rows) => rows.length),
    ]);

    return {
      success: true,
      data: {
        audits: {
          total: totalAudits,
          mine: myAudits,
        },
        findings: {
          total: totalFindings,
          mine: myFindings,
        },
        actions: {
          total: totalActions,
          mine: myActions,
        },
        dofs: {
          total: totalDofs,
          mine: myDofs,
        },
      },
    };
  });
}

/**
 * Kullanıcının bekleyen görev sayıları
 */
export async function getMyTaskCounts(): Promise<ActionResponse<{
  actions: number;
  dofs: number;
  approvals: number;
  findings: number;
  total: number;
}>> {
  return withAuth(async (user: User) => {
    const userId = user.id;

    const [
      pendingActions,
      pendingDofs,
      pendingApprovals,
      pendingFindings,
    ] = await Promise.all([
      // Bekleyen aksiyonlar
      db
        .select()
        .from(actionsTable)
        .where(
          and(
            eq(actionsTable.assignedToId, userId),
            eq(actionsTable.status, "Assigned")
          )
        )
        .then((rows) => rows.length),

      // Bekleyen DÖF'ler
      db
        .select()
        .from(dofs)
        .where(
          and(
            eq(dofs.assignedToId, userId),
            sql`${dofs.status} IN ('Step1_Problem', 'Step2_TempMeasures', 'Step3_RootCause', 'Step4_Activities', 'Step5_Implementation', 'Step6_Effectiveness')`
          )
        )
        .then((rows) => rows.length),

      // Onay bekleyenler (yönetici olarak)
      db
        .select()
        .from(actionsTable)
        .where(
          and(
            eq(actionsTable.managerId, userId),
            sql`${actionsTable.status} = 'PendingManagerApproval'`
          )
        )
        .then(async (actionRows) => {
          const dofRows = await db
            .select()
            .from(dofs)
            .where(
              and(
                eq(dofs.managerId, userId),
                sql`${dofs.status} = 'Step7_Approval'`
              )
            );
          return actionRows.length + dofRows.length;
        }),

      // Bekleyen bulgular
      db
        .select()
        .from(findings)
        .where(
          and(
            eq(findings.assignedToId, userId),
            sql`${findings.status} IN ('New', 'Assigned', 'InProgress')`
          )
        )
        .then((rows) => rows.length),
    ]);

    return {
      success: true,
      data: {
        actions: pendingActions,
        dofs: pendingDofs,
        approvals: pendingApprovals,
        findings: pendingFindings,
        total: pendingActions + pendingDofs + pendingApprovals + pendingFindings,
      },
    };
  });
}
