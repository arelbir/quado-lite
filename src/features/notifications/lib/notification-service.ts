/**
 * NOTIFICATION SERVICE
 * Core notification sending service with Database + Real-time support
 */

import { db } from '@/core/database/client';
import { notifications } from '@/core/database/schema';
import { nanoid } from 'nanoid';
import { realtime } from '@/lib/realtime/realtime-service';

export interface NotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  actionUrl?: string;
}

/**
 * Send notification - Save to DB and broadcast via WebSocket
 */
export async function sendNotification(data: NotificationData) {
  try {
    const notificationId = nanoid();
    
    // Save to database
    const [notification] = await db
      .insert(notifications)
      .values({
        userId: data.userId,
        category: data.type as any,
        title: data.title,
        message: data.message,
        priority: data.priority || 'medium',
        metadata: data.metadata || {},
        relatedEntityType: data.metadata?.entityType as any,
        relatedEntityId: data.metadata?.entityId,
        actionUrl: data.actionUrl,
        isRead: false,
        createdAt: new Date(),
      })
      .returning();

    // Broadcast to user via WebSocket
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
      // WebSocket error shouldn't fail the notification
      console.warn('WebSocket broadcast failed:', wsError);
    }

    return { 
      success: true, 
      notificationId: notification.id 
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

/**
 * Send bulk notifications
 */
export async function sendBulkNotifications(notifications: NotificationData[]) {
  try {
    const results = await Promise.allSettled(
      notifications.map(notification => sendNotification(notification))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return { 
      success: true, 
      sent: successful,
      failed,
      total: notifications.length 
    };
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    throw error;
  }
}

/**
 * Schedule notification for later delivery
 * Note: This requires a job queue implementation
 */
export async function scheduleNotification(
  data: NotificationData,
  scheduleAt: Date
) {
  try {
    // For now, save with scheduled flag
    // TODO: Integrate with BullMQ for scheduled jobs
    const notificationId = nanoid();
    
    await db
      .insert(notifications)
      .values({
        id: notificationId,
        userId: data.userId,
        category: data.type,
        title: data.title,
        message: data.message,
        priority: data.priority || 'medium',
        metadata: {
          ...data.metadata,
          scheduledFor: scheduleAt.toISOString(),
          scheduled: true,
        },
        relatedEntityType: data.metadata?.entityType,
        relatedEntityId: data.metadata?.entityId,
        actionUrl: data.actionUrl,
        isRead: false,
        createdAt: new Date(),
      });

    return { 
      success: true, 
      scheduledId: notificationId,
      scheduledFor: scheduleAt 
    };
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
}
