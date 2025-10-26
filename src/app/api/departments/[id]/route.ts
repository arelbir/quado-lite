import { NextResponse } from 'next/server';
import { db } from "@/drizzle/db";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    console.log("🔍 [API Departments] Fetching ID:", id);
    
    // Fetch department without relations first (relations not defined in schema)
    const department = await db.query.departments.findFirst({
      where: (departments, { eq }) => eq(departments.id, id),
    });
    
    if (!department) {
      console.log("❌ [API Departments] Not found:", id);
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }
    
    // Manually fetch relations if needed
    let branch = null;
    let manager = null;
    
    if (department.branchId) {
      branch = await db.query.branches.findFirst({
        where: (branches, { eq }) => eq(branches.id, department.branchId!),
        columns: { id: true, name: true, code: true },
      });
    }
    
    if (department.managerId) {
      manager = await db.query.user.findFirst({
        where: (users, { eq }) => eq(users.id, department.managerId!),
        columns: { id: true, name: true, email: true },
      });
    }
    
    console.log("✅ [API Departments] Found:", department.name);
    return NextResponse.json({
      ...department,
      branch,
      manager,
    });
  } catch (error) {
    console.error("❌ [API Departments] Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
