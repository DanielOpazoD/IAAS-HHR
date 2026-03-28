import { useState, useEffect } from 'react'
import { isFirebaseConfigured, db } from '@/config/firebase'

/**
 * Shows a small indicator when Firestore has pending writes or the browser is offline.
 *
 * Uses Firestore's waitForPendingWrites() to detect unsynced data.
 * Only renders in Firebase mode (hidden in demo/localStorage mode).
 */
export default function SyncStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [hasPending, setHasPending] = useState(false)

  // Track browser online/offline
  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  // Monitor Firestore pending writes
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return
    let cancelled = false

    async function monitor() {
      const { waitForPendingWrites } = await import('firebase/firestore')
      while (!cancelled) {
        try {
          // This resolves immediately if there are no pending writes,
          // or waits until all pending writes are acknowledged by the server
          await waitForPendingWrites(db!)
          if (!cancelled) setHasPending(false)
        } catch {
          if (!cancelled) setHasPending(true)
        }
        // Brief pause before re-checking
        await new Promise((r) => setTimeout(r, 3000))
      }
    }

    monitor()
    return () => {
      cancelled = true
    }
  }, [])

  // Don't render in demo mode or when everything is synced and online
  if (!isFirebaseConfigured) return null
  if (isOnline && !hasPending) return null

  // Offline indicator
  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>
        Sin conexion — cambios guardados localmente
      </div>
    )
  }

  // Pending writes indicator (online but syncing)
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Sincronizando...
    </div>
  )
}
