/**
 * FILE UPLOAD API ROUTE
 * Handles file uploads to MinIO
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLatestUser } from '@/lib/auth/server';
import { uploadFile, validateFile } from '@/lib/storage/upload-helpers';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getLatestUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file, {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
      ],
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to MinIO
    const result = await uploadFile(
      buffer,
      file.name,
      file.type,
      {
        userId: user.id,
        originalName: file.name,
      }
    );

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
