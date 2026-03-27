import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRutField } from '@/hooks/useRutField'

describe('useRutField', () => {
  it('initializes with no error', () => {
    const onSet = vi.fn()
    const { result } = renderHook(() => useRutField(onSet))
    expect(result.current.error).toBe('')
  })

  it('formats and sets RUT on change', () => {
    const onSet = vi.fn()
    const { result } = renderHook(() => useRutField(onSet))

    act(() => result.current.handleChange('123456789'))

    expect(onSet).toHaveBeenCalled()
    // onSet should be called with the formatted RUT
    const calledWith = onSet.mock.calls[0][0]
    expect(calledWith).toContain('.')
  })

  it('shows error for invalid RUT when length >= 3', () => {
    const onSet = vi.fn()
    const { result } = renderHook(() => useRutField(onSet))

    act(() => result.current.handleChange('111'))

    expect(result.current.error).toBe('RUT inválido')
  })

  it('clears error for short input', () => {
    const onSet = vi.fn()
    const { result } = renderHook(() => useRutField(onSet))

    act(() => result.current.handleChange('111'))
    expect(result.current.error).toBe('RUT inválido')

    act(() => result.current.handleChange('1'))
    expect(result.current.error).toBe('')
  })

  it('validate returns true for empty RUT', () => {
    const onSet = vi.fn()
    const { result } = renderHook(() => useRutField(onSet))

    let valid = false
    act(() => { valid = result.current.validate('') })
    expect(valid).toBe(true)
  })

  it('validate returns false and sets error for invalid RUT', () => {
    const onSet = vi.fn()
    const { result } = renderHook(() => useRutField(onSet))

    let valid = true
    act(() => { valid = result.current.validate('12.345.678-0') })
    expect(valid).toBe(false)
    expect(result.current.error).toBe('RUT inválido')
  })

  it('validate returns true for valid RUT', () => {
    const onSet = vi.fn()
    const { result } = renderHook(() => useRutField(onSet))

    // 12.345.678-5 is a valid Chilean RUT
    let valid = false
    act(() => { valid = result.current.validate('12.345.678-5') })
    expect(valid).toBe(true)
  })
})
