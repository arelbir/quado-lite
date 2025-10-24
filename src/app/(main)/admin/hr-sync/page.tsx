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
import { db } from "@/drizzle/db";
import { HRSyncDashboard } from "@/components/admin/hr-sync-dashboard";
import { HRSyncLogsTableClient } from "./hr-sync-logs-table-client";

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
    orderBy: (logs, { desc }) => [desc(logs.startedAt)],
    limit: 50,
    with: {
      config: {
        columns: {
          id: true,
          name: true,
          sourceType: true,
        },
      },
    },
  });

  // Calculate stats
  const completedLogs = recentLogs.filter(l => l.completedAt && l.startedAt);
  const stats = {
    totalSyncs: recentLogs.length,
    successfulSyncs: recentLogs.filter(l => l.status === "Completed").length,
    failedSyncs: recentLogs.filter(l => l.status === "Failed").length,
    lastSyncAt: recentLogs[0]?.startedAt ?? null,
    avgDuration: completedLogs.length > 0 
      ? completedLogs.reduce((acc, l) => {
            const startTime = l.startedAt instanceof Date ? l.startedAt : new Date(l.startedAt!);
            const endTime = l.completedAt instanceof Date ? l.completedAt : new Date(l.completedAt!);
            const duration = (endTime.getTime() - startTime.getTime()) / 1000;
            return acc + duration;
          }, 0) / completedLogs.length
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

      <HRSyncDashboard 
        configs={configs} 
        stats={stats}
      />
      
      {/* HR Sync Logs - Advanced DataTable */}
      <HRSyncLogsTableClient data={recentLogs as any} />
    </div>
  );
}

