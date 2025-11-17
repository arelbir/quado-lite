/**
 * DEADLINE MONITORING SYSTEM
 * Handles deadline checking, notifications, and auto-escalation
 * 
 * Features:
 * - Check overdue assignments
 * - Send deadline approaching notifications (24h before)
 * - Auto-escalate overdue tasks
 * - Deadline statistics
 * 
 * Created: 2025-01-25
 */

import { db } from "@/core/database/client";
import { stepAssignments, workflowInstances, user, workflowTimeline, notifications } from "@/core/database/schema";
import { eq, and, lte, isNull, sql } from "drizzle-orm";

/**
 * Deadline Status
 */
export type DeadlineStatus = "on_time" | "approaching" | "overdue";

/**
 * Assignment with Deadline Info
 */
interface AssignmentWithDeadline {
  id: string;
  workflowInstanceId: string;
  stepId: string;
  assignedUserId: string | null;
  assignedRole: string | null;
  deadline: Date | null;
  status: string;
  deadlineStatus: DeadlineStatus;
  hoursRemaining: number;
}

/**
 * Escalation Result
 */
interface EscalationResult {
  assignmentId: string;
  escalatedTo: string | null;
  success: boolean;
  error?: string;
}

/**
 * Calculate deadline status
 */
function getDeadlineStatus(deadline: Date): {
  status: DeadlineStatus;
  hoursRemaining: number;
} {
  const now = new Date();
  const deadlineTime = new Date(deadline).getTime();
  const nowTime = now.getTime();
  const msRemaining = deadlineTime - nowTime;
  const hoursRemaining = msRemaining / (1000 * 60 * 60);

  if (hoursRemaining < 0) {
    return { status: "overdue", hoursRemaining };
  } else if (hoursRemaining <= 24) {
    return { status: "approaching", hoursRemaining };
  } else {
    return { status: "on_time", hoursRemaining };
  }
}

/**
 * Get all assignments with deadlines
 */
export async function getAssignmentsWithDeadlines(): Promise<AssignmentWithDeadline[]> {
  const assignments = await db.query.stepAssignments.findMany({
    where: and(
      eq(stepAssignments.status, "pending"),
      isNull(stepAssignments.completedAt)
    ),
  });

  const result: AssignmentWithDeadline[] = [];

  for (const assignment of assignments as any[]) {
    if (!assignment.deadline) continue;

    const { status, hoursRemaining } = getDeadlineStatus(assignment.deadline);

    result.push({
      id: assignment.id,
      workflowInstanceId: assignment.workflowInstanceId,
      stepId: assignment.stepId,
      assignedUserId: assignment.assignedUserId,
      assignedRole: assignment.assignedRole,
      deadline: assignment.deadline,
      status: assignment.status,
      deadlineStatus: status,
      hoursRemaining,
    });
  }

  return result;
}

/**
 * Get overdue assignments
 */
export async function getOverdueAssignments(): Promise<AssignmentWithDeadline[]> {
  const all = await getAssignmentsWithDeadlines();
  return all.filter((a) => a.deadlineStatus === "overdue");
}

/**
 * Get assignments approaching deadline (< 24h)
 */
export async function getApproachingDeadlineAssignments(): Promise<AssignmentWithDeadline[]> {
  const all = await getAssignmentsWithDeadlines();
  return all.filter((a) => a.deadlineStatus === "approaching");
}

/**
 * Get escalation target for assignment
 */
async function getEscalationTarget(assignment: AssignmentWithDeadline): Promise<string | null> {
  // Get workflow instance with definition
  const instance = await db.query.workflowInstances.findFirst({
    where: eq(workflowInstances.id, assignment.workflowInstanceId),
    with: {
      definition: true,
    },
  }) as any;

  if (!instance || !instance.definition) return null;

  const steps = (instance.definition as any).steps as any[];
  const currentStep = steps.find((s: any) => s.id === assignment.stepId);

  if (!currentStep || !currentStep.escalateTo) return null;

  // escalateTo is a role name
  const escalationRole = currentStep.escalateTo;

  // Find users with this role
  const users = await db.query.user.findMany({
    where: eq(user.status, "Active"),
    with: {
      userRoles: {
        with: {
          role: true,
        },
      },
    },
  });

  const escalationUsers = users.filter((u: any) =>
    u.userRoles?.some((ur: any) => ur.role.name.toLowerCase() === escalationRole.toLowerCase())
  );

  // Return first available user with escalation role
  return escalationUsers[0]?.id || null;
}

/**
 * Escalate assignment to higher authority
 */
export async function escalateAssignment(assignmentId: string): Promise<EscalationResult> {
  try {
    // Get assignment
    const assignment = await db.query.stepAssignments.findFirst({
      where: eq(stepAssignments.id, assignmentId),
    });

    if (!assignment) {
      return { assignmentId, escalatedTo: null, success: false, error: "Assignment not found" };
    }

    const assignmentWithDeadline: AssignmentWithDeadline = {
      id: assignment.id,
      workflowInstanceId: assignment.workflowInstanceId,
      stepId: assignment.stepId,
      assignedUserId: assignment.assignedUserId,
      assignedRole: assignment.assignedRole,
      deadline: assignment.deadline,
      status: assignment.status,
      deadlineStatus: "overdue",
      hoursRemaining: 0,
    };

    // Get escalation target
    const escalationTarget = await getEscalationTarget(assignmentWithDeadline);

    if (!escalationTarget) {
      return {
        assignmentId,
        escalatedTo: null,
        success: false,
        error: "No escalation target available",
      };
    }

    // Update assignment: mark as escalated, assign to escalation target
    await db
      .update(stepAssignments)
      .set({
        status: "escalated",
        assignedUserId: escalationTarget,
        escalatedAt: new Date(),
        escalatedTo: escalationTarget,
        updatedAt: new Date(),
      })
      .where(eq(stepAssignments.id, assignmentId));

    // Create timeline entry for escalation
    await db.insert(workflowTimeline).values({
      workflowInstanceId: assignment.workflowInstanceId,
      stepId: assignment.stepId,
      action: "escalate",
      comment: `Task escalated due to deadline breach. Reassigned to escalation target.`,
      performedBy: assignment.assignedUserId, // System action, use original assignee
      metadata: {
        originalAssigneeId: assignment.assignedUserId,
        escalatedToId: escalationTarget,
        deadline: assignment.deadline,
        escalatedAt: new Date().toISOString(),
      },
      createdAt: new Date(),
    });

    // Save escalation log
    await db.insert(workflowEscalationLog).values({
      assignmentId,
      escalatedFrom: assignment.assignedUserId,
      escalatedTo: escalationTarget,
      reason: 'DEADLINE_EXCEEDED',
      metadata: {
        originalDeadline: assignment.deadline?.toISOString(),
        escalationDate: new Date().toISOString(),
      },
      createdBy: 'SYSTEM',
      createdAt: new Date(),
    });

    // Send notification to escalation target
    try {
      const { sendNotification } = await import('@/features/notifications');
      
      await sendNotification({
        userId: escalationTarget,
        type: 'workflow_escalated',
        title: 'Workflow Escalated to You',
        message: `A workflow task has been escalated to you from ${assignment.assignedUserId} due to deadline exceeded.`,
        priority: 'urgent',
        metadata: {
          entityType: 'workflow',
          entityId: assignment.workflowInstanceId,
          assignmentId,
          originalAssignee: assignment.assignedUserId,
          escalationReason: 'DEADLINE_EXCEEDED',
        },
        actionUrl: `/admin/workflows/instance/${assignment.workflowInstanceId}`,
      });
    } catch (notifError) {
      console.error('Failed to send escalation notification:', notifError);
      // Don't fail the escalation if notification fails
    }

    return {
      assignmentId,
      escalatedTo: escalationTarget,
      success: true,
    };
  } catch (error) {
    console.error(`Escalation error for assignment ${assignmentId}:`, error);
    return {
      assignmentId,
      escalatedTo: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Process all overdue assignments (auto-escalate)
 */
export async function processOverdueAssignments(): Promise<{
  total: number;
  escalated: number;
  failed: number;
  results: EscalationResult[];
}> {
  const overdueAssignments = await getOverdueAssignments();
  const results: EscalationResult[] = [];

  let escalated = 0;
  let failed = 0;

  for (const assignment of overdueAssignments) {
    // Only escalate if not already escalated
    if (assignment.status !== "escalated") {
      const result = await escalateAssignment(assignment.id);
      results.push(result);

      if (result.success) {
        escalated++;
      } else {
        failed++;
      }
    }
  }

  return {
    total: overdueAssignments.length,
    escalated,
    failed,
    results,
  };
}

/**
 * Get deadline statistics
 */
export async function getDeadlineStats(): Promise<{
  total: number;
  onTime: number;
  approaching: number;
  overdue: number;
}> {
  const all = await getAssignmentsWithDeadlines();

  return {
    total: all.length,
    onTime: all.filter((a) => a.deadlineStatus === "on_time").length,
    approaching: all.filter((a) => a.deadlineStatus === "approaching").length,
    overdue: all.filter((a) => a.deadlineStatus === "overdue").length,
  };
}

/**
 * Format deadline for display
 */
export function formatDeadline(deadline: Date): string {
  const { hoursRemaining } = getDeadlineStatus(deadline);

  if (hoursRemaining < 0) {
    const hoursOverdue = Math.abs(hoursRemaining);
    if (hoursOverdue < 24) {
      return `${Math.floor(hoursOverdue)}h overdue`;
    } else {
      const daysOverdue = Math.floor(hoursOverdue / 24);
      return `${daysOverdue}d overdue`;
    }
  } else if (hoursRemaining < 24) {
    return `${Math.floor(hoursRemaining)}h remaining`;
  } else {
    const daysRemaining = Math.floor(hoursRemaining / 24);
    return `${daysRemaining}d remaining`;
  }
}

/**
 * Check if should send approaching notification
 * Send once when < 24h remaining
 */
export async function shouldSendApproachingNotification(assignmentId: string): Promise<boolean> {
  // Track notification history to avoid duplicate notifications
  const existingNotification = await db.query.notifications.findFirst({
    where: and(
      eq(notifications.category, "workflow_deadline_approaching"),
      eq(notifications.relatedEntityId, assignmentId)
    ),
    orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
  });

  // If notification sent in last 24 hours, don't send again
  if (existingNotification) {
    const hoursSinceLastNotification = 
      (Date.now() - existingNotification.createdAt.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastNotification < 24) {
      return false;
    }
  }

  return true;
}

/**
 * Send deadline approaching notification
 */
export async function sendDeadlineApproachingNotification(
  assignmentId: string,
  userId: string,
  deadlineDate: Date
): Promise<boolean> {
  try {
    // Check if we should send notification
    const shouldSend = await shouldSendApproachingNotification(assignmentId);
    if (!shouldSend) {
      return false;
    }

    // Create notification record
    await db.insert(notifications).values({
      userId,
      category: "workflow_deadline_approaching",
      title: "Deadline Approaching",
      message: `Your task deadline is approaching: ${deadlineDate.toLocaleDateString()}`,
      // relatedEntityType can be null for workflow assignments
      relatedEntityType: null,
      relatedEntityId: null,
      isRead: false,
      createdAt: new Date(),
    });

    console.log(`📧 Deadline approaching notification sent to user ${userId} for assignment ${assignmentId}`);
    return true;
  } catch (error) {
    console.error(`Failed to send deadline notification for assignment ${assignmentId}:`, error);
    return false;
  }
}
