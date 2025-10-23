"use server";

import { db } from "@/drizzle/db";
import { notifications, notificationPreferences } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import type { ActionResponse, User } from "@/lib/types";
import { withAuth, revalidateCommonPaths } from "@/lib/helpers";

/**
 * Kullanıcının bildirimlerini getir
 */
export async function getUserNotifications(limit = 50) {
  const result = await withAuth(async (user: User) => {
    const data = await db.query.notifications.findMany({
      where: eq(notifications.userId, user.id),
      orderBy: [desc(notifications.createdAt)],
      limit,
    });

    return { success: true, data };
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}

/**
 * Okunmamış bildirim sayısını getir
 */
export async function getUnreadCount(): Promise<number> {
  const result = await withAuth(async (user: User) => {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.id));

    return {
      success: true,
      data: userNotifications.filter((n) => !n.isRead).length,
    };
  });

  if (!result.success) {
    return 0;
  }

  return result.data;
}

/**
 * Bildirim okundu olarak işaretle
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<ActionResponse> {
  return withAuth(async () => {
    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(notifications.id, notificationId));

    revalidateCommonPaths();
    return { success: true, data: undefined };
  });
}

/**
 * Tüm bildirimleri okundu olarak işaretle
 */
export async function markAllAsRead(): Promise<ActionResponse> {
  return withAuth(async (user: User) => {
    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(notifications.userId, user.id));

    revalidateCommonPaths();
    return { success: true, data: undefined };
  });
}

/**
 * Kullanıcı bildirim tercihlerini getir
 */
export async function getNotificationPreferences() {
  const result = await withAuth(async (user: User) => {
    let prefs = await db.query.notificationPreferences.findFirst({
      where: eq(notificationPreferences.userId, user.id),
    });

    if (!prefs) {
      const [newPrefs] = await db
        .insert(notificationPreferences)
        .values({
          userId: user.id,
        })
        .returning();
      prefs = newPrefs;
    }

    return { success: true, data: prefs };
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
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
  return withAuth(async (user: User) => {
    await db
      .update(notificationPreferences)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(notificationPreferences.userId, user.id));

    revalidateCommonPaths();
    return { success: true, data: undefined };
  });
}
