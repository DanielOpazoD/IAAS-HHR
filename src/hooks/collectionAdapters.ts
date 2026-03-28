import { useState, useEffect, useRef, useCallback } from 'react'
import { where, orderBy, QueryConstraint } from 'firebase/firestore'
import * as firestoreService from '@/services/firestore'
import { getLocalKey, loadLocal, saveLocal } from '@/utils/localStorage'

// ─── Shared types ───────────────────────────────────────────

export interface CollectionState<T> {
  data: (T & { id: string })[]
  loading: boolean
  error: string | null
}

export interface CollectionActions<T> {
  add: (item: T, uid: string) => Promise<string>
  update: (id: string, item: Partial<T>, uid: string) => Promise<void>
  remove: (id: string) => Promise<void>
}

export type CollectionAdapter<T> = CollectionState<T> & CollectionActions<T>

// ─── Firebase Adapter ───────────────────────────────────────

export function useFirebaseAdapter<T>(
  collectionName: string,
  anio?: number
): CollectionAdapter<T> {
  const [data, setData] = useState<(T & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
  }, [collectionName, anio])

  const add = useCallback(async (item: T, uid: string): Promise<string> => {
    return firestoreService.create(collectionName, {
      ...(item as Record<string, unknown>),
      createdBy: uid,
      updatedBy: uid,
    })
  }, [collectionName])

  const update = useCallback(async (id: string, item: Partial<T>, uid: string): Promise<void> => {
    await firestoreService.update(collectionName, id, {
      ...(item as Record<string, unknown>),
      updatedBy: uid,
    })
  }, [collectionName])

  const remove = useCallback(async (id: string): Promise<void> => {
    await firestoreService.remove(collectionName, id)
  }, [collectionName])

  return { data, loading, error, add, update, remove }
}

// ─── LocalStorage Adapter ───────────────────────────────────

export function useLocalStorageAdapter<T>(
  collectionName: string,
  anio?: number
): CollectionAdapter<T> {
  const localKey = getLocalKey(collectionName, anio)
  const versionRef = useRef(0)
  const [version, setVersion] = useState(0)

  // Re-read from localStorage whenever version changes
  const data: (T & { id: string })[] = loadLocal<T>(localKey)
  // Keep version in scope so React knows data depends on it
  void version

  // eslint-disable-next-line react-hooks/preserve-manual-memoization -- setVersion is stable; ref mutation intentional
  const bumpVersion = useCallback(() => {
    setVersion(++versionRef.current)
  }, [])

  const add = useCallback(async (item: T, uid: string): Promise<string> => {
    const newItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      createdBy: uid,
      updatedBy: uid,
    } as T & { id: string }
    const updated = [newItem, ...loadLocal<T>(localKey)]
    saveLocal(localKey, updated)
    bumpVersion()
    return newItem.id
  }, [localKey, bumpVersion])

  const update = useCallback(async (id: string, item: Partial<T>, uid: string): Promise<void> => {
    const current = loadLocal<T>(localKey)
    const updated = current.map((d) => d.id === id ? { ...d, ...item, updatedBy: uid } : d)
    saveLocal(localKey, updated)
    bumpVersion()
  }, [localKey, bumpVersion])

  const remove = useCallback(async (id: string): Promise<void> => {
    const current = loadLocal<T>(localKey)
    const updated = current.filter((d) => d.id !== id)
    saveLocal(localKey, updated)
    bumpVersion()
  }, [localKey, bumpVersion])

  return { data, loading: false, error: null, add, update, remove }
}
