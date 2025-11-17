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
import { importFromCSV } from "@/lib/hr-sync/csv-import-service";
import { currentUser } from "@/lib/auth/server";
import { db } from "@/core/database/client";
import { hrSyncConfigs } from "@/core/database/schema/hr-sync";
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

    // 2. Parse request
    const body = await request.json() as { 
      configId?: string;
      fileContent?: string;
      validate?: boolean;
      preview?: boolean;
    };
    
    const { configId, fileContent, validate, preview } = body;

    if (!configId) {
      return NextResponse.json(
        { success: false, error: "configId is required" },
        { status: 400 }
      );
    }

    if (!fileContent) {
      return NextResponse.json(
        { success: false, error: "fileContent is required" },
        { status: 400 }
      );
    }

    // 3. Trigger import
    console.log(`📥 Triggering CSV import for config: ${configId}`);
    const result = await importFromCSV(
      configId, 
      fileContent, 
      user.id,
      { validate, preview }
    );

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
    console.error("CSV import API error:", error);
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
      return NextResponse.json(
        { success: false, error: "configId is required" },
        { status: 400 }
      );
    }

    // Generate template based on config field mapping
    const config = await db.query.hrSyncConfigs.findFirst({
      where: eq(hrSyncConfigs.id, configId),
    });

    if (!config) {
      return NextResponse.json(
        { success: false, error: "Config not found" },
        { status: 404 }
      );
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
    return NextResponse.json(
      { success: false, error: "Failed to generate template" },
      { status: 500 }
    );
  }
}
