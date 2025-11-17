import { NextRequest } from "next/server";
import { db } from "@/core/database/client";
import { notifications } from "@/core/database/schema";
import { eq } from "drizzle-orm";
import { sendSuccess, sendNotFound, sendInternalError } from "@/lib/api/response-helpers";
import { log } from "@/lib/monitoring/logger";

/**
 * PATCH /api/notifications/[id]/read
 * Mark a notification as read
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const [updatedNotification] = await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(notifications.id, id))
      .returning();

    if (!updatedNotification) {
      return sendNotFound("Notification");
    }

    return sendSuccess(updatedNotification);
  } catch (error) {
    log.error("Error marking notification as read", error as Error);
    return sendInternalError(error);
  }
}
