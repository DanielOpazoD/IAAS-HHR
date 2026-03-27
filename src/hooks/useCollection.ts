import { useState, useEffect, useCallback } from 'react'
import { where, orderBy, QueryConstraint } from 'firebase/firestore'
import * as firestoreService from '@/services/firestore'
import { isFirebaseConfigured } from '@/config/firebase'
import { getErrorMessage } from '@/utils/errors'

function getLocalKey(collectionName: string, anio?: number) {
  return anio ? `iaas_${collectionName}_${anio}` : `iaas_${collectionName}`
}

function loadLocal<T>(key: string): (T & { id: string })[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

function saveLocal<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data))
}

/**
 * Generic CRUD hook with dual-mode support:
 * - Firebase mode: real-time subscription via Firestore
 * - Demo mode: localStorage fallback when Firebase not configured
 */
export function useCollection<T>(
  collectionName: string,
  anio?: number
) {
  const localKey = getLocalKey(collectionName, anio)
  const [data, setData] = useState<(T & { id: string })[]>(() =>
    isFirebaseConfigured ? [] : loadLocal<T>(localKey)
  )
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setData(loadLocal<T>(localKey))
      setLoading(false)
      return
    }

    const constraints: QueryConstraint[] = []
    if (anio) {
      constraints.push(where('anio', '==', anio))
    }
    constraints.push(orderBy('createdAt', 'desc'))

    const unsubscribe = firestoreService.subscribe<T>(
      collectionName,
      constraints,
      (items) => {
        setData(items)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )
    return unsubscribe
  }, [collectionName, anio, localKey])

  const add = useCallback(
    async (item: T) => {
      try {
        setError(null)
        if (!isFirebaseConfigured) {
          const newItem = { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() } as T & { id: string }
          const updated = [newItem, ...loadLocal<T>(localKey)]
          saveLocal(localKey, updated)
          setData(updated)
          return newItem.id
        }
        return firestoreService.create(collectionName, item as unknown as Record<string, unknown>)
      } catch (err) {
        const msg = getErrorMessage(err)
        setError(msg)
        throw err
      }
    },
    [collectionName, localKey]
  )

  const update = useCallback(
    async (id: string, item: Partial<T>) => {
      try {
        setError(null)
        if (!isFirebaseConfigured) {
          const current = loadLocal<T>(localKey)
          const updated = current.map((d) => d.id === id ? { ...d, ...item } : d)
          saveLocal(localKey, updated)
          setData(updated)
          return
        }
        return firestoreService.update(collectionName, id, item as unknown as Record<string, unknown>)
      } catch (err) {
        const msg = getErrorMessage(err)
        setError(msg)
        throw err
      }
    },
    [collectionName, localKey]
  )

  const remove = useCallback(
    async (id: string) => {
      try {
        setError(null)
        if (!isFirebaseConfigured) {
          const current = loadLocal<T>(localKey)
          const updated = current.filter((d) => d.id !== id)
          saveLocal(localKey, updated)
          setData(updated)
          return
        }
        return firestoreService.remove(collectionName, id)
      } catch (err) {
        const msg = getErrorMessage(err)
        setError(msg)
        throw err
      }
    },
    [collectionName, localKey]
  )

  return { data, loading, error, add, update, remove }
}
