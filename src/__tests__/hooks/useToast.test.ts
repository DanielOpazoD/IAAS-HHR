import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToast } from '@/hooks/useToast'

describe('useToast', () => {
  it('starts with empty toasts', () => {
    const { result } = renderHook(() => useToast())
    expect(result.current.toasts).toEqual([])
  })

  it('adds a toast with correct properties', () => {
    const { result } = renderHook(() => useToast())
    act(() => result.current.addToast('Test message', 'success'))
    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].message).toBe('Test message')
    expect(result.current.toasts[0].type).toBe('success')
    expect(result.current.toasts[0].id).toBeTruthy()
  })

  it('defaults to success type', () => {
    const { result } = renderHook(() => useToast())
    act(() => result.current.addToast('Default type'))
    expect(result.current.toasts[0].type).toBe('success')
  })

  it('supports error and info types', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.addToast('Error', 'error')
      result.current.addToast('Info', 'info')
    })
    expect(result.current.toasts).toHaveLength(2)
    expect(result.current.toasts[0].type).toBe('error')
    expect(result.current.toasts[1].type).toBe('info')
  })

  it('removes a toast by id', () => {
    const { result } = renderHook(() => useToast())
    let id: string
    act(() => { id = result.current.addToast('To remove') })
    expect(result.current.toasts).toHaveLength(1)
    act(() => result.current.removeToast(id))
    expect(result.current.toasts).toHaveLength(0)
  })

  it('accumulates multiple toasts', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.addToast('First')
      result.current.addToast('Second')
      result.current.addToast('Third')
    })
    expect(result.current.toasts).toHaveLength(3)
  })

  it('auto-removes toast after duration', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useToast(1000))
    act(() => result.current.addToast('Auto remove'))
    expect(result.current.toasts).toHaveLength(1)
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.toasts).toHaveLength(0)
    vi.useRealTimers()
  })

  it('each toast has unique id', () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.addToast('A')
      result.current.addToast('B')
    })
    const ids = result.current.toasts.map((t) => t.id)
    expect(new Set(ids).size).toBe(2)
  })
})
