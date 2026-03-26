import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

export const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'fake',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-iaas',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000:web:000',
}

let app: any = null
let db: any = null
let auth: any = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
}

export { app, db, auth }

export async function getFirebaseAuth() {
  if (!isFirebaseConfigured) return null
  if (auth) return auth
  const { getAuth } = await import('firebase/auth')
  auth = getAuth(app)
  return auth
}
