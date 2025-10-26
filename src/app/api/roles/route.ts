import { NextResponse } from 'next/server';
import { getAllRoles } from "@/server/actions/role-actions";

export async function GET() {
  try {
    console.log("🔍 [API Roles] Fetching all roles");
    
    const result = await getAllRoles();
    
    if (!result.success) {
      console.log("❌ [API Roles] Failed:", result.message);
      return NextResponse.json(
        { error: result.message || 'Failed to fetch roles' },
        { status: 500 }
      );
    }
    
    console.log("✅ [API Roles] Found:", result.data?.length || 0, "roles");
    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error("❌ [API Roles] Error:", error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
