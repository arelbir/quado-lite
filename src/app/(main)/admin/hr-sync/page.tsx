/**
 * HR SYNC DASHBOARD
 * Monitor and manage HR synchronization
 * 
 * Features:
 * - Sync config list
 * - Last sync status
 * - Sync logs
 * - Manual trigger
 * - Statistics
 * 
 * Created: 2025-01-24
 * Week 7-8: Day 7
 */

import { Metadata } from "next";
import { db } from "@/core/database/client";
import { HRSyncDashboard } from "@/features/hr-sync/components/hr-sync-dashboard";
import { HRSyncLogsTableClient } from "./hr-sync-logs-table-client";
import { HRSyncConfigsClient } from "./hr-sync-configs-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, History, Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "HR Sync Dashboard | Admin",
  description: "Monitor HR synchronization",
};

export default async function HRSyncPage() {
  // Fetch sync configs with last log
  const configs = await db.query.hrSyncConfigs.findMany({
    orderBy: (configs, { desc }) => [desc(configs.createdAt)],
  });

  // Fetch recent sync logs (last 50)
  const recentLogs = await db.query.hrSyncLogs.findMany({
    orderBy: (logs, { desc }) => [desc(logs.createdAt)],
    limit: 50,
    with: {
      config: {
        columns: {
          id: true,
          name: true,
          sourceType: true,
        },
      },
    } as any,
  });

  // Calculate stats
  const completedLogs = recentLogs.filter(l => l.completedAt && l.startedAt);
  const stats = {
    totalSyncs: recentLogs.length,
    successfulSyncs: recentLogs.filter(l => l.status === "Completed").length,
    failedSyncs: recentLogs.filter(l => l.status === "Failed").length,
    lastSyncAt: recentLogs[0]?.startedAt ?? null,
    avgDuration: completedLogs.length > 0 
      ? Math.round(completedLogs.reduce((acc, l) => {
            const startTime = l.startedAt instanceof Date ? l.startedAt : new Date(l.startedAt!);
            const endTime = l.completedAt instanceof Date ? l.completedAt : new Date(l.completedAt!);
            const duration = (endTime.getTime() - startTime.getTime()) / 1000;
            return acc + duration;
          }, 0) / completedLogs.length)
      : null,
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">HR Sync Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and manage HR system synchronization
          </p>
        </div>
      </div>

      {configs.length === 0 && recentLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No HR Sync Configured</h3>
            <p className="text-muted-foreground mb-4">
              Configure your first HR sync integration to get started
            </p>
            <p className="text-sm text-muted-foreground">
              This feature allows you to sync users from LDAP, CSV, or REST API
            </p>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <History className="h-4 w-4" />
              Sync Logs
            </TabsTrigger>
            <TabsTrigger value="configs" className="gap-2">
              <Settings className="h-4 w-4" />
              Configurations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <HRSyncDashboard 
              configs={configs as any} 
              stats={stats}
            />
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            {recentLogs.length > 0 ? (
              <HRSyncLogsTableClient data={recentLogs as any} />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Sync Logs</h3>
                  <p className="text-muted-foreground">
                    No synchronization has been performed yet
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="configs" className="space-y-4">
            <HRSyncConfigsClient configs={configs as any} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

