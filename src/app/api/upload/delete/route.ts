/**
 * FILE DELETE API ROUTE
 * Handles file deletion from MinIO
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getLatestUser } from '@/lib/auth/server';
import { deleteFile } from '@/lib/storage/upload-helpers';
import { sendSuccess, sendUnauthorized, sendValidationError, sendInternalError } from '@/lib/api/response-helpers';
import { log } from '@/lib/monitoring/logger';

const deleteFileSchema = z.object({
  key: z.string().min(1, 'File key is required'),
});

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const user = await getLatestUser();
    if (!user) {
      return sendUnauthorized();
    }

    // Get key from body with validation
    const body = await request.json();
    const validation = deleteFileSchema.safeParse(body);
    
    if (!validation.success) {
      return sendValidationError(validation.error.errors);
    }

    const { key } = validation.data;

    // Delete from MinIO
    await deleteFile(key);

    log.info('File deleted successfully', { key, userId: user.id });
    return sendSuccess({ deleted: true, key });
  } catch (error) {
    log.error('Delete error', error as Error);
    return sendInternalError(error);
  }
}

export async function POST(request: NextRequest) {
  return DELETE(request);
}
