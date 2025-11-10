import { NextResponse } from 'next/server';
import { db } from '@/drizzle/db';
import { auditQuestions, questionBanks } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const auditId = searchParams.get('auditId');

    if (!auditId) {
      return NextResponse.json({ error: 'Audit ID is required' }, { status: 400 });
    }

    // Fetch questions for the audit with question bank details
    const questions = await db.query.auditQuestions.findMany({
      where: eq(auditQuestions.auditId, auditId),
      with: {
        question: {
          columns: {
            id: true,
            question: true,
            category: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(questions);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
