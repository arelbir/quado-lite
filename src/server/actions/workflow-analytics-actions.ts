"use server";

import { db } from "@/drizzle/db";
import { workflowInstances, stepAssignments, workflowTimeline } from "@/drizzle/schema";
import { eq, and, gte, sql, count } from "drizzle-orm";
import { withAuth } from "@/lib/helpers";
import type { ActionResponse } from "@/lib/types";

/**
 * WORKFLOW ANALYTICS ACTIONS
 * Server actions for workflow analytics and statistics
 * 
 * Created: 2025-01-25
 */

/**
 * Get overall workflow statistics
 */
export async function getWorkflowStats(): Promise<ActionResponse<any>> {
  return withAuth(async () => {
    // Total instances by status
    const instanceStats = await db
      .select({
        status: workflowInstances.status,
        count: count(),
      })
      .from(workflowInstances)
      .groupBy(workflowInstances.status);

    // Total assignments by status
    const assignmentStats = await db
      .select({
        status: stepAssignments.status,
        count: count(),
      })
      .from(stepAssignments)
      .groupBy(stepAssignments.status);

    // Average completion time (completed workflows)
    const completedWorkflows = await db.query.workflowInstances.findMany({
      where: eq(workflowInstances.status, "completed"),
      columns: {
        createdAt: true,
        completedAt: true,
      },
    });

    const completionTimes = completedWorkflows
      .filter((w) => w.completedAt)
      .map((w) => {
        const created = new Date(w.createdAt).getTime();
        const completed = new Date(w.completedAt!).getTime();
        return (completed - created) / (1000 * 60 * 60); // hours
      });

    const avgCompletionTime =
      completionTimes.length > 0
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        : 0;

    // Active workflows count
    const activeCount = await db
      .select({ count: count() })
      .from(workflowInstances)
      .where(eq(workflowInstances.status, "active"));

    // Overdue assignments count
    const overdueCount = await db
      .select({ count: count() })
      .from(stepAssignments)
      .where(
        and(
          eq(stepAssignments.status, "pending"),
          sql`${stepAssignments.deadline} < NOW()`
        )
      );

    return {
      success: true,
      data: {
        instances: instanceStats,
        assignments: assignmentStats,
        avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
        activeWorkflows: activeCount[0]?.count || 0,
        overdueAssignments: overdueCount[0]?.count || 0,
      },
    };
  });
}

/**
 * Get workflow performance by entity type
 */
export async function getWorkflowPerformanceByType(): Promise<ActionResponse<any>> {
  return withAuth(async () => {
    const performance = await db
      .select({
        entityType: workflowInstances.entityType,
        status: workflowInstances.status,
        count: count(),
      })
      .from(workflowInstances)
      .groupBy(workflowInstances.entityType, workflowInstances.status);

    // Calculate completion rates by entity type
    const byType: Record<string, any> = {};

    performance.forEach((p) => {
      if (!byType[p.entityType]) {
        byType[p.entityType] = {
          total: 0,
          completed: 0,
          active: 0,
          cancelled: 0,
        };
      }
      byType[p.entityType].total += p.count;
      if (p.status === "completed") {
        byType[p.entityType].completed += p.count;
      } else if (p.status === "active") {
        byType[p.entityType].active += p.count;
      } else if (p.status === "cancelled") {
        byType[p.entityType].cancelled += p.count;
      }
    });

    // Calculate completion rate
    Object.keys(byType).forEach((type) => {
      const data = byType[type];
      data.completionRate =
        data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
    });

    return {
      success: true,
      data: byType,
    };
  });
}

/**
 * Get workflow timeline activity (last 30 days)
 */
export async function getWorkflowTimelineActivity(): Promise<ActionResponse<any>> {
  return withAuth(async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activity = await db
      .select({
        date: sql<string>`DATE(${workflowTimeline.createdAt})`,
        action: workflowTimeline.action,
        count: count(),
      })
      .from(workflowTimeline)
      .where(gte(workflowTimeline.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${workflowTimeline.createdAt})`, workflowTimeline.action)
      .orderBy(sql`DATE(${workflowTimeline.createdAt})`);

    return {
      success: true,
      data: activity,
    };
  });
}

/**
 * Get top performers (users with most completed tasks)
 */
export async function getTopPerformers(limit = 10): Promise<ActionResponse<any>> {
  return withAuth(async () => {
    const performers = await db
      .select({
        userId: stepAssignments.assignedUserId,
        completedCount: count(),
      })
      .from(stepAssignments)
      .where(eq(stepAssignments.status, "completed"))
      .groupBy(stepAssignments.assignedUserId)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(limit);

    return {
      success: true,
      data: performers.filter((p) => p.userId !== null),
    };
  });
}

/**
 * Get bottleneck analysis (steps taking longest)
 */
export async function getBottleneckAnalysis(): Promise<ActionResponse<any>> {
  return withAuth(async () => {
    // Get completed assignments with duration
    const assignments = await db.query.stepAssignments.findMany({
      where: eq(stepAssignments.status, "completed"),
      columns: {
        stepId: true,
        createdAt: true,
        completedAt: true,
      },
    });

    // Calculate average duration per step
    const stepDurations: Record<string, { total: number; count: number }> = {};

    assignments.forEach((a) => {
      if (!a.completedAt) return;

      const duration =
        (new Date(a.completedAt).getTime() - new Date(a.createdAt).getTime()) /
        (1000 * 60 * 60); // hours

      if (!stepDurations[a.stepId]) {
        stepDurations[a.stepId] = { total: 0, count: 0 };
      }

      const step = stepDurations[a.stepId];
      if (step) {
        step.total += duration;
        step.count += 1;
      }
    });

    // Calculate averages and sort
    const bottlenecks = Object.entries(stepDurations)
      .map(([stepId, data]) => ({
        stepId,
        avgDuration: Math.round((data.total / data.count) * 10) / 10,
        taskCount: data.count,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10);

    return {
      success: true,
      data: bottlenecks,
    };
  });
}

/**
 * Get escalation statistics
 */
export async function getEscalationStats(): Promise<ActionResponse<any>> {
  return withAuth(async () => {
    const escalations = await db
      .select({
        count: count(),
      })
      .from(workflowTimeline)
      .where(eq(workflowTimeline.action, "escalate"));

    const escalationsByEntity = await db
      .select({
        entityType: workflowInstances.entityType,
        count: sql<number>`COUNT(DISTINCT ${workflowTimeline.workflowInstanceId})`,
      })
      .from(workflowTimeline)
      .innerJoin(
        workflowInstances,
        eq(workflowTimeline.workflowInstanceId, workflowInstances.id)
      )
      .where(eq(workflowTimeline.action, "escalate"))
      .groupBy(workflowInstances.entityType);

    return {
      success: true,
      data: {
        totalEscalations: escalations?.[0]?.count || 0,
        byEntityType: escalationsByEntity || [],
      },
    };
  });
}
