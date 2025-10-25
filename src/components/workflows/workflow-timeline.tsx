"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, User, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

interface TimelineEntry {
  id: string;
  workflowInstanceId: string;
  stepId: string;
  action: string | null;
  performedBy: string;
  comment?: string | null;
  createdAt: Date;
}

interface WorkflowTimelineProps {
  timeline: TimelineEntry[];
  workflowInstanceId?: string;
}

export function WorkflowTimeline({ timeline }: WorkflowTimelineProps) {
  const getActionIcon = (action: string | null) => {
    switch (action) {
      case "approve":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "reject":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "submit":
        return <User className="h-5 w-5 text-blue-600" />;
      case "escalate":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "veto":
        return <ShieldCheck className="h-5 w-5 text-purple-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActionLabel = (action: string | null) => {
    const labels: Record<string, string> = {
      submit: "Submitted",
      approve: "Approved",
      reject: "Rejected",
      complete: "Completed",
      escalate: "Escalated",
      veto: "Vetoed",
      assign: "Assigned",
      reassign: "Reassigned",
    };
    return action ? labels[action] || action : "Unknown";
  };

  if (!timeline || timeline.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workflow Timeline</CardTitle>
          <CardDescription>Activity history for this workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No timeline entries yet</p>
        </CardContent>
      </Card>
    );
  }

  const sortedTimeline = [...timeline].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow Timeline</CardTitle>
        <CardDescription>{timeline.length} activity entries</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-border" />

          {sortedTimeline.map((entry, index) => (
            <div key={entry.id} className="relative flex gap-4">
              {/* Icon */}
              <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-card">
                {getActionIcon(entry.action)}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-1 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={entry.action === "approve" ? "default" : "secondary"}>
                      {getActionLabel(entry.action)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(entry.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                </div>

                {entry.comment && (
                  <p className="text-sm text-muted-foreground">{entry.comment}</p>
                )}

                <p className="text-xs text-muted-foreground">
                  by {entry.performedBy.slice(0, 8)}...
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
