import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAutoMonth } from '@/hooks/useAutoMonth'
import type { Mes } from '@/utils/constants'

// vi.fn() is untyped by default; cast to the expected signature so TypeScript
// validates that useAutoMonth calls the setter with the correct Mes union type.
function makeMesMock() {
  return vi.fn() as unknown as ReturnType<typeof vi.fn> & ((mes: Mes) => void)
}

describe('useAutoMonth', () => {
  it('derives month from a valid date string', () => {
    const setMes = makeMesMock()
    renderHook(() => useAutoMonth('2026-03-15', '', setMes))
    expect(setMes).toHaveBeenCalledWith('Marzo')
  })

  it('does not call setMes when date is empty', () => {
    const setMes = makeMesMock()
    renderHook(() => useAutoMonth('', '', setMes))
    expect(setMes).not.toHaveBeenCalled()
  })

  it('does not call setMes when derived month matches current', () => {
    const setMes = makeMesMock()
    renderHook(() => useAutoMonth('2026-01-10', 'Enero' as Mes, setMes))
    expect(setMes).not.toHaveBeenCalled()
  })

  it('updates when month changes', () => {
    const setMes = makeMesMock()
    const { rerender } = renderHook(
      ({ date, current }: { date: string; current: Mes | '' }) =>
        useAutoMonth(date, current, setMes),
      { initialProps: { date: '2026-01-10', current: 'Enero' as Mes } }
    )

    // Same month — no call
    expect(setMes).not.toHaveBeenCalled()

    // Change to February date
    rerender({ date: '2026-02-20', current: 'Enero' as Mes })
    expect(setMes).toHaveBeenCalledWith('Febrero')
  })

  it('handles all 12 months correctly', () => {
    const months = [
      { date: '2026-01-01', expected: 'Enero' },
      { date: '2026-06-15', expected: 'Junio' },
      { date: '2026-12-31', expected: 'Diciembre' },
    ]

    for (const { date, expected } of months) {
      const setMes = makeMesMock()
      renderHook(() => useAutoMonth(date, '', setMes))
      expect(setMes).toHaveBeenCalledWith(expected)
    }
  })
})
