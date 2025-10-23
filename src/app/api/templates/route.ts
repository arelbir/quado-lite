import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { auditTemplates } from "@/drizzle/schema";
import { isNull } from "drizzle-orm";
import { currentUser } from "@/lib/auth";

/**
 * GET /api/templates
 * Aktif şablonları listele
 * Pattern: API Route for client-side data fetching
 */
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await db.query.auditTemplates.findMany({
      where: isNull(auditTemplates.deletedAt),
      columns: {
        id: true,
        name: true,
        category: true,
      },
      orderBy: (auditTemplates, { asc }) => [asc(auditTemplates.name)],
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
