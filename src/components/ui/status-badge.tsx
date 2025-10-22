import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Finding Status Types
type FindingStatus = "New" | "Assigned" | "InProgress" | "PendingAuditorClosure" | "Completed" | "Rejected";
type ActionStatus = "Assigned" | "InProgress" | "PendingManagerApproval" | "Completed" | "Rejected";
type DofStatus = "ProblemDefinition" | "TemporaryActions" | "RootCause" | "PermanentActions" | "Implementation" | "Verification" | "Closure" | "Completed";

export type StatusType = FindingStatus | ActionStatus | DofStatus;

const findingStatusConfig: Record<FindingStatus, { label: string; className: string }> = {
  New: { 
    label: "Yeni", 
    className: "bg-status-new text-status-new-foreground border-status-new" 
  },
  Assigned: { 
    label: "Atandı", 
    className: "bg-status-assigned text-status-assigned-foreground border-status-assigned" 
  },
  InProgress: { 
    label: "İşlemde", 
    className: "bg-status-inprogress text-status-inprogress-foreground border-status-inprogress" 
  },
  PendingAuditorClosure: { 
    label: "Onay Bekliyor", 
    className: "bg-status-pending text-status-pending-foreground border-status-pending" 
  },
  Completed: { 
    label: "Tamamlandı", 
    className: "bg-status-completed text-status-completed-foreground border-status-completed" 
  },
  Rejected: { 
    label: "Reddedildi", 
    className: "bg-destructive/10 text-destructive border-destructive/20" 
  },
};

const actionStatusConfig: Record<ActionStatus, { label: string; className: string }> = {
  Assigned: { 
    label: "Atandı", 
    className: "bg-status-assigned text-status-assigned-foreground border-status-assigned" 
  },
  InProgress: { 
    label: "İşlemde", 
    className: "bg-status-inprogress text-status-inprogress-foreground border-status-inprogress" 
  },
  PendingManagerApproval: { 
    label: "Yönetici Onayı Bekliyor", 
    className: "bg-status-pending text-status-pending-foreground border-status-pending" 
  },
  Completed: { 
    label: "Tamamlandı", 
    className: "bg-status-completed text-status-completed-foreground border-status-completed" 
  },
  Rejected: { 
    label: "Reddedildi", 
    className: "bg-destructive/10 text-destructive border-destructive/20" 
  },
};

const dofStatusConfig: Record<DofStatus, { label: string; className: string }> = {
  ProblemDefinition: { label: "Problem Tanımı", className: "bg-status-new text-status-new-foreground border-status-new" },
  TemporaryActions: { label: "Geçici Önlemler", className: "bg-status-assigned text-status-assigned-foreground border-status-assigned" },
  RootCause: { label: "Kök Neden Analizi", className: "bg-status-inprogress text-status-inprogress-foreground border-status-inprogress" },
  PermanentActions: { label: "Kalıcı Faaliyetler", className: "bg-status-inprogress text-status-inprogress-foreground border-status-inprogress" },
  Implementation: { label: "Uygulama", className: "bg-status-pending text-status-pending-foreground border-status-pending" },
  Verification: { label: "Doğrulama", className: "bg-status-pending text-status-pending-foreground border-status-pending" },
  Closure: { label: "Kapanış", className: "bg-status-pending text-status-pending-foreground border-status-pending" },
  Completed: { label: "Tamamlandı", className: "bg-status-completed text-status-completed-foreground border-status-completed" },
};

interface StatusBadgeProps {
  status: StatusType;
  type?: "finding" | "action" | "dof";
  className?: string;
}

export function StatusBadge({ status, type = "finding", className }: StatusBadgeProps) {
  let config;
  
  if (type === "action") {
    config = actionStatusConfig[status as ActionStatus];
  } else if (type === "dof") {
    config = dofStatusConfig[status as DofStatus];
  } else {
    config = findingStatusConfig[status as FindingStatus];
  }
  
  if (!config) {
    return <Badge variant="outline">{status}</Badge>;
  }
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
