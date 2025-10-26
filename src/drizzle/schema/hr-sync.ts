/**
 * HR SYNC SCHEMA
 * HR system integration and synchronization
 * 
 * Features:
 * - LDAP/Active Directory sync
 * - CSV import/export
 * - REST API sync (SAP, Oracle, Workday)
 * - Webhook handlers
 * - Scheduled sync (cron)
 * - Delta sync (incremental)
 * 
 * Created: 2025-01-24
 * Sprint: Week 5-6 - HR Integration
 */

import { 
  pgTable, 
  uuid, 
  varchar, 
  text,
  timestamp, 
  boolean,
  json,
  integer,
  foreignKey,
  pgEnum 
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./user";

/**
 * ENUMS
 */
export const syncSourceType = pgEnum("SyncSourceType", [
  'LDAP',           // LDAP/Active Directory
  'CSV',            // CSV file import
  'REST_API',       // REST API (SAP, Oracle, Workday)
  'WEBHOOK',        // Webhook events
  'MANUAL'          // Manual sync trigger
]);

export const syncStatus = pgEnum("SyncStatus", [
  'Pending',        // Scheduled but not started
  'InProgress',     // Currently syncing
  'Completed',      // Successfully completed
  'Failed',         // Failed with errors
  'PartialSuccess'  // Some records failed
]);

export const syncMode = pgEnum("SyncMode", [
  'Full',           // Full sync (all records)
  'Delta',          // Delta sync (only changes)
  'Selective'       // Selective sync (specific records)
]);

export const userSyncAction = pgEnum("UserSyncAction", [
  'Create',         // New user created
  'Update',         // User updated
  'Deactivate',     // User deactivated
  'Reactivate',     // User reactivated
  'Skip',           // Skipped (no changes)
  'Error'           // Error occurred
]);

/**
 * HR_SYNC_CONFIGS TABLE
 * Configuration for HR system connections
 */
export const hrSyncConfigs = pgTable("HRSyncConfig", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  
  // Source type
  sourceType: syncSourceType("sourceType").notNull(),
  
  // Connection config (JSON)
  config: json("config").notNull(),
  // Example for LDAP:
  // {
  //   host: "ldap.company.com",
  //   port: 389,
  //   baseDN: "ou=users,dc=company,dc=com",
  //   bindDN: "cn=admin,dc=company,dc=com",
  //   bindPassword: "encrypted_password",
  //   searchFilter: "(objectClass=person)"
  // }
  // Example for REST API:
  // {
  //   baseUrl: "https://api.sap.com/hr",
  //   apiKey: "encrypted_key",
  //   endpoints: {
  //     users: "/users",
  //     departments: "/departments"
  //   }
  // }
  
  // Field mapping (JSON)
  fieldMapping: json("fieldMapping").notNull(),
  // Example:
  // {
  //   "ldap_uid" → "employeeNumber",
  //   "ldap_mail" → "email",
  //   "ldap_cn" → "name",
  //   "ldap_department" → "departmentId"
  // }
  
  // Sync settings
  syncMode: syncMode("syncMode").default('Full').notNull(),
  autoSync: boolean("autoSync").default(false), // Auto-sync on schedule
  syncSchedule: varchar("syncSchedule", { length: 100 }), // Cron expression
  
  // Filters
  syncFilter: json("syncFilter"), // Optional filter (e.g., only active users)
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  nextSyncAt: timestamp("nextSyncAt"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt"),
  
  // Audit
  createdById: uuid("createdById"),
},
(table) => ({
  createdByFkey: foreignKey({
    columns: [table.createdById],
    foreignColumns: [user.id],
    name: "HRSyncConfig_createdById_fkey"
  }).onDelete("set null"),
}));

/**
 * HR_SYNC_LOGS TABLE
 * Log of sync operations
 */
export const hrSyncLogs = pgTable("HRSyncLog", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  
  configId: uuid("configId"), // Null for manual sync
  
  // Sync info
  sourceType: syncSourceType("sourceType").notNull(),
  syncMode: syncMode("syncMode").notNull(),
  status: syncStatus("status").default('Pending').notNull(),
  
  // Results
  totalRecords: integer("totalRecords").default(0),
  successCount: integer("successCount").default(0),
  failedCount: integer("failedCount").default(0),
  skippedCount: integer("skippedCount").default(0),
  
  // Details
  errorMessage: text("errorMessage"),
  errorDetails: json("errorDetails"), // Detailed error info
  
  // Timing
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  duration: integer("duration"), // Duration in seconds
  
  // Metadata
  metadata: json("metadata"), // Additional sync info
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  
  // Audit
  triggeredBy: uuid("triggeredBy"), // User who triggered sync
},
(table) => ({
  configFkey: foreignKey({
    columns: [table.configId],
    foreignColumns: [hrSyncConfigs.id],
    name: "HRSyncLog_configId_fkey"
  }).onDelete("set null"),
  triggeredByFkey: foreignKey({
    columns: [table.triggeredBy],
    foreignColumns: [user.id],
    name: "HRSyncLog_triggeredBy_fkey"
  }).onDelete("set null"),
}));

/**
 * USER_SYNC_RECORDS TABLE
 * Individual user sync records (detailed)
 */
export const userSyncRecords = pgTable("UserSyncRecord", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  
  syncLogId: uuid("syncLogId").notNull(),
  
  // User info
  userId: uuid("userId"), // Null if user doesn't exist yet
  externalId: varchar("externalId", { length: 255 }), // ID from HR system
  
  // Action
  action: userSyncAction("action").notNull(),
  
  // Data
  sourceData: json("sourceData"), // Original data from HR system
  mappedData: json("mappedData"),  // Mapped data (ready for DB)
  
  // Result
  success: boolean("success").notNull(),
  errorMessage: text("errorMessage"),
  
  // Changes (if update)
  changes: json("changes"), // What changed (before/after)
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
},
(table) => ({
  syncLogFkey: foreignKey({
    columns: [table.syncLogId],
    foreignColumns: [hrSyncLogs.id],
    name: "UserSyncRecord_syncLogId_fkey"
  }).onDelete("cascade"),
  userFkey: foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: "UserSyncRecord_userId_fkey"
  }).onDelete("set null"),
}));

/**
 * EXTERNAL_USER_MAPPINGS TABLE
 * Map external HR system IDs to internal user IDs
 */
export const externalUserMappings = pgTable("ExternalUserMapping", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  
  userId: uuid("userId").notNull(),
  
  // External system info
  sourceType: syncSourceType("sourceType").notNull(),
  externalId: varchar("externalId", { length: 255 }).notNull(), // UID from LDAP, employee ID from SAP, etc.
  externalEmail: varchar("externalEmail", { length: 255 }),
  
  // Metadata
  metadata: json("metadata"), // Additional external system data
  
  // Sync
  lastSyncedAt: timestamp("lastSyncedAt"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt"),
},
(table) => ({
  userFkey: foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: "ExternalUserMapping_userId_fkey"
  }).onDelete("cascade"),
}));

/**
 * RELATIONS
 */
export const hrSyncConfigRelations = relations(hrSyncConfigs, ({ many }) => ({
  syncLogs: many(hrSyncLogs, {
    relationName: 'config_sync_logs',
  }),
}));

export const hrSyncLogRelations = relations(hrSyncLogs, ({ one, many }) => ({
  config: one(hrSyncConfigs, {
    fields: [hrSyncLogs.configId],
    references: [hrSyncConfigs.id],
    relationName: 'config_sync_logs',
  }),
  triggeredByUser: one(user, {
    fields: [hrSyncLogs.triggeredBy],
    references: [user.id],
    relationName: 'user_triggered_syncs',
  }),
  userRecords: many(userSyncRecords, {
    relationName: 'sync_log_records',
  }),
}));

export const userSyncRecordRelations = relations(userSyncRecords, ({ one }) => ({
  syncLog: one(hrSyncLogs, {
    fields: [userSyncRecords.syncLogId],
    references: [hrSyncLogs.id],
    relationName: 'sync_log_records',
  }),
  user: one(user, {
    fields: [userSyncRecords.userId],
    references: [user.id],
    relationName: 'user_sync_records',
  }),
}));

export const externalUserMappingRelations = relations(externalUserMappings, ({ one }) => ({
  user: one(user, {
    fields: [externalUserMappings.userId],
    references: [user.id],
    relationName: 'user_external_mappings',
  }),
}));

/**
 * TYPES
 */
export type HRSyncConfig = typeof hrSyncConfigs.$inferSelect;
export type NewHRSyncConfig = typeof hrSyncConfigs.$inferInsert;

export type HRSyncLog = typeof hrSyncLogs.$inferSelect;
export type NewHRSyncLog = typeof hrSyncLogs.$inferInsert;

export type UserSyncRecord = typeof userSyncRecords.$inferSelect;
export type NewUserSyncRecord = typeof userSyncRecords.$inferInsert;

export type ExternalUserMapping = typeof externalUserMappings.$inferSelect;
export type NewExternalUserMapping = typeof externalUserMappings.$inferInsert;

/**
 * HELPER TYPES
 */
export type HRSyncConfigWithLogs = HRSyncConfig & {
  syncLogs: HRSyncLog[];
};

export type HRSyncLogWithRecords = HRSyncLog & {
  userRecords: UserSyncRecord[];
  config?: HRSyncConfig;
};

export type SyncResult = {
  success: boolean;
  totalRecords: number;
  successCount: number;
  failedCount: number;
  skippedCount: number;
  errors: Array<{
    record: any;
    error: string;
  }>;
};

/**
 * CONFIG TYPES
 */
export interface LDAPConfig {
  host: string;
  port: number;
  baseDN: string;
  bindDN: string;
  bindPassword: string;
  searchFilter: string;
  tlsEnabled?: boolean;
}

export interface RESTAPIConfig {
  baseUrl: string;
  apiKey?: string;
  authType?: 'Bearer' | 'Basic' | 'ApiKey';
  headers?: Record<string, string>;
  endpoints: {
    users: string;
    departments?: string;
  };
}

export interface FieldMapping {
  [externalField: string]: string; // Maps to internal user field
}
