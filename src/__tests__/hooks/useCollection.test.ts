import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCollection } from '@/hooks/useCollection'

// useCollection in demo mode uses localStorage
// These tests verify the localStorage CRUD path

describe('useCollection (demo/localStorage mode)', () => {
  const collectionName = 'test_collection'
  const anio = 2026
  const localKey = `iaas_${collectionName}_${anio}`

  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with empty data when localStorage is empty', () => {
    const { result } = renderHook(() => useCollection(collectionName, anio))
    expect(result.current.data).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('loads existing data from localStorage', () => {
    const existing = [{ id: '1', nombre: 'Test', createdAt: '2026-01-01' }]
    localStorage.setItem(localKey, JSON.stringify(existing))
    const { result } = renderHook(() => useCollection(collectionName, anio))
    expect(result.current.data).toHaveLength(1)
    expect((result.current.data[0] as Record<string, unknown>).nombre).toBe('Test')
  })

  it('adds a new item', async () => {
    const { result } = renderHook(() => useCollection(collectionName, anio))
    await act(async () => {
      await result.current.add({ nombre: 'Nuevo' })
    })
    expect(result.current.data).toHaveLength(1)
    expect((result.current.data[0] as Record<string, unknown>).nombre).toBe('Nuevo')
    expect(result.current.data[0].id).toBeTruthy()
    // Verify persisted
    const stored = JSON.parse(localStorage.getItem(localKey) || '[]')
    expect(stored).toHaveLength(1)
  })

  it('updates an existing item', async () => {
    const { result } = renderHook(() => useCollection(collectionName, anio))
    await act(async () => {
      await result.current.add({ nombre: 'Original' })
    })
    await act(async () => {
      await result.current.update(result.current.data[0].id, { nombre: 'Updated' })
    })
    expect((result.current.data[0] as Record<string, unknown>).nombre).toBe('Updated')
  })

  it('removes an item', async () => {
    const { result } = renderHook(() => useCollection(collectionName, anio))
    await act(async () => {
      await result.current.add({ nombre: 'To Delete' })
    })
    expect(result.current.data).toHaveLength(1)
    const id = result.current.data[0].id
    await act(async () => {
      await result.current.remove(id)
    })
    expect(result.current.data).toHaveLength(0)
  })

  it('handles multiple adds', async () => {
    const { result } = renderHook(() => useCollection(collectionName, anio))
    await act(async () => {
      await result.current.add({ nombre: 'A' })
      await result.current.add({ nombre: 'B' })
      await result.current.add({ nombre: 'C' })
    })
    expect(result.current.data).toHaveLength(3)
  })

  it('uses different keys for different years', async () => {
    const { result: r2026 } = renderHook(() => useCollection(collectionName, 2026))
    const { result: r2025 } = renderHook(() => useCollection(collectionName, 2025))
    await act(async () => {
      await r2026.current.add({ nombre: '2026 data' })
    })
    expect(r2026.current.data).toHaveLength(1)
    expect(r2025.current.data).toHaveLength(0)
  })

  it('handles malformed localStorage gracefully', () => {
    localStorage.setItem(localKey, 'invalid json {{{')
    const { result } = renderHook(() => useCollection(collectionName, anio))
    expect(result.current.data).toEqual([])
  })
})
