/**
 * FILE DELETE API ROUTE
 * Handles file deletion from MinIO
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLatestUser } from '@/lib/auth/server';
import { deleteFile } from '@/lib/storage/upload-helpers';

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

    // Get key from body
    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json(
        { error: 'No file key provided' },
        { status: 400 }
      );
    }

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
