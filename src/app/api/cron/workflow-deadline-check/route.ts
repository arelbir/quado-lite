/**
 * WORKFLOW DEADLINE CHECK CRON JOB
 * Runs every hour to check deadlines and auto-escalate overdue assignments
 * 
 * Vercel Cron: Configure in vercel.json
 * 
 * Features:
 * - Check overdue assignments
 * - Auto-escalate overdue tasks
 * - Send approaching deadline notifications
 * - Log statistics
 * 
 * Created: 2025-01-25
 */

import { NextResponse } from "next/server";
import {
  processOverdueAssignments,
  getApproachingDeadlineAssignments,
  getDeadlineStats,
} from "@/features/workflows/lib/deadline-monitor";
import { notifyDeadlineApproaching } from "@/features/workflows/lib/workflow-notifications";

/**
 * GET endpoint for cron job
 * Protected by Vercel Cron Secret
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret (Vercel sets this automatically)
    const authHeader = request.headers.get("authorization");
    
    if (process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    console.log("[Workflow Cron] Starting deadline check...");

    // 1. Process overdue assignments (auto-escalate)
    const escalationResults = await processOverdueAssignments();

    console.log("[Workflow Cron] Escalation results:", {
      total: escalationResults.total,
      escalated: escalationResults.escalated,
      failed: escalationResults.failed,
    });

    // 2. Get assignments approaching deadline (< 24h)
    const approachingAssignments = await getApproachingDeadlineAssignments();

    console.log("[Workflow Cron] Approaching deadlines:", approachingAssignments.length);

    // Send notifications for approaching deadlines
    for (const assignment of approachingAssignments) {
      if (assignment.assignedUserId) {
        try {
          await notifyDeadlineApproaching({
            userId: assignment.assignedUserId,
            entityType: "Workflow",
            entityId: assignment.workflowInstanceId,
            hoursRemaining: assignment.hoursRemaining,
          });
          console.log(`[Workflow Cron] Notified user about approaching deadline: ${assignment.assignedUserId}`);
        } catch (error) {
          console.error(`[Workflow Cron] Failed to notify user:`, error);
        }
      }
    }

    // 3. Get overall statistics
    const stats = await getDeadlineStats();

    console.log("[Workflow Cron] Deadline stats:", stats);

    // Return summary
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      escalation: {
        total: escalationResults.total,
        escalated: escalationResults.escalated,
        failed: escalationResults.failed,
      },
      approaching: approachingAssignments.length,
      stats,
    });
  } catch (error) {
    console.error("[Workflow Cron] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
