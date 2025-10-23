import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { auditQuestions } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@/lib/auth";

/**
 * DELETE /api/audits/[id]/questions/[questionId]
 * Denetimden soru kaldır
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; questionId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Soruyu sil
    await db
      .delete(auditQuestions)
      .where(eq(auditQuestions.id, params.questionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing question:", error);
    return NextResponse.json(
      { error: "Failed to remove question" },
      { status: 500 }
    );
  }
}
