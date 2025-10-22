"use server";

import { db } from "@/drizzle/db";
import { notifications, notificationPreferences } from "@/drizzle/schema";
import { currentUser } from "@/lib/auth";
import { eq, desc, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResponse<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Kullanıcının bildirimlerini getir
 */
export async function getUserNotifications(limit = 50) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const userNotifications = await db.query.notifications.findMany({
      where: eq(notifications.userId, user.id),
      orderBy: [desc(notifications.createdAt)],
      limit,
    });

    return userNotifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

/**
 * Okunmamış bildirim sayısını getir
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const user = await currentUser();
    if (!user) {
      return 0;
    }

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.id));

    return userNotifications.filter((n) => !n.isRead).length;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
}

/**
 * Bildirim okundu olarak işaretle
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(notifications.id, notificationId));

    revalidatePath("/notifications");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Failed to mark as read" };
  }
}

/**
 * Tüm bildirimleri okundu olarak işaretle
 */
export async function markAllAsRead(): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(notifications.userId, user.id));

    revalidatePath("/notifications");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error marking all as read:", error);
    return { success: false, error: "Failed to mark all as read" };
  }
}

/**
 * Kullanıcı bildirim tercihlerini getir
 */
export async function getNotificationPreferences() {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    let prefs = await db.query.notificationPreferences.findFirst({
      where: eq(notificationPreferences.userId, user.id),
    });

    // Tercih yoksa default oluştur
    if (!prefs) {
      const [newPrefs] = await db
        .insert(notificationPreferences)
        .values({
          userId: user.id,
        })
        .returning();
      prefs = newPrefs;
    }

    return prefs;
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    throw error;
  }
}

/**
 * Bildirim tercihlerini güncelle
 */
export async function updateNotificationPreferences(data: {
  emailEnabled?: boolean;
  inAppEnabled?: boolean;
  findingNotifications?: boolean;
  actionNotifications?: boolean;
  dofNotifications?: boolean;
  planNotifications?: boolean;
  auditNotifications?: boolean;
}): Promise<ActionResponse> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(notificationPreferences)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(notificationPreferences.userId, user.id));

    revalidatePath("/settings/notifications");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return { success: false, error: "Failed to update preferences" };
  }
}
