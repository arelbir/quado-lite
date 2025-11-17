import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/core/database/client";
import { notifications } from "@/core/database/schema";
import { eq, and } from "drizzle-orm";
import { sendSuccess, sendValidationError, sendInternalError } from "@/lib/api/response-helpers";
import { log } from "@/lib/monitoring/logger";

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
      return sendValidationError(validation.error.errors);
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

    return sendSuccess({ marked: true });
  } catch (error) {
    log.error("Error marking all notifications as read", error as Error);
    return sendInternalError(error);
  }
}
