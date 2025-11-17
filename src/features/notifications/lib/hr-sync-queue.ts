/**
 * HR SYNC QUEUE SYSTEM
 * Handles background job processing for HR synchronization
 * 
 * Features:
 * - Redis-based job queue
 * - Job priorities and delays
 * - Job retries and error handling
 * - Job status tracking
 * - Concurrent processing limits
 * 
 * Dependencies: bullmq, ioredis
 * 
 * Created: 2025-01-29
 * TODO Completion: Background Job System
 */

import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import { Redis } from 'ioredis';
import { LDAPSyncService } from '@/features/hr-sync/lib/ldap-sync-service';
import { db } from '@/core/database/client';
import { hrSyncLogs, hrSyncConfigs } from '@/core/database/schema/hr-sync';
import { eq } from 'drizzle-orm';

// Redis connection configuration
const redisConnection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
});

// Queue names
export const HR_SYNC_QUEUE = 'hr-sync-jobs';
export const HR_SYNC_QUEUE_EVENTS = 'hr-sync-events';

// Create queue instance
export const hrSyncQueue = new Queue(HR_SYNC_QUEUE, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 50, // Keep last 50 completed jobs
    removeOnFail: 100,    // Keep last 100 failed jobs
    attempts: 3,          // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Queue events for monitoring
export const hrSyncQueueEvents = new QueueEvents(HR_SYNC_QUEUE, {
  connection: redisConnection,
});

/**
 * JOB TYPES
 */
export interface HRSyncJobData {
  syncLogId: string;
  configId: string;
  triggeredBy: string;
  syncType: 'LDAP' | 'CSV' | 'REST_API' | 'WEBHOOK' | 'MANUAL';
}

/**
 * ADD HR SYNC JOB TO QUEUE
 */
export async function addHRSyncJob(data: HRSyncJobData, options?: {
  delay?: number;
  priority?: number;
}) {
  const job = await hrSyncQueue.add(
    'hr-sync',
    data,
    {
      delay: options?.delay,
      priority: options?.priority || 0,
      jobId: `hr-sync-${data.syncLogId}`, // Unique job ID
    }
  );

  console.log(`📋 Added HR sync job to queue: ${job.id}`);
  return job;
}

/**
 * HR SYNC WORKER
 * Processes background sync jobs
 */
export const hrSyncWorker = new Worker<HRSyncJobData>(
  HR_SYNC_QUEUE,
  async (job: Job<HRSyncJobData>) => {
    const { syncLogId, configId, syncType, triggeredBy } = job.data;
    
    console.log(`🔄 Processing HR sync job: ${job.id} (${syncType})`);
    
    try {
      // Update job status to running
      await updateSyncLogStatus(syncLogId, 'Running');
      
      // Get sync configuration
      const config = await db.query.hrSyncConfigs.findFirst({
        where: eq(hrSyncConfigs.id, configId),
      });

      if (!config) {
        throw new Error(`Sync configuration not found: ${configId}`);
      }

      let result;
      
      // Process based on sync type
      switch (syncType) {
        case 'LDAP':
          const ldapService = new LDAPSyncService(config);
          result = await ldapService.sync(triggeredBy);
          break;
          
        case 'CSV':
          // CSV import needs file content, so this won't work from queue
          // CSV imports should be handled via direct API calls, not queued
          throw new Error('CSV import cannot be queued - use direct API endpoint instead');
          break;
          
        case 'REST_API':
          // TODO: Implement REST API sync service
          throw new Error('REST API sync not yet implemented');
          
        default:
          throw new Error(`Unknown sync type: ${syncType}`);
      }

      // Update sync log with success result
      await updateSyncLogStatus(syncLogId, 'Completed', result);
      
      console.log(`✅ HR sync job completed: ${job.id}`);
      return result;
      
    } catch (error) {
      console.error(`❌ HR sync job failed: ${job.id}`, error);
      
      // Update sync log with error
      await updateSyncLogStatus(syncLogId, 'Failed', {
        success: false,
        totalRecords: 0,
        successCount: 0,
        failedCount: 0,
        skippedCount: 0,
        errors: [{
          record: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        }],
      });
      
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: parseInt(process.env.HR_SYNC_CONCURRENCY || '2'), // Max 2 concurrent jobs
    limiter: {
      max: 10, // Max 10 jobs per 10 seconds
      duration: 10000,
    },
  }
);

/**
 * UPDATE SYNC LOG STATUS
 */
async function updateSyncLogStatus(
  syncLogId: string, 
  status: 'Pending' | 'Running' | 'Completed' | 'Failed',
  result?: any
) {
  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  if (status === 'Completed') {
    updateData.completedAt = new Date();
    updateData.result = result;
  } else if (status === 'Failed') {
    updateData.completedAt = new Date();
    updateData.result = result;
  }

  await db
    .update(hrSyncLogs)
    .set(updateData)
    .where(eq(hrSyncLogs.id, syncLogId));
}

/**
 * GET QUEUE STATUS
 */
export async function getQueueStatus() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    hrSyncQueue.getWaiting(),
    hrSyncQueue.getActive(),
    hrSyncQueue.getCompleted(),
    hrSyncQueue.getFailed(),
    hrSyncQueue.getDelayed(),
  ]);

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
    delayed: delayed.length,
  };
}

/**
 * CANCEL SYNC JOB
 */
export async function cancelSyncJob(jobId: string) {
  try {
    const job = await hrSyncQueue.getJob(jobId);
    if (job) {
      await job.remove();
      console.log(`🗑️ Cancelled HR sync job: ${jobId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Failed to cancel job ${jobId}:`, error);
    return false;
  }
}

/**
 * RETRY FAILED JOB
 */
export async function retryFailedJob(jobId: string) {
  try {
    const job = await hrSyncQueue.getJob(jobId);
    if (job && await job.isFailed()) {
      await job.retry();
      console.log(`🔄 Retried HR sync job: ${jobId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Failed to retry job ${jobId}:`, error);
    return false;
  }
}

// Handle worker events
hrSyncWorker.on('completed', (job) => {
  console.log(`✅ Worker completed job: ${job.id}`);
});

hrSyncWorker.on('failed', (job, err) => {
  console.error(`❌ Worker failed job: ${job?.id || 'unknown'}`, err);
});

hrSyncWorker.on('error', (err) => {
  console.error('❌ Worker error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down HR sync worker...');
  await hrSyncWorker.close();
  await hrSyncQueue.close();
  await redisConnection.quit();
  process.exit(0);
});

export default hrSyncQueue;
