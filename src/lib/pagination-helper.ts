/**
 * PAGINATION HELPER
 * Server-side pagination utility functions
 * 
 * Usage:
 * const result = await paginate(queryFn, countFn, searchParams)
 * 
 * Created: 2025-01-24
 */

export interface PaginationParams {
  page?: string | number
  per_page?: string | number
}

export interface PaginationResult<T> {
  data: T[]
  pageCount: number
  totalCount: number
  currentPage: number
  perPage: number
}

/**
 * Parse and validate pagination parameters from URL
 */
export function parsePaginationParams(
  params: PaginationParams
): { page: number; perPage: number } {
  const page = Math.max(1, Number(params.page) || 1)
  const perPage = Math.min(100, Math.max(1, Number(params.per_page) || 10))
  return { page, perPage }
}

/**
 * Generic pagination function
 * 
 * @example
 * ```typescript
 * const result = await paginate(
 *   (limit, offset) => db.query.user.findMany({ limit, offset }),
 *   () => db.select({ value: count() }).from(user).then(r => r[0].value),
 *   searchParams
 * )
 * ```
 */
export async function paginate<T>(
  queryFn: (limit: number, offset: number) => Promise<T[]>,
  countFn: () => Promise<number>,
  params: PaginationParams
): Promise<PaginationResult<T>> {
  const { page, perPage } = parsePaginationParams(params)
  const offset = (page - 1) * perPage

  const [data, totalCount] = await Promise.all([
    queryFn(perPage, offset),
    countFn(),
  ])

  return {
    data,
    pageCount: Math.ceil(totalCount / perPage) || 1,
    totalCount,
    currentPage: page,
    perPage,
  }
}

/**
 * Calculate offset from page number
 */
export function getOffset(page: number, perPage: number): number {
  return (Math.max(1, page) - 1) * perPage
}

/**
 * Generate pagination info text
 * 
 * @example "Showing 11 to 20 of 100 items"
 */
export function getPaginationInfo(
  currentPage: number,
  perPage: number,
  totalCount: number
): string {
  const start = (currentPage - 1) * perPage + 1
  const end = Math.min(currentPage * perPage, totalCount)
  
  if (totalCount === 0) {
    return "No items found"
  }
  
  return `Showing ${start} to ${end} of ${totalCount} items`
}

/**
 * Check if pagination is needed
 */
export function shouldPaginate(totalCount: number, threshold = 100): boolean {
  return totalCount > threshold
}
