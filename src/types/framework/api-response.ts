/**
 * UNIFIED API RESPONSE FORMAT
 * Standard response structure for all API endpoints
 * 
 * Benefits:
 * - Consistent response structure
 * - Type-safe responses
 * - Better error handling
 * - Easier frontend integration
 * - Improved debugging
 */

/**
 * Standard API Response
 * Used for all API endpoints
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

/**
 * API Error Structure
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  stack?: string; // Only in development
}

/**
 * API Metadata
 * Used for pagination, counts, etc.
 */
export interface ApiMeta {
  total?: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
  [key: string]: any;
}

/**
 * Paginated API Response
 */
export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta: Required<Pick<ApiMeta, 'total' | 'page' | 'limit' | 'hasMore'>> & ApiMeta;
}

/**
 * Success Response Helper
 */
export function successResponse<T>(data: T, meta?: ApiMeta): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}

/**
 * Error Response Helper
 */
export function errorResponse(
  message: string,
  code?: string,
  details?: any
): ApiResponse<never> {
  return {
    success: false,
    error: {
      message,
      code,
      details,
      ...(process.env.NODE_ENV === 'development' && details instanceof Error && {
        stack: details.stack,
      }),
    },
  };
}

/**
 * Paginated Response Helper
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      hasMore: page * limit < total,
    },
  };
}

/**
 * Not Found Response
 */
export function notFoundResponse(resource: string): ApiResponse<never> {
  return errorResponse(`${resource} not found`, 'NOT_FOUND');
}

/**
 * Unauthorized Response
 */
export function unauthorizedResponse(message = 'Unauthorized'): ApiResponse<never> {
  return errorResponse(message, 'UNAUTHORIZED');
}

/**
 * Forbidden Response
 */
export function forbiddenResponse(message = 'Permission denied'): ApiResponse<never> {
  return errorResponse(message, 'FORBIDDEN');
}

/**
 * Validation Error Response
 */
export function validationErrorResponse(details: any): ApiResponse<never> {
  return errorResponse('Validation failed', 'VALIDATION_ERROR', details);
}

/**
 * Internal Server Error Response
 */
export function internalErrorResponse(error?: any): ApiResponse<never> {
  return errorResponse(
    'Internal server error',
    'INTERNAL_ERROR',
    process.env.NODE_ENV === 'development' ? error : undefined
  );
}
