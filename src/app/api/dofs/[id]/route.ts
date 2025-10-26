import { NextResponse } from 'next/server';
import { db } from "@/drizzle/db";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    console.log("🔍 [API DOFs] Fetching ID:", id);
    
    const dof = await db.query.dofs.findFirst({
      where: (dofs, { eq }) => eq(dofs.id, id),
      with: { finding: true, createdBy: true } as any,
    });
    
    if (!dof) {
      console.log("❌ [API DOFs] Not found:", id);
      return NextResponse.json({ error: 'DOF not found' }, { status: 404 });
    }
    
    console.log("✅ [API DOFs] Found:", dof.id);
    return NextResponse.json(dof);
  } catch (error) {
    console.error("❌ [API DOFs] Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
