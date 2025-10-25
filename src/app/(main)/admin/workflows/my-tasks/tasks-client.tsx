"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { transitionWorkflow } from "@/server/actions/workflow-actions";
import { toast } from "sonner";

interface WorkflowTask {
  id: string;
  workflowInstanceId: string;
  stepId: string;
  assignmentType: string;
  assignedRole: string | null;
  assignedUserId: string | null;
  status: string;
  deadline: Date | null;
  instance?: any;
}

export function WorkflowTasksClient({ tasks }: { tasks: WorkflowTask[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleApprove = async (task: WorkflowTask) => {
    setLoading(task.id);
    try {
      const result = await transitionWorkflow({
        workflowInstanceId: task.workflowInstanceId,
        action: "approve",
        comment: "Approved from My Tasks",
      });

      if (result.success) {
        toast.success("Task approved successfully");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to approve");
      }
    } catch (error) {
      toast.error("Failed to approve");
    }
    setLoading(null);
  };

  const handleReject = async (task: WorkflowTask) => {
    setLoading(task.id);
    try {
      const result = await transitionWorkflow({
        workflowInstanceId: task.workflowInstanceId,
        action: "reject",
        comment: "Rejected from My Tasks",
      });

      if (result.success) {
        toast.success("Task rejected successfully");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to reject");
      }
    } catch (error) {
      toast.error("Failed to reject");
    }
    setLoading(null);
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No pending workflow tasks</p>
        </CardContent>
      </Card>
    );
  }

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const overdueCount = tasks.filter((t) => {
    if (!t.deadline) return false;
    return new Date(t.deadline) < new Date();
  }).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pendingTasks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map((task) => {
          const isOverdue = task.deadline && new Date(task.deadline) < new Date();
          const entityType = task.instance?.entityType || "Unknown";
          const entityId = task.instance?.entityId || "N/A";

          return (
            <Card key={task.id} className={isOverdue ? "border-red-500" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {entityType} - {entityId.slice(0, 8)}
                      {isOverdue && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Workflow: {task.instance?.definition?.name || "Unknown"}
                    </CardDescription>
                  </div>
                  <Badge variant={task.status === "pending" ? "default" : "secondary"}>
                    {task.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <div>Assignment: {task.assignmentType}</div>
                    {task.assignedRole && <div>Role: {task.assignedRole}</div>}
                    {task.deadline && (
                      <div>
                        Deadline: {new Date(task.deadline).toLocaleDateString()} at{" "}
                        {new Date(task.deadline).toLocaleTimeString()}
                      </div>
                    )}
                  </div>

                  {task.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(task)}
                        disabled={loading === task.id}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(task)}
                        disabled={loading === task.id}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
