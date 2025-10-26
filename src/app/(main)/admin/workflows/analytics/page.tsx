import { Suspense } from "react";
import { AnalyticsDashboard } from "./analytics-client";
import {
  getWorkflowStats,
  getWorkflowPerformanceByType,
  getTopPerformers,
  getEscalationStats,
} from "@/server/actions/workflow-analytics-actions";

export const metadata = {
  title: "Workflow Analytics",
  description: "Workflow system analytics and statistics",
};

async function AnalyticsContent() {
  const [stats, performance, performers, escalations] = await Promise.all([
    getWorkflowStats(),
    getWorkflowPerformanceByType(),
    getTopPerformers(10),
    getEscalationStats(),
  ]);

  return (
    <AnalyticsDashboard
      stats={stats.success ? stats.data : null}
      performance={performance.success ? performance.data : null}
      topPerformers={performers.success ? performers.data : []}
      escalations={escalations.success ? escalations.data : null}
    />
  );
}

export default async function WorkflowAnalyticsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Analytics</h1>
          <p className="text-muted-foreground">
            Monitor workflow performance and identify bottlenecks
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
      >
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}
