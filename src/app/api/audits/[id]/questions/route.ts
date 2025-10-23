import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { auditQuestions } from "@/drizzle/schema";
import { currentUser } from "@/lib/auth";

/**
 * POST /api/audits/[id]/questions
 * Denetim'e soru havuzundan soru ekle
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as { questionIds: string[] };
    const { questionIds } = body;

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json(
        { error: "Question IDs required" },
        { status: 400 }
      );
    }

    // Soruları audit'e ekle
    const values = questionIds.map((questionId) => ({
      auditId: params.id,
      questionId,
      answer: null,
      answerNotes: null,
      isNonCompliant: false,
    }));

    await db.insert(auditQuestions).values(values);

    return NextResponse.json({ 
      success: true,
      count: questionIds.length 
    });
  } catch (error) {
    console.error("Error adding questions:", error);
    return NextResponse.json(
      { error: "Failed to add questions" },
      { status: 500 }
    );
  }
}
