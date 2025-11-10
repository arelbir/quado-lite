import { NextResponse } from 'next/server';
import { createFinding } from '@/server/actions/finding-actions';
import { db } from '@/drizzle/db';
import { findings } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const CreateFindingSchema = z.object({
  auditId: z.string().min(1),
  details: z.string().min(1),
  riskType: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  assignedToId: z.string().optional(),
  questionId: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const auditId = searchParams.get('auditId');

    if (!auditId) {
      return NextResponse.json({ error: 'Audit ID is required' }, { status: 400 });
    }

    // Implement getFindingsByAudit function
    const auditFindings = await db.query.findings.findMany({
      where: eq(findings.auditId, auditId),
      orderBy: (findings, { desc }) => [desc(findings.createdAt)],
    });

    return NextResponse.json(auditFindings);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = CreateFindingSchema.parse(body);

    const result = await createFinding(validatedData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.data }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
