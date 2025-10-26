import { NextResponse } from 'next/server';
import { getFindingById } from "@/server/actions/finding-actions";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    console.log("🔍 [API Findings] Fetching ID:", id);
    
    const finding = await getFindingById(id);
    
    console.log("✅ [API Findings] Found:", finding.id);
    return NextResponse.json(finding);
  } catch (error: any) {
    console.error("❌ [API Findings] Error:", error);
    const status = error.message?.includes('not found') ? 404 : 
                   error.message?.includes('denied') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status });
  }
}
