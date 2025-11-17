/**
 * CSV IMPORT API ENDPOINT
 * Triggers CSV user import
 * 
 * POST /api/hr-sync/csv
 * 
 * Request Body:
 * {
 *   configId: string      // HR Sync Config ID
 *   fileContent: string   // CSV file content
 *   validate?: boolean    // Validate before import (default: true)
 *   preview?: boolean     // Preview only (don't import)
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
import { z } from 'zod';
import { importFromCSV } from "@/features/hr-sync/lib/csv-import-service";
import { currentUser } from "@/lib/auth/server";
import { sendSuccess, sendUnauthorized, sendValidationError, sendNotFound, sendInternalError } from "@/lib/api/response-helpers";
import { log } from "@/lib/monitoring/logger";
import { db } from "@/core/database/client";
import { hrSyncConfigs } from "@/core/database/schema/hr-sync";
import { eq } from "drizzle-orm";

const csvSyncSchema = z.object({
  configId: z.string().uuid(),
  fileContent: z.string().min(1),
  validate: z.boolean().optional(),
  preview: z.boolean().optional(),
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

    // 2. Parse request with validation
    const body = await request.json();
    const validation = csvSyncSchema.safeParse(body);
    
    if (!validation.success) {
      return sendValidationError(validation.error.errors);
    }
    
    const { configId, fileContent, validate, preview } = validation.data;

    // 3. Trigger import
    log.info('Triggering CSV import', { configId, userId: user.id });
    const result = await importFromCSV(
      configId, 
      fileContent, 
      user.id,
      { validate, preview }
    );

    // 4. Return result
    return sendSuccess({
      totalRecords: result.totalRecords,
      successCount: result.successCount,
      failedCount: result.failedCount,
      skippedCount: result.skippedCount,
      errors: result.errors.length > 0 ? result.errors.slice(0, 10) : [],
    });

  } catch (error) {
    log.error("CSV import error", error as Error);
    return sendInternalError(error);
  }
}

/**
 * GET /api/hr-sync/csv/template
 * Get CSV template
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

    // Generate template based on config field mapping
    const config = await db.query.hrSyncConfigs.findFirst({
      where: eq(hrSyncConfigs.id, configId),
    });

    if (!config) {
      return sendNotFound('Config');
    }

    const fieldMapping = config.fieldMapping as any;
    const headers = Object.keys(fieldMapping).join(',');
    
    // Generate sample data row
    const sampleData = Object.values(fieldMapping).map((field: any) => {
      switch (field) {
        case 'name': return 'John Doe';
        case 'email': return 'john.doe@company.com';
        case 'employeeNumber': return 'EMP001';
        case 'departmentId': return 'Quality';
        case 'positionId': return 'Quality Manager';
        case 'phone': return '+90 555 123 4567';
        case 'isActive': return 'true';
        default: return 'Sample Value';
      }
    }).join(',');

    const template = `${headers}\n${sampleData}`;

    return new NextResponse(template, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="user-import-template.csv"'
      }
    });

  } catch (error) {
    log.error("Error generating CSV template", error as Error);
    return sendInternalError(error);
  }
}
