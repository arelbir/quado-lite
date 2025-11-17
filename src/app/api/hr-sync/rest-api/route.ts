/**
 * REST API SYNC ENDPOINT
 * Triggers REST API user synchronization
 * 
 * POST /api/hr-sync/rest-api
 * 
 * Request Body:
 * {
 *   configId: string  // HR Sync Config ID
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   result?: SyncResult
 *   error?: string
 * }
 * 
 * Created: 2025-01-24
 * Week 7-8: Day 2
 */

import { NextRequest, NextResponse } from "next/server";
import { syncFromRESTAPI } from "@/features/hr-sync/lib/rest-api-service";
import { currentUser } from "@/lib/auth/server";

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

    // 2. Parse request
    const body = await request.json() as { configId?: string };
    const { configId } = body;

    if (!configId) {
      return NextResponse.json(
        { success: false, error: "configId is required" },
        { status: 400 }
      );
    }

    // 3. Trigger sync
    console.log(`🔄 Triggering REST API sync for config: ${configId}`);
    const result = await syncFromRESTAPI(configId, user.id);

    // 4. Return result
    return NextResponse.json({
      success: result.success,
      result: {
        totalRecords: result.totalRecords,
        successCount: result.successCount,
        failedCount: result.failedCount,
        skippedCount: result.skippedCount,
        errors: result.errors.length > 0 ? result.errors.slice(0, 10) : []
      }
    });

  } catch (error) {
    console.error("REST API sync API error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
