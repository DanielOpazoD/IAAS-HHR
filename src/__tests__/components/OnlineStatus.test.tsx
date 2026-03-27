import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import OnlineStatus from '@/components/ui/OnlineStatus'

describe('OnlineStatus', () => {
  const originalOnLine = navigator.onLine

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true })
  })

  it('renders nothing when online', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
    const { container } = render(<OnlineStatus />)
    expect(container.innerHTML).toBe('')
  })

  it('shows offline banner when offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    render(<OnlineStatus />)
    expect(screen.getByText('Sin conexión a internet')).toBeInTheDocument()
  })

  it('shows banner when going offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
    render(<OnlineStatus />)
    expect(screen.queryByText('Sin conexión a internet')).toBeNull()

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
      window.dispatchEvent(new Event('offline'))
    })
    expect(screen.getByText('Sin conexión a internet')).toBeInTheDocument()
  })

  it('hides banner when coming back online', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    render(<OnlineStatus />)
    expect(screen.getByText('Sin conexión a internet')).toBeInTheDocument()

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
      window.dispatchEvent(new Event('online'))
    })
    expect(screen.queryByText('Sin conexión a internet')).toBeNull()
  })
})
