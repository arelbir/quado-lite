"use server";

import { db } from "@/drizzle/db";
import { actions, dofs, findings } from "@/drizzle/schema";
import { eq, and, or, inArray } from "drizzle-orm";
import { withAuth } from "@/lib/helpers";

/**
 * Bekleyen İşlerim - Tüm atanan görevleri getir
 */
export async function getMyPendingTasks() {
  const result = await withAuth(async (user) => {

    // 1. Aksiyonlarım (Atanan veya Onay Bekleyen)
    const myActions = await db.query.actions.findMany({
      where: or(
        eq(actions.assignedToId, user.id),
        and(
          eq(actions.managerId, user.id),
          eq(actions.status, "PendingManagerApproval")
        )
      ),
      with: {
        finding: {
          columns: {
            id: true,
            details: true,
          },
        },
        assignedTo: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: (actions, { desc }) => [desc(actions.createdAt)],
    });

    // 2. DÖF'lerim (Sorumlu olduğum ve tamamlanmamış)
    const myDofs = await db.query.dofs.findMany({
      where: and(
        eq(dofs.assignedToId, user.id),
        inArray(dofs.status, [
          "Step1_Problem",
          "Step2_TempMeasures",
          "Step3_RootCause",
          "Step4_Activities",
          "Step5_Implementation",
          "Step6_EffectivenessCheck",
          "PendingManagerApproval",
        ])
      ),
      with: {
        finding: {
          columns: {
            id: true,
            details: true,
          },
        },
        assignedTo: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: (dofs, { desc }) => [desc(dofs.createdAt)],
    });

    // 3. Onaylarım (Yönetici ise - Aksiyon ve DÖF onayları)
    const myApprovals = {
      actions: await db.query.actions.findMany({
        where: and(
          eq(actions.managerId, user.id),
          eq(actions.status, "PendingManagerApproval")
        ),
        with: {
          assignedTo: {
            columns: {
              id: true,
              name: true,
            },
          },
          finding: {
            columns: {
              id: true,
              details: true,
            },
          },
        },
        orderBy: (actions, { desc }) => [desc(actions.createdAt)],
      }),
      dofs: await db.query.dofs.findMany({
        where: and(
          eq(dofs.managerId, user.id),
          eq(dofs.status, "PendingManagerApproval")
        ),
        with: {
          assignedTo: {
            columns: {
              id: true,
              name: true,
            },
          },
          finding: {
            columns: {
              id: true,
              details: true,
            },
          },
        },
        orderBy: (dofs, { desc }) => [desc(dofs.createdAt)],
      }),
    };

    // 4. Bulgularım (Atanan açık bulgular)
    const myFindings = await db.query.findings.findMany({
      where: and(
        eq(findings.assignedToId, user.id),
        inArray(findings.status, ["New", "Assigned", "InProgress"])
      ),
      with: {
        audit: {
          columns: {
            id: true,
            title: true,
          },
        },
        assignedTo: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: (findings, { desc }) => [desc(findings.createdAt)],
    });

    // Özet istatistikler
    const summary = {
      totalActions: myActions.length,
      pendingActions: myActions.filter(a => a.status === "Assigned").length,
      totalDofs: myDofs.length,
      totalApprovals: myApprovals.actions.length + myApprovals.dofs.length,
      totalFindings: myFindings.length,
    };

    return {
      success: true,
      data: {
        actions: myActions,
        dofs: myDofs,
        approvals: myApprovals,
        findings: myFindings,
        summary,
      },
    };
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}

/**
 * Quick stats - sadece sayılar
 */
export async function getMyTasksCount() {
  const result = await withAuth(async (user) => {

    const [actionsCount, dofsCount, approvalsCount, findingsCount] = await Promise.all([
      db.query.actions.findMany({
        where: eq(actions.assignedToId, user.id),
        columns: { id: true },
      }),
      db.query.dofs.findMany({
        where: and(
          eq(dofs.assignedToId, user.id),
          inArray(dofs.status, [
            "Step1_Problem",
            "Step2_TempMeasures",
            "Step3_RootCause",
            "Step4_Activities",
            "Step5_Implementation",
            "Step6_EffectivenessCheck",
            "PendingManagerApproval",
          ])
        ),
        columns: { id: true },
      }),
      db.query.actions.findMany({
        where: and(
          eq(actions.managerId, user.id),
          eq(actions.status, "PendingManagerApproval")
        ),
        columns: { id: true },
      }),
      db.query.findings.findMany({
        where: and(
          eq(findings.assignedToId, user.id),
          inArray(findings.status, ["New", "Assigned", "InProgress"])
        ),
        columns: { id: true },
      }),
    ]);

    return {
      success: true,
      data: {
        actions: actionsCount.length,
        dofs: dofsCount.length,
        approvals: approvalsCount.length,
        findings: findingsCount.length,
      },
    };
  });

  if (!result.success) {
    return { actions: 0, dofs: 0, approvals: 0, findings: 0 };
  }

  return result.data;
}
