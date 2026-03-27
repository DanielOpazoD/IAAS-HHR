import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFormChangeNotify } from '@/hooks/useFormChangeNotify'

describe('useFormChangeNotify', () => {
  it('calls onFormChange with initial values', () => {
    const onChange = vi.fn()
    renderHook(() => useFormChangeNotify({ rut: '12.345.678-5', mes: 'Enero' }, onChange))
    expect(onChange).toHaveBeenCalledWith({ rut: '12.345.678-5', mes: 'Enero' })
  })

  it('does not crash when onFormChange is undefined', () => {
    expect(() => {
      renderHook(() => useFormChangeNotify({ rut: '11.111.111-1' }, undefined))
    }).not.toThrow()
  })

  it('calls onFormChange again when rut changes', () => {
    const onChange = vi.fn()
    const { rerender } = renderHook(
      ({ values }) => useFormChangeNotify(values, onChange),
      { initialProps: { values: { rut: 'aaa', mes: 'Enero' } } }
    )

    onChange.mockClear()
    rerender({ values: { rut: 'bbb', mes: 'Enero' } })
    expect(onChange).toHaveBeenCalledWith({ rut: 'bbb', mes: 'Enero' })
  })

  it('calls onFormChange again when mes changes', () => {
    const onChange = vi.fn()
    const { rerender } = renderHook(
      ({ values }) => useFormChangeNotify(values, onChange),
      { initialProps: { values: { rut: 'aaa', mes: 'Enero' } } }
    )

    onChange.mockClear()
    rerender({ values: { rut: 'aaa', mes: 'Febrero' } })
    expect(onChange).toHaveBeenCalledWith({ rut: 'aaa', mes: 'Febrero' })
  })

  it('does not call onFormChange when values unchanged', () => {
    const onChange = vi.fn()
    const { rerender } = renderHook(
      ({ values }) => useFormChangeNotify(values, onChange),
      { initialProps: { values: { rut: 'x', mes: 'Enero' } } }
    )

    onChange.mockClear()
    rerender({ values: { rut: 'x', mes: 'Enero' } })
    expect(onChange).not.toHaveBeenCalled()
  })
})
