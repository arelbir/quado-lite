/**
 * HR SYNC QUEUE
 * Queue management for HR sync jobs using BullMQ + Redis
 */

import { Queue, QueueEvents } from 'bullmq';
import { createRedisConnection } from '@/lib/queue/redis-connection';

export interface QueueStatus {
  active: number;
  waiting: number;
  completed: number;
  failed: number;
}

export interface HRSyncJobData {
  syncLogId: string;
  triggeredBy: string;
  syncType: 'LDAP' | 'CSV' | 'REST_API' | 'WEBHOOK' | 'MANUAL';
}

// Create HR Sync Queue
const hrSyncQueue = new Queue('hr-sync', {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

// Queue Events for monitoring
const queueEvents = new QueueEvents('hr-sync', {
  connection: createRedisConnection(),
});

queueEvents.on('completed', ({ jobId }) => {
  console.log(`✅ HR Sync job completed: ${jobId}`);
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ HR Sync job failed: ${jobId}`, failedReason);
});

/**
 * Add HR sync job to queue
 */
export async function addHRSyncJob(
  configId: string,
  options?: HRSyncJobData
) {
  try {
    const job = await hrSyncQueue.add(
      'sync',
      {
        configId,
        ...options,
        enqueuedAt: new Date().toISOString(),
      },
      {
        jobId: `hr-sync-${configId}-${Date.now()}`,
      }
    );

    return { jobId: job.id as string };
  } catch (error) {
    console.error('Error adding HR sync job:', error);
    throw error;
  }
}

/**
 * Get queue status
 */
export async function getQueueStatus(): Promise<QueueStatus> {
  try {
    const [active, waiting, completed, failed] = await Promise.all([
      hrSyncQueue.getActiveCount(),
      hrSyncQueue.getWaitingCount(),
      hrSyncQueue.getCompletedCount(),
      hrSyncQueue.getFailedCount(),
    ]);

    return {
      active,
      waiting,
      completed,
      failed,
    };
  } catch (error) {
    console.error('Error getting queue status:', error);
    return {
      active: 0,
      waiting: 0,
      completed: 0,
      failed: 0,
    };
  }
}

/**
 * Cancel/remove a job from queue
 */
export async function cancelSyncJob(jobId: string) {
  try {
    const job = await hrSyncQueue.getJob(jobId);
    
    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    // Remove the job
    await job.remove();

    return { success: true };
  } catch (error) {
    console.error('Error cancelling sync job:', error);
    return { success: false, error: 'Failed to cancel job' };
  }
}

/**
 * Get job details
 */
export async function getJobDetails(jobId: string) {
  try {
    const job = await hrSyncQueue.getJob(jobId);
    
    if (!job) {
      return null;
    }

    return {
      id: job.id,
      data: job.data,
      progress: job.progress,
      state: await job.getState(),
      attemptsMade: job.attemptsMade,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
    };
  } catch (error) {
    console.error('Error getting job details:', error);
    return null;
  }
}

// Export queue for worker
export { hrSyncQueue };
