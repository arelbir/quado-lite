import { NextResponse } from 'next/server';
import { db } from "@/drizzle/db";
import { roles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@/lib/auth";

export async function GET() {
  try {
    console.log("🔍 [API Roles] Fetching all roles");
    
    // Simple auth check - no permission system needed for dropdown
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Fetch active roles directly
    const rolesList = await db.query.roles.findMany({
      where: eq(roles.isActive, true),
      orderBy: (roles, { asc }) => [asc(roles.name)],
      columns: {
        id: true,
        name: true,
        code: true,
        description: true,
        category: true,
        isSystem: true,
      },
    });
    
    console.log("✅ [API Roles] Found:", rolesList.length, "roles");
    return NextResponse.json(rolesList);
  } catch (error: any) {
    console.error("❌ [API Roles] Error:", error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
