/**
 * API RESPONSE HELPERS
 * NextJS-specific helpers for API responses
 */

import { NextResponse } from 'next/server';
import type {
  ApiResponse,
  PaginatedApiResponse,
} from '@/types/framework/api-response';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  internalErrorResponse,
} from '@/types/framework/api-response';

/**
 * Send success response
 */
export function sendSuccess<T>(
  data: T,
  meta?: ApiResponse<T>['meta'],
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(successResponse(data, meta), { status });
}

/**
 * Send created response (201)
 */
export function sendCreated<T>(data: T): NextResponse<ApiResponse<T>> {
  return sendSuccess(data, undefined, 201);
}

/**
 * Send error response
 */
export function sendError(
  message: string,
  code?: string,
  details?: any,
  status: number = 500
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(errorResponse(message, code, details), { status });
}

/**
 * Send not found response (404)
 */
export function sendNotFound(resource: string): NextResponse<ApiResponse<never>> {
  return NextResponse.json(notFoundResponse(resource), { status: 404 });
}

/**
 * Send unauthorized response (401)
 */
export function sendUnauthorized(message?: string): NextResponse<ApiResponse<never>> {
  return NextResponse.json(unauthorizedResponse(message), { status: 401 });
}

/**
 * Send forbidden response (403)
 */
export function sendForbidden(message?: string): NextResponse<ApiResponse<never>> {
  return NextResponse.json(forbiddenResponse(message), { status: 403 });
}

/**
 * Send validation error response (400)
 */
export function sendValidationError(details: any): NextResponse<ApiResponse<never>> {
  return NextResponse.json(validationErrorResponse(details), { status: 400 });
}

/**
 * Send internal error response (500)
 */
export function sendInternalError(error?: any): NextResponse<ApiResponse<never>> {
  return NextResponse.json(internalErrorResponse(error), { status: 500 });
}

/**
 * Send paginated response
 */
export function sendPaginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): NextResponse<PaginatedApiResponse<T>> {
  return NextResponse.json(paginatedResponse(data, total, page, limit));
}

/**
 * Try-catch wrapper for API routes
 * Automatically handles errors and sends appropriate responses
 */
export async function handleApiRoute<T>(
  handler: () => Promise<T | NextResponse>,
  errorMessage: string = 'Operation failed'
): Promise<NextResponse> {
  try {
    const result = await handler();
    
    // If handler returns NextResponse, return it directly
    if (result instanceof NextResponse) {
      return result;
    }
    
    // Otherwise, wrap in success response
    return sendSuccess(result);
  } catch (error) {
    // Log error
    console.error(errorMessage, error);
    
    // Send appropriate error response
    if (error instanceof Error) {
      return sendInternalError(error);
    }
    
    return sendError(errorMessage);
  }
}
