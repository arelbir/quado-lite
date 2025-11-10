/**
 * LDAP SYNC API ENDPOINT
 * Triggers LDAP user synchronization
 * 
 * POST /api/hr-sync/ldap
 * 
 * Request Body:
 * {
 *   configId: string  // HR Sync Config ID
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   syncLogId?: string
 *   result?: SyncResult
 *   error?: string
 * }
 * 
 * Created: 2025-01-24
 * Week 7-8: Day 1
 */

import { NextRequest, NextResponse } from "next/server";
import { syncFromLDAP } from "@/lib/hr-sync/ldap-sync-service";
import { currentUser } from "@/lib/auth";
import { db } from "@/drizzle/db";
import { hrSyncLogs } from "@/drizzle/schema/hr-sync";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Check admin permission
    // TODO: Use permission checker
    // const checker = createPermissionChecker(user.id);
    // if (!await checker.can({ resource: 'HRSync', action: 'Execute' })) {
    //   return NextResponse.json(
    //     { success: false, error: "Permission denied" },
    //     { status: 403 }
    //   );
    // }

    // 3. Parse request
    const body = await request.json() as { configId?: string };
    const { configId } = body;

    if (!configId) {
      return NextResponse.json(
        { success: false, error: "configId is required" },
        { status: 400 }
      );
    }

    // 4. Trigger sync
    console.log(`🔄 Triggering LDAP sync for config: ${configId}`);
    const result = await syncFromLDAP(configId, user.id);

    // 5. Return result
    return NextResponse.json({
      success: result.success,
      result: {
        totalRecords: result.totalRecords,
        successCount: result.successCount,
        failedCount: result.failedCount,
        skippedCount: result.skippedCount,
        errors: result.errors.length > 0 ? result.errors.slice(0, 10) : [] // Limit errors
      }
    });

  } catch (error) {
    console.error("LDAP sync API error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/hr-sync/ldap?configId=xxx
 * Get LDAP sync status/history
 */
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get configId from query params
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('configId');

    if (!configId) {
      return NextResponse.json(
        { success: false, error: "configId is required" },
        { status: 400 }
      );
    }

    // Get sync logs for this config
    const logs = await db.query.hrSyncLogs.findMany({
      where: eq(hrSyncLogs.configId, configId),
      orderBy: (hrSyncLogs, { desc }) => [desc(hrSyncLogs.createdAt)],
      limit: 50, // Last 50 logs
    });

    return NextResponse.json({
      success: true,
      data: logs,
      count: logs.length
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to get sync logs" },
      { status: 500 }
    );
  }
}
