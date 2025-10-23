/**
 * Error Handling Helpers
 * DRY: Consistent error handling across all action files
 */

import type { ActionResponse } from "@/lib/types";

/**
 * HELPER: Create standardized error response
 * 
 * @example
 * ```typescript
 * } catch (error) {
 *   return createActionError("create user", error);
 * }
 * ```
 */
export function createActionError<T = void>(context: string, error: unknown): ActionResponse<T> {
  console.error(`Error ${context}:`, error);
  return {
    success: false,
    error: `Failed to ${context}`,
  };
}

/**
 * HELPER: Create validation error response
 */
export function createValidationError<T = void>(message: string): ActionResponse<T> {
  return {
    success: false,
    error: message,
  };
}

/**
 * HELPER: Create not found error response
 */
export function createNotFoundError<T = void>(entity: string): ActionResponse<T> {
  return {
    success: false,
    error: `${entity} not found`,
  };
}

/**
 * HELPER: Create permission denied error response
 */
export function createPermissionError<T = void>(message?: string): ActionResponse<T> {
  return {
    success: false,
    error: message || "Permission denied",
  };
}
