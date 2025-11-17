/**
 * LDAP SYNC SERVICE
 * Handles LDAP/Active Directory user synchronization
 * 
 * Features:
 * - Connection management
 * - User search & fetch
 * - Field mapping
 * - Delta sync support
 * - Error handling
 * - Logging
 * 
 * Dependencies: ldapjs
 * 
 * Created: 2025-01-24
 * Week 7-8: Day 1
 */

import { db } from "@/core/database/client";
import { 
  hrSyncConfigs, 
  hrSyncLogs, 
  userSyncRecords,
  externalUserMappings,
  type HRSyncConfig,
  type LDAPConfig,
  type FieldMapping,
  type SyncResult
} from "@/core/database/schema/hr-sync";
import { departments, positions, user } from "@/core/database/schema";
import { eq, and } from "drizzle-orm";

import { Client, type Entry, type SearchResult } from 'ldapts';

// Type for LDAP user data
type LDAPUser = Record<string, any>;

/**
 * LDAP SYNC SERVICE CLASS
 */
export class LDAPSyncService {
  private config: HRSyncConfig;
  private ldapConfig: LDAPConfig;
  private fieldMapping: FieldMapping;
  private syncLogId?: string;
  private client?: Client;

  constructor(config: HRSyncConfig) {
    this.config = config;
    this.ldapConfig = config.config as LDAPConfig;
    this.fieldMapping = config.fieldMapping as FieldMapping;
  }

  /**
   * MAIN SYNC METHOD
   * Orchestrates the entire sync process
   */
  async sync(triggeredBy: string): Promise<SyncResult> {
    console.log(`🔄 Starting LDAP sync for config: ${this.config.name}`);
    
    // Create sync log
    this.syncLogId = await this.createSyncLog(triggeredBy);
    
    try {
      // 1. Connect to LDAP
      const client = await this.connect();
      
      // 2. Search users
      const ldapUsers = await this.searchUsers(client);
      console.log(`📊 Found ${ldapUsers.length} users in LDAP`);
      
      // 3. Process users
      const result = await this.processUsers(ldapUsers);
      
      // 4. Update sync log
      await this.updateSyncLog('Completed', result);
      
      // 5. Disconnect
      if (this.client) {
        await this.client.unbind();
        this.client = undefined;
      }
      
      console.log(`✅ LDAP sync completed successfully`);
      return result;
      
    } catch (error) {
      console.error('❌ LDAP sync failed:', error);
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
      
      // Cleanup connection on error
      if (this.client) {
        try {
          await this.client.unbind();
          this.client = undefined;
        } catch (cleanupError) {
          console.warn('⚠️ Failed to cleanup LDAP connection:', cleanupError);
        }
      }
      
      throw error;
    }
  }

  /**
   * CONNECT TO LDAP SERVER
   */
  private async connect(): Promise<Client> {
    console.log(`🔌 Connecting to LDAP server: ${this.ldapConfig.host}:${this.ldapConfig.port}`);
    
    try {
      // Create LDAP client
      this.client = new Client({
        url: `${this.ldapConfig.tlsEnabled ? 'ldaps' : 'ldap'}://${this.ldapConfig.host}:${this.ldapConfig.port}`,
        timeout: 10000, // 10 seconds timeout
        connectTimeout: 10000,
      });

      // Bind to LDAP server
      await this.client.bind(this.ldapConfig.bindDN, this.ldapConfig.bindPassword);
      
      console.log('✅ Successfully connected to LDAP server');
      return this.client;
    } catch (error) {
      console.error('❌ Failed to connect to LDAP server:', error);
      throw new Error(`LDAP connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * SEARCH USERS IN LDAP
   */
  private async searchUsers(client: Client): Promise<LDAPUser[]> {
    console.log(`🔍 Searching users in: ${this.ldapConfig.baseDN}`);
    
    const searchOptions = {
      scope: 'sub' as const,
      filter: this.ldapConfig.searchFilter,
      attributes: Object.keys(this.fieldMapping)
    };

    try {
      const result: SearchResult = await client.search(this.ldapConfig.baseDN, searchOptions);
      const users = result.searchEntries.map((entry: Entry) => entry.pojo as LDAPUser);
      console.log(`✅ Found ${users.length} users in LDAP`);
      return users;
    } catch (error) {
      console.error('❌ Failed to search LDAP users:', error);
      throw new Error(`LDAP search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * PROCESS USERS (Create/Update/Skip)
   */
  private async processUsers(ldapUsers: LDAPUser[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      totalRecords: ldapUsers.length,
      successCount: 0,
      failedCount: 0,
      skippedCount: 0,
      errors: []
    };

    for (const ldapUser of ldapUsers) {
      try {
        // 1. Map LDAP fields to internal fields
        const mappedData = await this.mapFields(ldapUser);
        
        // 2. Check if user exists (by external ID or email)
        const existingUser = await this.findExistingUser(
          ldapUser[this.getExternalIdField()] as string,
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
            ldapUser[this.getExternalIdField()] as string,
            (mappedData.email || ldapUser.mail) as string
          );
        }

        // 4. Log record
        await this.logUserRecord(
          userId,
          ldapUser[this.getExternalIdField()] as string,
          action,
          ldapUser,
          mappedData,
          true
        );

      } catch (error) {
        result.failedCount++;
        result.errors.push({
          record: ldapUser,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        // Log failed record
        await this.logUserRecord(
          undefined,
          ldapUser[this.getExternalIdField()] as string,
          'Error',
          ldapUser,
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
   * MAP LDAP FIELDS TO INTERNAL FIELDS
   */
  private async mapFields(ldapUser: LDAPUser): Promise<any> {
    const mapped: any = {};
    
    for (const [ldapField, internalField] of Object.entries(this.fieldMapping)) {
      const value = ldapUser[ldapField];
      
      if (value !== undefined && value !== null) {
        // Handle special mappings
        if (internalField === 'departmentId') {
          // Map department name to ID (requires lookup)
          mapped[internalField] = await this.lookupDepartmentId(value as string);
        } else if (internalField === 'positionId') {
          // Map position name to ID (requires lookup)
          mapped[internalField] = await this.lookupPositionId(value as string);
        } else {
          mapped[internalField] = value;
        }
      }
    }

    return mapped;
  }

  /**
   * LOOKUP DEPARTMENT ID BY NAME
   */
  private async lookupDepartmentId(departmentName: string): Promise<string | null> {
    try {
      const department = await db.query.departments.findFirst({
        where: eq(departments.name, departmentName),
        columns: { id: true }
      });
      
      return department?.id || null;
    } catch (error) {
      console.warn(`⚠️ Failed to lookup department "${departmentName}":`, error);
      return null;
    }
  }

  /**
   * LOOKUP POSITION ID BY NAME
   */
  private async lookupPositionId(positionName: string): Promise<string | null> {
    try {
      const position = await db.query.positions.findFirst({
        where: eq(positions.name, positionName),
        columns: { id: true }
      });
      
      return position?.id || null;
    } catch (error) {
      console.warn(`⚠️ Failed to lookup position "${positionName}":`, error);
      return null;
    }
  }

  /**
   * FIND EXISTING USER
   */
  private async findExistingUser(externalId: string, email?: string) {
    // Try by external mapping first
    const mapping = await db.query.externalUserMappings.findFirst({
      where: and(
        eq(externalUserMappings.sourceType, 'LDAP'),
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
    // Compare key fields
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
        password: 'LDAP_USER', // LDAP users don't have local password
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
        eq(externalUserMappings.sourceType, 'LDAP')
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
        sourceType: 'LDAP',
        externalId,
        externalEmail,
        lastSyncedAt: new Date()
      });
    }
  }

  /**
   * HELPER: Get external ID field from mapping
   */
  private getExternalIdField(): string {
    // Find which LDAP field maps to employeeNumber or similar
    for (const [ldapField, internalField] of Object.entries(this.fieldMapping)) {
      if (internalField === 'employeeNumber' || ldapField === 'uid') {
        return ldapField;
      }
    }
    return 'uid'; // Default
  }

  /**
   * CREATE SYNC LOG
   */
  private async createSyncLog(triggeredBy: string): Promise<string> {
    const [log] = await db.insert(hrSyncLogs)
      .values({
        configId: this.config.id,
        sourceType: 'LDAP',
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

  /**
   * UPDATE SYNC LOG
   */
  private async updateSyncLog(status: 'Completed' | 'Failed', result: SyncResult): Promise<void> {
    if (!this.syncLogId) return;

    const now = new Date();
    const startedAt = new Date(); // TODO: Get from log

    await db.update(hrSyncLogs)
      .set({
        status,
        totalRecords: result.totalRecords,
        successCount: result.successCount,
        failedCount: result.failedCount,
        skippedCount: result.skippedCount,
        completedAt: now,
        duration: Math.floor((now.getTime() - startedAt.getTime()) / 1000),
        errorMessage: result.errors.length > 0 ? `${result.errors.length} errors occurred` : null
      })
      .where(eq(hrSyncLogs.id, this.syncLogId));
  }

  /**
   * LOG USER RECORD
   */
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
   * MOCK DATA FOR TESTING
   */
  private getMockLDAPUsers(): any[] {
    return [
      {
        uid: 'jdoe',
        cn: 'John Doe',
        mail: 'john.doe@company.com',
        department: 'Quality',
        title: 'Quality Manager',
        employeeNumber: 'EMP001'
      },
      {
        uid: 'asmith',
        cn: 'Alice Smith',
        mail: 'alice.smith@company.com',
        department: 'IT',
        title: 'Developer',
        employeeNumber: 'EMP002'
      }
    ];
  }
}

/**
 * FACTORY FUNCTION
 */
export async function syncFromLDAP(configId: string, triggeredBy: string): Promise<SyncResult> {
  // Get config
  const config = await db.query.hrSyncConfigs.findFirst({
    where: eq(hrSyncConfigs.id, configId)
  });

  if (!config) {
    throw new Error(`HR Sync Config not found: ${configId}`);
  }

  if (config.sourceType !== 'LDAP') {
    throw new Error(`Config is not LDAP type: ${config.sourceType}`);
  }

  // Create service and sync
  const service = new LDAPSyncService(config);
  return await service.sync(triggeredBy);
}
