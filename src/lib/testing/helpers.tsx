import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Add providers wrapper if needed
function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

// Custom render with providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: Providers, ...options })
}

// Re-export everything from RTL
export * from '@testing-library/react'
export { renderWithProviders as render }
