import { Client } from 'minio'
import { handleError } from '@/lib/monitoring/error-handler'

// MinIO client (S3-compatible)
export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
})

// Default bucket name
const BUCKET_NAME = process.env.MINIO_BUCKET || 'quado-uploads'

// Initialize bucket
export async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME)
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1')
      
      // Set bucket policy to public read
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
      }
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy))
    }
  } catch (error) {
    handleError(error as Error, {
      context: 'minio-bucket-init',
      bucket: BUCKET_NAME,
    });
  }
}

// File upload
export async function uploadFile(
  file: File | Buffer,
  filename: string,
  metadata?: Record<string, string>
) {
  try {
    const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file
    
    await minioClient.putObject(
      BUCKET_NAME,
      filename,
      buffer,
      buffer.length,
      metadata
    )

    // Get public URL
    const url = `${process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'}/${BUCKET_NAME}/${filename}`
    
    return { success: true, url }
  } catch (error) {
    handleError(error as Error, {
      context: 'minio-file-upload',
      filename,
    });
    return { success: false, error }
  }
}

// Get presigned URL (for temporary access)
export async function getPresignedUrl(filename: string, expiry = 3600) {
  try {
    const url = await minioClient.presignedGetObject(BUCKET_NAME, filename, expiry)
    return { success: true, url }
  } catch (error) {
    handleError(error as Error, {
      context: 'minio-presigned-url',
      filename,
    });
    return { success: false, error }
  }
}

// Delete file
export async function deleteFile(filename: string) {
  try {
    await minioClient.removeObject(BUCKET_NAME, filename)
    return { success: true }
  } catch (error) {
    handleError(error as Error, {
      context: 'minio-file-delete',
      filename,
    });
    return { success: false, error }
  }
}

// List files
export async function listFiles(prefix?: string) {
  try {
    const stream = minioClient.listObjects(BUCKET_NAME, prefix, true)
    const files: any[] = []
    
    for await (const obj of stream) {
      files.push(obj)
    }
    
    return { success: true, files }
  } catch (error) {
    handleError(error as Error, {
      context: 'minio-list-files',
      prefix,
    });
    return { success: false, error }
  }
}
