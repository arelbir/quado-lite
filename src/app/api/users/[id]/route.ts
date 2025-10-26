import { NextResponse } from 'next/server';
import { getUserById } from "@/server/actions/user-actions";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    console.log("🔍 [API Users] Fetching ID:", id);
    
    const result = await getUserById(id);

    if (!result.success || !result.data) {
      console.log("❌ [API Users] Not found:", id);
      return NextResponse.json(
        { error: result.message || 'User not found' },
        { status: 404 }
      );
    }

    console.log("✅ [API Users] Found:", result.data.name);
    
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("❌ [API Users] Error:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
