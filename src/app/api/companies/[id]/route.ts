import { NextResponse } from 'next/server';
import { db } from "@/core/database/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    console.log("🔍 [API Companies] Fetching ID:", id);
    
    const company = await db.query.companies.findFirst({
      where: (companies, { eq }) => eq(companies.id, id),
      with: {
        branches: {
          columns: {
            id: true,
            name: true,
            code: true,
            city: true,
            isActive: true,
          },
        },
      },
    });

    if (!company) {
      console.log("❌ [API Companies] Not found:", id);
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }
    
    console.log("✅ [API Companies] Found:", company.name);
    return NextResponse.json(company);
  } catch (error) {
    console.error("❌ [API Companies] Error:", error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
