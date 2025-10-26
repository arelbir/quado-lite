import { NextResponse } from 'next/server';
import { db } from "@/drizzle/db";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    console.log("🔍 [API Branches] Fetching ID:", id);
    
    const branch = await db.query.branches.findFirst({
      where: (branches, { eq }) => eq(branches.id, id),
      with: { company: true } as any,
    });
    
    if (!branch) {
      console.log("❌ [API Branches] Not found:", id);
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }
    
    console.log("✅ [API Branches] Found:", branch.name);
    return NextResponse.json(branch);
  } catch (error) {
    console.error("❌ [API Branches] Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
