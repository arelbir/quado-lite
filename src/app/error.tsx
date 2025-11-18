'use client' // Error components must be Client Components

import { ErrorComponent } from '@/components/error/500'
import { useEffect } from 'react'
import { handleError } from '@/lib/monitoring/error-handler'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Unified error handling: Pino (local logs) + Sentry (production monitoring)
    handleError(error, {
      digest: error.digest,
      context: 'error-boundary',
    });
  }, [error])

  return (
    <ErrorComponent />
  )
}
