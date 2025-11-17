/**
 * UPLOAD HELPERS
 * Helper functions for file uploads using MinIO
 */

import { nanoid } from 'nanoid';
import { minioClient, BUCKET_NAME, ensureBucketExists, getPublicUrl } from './minio-client';

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

/**
 * Validate file type and size
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSize = 10 * 1024 * 1024, allowedTypes } = options; // Default 10MB
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
    };
  }
  
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }
  
  return { valid: true };
}

/**
 * Extract filename from URL or path
 */
export function extractFilename(url?: string | null): string | null {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const parts = pathname.split('/');
    return parts[parts.length - 1] || null;
  } catch {
    // If not a valid URL, try to extract from path
    const parts = url.split('/');
    return parts[parts.length - 1] || null;
  }
}
