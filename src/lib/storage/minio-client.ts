/**
 * MINIO CLIENT
 * S3-compatible object storage client
 * 
 * Environment Variables Required:
 * - MINIO_ENDPOINT
 * - MINIO_PORT
 * - MINIO_ACCESS_KEY
 * - MINIO_SECRET_KEY
 * - MINIO_BUCKET_NAME
 * - MINIO_USE_SSL
 */

import { Client } from 'minio';
import { log } from '@/lib/monitoring/logger';

// Initialize MinIO client
export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
});

export const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'quado-uploads';

/**
 * Initialize bucket if it doesn't exist
 */
export async function ensureBucketExists() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      
      // Set public read policy for uploaded files
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
          },
        ],
      };
      
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
      log.info('MinIO bucket created and configured', { bucket: BUCKET_NAME });
    }
  } catch (error) {
    log.error('MinIO bucket initialization error', error as Error);
    throw error;
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(filename: string): string {
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
  const port = process.env.MINIO_PORT || '9000';
  
  return `${protocol}://${endpoint}:${port}/${BUCKET_NAME}/${filename}`;
}
