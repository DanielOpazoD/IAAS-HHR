/* eslint-disable react-refresh/only-export-components -- Provider + hook is a standard React pattern */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from 'firebase/auth'
import { isFirebaseConfigured, getFirebaseAuth } from '@/config/firebase'
import type { UserRole } from '@/types/roles'
import { ROLE_PERMISSIONS } from '@/types/roles'
import * as userService from '@/services/userService'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  isDemo: boolean
  role: UserRole | null
  canWrite: (collection: string) => boolean
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
  const [role, setRole] = useState<UserRole | null>(isFirebaseConfigured ? null : 'admin')

  useEffect(() => {
    if (!isFirebaseConfigured) return

    let unsubscribe: (() => void) | undefined

    getFirebaseAuth().then(async (authInstance) => {
      if (!authInstance) return
      const { onAuthStateChanged } = await import('firebase/auth')
      unsubscribe = onAuthStateChanged(authInstance, async (u) => {
        setUser(u)
        if (u) {
          try {
            let profile = await userService.getUserProfile(u.uid)
            if (!profile) {
              // First login: create as admin
              profile = {
                uid: u.uid,
                email: u.email ?? '',
                displayName: u.displayName ?? '',
                role: 'admin',
                createdAt: new Date().toISOString(),
              }
              await userService.createUserProfile(profile)
            }
            setRole(profile.role)
          } catch {
            setRole(null)
          }
        } else {
          setRole(null)
        }
        setLoading(false)
      })
    })

    return () => unsubscribe?.()
  }, [])

  const signIn = async () => {
    if (!isFirebaseConfigured) {
      setUser(demoUser)
      setRole('admin')
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
      setRole(null)
      return
    }
    const authInstance = await getFirebaseAuth()
    if (!authInstance) return
    const { signOut: fbSignOut } = await import('firebase/auth')
    await fbSignOut(authInstance)
  }

  const canWrite = (collection: string): boolean => {
    if (!role) return false
    return ROLE_PERMISSIONS[role].canWrite.includes(collection)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, isDemo: !isFirebaseConfigured, role, canWrite }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
