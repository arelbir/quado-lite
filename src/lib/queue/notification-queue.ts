/**
 * NOTIFICATION QUEUE
 * Scheduled notification system using BullMQ
 */

import { Queue, QueueEvents, Worker } from 'bullmq';
import { createRedisConnection } from './redis-connection';
import { log } from '@/lib/monitoring/logger';
import { db } from '@/core/database/client';
import { notifications } from '@/core/database/schema';
import { realtime } from '@/lib/realtime/realtime-service';
import { eq } from 'drizzle-orm';

interface ScheduledNotificationData {
  userId: string;
  category: string;
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  actionUrl?: string;
}

// Create Notification Queue
const notificationQueue = new Queue('notifications', {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      age: 7 * 24 * 3600, // 7 days
      count: 1000,
    },
    removeOnFail: {
      age: 14 * 24 * 3600, // 14 days
    },
  },
});

// Queue Events
const queueEvents = new QueueEvents('notifications', {
  connection: createRedisConnection(),
});

queueEvents.on('completed', ({ jobId }) => {
  log.queue('Notification sent', { jobId, queue: 'notifications' });
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  log.error('Notification failed', { jobId, reason: failedReason });
});

/**
 * Schedule a notification for future delivery
 */
export async function scheduleNotification(
  data: ScheduledNotificationData,
  scheduleAt: Date
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    const delay = scheduleAt.getTime() - Date.now();
    
    if (delay < 0) {
      throw new Error('Schedule time must be in the future');
    }

    const job = await notificationQueue.add(
      'send-notification',
      data,
      {
        delay,
        jobId: `notif-${data.userId}-${Date.now()}`,
      }
    );

    return { success: true, jobId: job.id as string };
  } catch (error) {
    log.error('Error scheduling notification', error as Error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Schedule bulk notifications
 */
export async function scheduleBulkNotifications(
  notifications: Array<{ data: ScheduledNotificationData; scheduleAt: Date }>
): Promise<{ success: boolean; scheduled: number; failed: number }> {
  let scheduled = 0;
  let failed = 0;

  for (const { data, scheduleAt } of notifications) {
    const result = await scheduleNotification(data, scheduleAt);
    if (result.success) {
      scheduled++;
    } else {
      failed++;
    }
  }

  return { success: true, scheduled, failed };
}

/**
 * Cancel a scheduled notification
 */
export async function cancelScheduledNotification(jobId: string): Promise<boolean> {
  try {
    const job = await notificationQueue.getJob(jobId);
    if (job) {
      await job.remove();
      return true;
    }
    return false;
  } catch (error) {
    log.error('Error cancelling scheduled notification', error as Error);
    return false;
  }
}

/**
 * Worker to process scheduled notifications
 * This should be started in a separate process/worker
 */
export function startNotificationWorker() {
  const worker = new Worker(
    'notifications',
    async (job) => {
      const data = job.data as ScheduledNotificationData;

      try {
        // Save to database
        const [notification] = await db
          .insert(notifications)
          .values({
            userId: data.userId,
            category: data.category as any,
            title: data.title,
            message: data.message,
            priority: data.priority || 'medium',
            metadata: data.metadata || {},
            actionUrl: data.actionUrl,
            isRead: false,
            createdAt: new Date(),
          })
          .returning();

        if (!notification) {
          throw new Error('Failed to create notification');
        }

        // Broadcast via WebSocket
        try {
          realtime.send('notification', {
            userId: data.userId,
            id: notification.id,
            title: notification.title,
            message: notification.message,
            priority: notification.priority,
            createdAt: notification.createdAt,
          });
        } catch (wsError) {
          log.warn('WebSocket broadcast failed', { error: wsError });
        }

        return { success: true, notificationId: notification.id };
      } catch (error) {
        log.error('Error processing notification', error as Error);
        throw error;
      }
    },
    {
      connection: createRedisConnection(),
      concurrency: 10,
    }
  );

  worker.on('completed', (job) => {
    log.queue('Notification processed', { jobId: job.id });
  });

  worker.on('failed', (job, err) => {
    log.error('Notification processing failed', { jobId: job?.id, error: err });
  });

  return worker;
}

export { notificationQueue };
