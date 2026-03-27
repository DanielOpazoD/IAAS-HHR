import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReactNode } from 'react'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

function ThrowingComponent({ error }: { error: Error }): ReactNode {
  throw error
}

describe('ErrorBoundary', () => {
  // Suppress console.error for expected errors
  const originalError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })
  afterEach(() => {
    console.error = originalError
  })

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <p>Contenido normal</p>
      </ErrorBoundary>
    )
    expect(screen.getByText('Contenido normal')).toBeInTheDocument()
  })

  it('shows fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error('Crash!')} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument()
    expect(screen.getByText('Ha ocurrido un error inesperado en la aplicación.')).toBeInTheDocument()
  })

  it('displays the error message', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error('Detalle del error')} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Detalle del error')).toBeInTheDocument()
  })

  it('shows reload button', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error('Crash')} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Recargar página')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Error personalizado</div>}>
        <ThrowingComponent error={new Error('Crash')} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Error personalizado')).toBeInTheDocument()
    expect(screen.queryByText('Algo salió mal')).toBeNull()
  })

  it('logs error to console', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent error={new Error('Log test')} />
      </ErrorBoundary>
    )
    expect(console.error).toHaveBeenCalled()
  })
})
