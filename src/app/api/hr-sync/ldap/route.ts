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

import { NextRequest } from "next/server";
import { z } from 'zod';
import { syncFromLDAP } from "@/features/hr-sync/lib/ldap-sync-service";
import { currentUser } from "@/lib/auth/server";
import { sendSuccess, sendUnauthorized, sendForbidden, sendValidationError, sendInternalError } from "@/lib/api/response-helpers";
import { log } from "@/lib/monitoring/logger";
import { db } from "@/core/database/client";
import { hrSyncLogs } from "@/core/database/schema/hr-sync";
import { eq } from "drizzle-orm";

const ldapSyncSchema = z.object({
  configId: z.string().uuid(),
});

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
    const { createPermissionChecker } = await import('@/lib/helpers/auth-helpers');
    const checker = createPermissionChecker(user.id);
    const hasPermission = await checker.can({ resource: 'HRSync', action: 'Execute' });
    
    if (!hasPermission.success || !hasPermission.data) {
      return sendForbidden();
    }

    // 3. Parse request with validation
    const body = await request.json();
    const validation = ldapSyncSchema.safeParse(body);
    
    if (!validation.success) {
      return sendValidationError(validation.error.errors);
    }
    
    const { configId } = validation.data;

    // 4. Trigger sync
    log.info('Triggering LDAP sync', { configId, userId: user.id });
    const result = await syncFromLDAP(configId, user.id);

    // 5. Return result
    return sendSuccess({
      totalRecords: result.totalRecords,
      successCount: result.successCount,
      failedCount: result.failedCount,
      skippedCount: result.skippedCount,
      errors: result.errors.length > 0 ? result.errors.slice(0, 10) : [],
    });

  } catch (error) {
    log.error("LDAP sync API error", error as Error);
    return sendInternalError(error);
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
      return sendValidationError({ configId: 'Config ID is required' });
    }

    // Get sync logs for this config
    const logs = await db.query.hrSyncLogs.findMany({
      where: eq(hrSyncLogs.configId, configId),
      orderBy: (hrSyncLogs, { desc }) => [desc(hrSyncLogs.createdAt)],
      limit: 50, // Last 50 logs
    });

    return sendSuccess(logs, { total: logs.length });

  } catch (error) {
    log.error("Error getting sync logs", error as Error);
    return sendInternalError(error);
  }
}
