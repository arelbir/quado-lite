"use server";

import { db } from "@/core/database/client";
import { hrSyncConfigs, hrSyncLogs } from "@/core/database/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { withAuth } from "@/lib/helpers/auth-helpers";
import {
  createValidationError,
  createNotFoundError,
  createPermissionError,
} from "@/lib/helpers/error-helpers";
import { checkPermission } from "@/core/permissions/unified-permission-checker";
import { addHRSyncJob, getQueueStatus, cancelSyncJob } from "@/features/notifications/lib/hr-sync-queue";

interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

interface CreateConfigData {
  name: string;
  description?: string;
  sourceType: "LDAP" | "CSV" | "REST_API" | "WEBHOOK" | "MANUAL";
  config: any;
  fieldMapping: any;
  syncMode?: "Full" | "Delta" | "Selective";
  autoSync?: boolean;
  syncSchedule?: string;
}

interface UpdateConfigData extends Partial<CreateConfigData> {
  isActive?: boolean;
}

/**
 * CREATE HR SYNC CONFIG
 */
export async function createHRSyncConfig(
  data: CreateConfigData
): Promise<ActionResponse> {
  return withAuth(
    async (user) => {
      // ✅ UNIFIED PERMISSION CHECK
      const perm = await checkPermission({
        user: user as any,
        resource: "hr-sync",
        action: "create",
      });

      if (!perm.allowed) {
        return createPermissionError(perm.reason || "Permission denied");
      }

      // Validate
      if (!data.name || data.name.trim().length < 2) {
        return createValidationError("Config name must be at least 2 characters");
      }

      if (!data.sourceType) {
        return createValidationError("Source type is required");
      }

      // Create config
      const [newConfig] = await db
        .insert(hrSyncConfigs)
        .values({
          name: data.name.trim(),
          description: data.description?.trim() || null,
          sourceType: data.sourceType,
          config: data.config || {},
          fieldMapping: data.fieldMapping || {},
          syncMode: data.syncMode || "Full",
          autoSync: data.autoSync || false,
          syncSchedule: data.syncSchedule || null,
          isActive: true,
          createdById: user.id,
        })
        .returning();

      revalidatePath("/admin/hr-sync");

      return {
        success: true,
        message: "HR sync config created successfully",
        data: newConfig,
      };
    }
  );
}

/**
 * UPDATE HR SYNC CONFIG
 */
export async function updateHRSyncConfig(
  configId: string,
  data: UpdateConfigData
): Promise<ActionResponse> {
  return withAuth(
    async (user) => {
      // ✅ UNIFIED PERMISSION CHECK
      const perm = await checkPermission({
        user: user as any,
        resource: "hr-sync",
        action: "update",
      });

      if (!perm.allowed) {
        return createPermissionError(perm.reason || "Permission denied");
      }

      // Fetch config
      const config = await db.query.hrSyncConfigs.findFirst({
        where: eq(hrSyncConfigs.id, configId),
      });

      if (!config) {
        return createNotFoundError("HR Sync Config");
      }

      // Update
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (data.name) updateData.name = data.name.trim();
      if (data.description !== undefined)
        updateData.description = data.description?.trim() || null;
      if (data.sourceType) updateData.sourceType = data.sourceType;
      if (data.config) updateData.config = data.config;
      if (data.fieldMapping) updateData.fieldMapping = data.fieldMapping;
      if (data.syncMode) updateData.syncMode = data.syncMode;
      if (data.autoSync !== undefined) updateData.autoSync = data.autoSync;
      if (data.syncSchedule !== undefined)
        updateData.syncSchedule = data.syncSchedule;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      await db.update(hrSyncConfigs).set(updateData).where(eq(hrSyncConfigs.id, configId));

      revalidatePath("/admin/hr-sync");

      return {
        success: true,
        message: "HR sync config updated successfully",
        data: null,
      };
    }
  );
}

/**
 * DELETE HR SYNC CONFIG
 */
export async function deleteHRSyncConfig(
  configId: string
): Promise<ActionResponse> {
  return withAuth(
    async (user) => {
      // ✅ UNIFIED PERMISSION CHECK
      const perm = await checkPermission({
        user: user as any,
        resource: "hr-sync",
        action: "delete",
      });

      if (!perm.allowed) {
        return createPermissionError(perm.reason || "Permission denied");
      }

      const config = await db.query.hrSyncConfigs.findFirst({
        where: eq(hrSyncConfigs.id, configId),
      });

      if (!config) {
        return createNotFoundError("HR Sync Config");
      }

      // Delete config (cascade will handle logs)
      await db.delete(hrSyncConfigs).where(eq(hrSyncConfigs.id, configId));

      revalidatePath("/admin/hr-sync");

      return {
        success: true,
        message: "HR sync config deleted successfully",
        data: null,
      };
    }
  );
}

/**
 * TRIGGER MANUAL SYNC
 */
export async function triggerManualSync(
  configId: string
): Promise<ActionResponse> {
  return withAuth(
    async (user) => {
      // ✅ UNIFIED PERMISSION CHECK
      const perm = await checkPermission({
        user: user as any,
        resource: "hr-sync",
        action: "sync",
      });

      if (!perm.allowed) {
        return createPermissionError(perm.reason || "Permission denied");
      }

      const config = await db.query.hrSyncConfigs.findFirst({
        where: eq(hrSyncConfigs.id, configId),
      });

      if (!config) {
        return createNotFoundError("HR Sync Config");
      }

      if (!config.isActive) {
        return createValidationError("Config is not active");
      }

      // Create sync log
      const [syncLog] = await db
        .insert(hrSyncLogs)
        .values({
          configId: config.id,
          sourceType: config.sourceType,
          syncMode: config.syncMode,
          status: "Pending",
          startedAt: new Date(),
          triggeredBy: user.id,
        })
        .returning();

      if (!syncLog) {
        throw new Error("Failed to create sync log");
      }

      // Add sync job to background queue
      const job = await addHRSyncJob({
        syncLogId: syncLog.id,
        configId: config.id,
        triggeredBy: user.id,
        syncType: config.sourceType,
      });

      console.log(`📋 HR sync job queued: ${job.id}`);

      revalidatePath("/admin/hr-sync");

      return {
        success: true,
        message: "Sync triggered successfully. Processing in background...",
        data: { syncLog, jobId: job.id },
      };
    }
  );
}

/**
 * GET HR SYNC QUEUE STATUS
 */
export async function getHRSyncQueueStatus(): Promise<ActionResponse> {
  return withAuth(
    async (user) => {
      // ✅ UNIFIED PERMISSION CHECK
      const perm = await checkPermission({
        user: user as any,
        resource: "hr-sync",
        action: "view",
      });

      if (!perm.allowed) {
        return createPermissionError(perm.reason || "Permission denied");
      }

      const queueStatus = await getQueueStatus();

      return {
        success: true,
        data: queueStatus,
      };
    }
  );
}

/**
 * CANCEL HR SYNC JOB
 */
export async function cancelHRSyncJob(jobId: string): Promise<ActionResponse> {
  return withAuth(
    async (user) => {
      // ✅ UNIFIED PERMISSION CHECK
      const perm = await checkPermission({
        user: user as any,
        resource: "hr-sync",
        action: "cancel",
      });

      if (!perm.allowed) {
        return createPermissionError(perm.reason || "Permission denied");
      }

      const cancelled = await cancelSyncJob(jobId);

      if (!cancelled) {
        return createValidationError("Job not found or cannot be cancelled");
      }

      revalidatePath("/admin/hr-sync");

      return {
        success: true,
        message: "Sync job cancelled successfully",
        data: { jobId, cancelled: true },
      };
    }
  );
}

/**
 * TOGGLE CONFIG ACTIVE STATUS
 */
export async function toggleConfigStatus(
  configId: string
): Promise<ActionResponse> {
  return withAuth(
    async (user) => {
      // ✅ UNIFIED PERMISSION CHECK
      const perm = await checkPermission({
        user: user as any,
        resource: "hr-sync",
        action: "update",
      });

      if (!perm.allowed) {
        return createPermissionError(perm.reason || "Permission denied");
      }

      const config = await db.query.hrSyncConfigs.findFirst({
        where: eq(hrSyncConfigs.id, configId),
      });

      if (!config) {
        return createNotFoundError("HR Sync Config");
      }

      await db
        .update(hrSyncConfigs)
        .set({
          isActive: !config.isActive,
          updatedAt: new Date(),
        })
        .where(eq(hrSyncConfigs.id, configId));

      revalidatePath("/admin/hr-sync");

      return {
        success: true,
        message: `Config ${!config.isActive ? "activated" : "deactivated"} successfully`,
        data: null,
      };
    }
  );
}
