import { NextRequest, NextResponse } from "next/server";
import { db } from "@/core/database/client";
import { notifications } from "@/core/database/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

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
    const body = await request.json() as {
      userId: string;
      category: string;
      title: string;
      message: string;
      relatedEntityType?: string;
      relatedEntityId?: string;
    };
    const { userId, category, title, message, relatedEntityType, relatedEntityId } = body;

    if (!userId || !category || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [notification] = await db
      .insert(notifications)
      .values({
        userId: userId,
        category: category as any,
        title,
        message,
        relatedEntityType: relatedEntityType as any,
        relatedEntityId,
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
