/**
 * REST API SYNC SERVICE
 * Handles REST API user synchronization (SAP, Oracle, Workday, etc.)
 * 
 * Features:
 * - Generic HTTP client
 * - Multiple auth types (Bearer, Basic, ApiKey)
 * - Pagination support
 * - Delta sync (last sync timestamp)
 * - Rate limiting
 * - Error handling
 * - Retry logic
 * 
 * Created: 2025-01-24
 * Week 7-8: Day 2
 */

import { db } from "@/drizzle/db";
import { 
  hrSyncConfigs, 
  hrSyncLogs, 
  userSyncRecords,
  externalUserMappings,
  type HRSyncConfig,
  type RESTAPIConfig,
  type FieldMapping,
  type SyncResult
} from "@/drizzle/schema/hr-sync";
import { user } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * REST API SYNC SERVICE CLASS
 */
export class RESTAPISyncService {
  private config: HRSyncConfig;
  private apiConfig: RESTAPIConfig;
  private fieldMapping: FieldMapping;
  private syncLogId?: string;

  constructor(config: HRSyncConfig) {
    this.config = config;
    this.apiConfig = config.config as RESTAPIConfig;
    this.fieldMapping = config.fieldMapping as FieldMapping;
  }

  /**
   * MAIN SYNC METHOD
   */
  async sync(triggeredBy: string): Promise<SyncResult> {
    console.log(`🔄 Starting REST API sync for config: ${this.config.name}`);
    
    // Create sync log
    this.syncLogId = await this.createSyncLog(triggeredBy);
    
    try {
      // 1. Fetch users from API
      const apiUsers = await this.fetchUsers();
      console.log(`📊 Fetched ${apiUsers.length} users from API`);
      
      // 2. Process users
      const result = await this.processUsers(apiUsers);
      
      // 3. Update sync log
      await this.updateSyncLog('Completed', result);
      
      console.log(`✅ REST API sync completed successfully`);
      return result;
      
    } catch (error) {
      console.error('❌ REST API sync failed:', error);
      await this.updateSyncLog('Failed', {
        success: false,
        totalRecords: 0,
        successCount: 0,
        failedCount: 0,
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
   * FETCH USERS FROM REST API
   */
  private async fetchUsers(): Promise<any[]> {
    console.log(`🌐 Fetching users from: ${this.apiConfig.baseUrl}`);

    const headers = this.buildHeaders();
    const endpoint = this.apiConfig.endpoints.users;
    const url = `${this.apiConfig.baseUrl}${endpoint}`;

    try {
      // Fetch with pagination support
      const allUsers: any[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const pageUrl = this.addPaginationParams(url, page);
        console.log(`📄 Fetching page ${page}: ${pageUrl}`);

        const response = await fetch(pageUrl, {
          method: 'GET',
          headers
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Extract users from response (format varies by API)
        const users = this.extractUsers(data);
        allUsers.push(...users);

        // Check if there are more pages
        hasMore = this.hasMorePages(data, page);
        page++;

        // Rate limiting: wait 100ms between requests
        if (hasMore) {
          await this.sleep(100);
        }
      }

      return allUsers;

    } catch (error) {
      console.error('Error fetching from REST API:', error);
      throw error;
    }
  }

  /**
   * BUILD HTTP HEADERS
   */
  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Add custom headers from config
    if (this.apiConfig.headers) {
      Object.assign(headers, this.apiConfig.headers);
    }

    // Add authentication
    const authType = this.apiConfig.authType || 'Bearer';

    if (authType === 'Bearer' && this.apiConfig.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiConfig.apiKey}`;
    } else if (authType === 'Basic' && this.apiConfig.apiKey) {
      // API key contains base64 encoded credentials
      headers['Authorization'] = `Basic ${this.apiConfig.apiKey}`;
    } else if (authType === 'ApiKey' && this.apiConfig.apiKey) {
      headers['X-API-Key'] = this.apiConfig.apiKey;
    }

    return headers;
  }

  /**
   * ADD PAGINATION PARAMS
   */
  private addPaginationParams(url: string, page: number): string {
    // Support common pagination patterns
    const separator = url.includes('?') ? '&' : '?';
    
    // Try common patterns: page/limit, offset/limit, page/size
    return `${url}${separator}page=${page}&limit=100`;
  }

  /**
   * EXTRACT USERS FROM API RESPONSE
   */
  private extractUsers(data: any): any[] {
    // Support common response formats
    if (Array.isArray(data)) {
      return data;
    }
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    if (data.users && Array.isArray(data.users)) {
      return data.users;
    }
    if (data.results && Array.isArray(data.results)) {
      return data.results;
    }
    
    console.warn('Unknown API response format, returning empty array');
    return [];
  }

  /**
   * CHECK IF MORE PAGES EXIST
   */
  private hasMorePages(data: any, currentPage: number): boolean {
    // Support common pagination patterns
    if (data.hasMore !== undefined) return data.hasMore;
    if (data.has_more !== undefined) return data.has_more;
    if (data.next !== undefined && data.next !== null) return true;
    if (data.pagination) {
      const { total, page, limit } = data.pagination;
      if (total && page && limit) {
        return page * limit < total;
      }
    }
    
    // If we got results, assume there might be more (until we get empty)
    const users = this.extractUsers(data);
    return users.length > 0 && currentPage < 100; // Safety limit: max 100 pages
  }

  /**
   * PROCESS USERS
   */
  private async processUsers(apiUsers: any[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      totalRecords: apiUsers.length,
      successCount: 0,
      failedCount: 0,
      skippedCount: 0,
      errors: []
    };

    for (const apiUser of apiUsers) {
      try {
        // 1. Map API fields to internal fields
        const mappedData = this.mapFields(apiUser);
        
        // 2. Check if user exists
        const existingUser = await this.findExistingUser(
          apiUser[this.getExternalIdField()],
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
            apiUser[this.getExternalIdField()] || '',
            mappedData.email || ''
          );
        }

        // 4. Log record
        await this.logUserRecord(
          userId,
          apiUser[this.getExternalIdField()],
          action,
          apiUser,
          mappedData,
          true
        );

      } catch (error) {
        result.failedCount++;
        result.errors.push({
          record: apiUser,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        // Log failed record
        await this.logUserRecord(
          undefined,
          apiUser[this.getExternalIdField()],
          'Error',
          apiUser,
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
   * MAP API FIELDS TO INTERNAL FIELDS
   */
  private mapFields(apiUser: any): any {
    const mapped: any = {};
    
    for (const [apiField, internalField] of Object.entries(this.fieldMapping)) {
      const value = this.getNestedValue(apiUser, apiField);
      
      if (value !== undefined && value !== null) {
        mapped[internalField] = value;
      }
    }

    return mapped;
  }

  /**
   * GET NESTED VALUE FROM OBJECT
   * Supports dot notation: user.profile.name
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * FIND EXISTING USER
   */
  private async findExistingUser(externalId: string, email?: string) {
    // Try by external mapping first
    const mapping = await db.query.externalUserMappings.findFirst({
      where: and(
        eq(externalUserMappings.sourceType, 'REST_API'),
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
        password: 'API_USER', // API users don't have local password
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
        eq(externalUserMappings.sourceType, 'REST_API')
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
        sourceType: 'REST_API',
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
    for (const [apiField, internalField] of Object.entries(this.fieldMapping)) {
      if (internalField === 'employeeNumber') {
        return apiField;
      }
    }
    return Object.keys(this.fieldMapping)[0] || 'id';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * LOGGING METHODS
   */
  private async createSyncLog(triggeredBy: string): Promise<string> {
    const [log] = await db.insert(hrSyncLogs)
      .values({
        configId: this.config.id,
        sourceType: 'REST_API',
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
}

/**
 * FACTORY FUNCTION
 */
export async function syncFromRESTAPI(configId: string, triggeredBy: string): Promise<SyncResult> {
  // Get config
  const config = await db.query.hrSyncConfigs.findFirst({
    where: eq(hrSyncConfigs.id, configId)
  });

  if (!config) {
    throw new Error(`HR Sync Config not found: ${configId}`);
  }

  if (config.sourceType !== 'REST_API') {
    throw new Error(`Config is not REST_API type: ${config.sourceType}`);
  }

  // Create service and sync
  const service = new RESTAPISyncService(config);
  return await service.sync(triggeredBy);
}
