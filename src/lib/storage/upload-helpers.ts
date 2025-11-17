/**
 * UPLOAD HELPERS
 * Server-side helper functions for file uploads using MinIO
 * Note: This file imports MinIO client and should only be used server-side
 */

import { nanoid } from 'nanoid';
import { minioClient, BUCKET_NAME, ensureBucketExists, getPublicUrl } from './minio-client';

// Re-export client-safe utilities
export { extractFilename, validateFile, formatFileSize, getFileExtension, isImageFile } from './file-utils';

/**
 * Upload a file to MinIO
 */
export async function uploadFile(
  file: Buffer,
  filename: string,
  contentType: string,
  metadata?: Record<string, string>
): Promise<{ url: string; key: string }> {
  await ensureBucketExists();
  
  // Generate unique filename
  const ext = filename.split('.').pop() || 'bin';
  const key = `${nanoid()}.${ext}`;
  
  // Upload to MinIO
  await minioClient.putObject(BUCKET_NAME, key, file, file.length, {
    'Content-Type': contentType,
    ...metadata,
  });
  
  return {
    url: getPublicUrl(key),
    key,
  };
}

/**
 * Delete a file from MinIO
 */
export async function deleteFile(key: string): Promise<void> {
  try {
    await minioClient.removeObject(BUCKET_NAME, key);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Delete multiple files from MinIO
 */
export async function deleteFiles(keys: string[]): Promise<void> {
  try {
    await minioClient.removeObjects(BUCKET_NAME, keys);
  } catch (error) {
    console.error('Error deleting files:', error);
    throw error;
  }
}

/**
 * Get presigned URL for temporary access
 */
export async function getPresignedUrl(
  key: string,
  expirySeconds: number = 3600
): Promise<string> {
  return await minioClient.presignedGetObject(BUCKET_NAME, key, expirySeconds);
}
