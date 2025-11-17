import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/core/database/client";
import { notifications } from "@/core/database/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  category: z.string().min(1),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.string().optional(),
  actionUrl: z.string().url().optional(),
  sendEmail: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * GET /api/notifications
 * Fetch notifications for a user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch notifications (not deleted, ordered by created date)
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          isNull(notifications.deletedAt)
        )
      )
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    // Count unread
    const unreadCount = userNotifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      notifications: userNotifications,
      unreadCount,
      total: userNotifications.length,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a new notification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createNotificationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    const [notification] = await db
      .insert(notifications)
      .values({
        userId: data.userId,
        category: data.category,
        title: data.title,
        message: data.message,
        priority: data.priority || "medium",
        relatedEntityType: data.relatedEntityType,
        relatedEntityId: data.relatedEntityId,
        actionUrl: data.actionUrl,
        metadata: data.metadata || {},
        isRead: false,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
