import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFormState } from '@/hooks/useFormState'

interface TestForm extends Record<string, unknown> {
  nombre: string
  edad: number
  activo: boolean
}

const defaults: TestForm = { nombre: '', edad: 0, activo: false }

describe('useFormState', () => {
  it('initializes with defaults when no initial provided', () => {
    const { result } = renderHook(() => useFormState<TestForm>(undefined, defaults))
    expect(result.current.form).toEqual(defaults)
  })

  it('merges initial values over defaults', () => {
    const initial = { nombre: 'Juan', edad: 30 }
    const { result } = renderHook(() => useFormState<TestForm>(initial, defaults))
    expect(result.current.form).toEqual({ nombre: 'Juan', edad: 30, activo: false })
  })

  it('sets individual field with type safety', () => {
    const { result } = renderHook(() => useFormState<TestForm>(undefined, defaults))
    act(() => result.current.set('nombre', 'María'))
    expect(result.current.form.nombre).toBe('María')
    expect(result.current.form.edad).toBe(0) // unchanged
  })

  it('sets multiple fields sequentially', () => {
    const { result } = renderHook(() => useFormState<TestForm>(undefined, defaults))
    act(() => {
      result.current.set('nombre', 'Pedro')
      result.current.set('edad', 45)
      result.current.set('activo', true)
    })
    expect(result.current.form).toEqual({ nombre: 'Pedro', edad: 45, activo: true })
  })

  it('resets to defaults when no initial', () => {
    const { result } = renderHook(() => useFormState<TestForm>(undefined, defaults))
    act(() => {
      result.current.set('nombre', 'Test')
      result.current.set('edad', 99)
    })
    act(() => result.current.reset())
    expect(result.current.form).toEqual(defaults)
  })

  it('resets to merged initial + defaults when initial provided', () => {
    const initial = { nombre: 'Ana', edad: 25 }
    const { result } = renderHook(() => useFormState<TestForm>(initial, defaults))
    act(() => {
      result.current.set('nombre', 'Changed')
      result.current.set('activo', true)
    })
    act(() => result.current.reset())
    expect(result.current.form).toEqual({ nombre: 'Ana', edad: 25, activo: false })
  })

  it('setForm replaces entire form state', () => {
    const { result } = renderHook(() => useFormState<TestForm>(undefined, defaults))
    act(() => result.current.setForm({ nombre: 'Full', edad: 100, activo: true }))
    expect(result.current.form).toEqual({ nombre: 'Full', edad: 100, activo: true })
  })
})
