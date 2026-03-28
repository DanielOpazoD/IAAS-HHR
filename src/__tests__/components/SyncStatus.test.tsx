import { describe, it, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'

// Mock firebase config — demo mode by default (no Firebase env vars)
vi.mock('@/config/firebase', () => ({
  isFirebaseConfigured: false,
  db: null,
}))

describe('SyncStatus', () => {
  const originalOnLine = navigator.onLine

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true })
    vi.restoreAllMocks()
  })

  it('renders nothing in demo mode (no Firebase configured)', async () => {
    const { default: SyncStatus } = await import('@/components/ui/SyncStatus')
    const { container } = render(<SyncStatus />)
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing in demo mode even when offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    const { default: SyncStatus } = await import('@/components/ui/SyncStatus')
    const { container } = render(<SyncStatus />)
    // Component returns null when !isFirebaseConfigured, regardless of online status
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing in demo mode when online', async () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
    const { default: SyncStatus } = await import('@/components/ui/SyncStatus')
    const { container } = render(<SyncStatus />)
    expect(container.innerHTML).toBe('')
  })
})
