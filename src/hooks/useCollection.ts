import { useState, useCallback } from 'react'
import { isFirebaseConfigured } from '@/config/firebase'
import { getErrorMessage } from '@/utils/errors'
import { useAuth } from '@/context/AuthContext'
import { ROLE_PERMISSIONS } from '@/types/roles'
import { useFirebaseAdapter, useLocalStorageAdapter } from './collectionAdapters'

/**
 * Generic CRUD hook with dual-mode support via Strategy Pattern:
 * - Firebase mode: real-time subscription via Firestore
 * - Demo mode: localStorage fallback when Firebase not configured
 *
 * The storage strategy is selected once at initialization based on
 * `isFirebaseConfigured`. Each adapter encapsulates its own state
 * management and data access, keeping this hook focused on:
 * 1. Permission checking
 * 2. Error handling
 * 3. Providing a stable public API
 *
 * Returns { data, loading, error, add, update, remove }.
 */
export function useCollection<T>(
  collectionName: string,
  anio?: number
) {
  const { user, role } = useAuth()
  const [error, setError] = useState<string | null>(null)

  // Strategy selection: adapter handles all data storage concerns
  const adapter = isFirebaseConfigured
    ? useFirebaseAdapter<T>(collectionName, anio)
    : useLocalStorageAdapter<T>(collectionName, anio)

  const checkWritePermission = useCallback(() => {
    if (role && !ROLE_PERMISSIONS[role].canWrite.includes(collectionName)) {
      throw new Error('No tienes permisos para esta operacion')
    }
  }, [role, collectionName])

  const add = useCallback(async (item: T) => {
    try {
      setError(null)
      checkWritePermission()
      const uid = user?.uid ?? 'unknown'
      return await adapter.add(item, uid)
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    }
  }, [checkWritePermission, user?.uid, adapter.add])

  const update = useCallback(async (id: string, item: Partial<T>) => {
    try {
      setError(null)
      checkWritePermission()
      const uid = user?.uid ?? 'unknown'
      await adapter.update(id, item, uid)
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    }
  }, [checkWritePermission, user?.uid, adapter.update])

  const remove = useCallback(async (id: string) => {
    try {
      setError(null)
      checkWritePermission()
      await adapter.remove(id)
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    }
  }, [checkWritePermission, adapter.remove])

  // Merge adapter error with local error (adapter errors come from Firestore listener)
  const combinedError = error ?? adapter.error

  return {
    data: adapter.data,
    loading: adapter.loading,
    error: combinedError,
    add,
    update,
    remove,
  }
}
