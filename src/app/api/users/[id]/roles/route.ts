import { NextResponse } from 'next/server';
import { getUserRoles } from "@/features/users/actions/user-actions";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    console.log("🔍 [API User Roles] Fetching roles for user:", id);
    
    const result = await getUserRoles(id);
    
    if (!result.success) {
      console.log("❌ [API User Roles] Failed:", result.message);
      return NextResponse.json(
        { error: result.message || 'Failed to fetch user roles' },
        { status: 500 }
      );
    }
    
    console.log("✅ [API User Roles] Found:", result.data?.length || 0, "roles");
    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error("❌ [API User Roles] Error:", error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
