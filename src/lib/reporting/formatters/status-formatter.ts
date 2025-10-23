/**
 * Status Formatter
 * Converts status codes to Turkish labels
 */

import { AUDIT_STATUS_LABELS, FINDING_STATUS_LABELS, ACTION_STATUS_LABELS, DOF_STATUS_LABELS } from "@/lib/constants/status-labels";

export function formatAuditStatus(status: string): string {
  return AUDIT_STATUS_LABELS[status as keyof typeof AUDIT_STATUS_LABELS] || status;
}

export function formatFindingStatus(status: string): string {
  return FINDING_STATUS_LABELS[status as keyof typeof FINDING_STATUS_LABELS] || status;
}

export function formatActionStatus(status: string): string {
  return ACTION_STATUS_LABELS[status as keyof typeof ACTION_STATUS_LABELS] || status;
}

export function formatDofStatus(status: string): string {
  return DOF_STATUS_LABELS[status as keyof typeof DOF_STATUS_LABELS] || status;
}

/**
 * Generic status formatter
 */
export function formatStatus(
  status: string,
  type: "audit" | "finding" | "action" | "dof"
): string {
  switch (type) {
    case "audit":
      return formatAuditStatus(status);
    case "finding":
      return formatFindingStatus(status);
    case "action":
      return formatActionStatus(status);
    case "dof":
      return formatDofStatus(status);
    default:
      return status;
  }
}
