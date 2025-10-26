import { NextResponse } from 'next/server';
import { db } from "@/drizzle/db";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    console.log("🔍 [API Actions] Fetching ID:", id);
    
    const action = await db.query.actions.findFirst({
      where: (actions, { eq }) => eq(actions.id, id),
      with: { finding: true, assignedTo: true } as any,
    });
    
    if (!action) {
      console.log("❌ [API Actions] Not found:", id);
      return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    }
    
    console.log("✅ [API Actions] Found:", action.id);
    return NextResponse.json(action);
  } catch (error) {
    console.error("❌ [API Actions] Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
