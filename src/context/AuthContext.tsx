import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from 'firebase/auth'
import { isFirebaseConfigured, getFirebaseAuth } from '@/config/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  isDemo: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const demoUser = {
  uid: 'demo',
  displayName: 'Enfermera IAAS (Demo)',
  email: 'demo@hospitalhhr.cl',
} as unknown as User

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(isFirebaseConfigured ? null : demoUser)
  const [loading, setLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    if (!isFirebaseConfigured) return

    let unsubscribe: (() => void) | undefined

    getFirebaseAuth().then(async (authInstance) => {
      if (!authInstance) return
      const { onAuthStateChanged } = await import('firebase/auth')
      unsubscribe = onAuthStateChanged(authInstance, (u) => {
        setUser(u)
        setLoading(false)
      })
    })

    return () => unsubscribe?.()
  }, [])

  const signIn = async () => {
    if (!isFirebaseConfigured) {
      setUser(demoUser)
      return
    }
    const authInstance = await getFirebaseAuth()
    if (!authInstance) return
    const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth')
    await signInWithPopup(authInstance, new GoogleAuthProvider())
  }

  const signOut = async () => {
    if (!isFirebaseConfigured) {
      setUser(null)
      return
    }
    const authInstance = await getFirebaseAuth()
    if (!authInstance) return
    const { signOut: fbSignOut } = await import('firebase/auth')
    await fbSignOut(authInstance)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, isDemo: !isFirebaseConfigured }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
