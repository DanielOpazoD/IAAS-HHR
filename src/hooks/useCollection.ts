import { useState, useEffect, useRef } from 'react'
import { where, orderBy, QueryConstraint } from 'firebase/firestore'
import * as firestoreService from '@/services/firestore'
import { isFirebaseConfigured } from '@/config/firebase'
import { getErrorMessage } from '@/utils/errors'
import { getLocalKey, loadLocal, saveLocal } from '@/utils/localStorage'
import { useAuth } from '@/context/AuthContext'
import { ROLE_PERMISSIONS } from '@/types/roles'

/**
 * Generic CRUD hook with dual-mode support:
 * - Firebase mode: real-time subscription via Firestore
 * - Demo mode: localStorage fallback when Firebase not configured
 *
 * Returns { data, loading, error, add, update, remove }.
 * React Compiler auto-memoizes the returned functions.
 */
export function useCollection<T>(
  collectionName: string,
  anio?: number
) {
  const localKey = getLocalKey(collectionName, anio)
  const { user, role } = useAuth()

  // Demo mode: version counter triggers re-reads from localStorage after CRUD ops
  const versionRef = useRef(0)
  const [, setVersion] = useState(0)

  const [firebaseData, setFirebaseData] = useState<(T & { id: string })[]>([])
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState<string | null>(null)

  // Read localStorage data — re-evaluated when version bumps
  const localData: (T & { id: string })[] = isFirebaseConfigured ? [] : loadLocal<T>(localKey)
  const data = isFirebaseConfigured ? firebaseData : localData

  useEffect(() => {
    if (!isFirebaseConfigured) return

    const constraints: QueryConstraint[] = []
    if (anio) {
      constraints.push(where('anio', '==', anio))
    }
    constraints.push(orderBy('createdAt', 'desc'))

    const unsubscribe = firestoreService.subscribe<T>(
      collectionName,
      constraints,
      (items) => {
        setFirebaseData(items)
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

  function checkWritePermission() {
    if (role && !ROLE_PERMISSIONS[role].canWrite.includes(collectionName)) {
      throw new Error('No tienes permisos para esta operacion')
    }
  }

  const add = async (item: T) => {
    try {
      setError(null)
      checkWritePermission()
      const uid = user?.uid ?? 'unknown'
      if (!isFirebaseConfigured) {
        const newItem = {
          ...item,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          createdBy: uid,
          updatedBy: uid,
        } as T & { id: string }
        const updated = [newItem, ...loadLocal<T>(localKey)]
        saveLocal(localKey, updated)
        setVersion(++versionRef.current)
        return newItem.id
      }
      return firestoreService.create(collectionName, {
        ...(item as unknown as Record<string, unknown>),
        createdBy: uid,
        updatedBy: uid,
      })
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    }
  }

  const update = async (id: string, item: Partial<T>) => {
    try {
      setError(null)
      checkWritePermission()
      const uid = user?.uid ?? 'unknown'
      if (!isFirebaseConfigured) {
        const current = loadLocal<T>(localKey)
        const updated = current.map((d) => d.id === id ? { ...d, ...item, updatedBy: uid } : d)
        saveLocal(localKey, updated)
        setVersion(++versionRef.current)
        return
      }
      return firestoreService.update(collectionName, id, {
        ...(item as unknown as Record<string, unknown>),
        updatedBy: uid,
      })
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    }
  }

  const remove = async (id: string) => {
    try {
      setError(null)
      checkWritePermission()
      if (!isFirebaseConfigured) {
        const current = loadLocal<T>(localKey)
        const updated = current.filter((d) => d.id !== id)
        saveLocal(localKey, updated)
        setVersion(++versionRef.current)
        return
      }
      return firestoreService.remove(collectionName, id)
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    }
  }

  return { data, loading, error, add, update, remove }
}
