import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { audits } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@/lib/auth";

/**
 * PATCH /api/audits/[id]
 * Denetim bilgilerini güncelle
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

    const body = await req.json() as {
      title?: string;
      description?: string | null;
      auditDate?: Date | null;
      auditorId?: string | null;
    };

    // Sadece Active durumunda düzenlenebilir
    const audit = await db.query.audits.findFirst({
      where: eq(audits.id, params.id),
    });

    if (!audit) {
      return NextResponse.json({ error: "Audit not found" }, { status: 404 });
    }

    if (audit.status !== "Active") {
      return NextResponse.json(
        { error: "Only active audits can be edited" },
        { status: 400 }
      );
    }

    // Tarihi dönüştür
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.auditorId !== undefined) updateData.auditorId = body.auditorId;
    
    // auditDate string ise Date'e çevir
    if (body.auditDate !== undefined) {
      updateData.auditDate = body.auditDate ? new Date(body.auditDate) : null;
    }

    await db
      .update(audits)
      .set(updateData)
      .where(eq(audits.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating audit:", error);
    return NextResponse.json(
      { error: "Failed to update audit" },
      { status: 500 }
    );
  }
}
