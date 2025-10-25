"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  BarChart3,
} from "lucide-react";

interface AnalyticsDashboardProps {
  stats: any;
  performance: any;
  topPerformers: any[];
  escalations: any;
}

export function AnalyticsDashboard({
  stats,
  performance,
  topPerformers,
  escalations,
}: AnalyticsDashboardProps) {
  // Calculate totals
  const totalWorkflows =
    stats?.instances?.reduce((acc: number, item: any) => acc + item.count, 0) || 0;
  const completedWorkflows =
    stats?.instances?.find((item: any) => item.status === "completed")?.count || 0;
  const completionRate =
    totalWorkflows > 0 ? Math.round((completedWorkflows / totalWorkflows) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeWorkflows || 0}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {completedWorkflows} of {totalWorkflows} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgCompletionTime || 0}h</div>
            <p className="text-xs text-muted-foreground">Average duration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats?.overdueAssignments || 0}
            </div>
            <p className="text-xs text-muted-foreground">Past deadline</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Performance by Entity Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance by Entity Type
            </CardTitle>
            <CardDescription>Completion rates across different modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performance && Object.keys(performance).length > 0 ? (
                Object.entries(performance).map(([type, data]: [string, any]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{type}</span>
                        <Badge variant="outline">{data.total} total</Badge>
                      </div>
                      <span className="text-sm font-bold">{data.completionRate}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${data.completionRate}%` }}
                      />
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>✓ {data.completed} completed</span>
                      <span>⏳ {data.active} active</span>
                      {data.cancelled > 0 && <span>✗ {data.cancelled} cancelled</span>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No performance data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Performers
            </CardTitle>
            <CardDescription>Users with most completed workflow tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers && topPerformers.length > 0 ? (
                topPerformers.slice(0, 5).map((performer, index) => (
                  <div
                    key={performer.userId}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          User {performer.userId.slice(0, 8)}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {performer.completedCount} tasks completed
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{performer.completedCount}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No performer data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Escalation Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Escalation Statistics
          </CardTitle>
          <CardDescription>Overview of workflow escalations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-3xl font-bold">{escalations?.totalEscalations || 0}</div>
              <p className="text-sm text-muted-foreground">Total Escalations</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">By Entity Type:</p>
              {escalations?.byEntityType && escalations.byEntityType.length > 0 ? (
                <div className="space-y-1">
                  {escalations.byEntityType.map((item: any) => (
                    <div key={item.entityType} className="flex justify-between text-sm">
                      <span className="capitalize">{item.entityType}</span>
                      <Badge variant="outline">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No escalations yet</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Status Distribution</CardTitle>
          <CardDescription>Current state of all workflow assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {stats?.assignments?.map((item: any) => (
              <div key={item.status} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{item.status}</span>
                  <Badge
                    variant={
                      item.status === "completed"
                        ? "default"
                        : item.status === "pending"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {item.count}
                  </Badge>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      item.status === "completed"
                        ? "bg-green-500"
                        : item.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                    }`}
                    style={{
                      width: `${
                        stats.assignments.reduce((acc: number, a: any) => acc + a.count, 0) > 0
                          ? (item.count /
                              stats.assignments.reduce(
                                (acc: number, a: any) => acc + a.count,
                                0
                              )) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
