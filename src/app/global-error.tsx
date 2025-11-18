'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { handleError } from '@/lib/monitoring/error-handler'

/**
 * Global Error Handler
 * 
 * This catches errors in the root layout and above.
 * It's a fallback when the error boundary can't catch the error.
 * 
 * Note: This is a Next.js App Router feature
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Unified error handling: Pino (local logs) + Sentry (production monitoring)
    // Automatically handles both logging systems
    handleError(error, {
      digest: error.digest,
      context: 'global-error-boundary',
      severity: 'critical',
    });
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md space-y-4 text-center">
            <div className="flex justify-center">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold">Bir Hata Oluştu</h1>
            <p className="text-muted-foreground">
              Üzgünüz, beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="rounded-md bg-destructive/10 p-4 text-left">
                <p className="text-sm font-medium text-destructive">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}
            <div className="flex justify-center gap-2">
              <Button onClick={() => reset()}>Tekrar Dene</Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Ana Sayfa
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
