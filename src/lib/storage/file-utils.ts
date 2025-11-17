/**
 * FILE UTILITIES
 * Pure utility functions for file operations (client + server safe)
 * These functions don't depend on MinIO or any server-side modules
 */

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
 * Safe to use in client and server components
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

/**
 * Format file size to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

/**
 * Check if file is an image
 */
export function isImageFile(filename: string): boolean {
  const ext = getFileExtension(filename).toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
}
