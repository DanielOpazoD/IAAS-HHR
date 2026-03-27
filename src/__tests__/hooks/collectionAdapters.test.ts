import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorageAdapter } from '@/hooks/collectionAdapters'

// Tests for the localStorage adapter in isolation (no AuthProvider needed)

describe('useLocalStorageAdapter', () => {
  const collectionName = 'testcol'
  const anio = 2026
  const localKey = `iaas_${collectionName}_${anio}`

  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with empty data', () => {
    const { result } = renderHook(() => useLocalStorageAdapter(collectionName, anio))
    expect(result.current.data).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('loads existing data from localStorage', () => {
    const existing = [{ id: '1', nombre: 'Existing' }]
    localStorage.setItem(localKey, JSON.stringify(existing))
    const { result } = renderHook(() => useLocalStorageAdapter(collectionName, anio))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data[0].id).toBe('1')
  })

  it('add persists item and returns id', async () => {
    const { result } = renderHook(() => useLocalStorageAdapter(collectionName, anio))
    let id: string
    await act(async () => {
      id = await result.current.add({ nombre: 'New' } as never, 'user1')
    })
    expect(id!).toBeTruthy()
    expect(result.current.data).toHaveLength(1)
    expect((result.current.data[0] as Record<string, unknown>).nombre).toBe('New')
    expect((result.current.data[0] as Record<string, unknown>).createdBy).toBe('user1')
    expect((result.current.data[0] as Record<string, unknown>).updatedBy).toBe('user1')
    expect((result.current.data[0] as Record<string, unknown>).createdAt).toBeTruthy()
  })

  it('add prepends new items (newest first)', async () => {
    const { result } = renderHook(() => useLocalStorageAdapter(collectionName, anio))
    await act(async () => {
      await result.current.add({ nombre: 'First' } as never, 'u')
      await result.current.add({ nombre: 'Second' } as never, 'u')
    })
    expect((result.current.data[0] as Record<string, unknown>).nombre).toBe('Second')
    expect((result.current.data[1] as Record<string, unknown>).nombre).toBe('First')
  })

  it('update modifies an existing item', async () => {
    const { result } = renderHook(() => useLocalStorageAdapter(collectionName, anio))
    await act(async () => {
      await result.current.add({ nombre: 'Original' } as never, 'u1')
    })
    const id = result.current.data[0].id
    await act(async () => {
      await result.current.update(id, { nombre: 'Modified' } as never, 'u2')
    })
    expect((result.current.data[0] as Record<string, unknown>).nombre).toBe('Modified')
    expect((result.current.data[0] as Record<string, unknown>).updatedBy).toBe('u2')
  })

  it('update does not affect other items', async () => {
    const { result } = renderHook(() => useLocalStorageAdapter(collectionName, anio))
    await act(async () => {
      await result.current.add({ nombre: 'A' } as never, 'u')
      await result.current.add({ nombre: 'B' } as never, 'u')
    })
    const idB = result.current.data[0].id // B is first (newest)
    await act(async () => {
      await result.current.update(idB, { nombre: 'B2' } as never, 'u')
    })
    expect((result.current.data[1] as Record<string, unknown>).nombre).toBe('A')
  })

  it('remove deletes an item', async () => {
    const { result } = renderHook(() => useLocalStorageAdapter(collectionName, anio))
    await act(async () => {
      await result.current.add({ nombre: 'ToDelete' } as never, 'u')
    })
    const id = result.current.data[0].id
    await act(async () => {
      await result.current.remove(id)
    })
    expect(result.current.data).toHaveLength(0)
    // Verify persisted
    const stored = JSON.parse(localStorage.getItem(localKey) || '[]')
    expect(stored).toHaveLength(0)
  })

  it('uses separate keys for different years', async () => {
    const { result: r2026 } = renderHook(() => useLocalStorageAdapter(collectionName, 2026))
    const { result: r2025 } = renderHook(() => useLocalStorageAdapter(collectionName, 2025))
    await act(async () => {
      await r2026.current.add({ nombre: 'Only 2026' } as never, 'u')
    })
    expect(r2026.current.data).toHaveLength(1)
    expect(r2025.current.data).toHaveLength(0)
  })

  it('uses separate keys for different collections', async () => {
    const { result: rA } = renderHook(() => useLocalStorageAdapter('colA', anio))
    const { result: rB } = renderHook(() => useLocalStorageAdapter('colB', anio))
    await act(async () => {
      await rA.current.add({ nombre: 'Only A' } as never, 'u')
    })
    expect(rA.current.data).toHaveLength(1)
    expect(rB.current.data).toHaveLength(0)
  })

  it('handles malformed localStorage gracefully', () => {
    localStorage.setItem(localKey, '{{invalid json')
    const { result } = renderHook(() => useLocalStorageAdapter(collectionName, anio))
    expect(result.current.data).toEqual([])
  })

  it('generates unique ids for each add', async () => {
    const { result } = renderHook(() => useLocalStorageAdapter(collectionName, anio))
    const ids: string[] = []
    await act(async () => {
      ids.push(await result.current.add({ nombre: 'A' } as never, 'u'))
      ids.push(await result.current.add({ nombre: 'B' } as never, 'u'))
      ids.push(await result.current.add({ nombre: 'C' } as never, 'u'))
    })
    const unique = new Set(ids)
    expect(unique.size).toBe(3)
  })
})
