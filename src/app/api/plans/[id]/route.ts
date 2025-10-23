import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { auditPlans } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@/lib/auth";

/**
 * PATCH /api/plans/[id]
 * Planı güncelle (sadece Pending durumda)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "admin" && user.role !== "superAdmin") {
      return NextResponse.json({ error: "Only admins can edit plans" }, { status: 403 });
    }

    const body = await req.json() as {
      title?: string;
      description?: string | null;
      scheduledDate?: Date | null;
      auditorId?: string | null;
      recurrenceType?: string;
      recurrenceInterval?: number;
      maxOccurrences?: number;
    };

    // Sadece Pending durumunda düzenlenebilir
    const plan = await db.query.auditPlans.findFirst({
      where: eq(auditPlans.id, params.id),
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    if (plan.status !== "Pending") {
      return NextResponse.json(
        { error: "Only pending plans can be edited" },
        { status: 400 }
      );
    }

    // Bir sonraki oluşturulma tarihini hesapla
    const calculateNextScheduledDate = (date: Date, type?: string, interval: number = 1): Date | null => {
      if (!type || type === "None") return null;
      
      const nextDate = new Date(date);
      switch (type) {
        case "Daily":
          nextDate.setDate(nextDate.getDate() + interval);
          break;
        case "Weekly":
          nextDate.setDate(nextDate.getDate() + (7 * interval));
          break;
        case "Monthly":
          nextDate.setMonth(nextDate.getMonth() + interval);
          break;
        case "Quarterly":
          nextDate.setMonth(nextDate.getMonth() + (3 * interval));
          break;
        case "Yearly":
          nextDate.setFullYear(nextDate.getFullYear() + interval);
          break;
      }
      return nextDate;
    };

    // Tarihi dönüştür
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.auditorId !== undefined) updateData.auditorId = body.auditorId;
    if (body.recurrenceType !== undefined) updateData.recurrenceType = body.recurrenceType;
    if (body.recurrenceInterval !== undefined) updateData.recurrenceInterval = body.recurrenceInterval;
    if (body.maxOccurrences !== undefined) updateData.maxOccurrences = body.maxOccurrences;
    
    // scheduledDate string ise Date'e çevir
    if (body.scheduledDate !== undefined) {
      updateData.scheduledDate = body.scheduledDate ? new Date(body.scheduledDate) : null;
      
      // nextScheduledDate'i yeniden hesapla
      if (updateData.scheduledDate) {
        updateData.nextScheduledDate = calculateNextScheduledDate(
          updateData.scheduledDate,
          body.recurrenceType || plan.recurrenceType || undefined,
          body.recurrenceInterval || plan.recurrenceInterval || undefined
        );
      }
    }

    await db
      .update(auditPlans)
      .set(updateData)
      .where(eq(auditPlans.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }
}
