import { db } from "@/drizzle/db";
import { notifications, notificationPreferences } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * GENERIC NOTIFICATION CATEGORIES
 * Framework-level categories, domain modules can extend these
 */
export type NotificationCategory =
  // Core workflow notifications
  | "workflow_assignment"
  | "workflow_deadline_approaching"
  | "workflow_escalated"
  | "workflow_approved"
  | "workflow_rejected"
  | "workflow_completed"
  // Generic system notifications
  | "system_alert"
  | "user_mentioned"
  | "task_assigned"
  | "task_updated"
  | "task_completed"
  | "approval_required"
  | "approval_completed"
  // Custom categories (for domain modules)
  | string;

export type RelatedEntityType = string; // Generic - any entity type

interface NotificationData {
  userId: string;
  category: NotificationCategory;
  title: string;
  message: string;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
  sendEmail?: boolean;
}

/**
 * Bildirim Servisi - Ortak Modül
 * Tüm sistem genelinde bildirim göndermek için kullanılır
 */
export class NotificationService {
  /**
   * Ana bildirim gönderme fonksiyonu
   * Hem in-app hem email için kullanılır
   */
  static async send(data: NotificationData): Promise<boolean> {
    try {
      // Kullanıcı tercihlerini kontrol et
      const shouldSend = await this.shouldSendNotification(
        data.userId,
        data.category
      );

      if (!shouldSend.inApp && !shouldSend.email) {
        console.log(`Notification skipped for user ${data.userId} - preferences disabled`);
        return false;
      }

      // In-app bildirim oluştur (tercih varsa)
      if (shouldSend.inApp) {
        await this.createInAppNotification(data);
      }

      // Email gönder (tercih varsa ve isteniyorsa)
      if (shouldSend.email && data.sendEmail) {
        await this.sendEmail(data);
      }

      return true;
    } catch (error) {
      console.error("Error sending notification:", error);
      return false;
    }
  }

  /**
   * In-app bildirim oluştur (veritabanına kaydet)
   */
  static async createInAppNotification(
    data: NotificationData
  ): Promise<void> {
    await db.insert(notifications).values({
      userId: data.userId,
      category: data.category as any, // Generic category support
      title: data.title,
      message: data.message,
      relatedEntityType: data.relatedEntityType as any, // Generic entity support
      relatedEntityId: data.relatedEntityId,
      isRead: false,
      emailSent: false,
    });
  }

  /**
   * Email gönder
   * EmailService'i kullanarak email gönderir
   */
  static async sendEmail(data: NotificationData): Promise<void> {
    try {
      // Email servisi entegre edildiğinde burada çağrılacak
      // Şu an için sadece log atıyoruz
      console.log("Email would be sent:", {
        userId: data.userId,
        category: data.category,
        title: data.title,
      });

      // Email gönderimi burada yapılacak
      // import { EmailService } from '@/lib/email/email-service';
      // await EmailService.sendFindingAssigned({...});
      
      // Notification tablosunu email sent olarak güncelle
      await db
        .update(notifications)
        .set({
          emailSent: true,
          emailSentAt: new Date(),
        })
        .where(eq(notifications.userId, data.userId));
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  /**
   * Toplu bildirim gönder
   */
  static async sendBulk(notifications: NotificationData[]): Promise<void> {
    const promises = notifications.map((notification) =>
      this.send(notification)
    );
    await Promise.all(promises);
  }

  /**
   * Kullanıcı tercihlerini kontrol et
   * Generic implementation - checks only global preferences
   * Domain modules can extend this with custom category checks
   */
  static async shouldSendNotification(
    userId: string,
    category: NotificationCategory
  ): Promise<{ inApp: boolean; email: boolean }> {
    try {
      // Kullanıcı tercihlerini getir
      const prefs = await db.query.notificationPreferences.findFirst({
        where: eq(notificationPreferences.userId, userId),
      });

      // Tercih yoksa default değerler (hepsi true)
      if (!prefs) {
        return { inApp: true, email: true };
      }

      // Global preferences check
      return {
        inApp: prefs.inAppEnabled ?? true,
        email: prefs.emailEnabled ?? true,
      };
    } catch (error) {
      console.error("Error checking notification preferences:", error);
      // Hata durumunda default true
      return { inApp: true, email: true };
    }
  }

  /**
   * Kullanıcının okunmamış bildirim sayısını getir
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId));

    return result.filter((n) => !n.isRead).length;
  }

  /**
   * Bildirim okundu olarak işaretle
   */
  static async markAsRead(notificationId: string): Promise<void> {
    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(notifications.id, notificationId));
  }

  /**
   * Tüm bildirimleri okundu olarak işaretle
   */
  static async markAllAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(notifications.userId, userId));
  }

  /**
   * Kullanıcının bildirimlerini getir
   */
  static async getUserNotifications(userId: string, limit = 50) {
    const result = await db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
      orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
      limit,
    });

    return result;
  }
}
