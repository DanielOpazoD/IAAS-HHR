import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAutoMonth } from '@/hooks/useAutoMonth'

describe('useAutoMonth', () => {
  it('derives month from a valid date string', () => {
    const setMes = vi.fn()
    renderHook(() => useAutoMonth('2026-03-15', '', setMes))
    expect(setMes).toHaveBeenCalledWith('Marzo')
  })

  it('does not call setMes when date is empty', () => {
    const setMes = vi.fn()
    renderHook(() => useAutoMonth('', '', setMes))
    expect(setMes).not.toHaveBeenCalled()
  })

  it('does not call setMes when derived month matches current', () => {
    const setMes = vi.fn()
    renderHook(() => useAutoMonth('2026-01-10', 'Enero', setMes))
    expect(setMes).not.toHaveBeenCalled()
  })

  it('updates when month changes', () => {
    const setMes = vi.fn()
    const { rerender } = renderHook(
      ({ date, current }) => useAutoMonth(date, current, setMes),
      { initialProps: { date: '2026-01-10', current: 'Enero' } }
    )

    // Same month — no call
    expect(setMes).not.toHaveBeenCalled()

    // Change to February date
    rerender({ date: '2026-02-20', current: 'Enero' })
    expect(setMes).toHaveBeenCalledWith('Febrero')
  })

  it('handles all 12 months correctly', () => {
    const months = [
      { date: '2026-01-01', expected: 'Enero' },
      { date: '2026-06-15', expected: 'Junio' },
      { date: '2026-12-31', expected: 'Diciembre' },
    ]

    for (const { date, expected } of months) {
      const setMes = vi.fn()
      renderHook(() => useAutoMonth(date, '', setMes))
      expect(setMes).toHaveBeenCalledWith(expected)
    }
  })
})
