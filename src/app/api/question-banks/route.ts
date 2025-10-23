import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { questionBanks } from "@/drizzle/schema";
import { isNull } from "drizzle-orm";
import { currentUser } from "@/lib/auth";

/**
 * GET /api/question-banks
 * Aktif soru havuzlarını listele
 */
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const banks = await db.query.questionBanks.findMany({
      where: isNull(questionBanks.deletedAt),
      columns: {
        id: true,
        name: true,
        category: true,
      },
      orderBy: (questionBanks, { asc }) => [asc(questionBanks.name)],
    });

    return NextResponse.json(banks);
  } catch (error) {
    console.error("Error fetching question banks:", error);
    return NextResponse.json(
      { error: "Failed to fetch question banks" },
      { status: 500 }
    );
  }
}
