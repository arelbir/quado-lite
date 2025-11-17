/**
 * WORKFLOW NOTIFICATION HELPERS
 * Helper functions for sending workflow-related notifications
 * 
 * Created: 2025-01-25
 */

import { sendNotification } from "@/features/notifications/lib/notification-service";

/**
 * Send notification when workflow task is assigned
 */
export async function notifyWorkflowAssignment(data: {
  userId: string;
  entityType: string;
  entityId: string;
  stepName?: string;
}) {
  await sendNotification({
    userId: data.userId,
    type: "workflow_assignment",
    title: "New Workflow Task Assigned",
    message: `You have been assigned a new workflow task for ${data.entityType}`,
    metadata: {
      entityType: data.entityType,
      entityId: data.entityId,
    },
  });
}

/**
 * Send notification when deadline is approaching
 */
export async function notifyDeadlineApproaching(data: {
  userId: string;
  entityType: string;
  entityId: string;
  hoursRemaining: number;
}) {
  await sendNotification({
    userId: data.userId,
    type: "workflow_deadline",
    title: "Workflow Task Deadline Approaching",
    message: `Your workflow task is due in ${Math.floor(data.hoursRemaining)} hours`,
    priority: 'high',
    metadata: {
      entityType: data.entityType,
      entityId: data.entityId,
    },
  });
}

/**
 * Send notification when task is escalated
 */
export async function notifyEscalation(data: {
  userId: string;
  entityType: string;
  entityId: string;
  reason?: string;
}) {
  await NotificationService.send({
    userId: data.userId,
    category: "workflow_escalated",
    title: "Workflow Task Escalated to You",
    message: `A workflow task has been escalated to you: ${data.reason || "Overdue"}`,
    relatedEntityType: data.entityType.toLowerCase() as any,
    relatedEntityId: data.entityId,
    sendEmail: true,
  });
}

/**
 * Send notification when workflow is approved
 */
export async function notifyApproval(data: {
  userId: string;
  entityType: string;
  entityId: string;
  approvedBy?: string;
}) {
  await sendNotification({
    userId: data.userId,
    type: "workflow_approved",
    title: "Workflow Task Approved",
    message: `Your workflow task has been approved`,
    metadata: {
      entityType: data.entityType,
      entityId: data.entityId,
    },
  });
}

/**
 * Send notification when workflow is rejected
 */
export async function notifyRejection(data: {
  userId: string;
  entityType: string;
  entityId: string;
  reason?: string;
}) {
  await sendNotification({
    userId: data.userId,
    type: "workflow_rejected",
    title: "Workflow Task Rejected",
    message: `Your workflow task has been rejected${data.reason ? `: ${data.reason}` : ""}`,
    priority: 'high',
    metadata: {
      entityType: data.entityType,
      entityId: data.entityId,
    },
  });
}
