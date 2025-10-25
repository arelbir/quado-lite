"use server";

import { db } from "@/drizzle/db";
import { notifications, notificationPreferences } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export type NotificationCategory =
  | "finding_assigned"
  | "finding_updated"
  | "action_assigned"
  | "action_pending_approval"
  | "action_approved"
  | "action_rejected"
  | "dof_assigned"
  | "dof_pending_approval"
  | "dof_approved"
  | "dof_rejected"
  | "plan_created"
  | "audit_completed"
  | "audit_reminder"
  | "workflow_assignment"
  | "workflow_deadline_approaching"
  | "workflow_escalated"
  | "workflow_approved"
  | "workflow_rejected";

export type RelatedEntityType = "finding" | "action" | "dof" | "audit" | "plan";

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
      category: data.category,
      title: data.title,
      message: data.message,
      relatedEntityType: data.relatedEntityType,
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

      // Genel tercihler kapalıysa direkt false
      if (!prefs.inAppEnabled && !prefs.emailEnabled) {
        return { inApp: false, email: false };
      }

      // Kategori bazlı kontrol
      let categoryEnabled = true;
      if (category.startsWith("finding")) {
        categoryEnabled = prefs.findingNotifications;
      } else if (category.startsWith("action")) {
        categoryEnabled = prefs.actionNotifications;
      } else if (category.startsWith("dof")) {
        categoryEnabled = prefs.dofNotifications;
      } else if (category.startsWith("plan")) {
        categoryEnabled = prefs.planNotifications;
      } else if (category.startsWith("audit")) {
        categoryEnabled = prefs.auditNotifications;
      }

      return {
        inApp: prefs.inAppEnabled && categoryEnabled,
        email: prefs.emailEnabled && categoryEnabled,
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
