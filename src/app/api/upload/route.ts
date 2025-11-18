/**
 * FILE UPLOAD API ROUTE
 * Handles file uploads to MinIO
 */

import { NextRequest } from 'next/server';
import { getLatestUser } from '@/lib/auth/server';
import { validateFile, uploadFile } from '@/lib/storage/upload-helpers';
import { sendSuccess, sendUnauthorized, sendValidationError, sendInternalError } from '@/lib/api/response-helpers';
import { log } from '@/lib/monitoring/logger';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getLatestUser();
    if (!user) {
      return sendUnauthorized();
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return sendValidationError({ file: 'No file provided' });
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
      return sendValidationError({ file: validation.error });
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

    log.info('File uploaded successfully', { key: result.key, userId: user.id });
    return sendSuccess({
      url: result.url,
      key: result.key,
    });
  } catch (error) {
    log.error('Upload error', error as Error);
    return sendInternalError(error);
  }
}
