/**
 * CSV IMPORT SERVICE
 * Handles CSV/Excel user imports
 * 
 * Features:
 * - File parsing (CSV, Excel)
 * - Data validation
 * - Preview functionality
 * - Bulk user operations
 * - Field mapping
 * - Error tracking
 * 
 * Dependencies: papaparse (for CSV)
 * 
 * Created: 2025-01-24
 * Week 7-8: Day 2
 */

import { db } from "@/core/database/client";
import { 
  hrSyncConfigs, 
  hrSyncLogs, 
  userSyncRecords,
  externalUserMappings,
  type HRSyncConfig,
  type FieldMapping,
  type SyncResult
} from "@/core/database/schema/hr-sync";
import { user } from "@/core/database/schema";
import { eq, and } from "drizzle-orm";
import Papa from 'papaparse';

/**
 * CSV IMPORT SERVICE CLASS
 */
export class CSVImportService {
  private config: HRSyncConfig;
  private fieldMapping: FieldMapping;
  private syncLogId?: string;

  constructor(config: HRSyncConfig) {
    this.config = config;
    this.fieldMapping = config.fieldMapping as FieldMapping;
  }

  /**
   * PARSE CSV FILE
   * Convert CSV file to JSON array
   */
  async parseCSV(fileContent: string): Promise<any[]> {
    console.log(`📄 Parsing CSV file with PapaParse...`);

    return new Promise((resolve, reject) => {
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        transform: (value) => value.trim(),
        complete: (results) => {
          console.log(`✅ Parsed ${results.data.length} rows from CSV`);
          
          if (results.errors.length > 0) {
            console.warn(`⚠️ CSV parsing warnings:`, results.errors);
          }
          
          resolve(results.data);
        },
        error: (error: Error) => {
          console.error('❌ CSV parsing failed:', error);
          reject(new Error(`CSV parsing failed: ${error.message}`));
        }
      });
    });
  }

  /**
   * VALIDATE CSV DATA
   * Check for required fields and format
   */
  validateData(data: any[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.length === 0) {
      errors.push('CSV file is empty');
      return { valid: false, errors };
    }

    // Check if all mapped fields exist in CSV
    const csvColumns = Object.keys(data[0]);
    const requiredColumns = Object.keys(this.fieldMapping);

    for (const column of requiredColumns) {
      if (!csvColumns.includes(column)) {
        errors.push(`Missing required column: ${column}`);
      }
    }

    // Validate each row
    data.forEach((row, index) => {
      // Check email format
      const emailField = this.findFieldMapping('email');
      if (emailField && row[emailField]) {
        const email = row[emailField];
        if (!this.isValidEmail(email)) {
          errors.push(`Row ${index + 1}: Invalid email format: ${email}`);
        }
      }

      // Check required fields
      for (const [csvField, internalField] of Object.entries(this.fieldMapping)) {
        if (this.isRequiredField(internalField) && !row[csvField]) {
          errors.push(`Row ${index + 1}: Missing required field: ${csvField}`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * PREVIEW IMPORT
   * Show what will happen without actually importing
   */
  async preview(data: any[]): Promise<{
    toCreate: number;
    toUpdate: number;
    toSkip: number;
    samples: any[];
  }> {
    console.log(`👀 Previewing import for ${data.length} records...`);

    let toCreate = 0;
    let toUpdate = 0;
    let toSkip = 0;
    const samples: any[] = [];

    for (const row of data.slice(0, 100)) { // Preview first 100
      const mappedData = this.mapFields(row);
      const existingUser = await this.findExistingUser(
        row[this.getExternalIdField()],
        mappedData.email
      );

      if (existingUser) {
        const hasChanges = this.hasChanges(existingUser, mappedData);
        if (hasChanges) {
          toUpdate++;
        } else {
          toSkip++;
        }
      } else {
        toCreate++;
      }

      // Sample first 5
      if (samples.length < 5) {
        samples.push({
          row,
          mappedData,
          action: existingUser 
            ? (this.hasChanges(existingUser, mappedData) ? 'Update' : 'Skip')
            : 'Create'
        });
      }
    }

    return { toCreate, toUpdate, toSkip, samples };
  }

  /**
   * MAIN IMPORT METHOD
   * Process and import all users
   */
  async import(
    fileContent: string,
    triggeredBy: string,
    options?: { validate?: boolean; preview?: boolean }
  ): Promise<SyncResult> {
    console.log(`📥 Starting CSV import...`);

    // 1. Parse CSV
    const data = await this.parseCSV(fileContent);
    console.log(`📊 Parsed ${data.length} records`);

    // 2. Validate if requested
    if (options?.validate !== false) {
      const validation = this.validateData(data);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
    }

    // 3. Preview if requested
    if (options?.preview) {
      const preview = await this.preview(data);
      return {
        success: true,
        totalRecords: data.length,
        successCount: preview.toCreate + preview.toUpdate,
        failedCount: 0,
        skippedCount: preview.toSkip,
        errors: []
      };
    }

    // 4. Create sync log
    this.syncLogId = await this.createSyncLog(triggeredBy);

    try {
      // 5. Process users
      const result = await this.processUsers(data);

      // 6. Update sync log
      await this.updateSyncLog('Completed', result);

      console.log(`✅ CSV import completed successfully`);
      return result;

    } catch (error) {
      console.error('❌ CSV import failed:', error);
      await this.updateSyncLog('Failed', {
        success: false,
        totalRecords: data.length,
        successCount: 0,
        failedCount: data.length,
        skippedCount: 0,
        errors: [{
          record: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        }]
      });
      throw error;
    }
  }

  /**
   * PROCESS USERS
   * Same logic as LDAP sync
   */
  private async processUsers(csvData: any[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      totalRecords: csvData.length,
      successCount: 0,
      failedCount: 0,
      skippedCount: 0,
      errors: []
    };

    for (const row of csvData) {
      try {
        // 1. Map CSV fields to internal fields
        const mappedData = this.mapFields(row);

        // 2. Check if user exists
        const existingUser = await this.findExistingUser(
          row[this.getExternalIdField()],
          mappedData.email
        );

        let action: 'Create' | 'Update' | 'Skip';
        let userId: string | undefined;

        if (existingUser) {
          // User exists - check if update needed
          const hasChanges = this.hasChanges(existingUser, mappedData);

          if (hasChanges) {
            // Update user
            await this.updateUser(existingUser.id, mappedData);
            action = 'Update';
            userId = existingUser.id;
            result.successCount++;
          } else {
            // No changes - skip
            action = 'Skip';
            userId = existingUser.id;
            result.skippedCount++;
          }
        } else {
          // User doesn't exist - create
          userId = await this.createUser(mappedData);
          action = 'Create';
          result.successCount++;
        }

        // 3. Create/Update external mapping
        if (userId) {
          await this.upsertExternalMapping(
            userId,
            row[this.getExternalIdField()] || '',
            mappedData.email || ''
          );
        }

        // 4. Log record
        await this.logUserRecord(
          userId,
          row[this.getExternalIdField()],
          action,
          row,
          mappedData,
          true
        );

      } catch (error) {
        result.failedCount++;
        result.errors.push({
          record: row,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        // Log failed record
        await this.logUserRecord(
          undefined,
          row[this.getExternalIdField()],
          'Error',
          row,
          null,
          false,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }

    result.success = result.failedCount === 0;
    return result;
  }

  /**
   * MAP CSV FIELDS TO INTERNAL FIELDS
   */
  private mapFields(csvRow: any): any {
    const mapped: any = {};

    for (const [csvField, internalField] of Object.entries(this.fieldMapping)) {
      const value = csvRow[csvField];

      if (value !== undefined && value !== null && value !== '') {
        mapped[internalField] = value;
      }
    }

    return mapped;
  }

  /**
   * FIND EXISTING USER
   */
  private async findExistingUser(externalId: string, email?: string) {
    // Try by external mapping first
    const mapping = await db.query.externalUserMappings.findFirst({
      where: and(
        eq(externalUserMappings.sourceType, 'CSV'),
        eq(externalUserMappings.externalId, externalId)
      ),
      with: {
        user: true
      } as any
    }) as any;

    if (mapping) return mapping.user;

    // Try by email
    if (email) {
      return await db.query.user.findFirst({
        where: eq(user.email, email)
      });
    }

    return null;
  }

  /**
   * CHECK IF USER DATA HAS CHANGES
   */
  private hasChanges(existingUser: any, newData: any): boolean {
    const fieldsToCompare = ['name', 'email', 'departmentId', 'positionId'];

    for (const field of fieldsToCompare) {
      if (newData[field] && existingUser[field] !== newData[field]) {
        return true;
      }
    }

    return false;
  }

  /**
   * CREATE USER
   */
  private async createUser(data: any): Promise<string> {
    const [created] = await db.insert(user)
      .values({
        ...data,
        password: 'CSV_IMPORT', // CSV imports don't have password
        status: 'Active'
      })
      .returning({ id: user.id });

    if (!created) {
      throw new Error('Failed to create user');
    }

    return created.id;
  }

  /**
   * UPDATE USER
   */
  private async updateUser(userId: string, data: any): Promise<void> {
    await db.update(user)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(user.id, userId));
  }

  /**
   * UPSERT EXTERNAL MAPPING
   */
  private async upsertExternalMapping(
    userId: string,
    externalId: string,
    externalEmail: string
  ): Promise<void> {
    const existing = await db.query.externalUserMappings.findFirst({
      where: and(
        eq(externalUserMappings.userId, userId),
        eq(externalUserMappings.sourceType, 'CSV')
      )
    });

    if (existing) {
      // Update
      await db.update(externalUserMappings)
        .set({
          externalId,
          externalEmail,
          lastSyncedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(externalUserMappings.id, existing.id));
    } else {
      // Insert
      await db.insert(externalUserMappings).values({
        userId,
        sourceType: 'CSV',
        externalId,
        externalEmail,
        lastSyncedAt: new Date()
      });
    }
  }

  /**
   * HELPER METHODS
   */
  private getExternalIdField(): string {
    for (const [csvField, internalField] of Object.entries(this.fieldMapping)) {
      if (internalField === 'employeeNumber') {
        return csvField;
      }
    }
    return Object.keys(this.fieldMapping)[0] || 'id'; // First field or 'id'
  }

  private findFieldMapping(internalField: string): string | undefined {
    for (const [csvField, internal] of Object.entries(this.fieldMapping)) {
      if (internal === internalField) {
        return csvField;
      }
    }
    return undefined;
  }

  private isRequiredField(internalField: string): boolean {
    return ['email', 'name'].includes(internalField);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * LOGGING METHODS
   */
  private async createSyncLog(triggeredBy: string): Promise<string> {
    const [log] = await db.insert(hrSyncLogs)
      .values({
        configId: this.config.id,
        sourceType: 'CSV',
        syncMode: this.config.syncMode,
        status: 'InProgress',
        startedAt: new Date(),
        triggeredBy
      })
      .returning({ id: hrSyncLogs.id });

    if (!log) {
      throw new Error('Failed to create sync log');
    }

    return log.id;
  }

  private async updateSyncLog(status: 'Completed' | 'Failed', result: SyncResult): Promise<void> {
    if (!this.syncLogId) return;

    const now = new Date();

    await db.update(hrSyncLogs)
      .set({
        status,
        totalRecords: result.totalRecords,
        successCount: result.successCount,
        failedCount: result.failedCount,
        skippedCount: result.skippedCount,
        completedAt: now,
        errorMessage: result.errors.length > 0 ? `${result.errors.length} errors occurred` : null
      })
      .where(eq(hrSyncLogs.id, this.syncLogId));
  }

  private async logUserRecord(
    userId: string | undefined,
    externalId: string,
    action: 'Create' | 'Update' | 'Skip' | 'Error',
    sourceData: any,
    mappedData: any,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    if (!this.syncLogId) return;

    await db.insert(userSyncRecords).values({
      syncLogId: this.syncLogId,
      userId,
      externalId,
      action,
      sourceData,
      mappedData,
      success,
      errorMessage
    });
  }

  /**
   * MOCK CSV PARSER
   */
  private parseMockCSV(content: string): any[] {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0]?.split(',').map(h => h.trim()) || [];
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      const row: any = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      data.push(row);
    }

    return data;
  }
}

/**
 * FACTORY FUNCTION
 */
export async function importFromCSV(
  configId: string,
  fileContent: string,
  triggeredBy: string,
  options?: { validate?: boolean; preview?: boolean }
): Promise<SyncResult> {
  // Get config
  const config = await db.query.hrSyncConfigs.findFirst({
    where: eq(hrSyncConfigs.id, configId)
  });

  if (!config) {
    throw new Error(`HR Sync Config not found: ${configId}`);
  }

  if (config.sourceType !== 'CSV') {
    throw new Error(`Config is not CSV type: ${config.sourceType}`);
  }

  // Create service and import
  const service = new CSVImportService(config);
  return await service.import(fileContent, triggeredBy, options);
}

/**
 * EXAMPLE CSV FORMAT
 */
export const EXAMPLE_CSV = `Employee ID,Full Name,Email,Department,Position
EMP001,John Doe,john.doe@company.com,Quality,Quality Manager
EMP002,Alice Smith,alice.smith@company.com,IT,Developer
EMP003,Bob Johnson,bob.johnson@company.com,Sales,Sales Manager`;
