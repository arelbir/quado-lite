/**
 * Performance Monitoring Utilities
 * 
 * Tracks and reports performance metrics for the application
 */

/**
 * Web Vitals Tracking
 * These metrics are crucial for user experience
 */
export interface WebVitals {
  // Largest Contentful Paint - measures loading performance
  LCP: number
  // First Input Delay - measures interactivity
  FID: number
  // Cumulative Layout Shift - measures visual stability
  CLS: number
  // First Contentful Paint
  FCP: number
  // Time to First Byte
  TTFB: number
}

/**
 * Report Web Vitals to analytics service
 */
export function reportWebVitals(metric: any) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
    })
  }

  // Send to analytics service
  // Example: Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    })
  }

  // Example: Send to custom analytics endpoint
  // fetch('/api/analytics', {
  //   method: 'POST',
  //   body: JSON.stringify(metric),
  // })
}

/**
 * Performance Mark - Create a custom performance mark
 */
export function mark(name: string) {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(name)
  }
}

/**
 * Performance Measure - Measure between two marks
 */
export function measure(name: string, startMark: string, endMark: string) {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      performance.measure(name, startMark, endMark)
      const measure = performance.getEntriesByName(name)[0]
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance: ${name} took ${measure?.duration}ms`)
      }
      
      return measure?.duration
    } catch (error) {
      console.error('Performance measure error:', error)
    }
  }
}

/**
 * Track API Call Duration
 */
export function trackAPICall(endpoint: string, duration: number, success: boolean) {
  if (process.env.NODE_ENV === 'development') {
    console.log('API Call:', {
      endpoint,
      duration: `${duration}ms`,
      success,
    })
  }

  // Send to monitoring service
  // Example: Sentry performance monitoring
  // Sentry.addBreadcrumb({
  //   category: 'api',
  //   message: endpoint,
  //   data: { duration, success },
  // })
}

/**
 * Resource Timing - Get resource loading times
 */
export function getResourceTiming() {
  if (typeof window !== 'undefined' && window.performance) {
    const resources = performance.getEntriesByType('resource')
    return resources.map((resource: any) => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize,
      type: resource.initiatorType,
    }))
  }
  return []
}

/**
 * Memory Usage (if available)
 */
export function getMemoryUsage() {
  if (typeof window !== 'undefined' && (performance as any).memory) {
    const memory = (performance as any).memory
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    }
  }
  return null
}

/**
 * Get Page Load Time
 */
export function getPageLoadTime() {
  if (typeof window !== 'undefined' && window.performance) {
    const navigation = performance.getEntriesByType('navigation')[0] as any
    return {
      dns: navigation?.domainLookupEnd - navigation?.domainLookupStart,
      tcp: navigation?.connectEnd - navigation?.connectStart,
      request: navigation?.responseStart - navigation?.requestStart,
      response: navigation?.responseEnd - navigation?.responseStart,
      dom: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
      load: navigation?.loadEventEnd - navigation?.loadEventStart,
      total: navigation?.loadEventEnd - navigation?.fetchStart,
    }
  }
  return null
}
