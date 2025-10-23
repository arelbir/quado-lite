'use client';

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  FINDING_STATUS_COLORS,
  ACTION_STATUS_COLORS,
  DOF_STATUS_COLORS,
  type FindingStatus,
  type ActionStatus,
  type DofStatus,
} from "@/lib/constants/status-labels";
import { 
  useFindingStatusLabel,
  useActionStatusLabel,
  useDofStatusLabel,
} from "@/lib/i18n/status-helpers";

export type StatusType = FindingStatus | ActionStatus | DofStatus;

interface StatusBadgeProps {
  status: StatusType;
  type?: "finding" | "action" | "dof";
  className?: string;
}

/**
 * Unified Status Badge Component with i18n
 * ✅ Multi-language support
 * ✅ Centralized colors
 */
export function StatusBadge({ status, type = "finding", className }: StatusBadgeProps) {
  const getFindingLabel = useFindingStatusLabel();
  const getActionLabel = useActionStatusLabel();
  const getDofLabel = useDofStatusLabel();
  
  let label: string;
  let colorClass: string;
  
  if (type === "action") {
    label = getActionLabel(status as ActionStatus);
    colorClass = ACTION_STATUS_COLORS[status as keyof typeof ACTION_STATUS_COLORS] || "";
  } else if (type === "dof") {
    label = getDofLabel(status as DofStatus);
    colorClass = DOF_STATUS_COLORS[status as keyof typeof DOF_STATUS_COLORS] || "";
  } else {
    label = getFindingLabel(status as FindingStatus);
    colorClass = FINDING_STATUS_COLORS[status as keyof typeof FINDING_STATUS_COLORS] || "";
  }
  
  if (!label) {
    return <Badge variant="outline">{status}</Badge>;
  }
  
  return (
    <Badge 
      variant="outline" 
      className={cn(colorClass, className)}
    >
      {label}
    </Badge>
  );
}
