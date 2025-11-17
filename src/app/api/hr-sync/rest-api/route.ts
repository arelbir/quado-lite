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

import { NextRequest } from "next/server";
import { z } from 'zod';
import { syncFromRESTAPI } from "@/features/hr-sync/lib/rest-api-service";
import { currentUser } from "@/lib/auth/server";
import { sendSuccess, sendUnauthorized, sendValidationError, sendInternalError } from "@/lib/api/response-helpers";
import { log } from "@/lib/monitoring/logger";

const restApiSyncSchema = z.object({
  configId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const user = await currentUser();
    
    if (!user) {
      return sendUnauthorized();
    }

    // 2. Parse request with validation
    const body = await request.json();
    const validation = restApiSyncSchema.safeParse(body);
    
    if (!validation.success) {
      return sendValidationError(validation.error.errors);
    }
    
    const { configId } = validation.data;

    // 3. Trigger sync
    log.info('Triggering REST API sync', { configId, userId: user.id });
    const result = await syncFromRESTAPI(configId, user.id);

    // 4. Return result
    return sendSuccess({
      totalRecords: result.totalRecords,
      successCount: result.successCount,
      failedCount: result.failedCount,
      skippedCount: result.skippedCount,
      errors: result.errors.length > 0 ? result.errors.slice(0, 10) : [],
    });

  } catch (error) {
    log.error("REST API sync error", error as Error);
    return sendInternalError(error);
  }
}
