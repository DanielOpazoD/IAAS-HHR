import { initializeApp, FirebaseApp } from 'firebase/app'
import { initializeFirestore, memoryLocalCache, Firestore } from 'firebase/firestore'
import type { Auth } from 'firebase/auth'

/** True when Firebase env vars are present (false = demo/localStorage mode) */
export const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'fake',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-iaas',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000:web:000',
}

let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  // Use in-memory cache instead of IndexedDB persistence.
  //
  // Why NOT IndexedDB persistence:
  // - persistentLocalCache causes Firestore INTERNAL ASSERTION FAILED (b815/ca9)
  //   when multiple onSnapshot listeners are torn down simultaneously (logout,
  //   navigation between pages with lazy-loaded components, Vite HMR).
  // - Both persistentMultipleTabManager and persistentSingleTabManager trigger it.
  // - The bug is in Firestore's watch stream TargetState coordination with
  //   the IndexedDB persistence layer during concurrent unsubscribes.
  //
  // memoryLocalCache still provides:
  // - Instant re-renders from in-memory cache when navigating between pages
  // - Automatic background sync when server data changes
  // - No b815/ca9 assertion errors
  //
  // Trade-off: data reloads from server on each app open (acceptable for
  // a hospital with internet; ~200-500 records loads in <1s).
  db = initializeFirestore(app, {
    localCache: memoryLocalCache(),
  })
}

export { app, db, auth }

/** Lazy-load Firebase Auth to avoid crash without API key */
export async function getFirebaseAuth(): Promise<Auth | null> {
  if (!isFirebaseConfigured) return null
  if (auth) return auth
  const { getAuth } = await import('firebase/auth')
  auth = getAuth(app!)
  return auth
}

/**
 * Gracefully stop all Firestore network connections.
 * Call before signOut to prevent watch stream assertion errors
 * when multiple listeners are torn down simultaneously.
 */
export async function disableFirestoreNetwork(): Promise<void> {
  if (!db) return
  const { disableNetwork } = await import('firebase/firestore')
  await disableNetwork(db)
}

/**
 * Re-enable Firestore network after a previous disableFirestoreNetwork() call.
 */
export async function enableFirestoreNetwork(): Promise<void> {
  if (!db) return
  const { enableNetwork } = await import('firebase/firestore')
  await enableNetwork(db)
}
