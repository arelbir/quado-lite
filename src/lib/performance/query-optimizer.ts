/**
 * QUERY OPTIMIZER
 * Performance utilities for database queries
 */

/**
 * Pagination helper
 */
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function getPaginationParams(options?: PaginationOptions) {
  const page = Math.max(1, options?.page || 1);
  const pageSize = Math.min(100, Math.max(1, options?.pageSize || 20));
  const offset = (page - 1) * pageSize;
  
  return {
    page,
    pageSize,
    offset,
    limit: pageSize,
  };
}

export function createPaginationResult<T>(
  data: T[],
  total: number,
  options: ReturnType<typeof getPaginationParams>
): PaginationResult<T> {
  const totalPages = Math.ceil(total / options.pageSize);
  
  return {
    data,
    pagination: {
      page: options.page,
      pageSize: options.pageSize,
      total,
      totalPages,
      hasNext: options.page < totalPages,
      hasPrev: options.page > 1,
    },
  };
}

/**
 * Batch operations helper
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Debounce helper for search/filter operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle helper for expensive operations
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  /**
   * Time an operation
   */
  async time<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      return await operation();
    } finally {
      const duration = performance.now() - start;
      this.record(name, duration);
    }
  }

  /**
   * Record metric
   */
  private record(name: string, duration: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const metrics = this.metrics.get(name)!;
    metrics.push(duration);
    
    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  /**
   * Get stats
   */
  getStats(name: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    p95: number;
  } | null {
    const metrics = this.metrics.get(name);
    
    if (!metrics || metrics.length === 0) {
      return null;
    }
    
    const sorted = [...metrics].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const p95Index = Math.floor(sorted.length * 0.95);
    
    return {
      count: sorted.length,
      avg: sum / sorted.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p95: sorted[p95Index],
    };
  }

  /**
   * Get all stats
   */
  getAllStats(): Record<string, ReturnType<typeof this.getStats>> {
    const result: Record<string, ReturnType<typeof this.getStats>> = {};
    
    for (const [name] of this.metrics) {
      result[name] = this.getStats(name);
    }
    
    return result;
  }
}

// Export singleton
export const perfMonitor = new PerformanceMonitor();
