import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/core/database/client";
import { notifications } from "@/core/database/schema";
import { eq, and } from "drizzle-orm";

const markAllReadSchema = z.object({
  userId: z.string().uuid(),
});

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all notifications as read for a user
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = markAllReadSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { userId } = validation.data;

    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark all notifications as read" },
      { status: 500 }
    );
  }
}
