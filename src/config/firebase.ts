import { initializeApp, FirebaseApp } from 'firebase/app'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, Firestore } from 'firebase/firestore'
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
  // Enable IndexedDB persistence for offline-first / stale-while-revalidate:
  // - onSnapshot fires immediately with cached data (instant UI)
  // - then fires again when server data arrives (background sync)
  // - works fully offline (critical for remote island hospital)
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
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
