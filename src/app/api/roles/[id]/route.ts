import { NextResponse } from 'next/server';
import { getRoleById } from "@/features/roles/actions/role-actions";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    console.log("🔍 [API Roles] Fetching ID:", id);
    
    const result = await getRoleById(id);
    
    if (!result.success || !result.data) {
      console.log("❌ [API Roles] Not found:", id);
      return NextResponse.json({ error: result.error || 'Role not found' }, { status: 404 });
    }
    
    console.log("✅ [API Roles] Found:", result.data.name);
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("❌ [API Roles] Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
