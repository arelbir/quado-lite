import { NextResponse } from 'next/server';
import { db } from "@/core/database/client";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    console.log("🔍 [API Positions] Fetching ID:", id);
    
    // TEMPORARY FIX: Remove relations until schema is fixed
    const position = await db.query.positions.findFirst({
      where: (positions, { eq }) => eq(positions.id, id),
    });
    
    if (!position) {
      console.log("❌ [API Positions] Not found:", id);
      return NextResponse.json({ error: 'Position not found' }, { status: 404 });
    }
    
    console.log("✅ [API Positions] Found:", position.name);
    return NextResponse.json(position);
  } catch (error) {
    console.error("❌ [API Positions] Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
