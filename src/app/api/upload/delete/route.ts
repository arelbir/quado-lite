/**
 * FILE DELETE API ROUTE
 * Handles file deletion from MinIO
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getLatestUser } from '@/lib/auth/server';
import { deleteFile } from '@/lib/storage/upload-helpers';

const deleteFileSchema = z.object({
  key: z.string().min(1, 'File key is required'),
});

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const user = await getLatestUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get key from body with validation
    const body = await request.json();
    const validation = deleteFileSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { key } = validation.data;

    // Delete from MinIO
    await deleteFile(key);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return DELETE(request);
}
