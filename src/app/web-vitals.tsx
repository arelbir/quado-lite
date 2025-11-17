'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { reportWebVitals } from '@/lib/monitoring/performance'

/**
 * Web Vitals Reporter Component
 * 
 * This component uses Next.js's built-in Web Vitals reporting
 * and forwards the metrics to our monitoring service.
 * 
 * Usage: Import this in your root layout
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    reportWebVitals(metric)
  })

  return null
}
