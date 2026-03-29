/* eslint-disable react-refresh/only-export-components -- Provider + hook is a standard React pattern */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from 'firebase/auth'
import { isFirebaseConfigured, getFirebaseAuth } from '@/config/firebase'
import type { UserRole } from '@/types/roles'
import { canWriteCollection } from '@/types/roles'
import * as userService from '@/services/userService'

interface AuthContextType {
  user: User | null
  loading: boolean
  roleLoading: boolean
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
  const [roleLoading, setRoleLoading] = useState(isFirebaseConfigured)
  const [role, setRole] = useState<UserRole | null>(isFirebaseConfigured ? null : 'admin')

  useEffect(() => {
    if (!isFirebaseConfigured) return

    let unsubscribe: (() => void) | undefined

    getFirebaseAuth().then(async (authInstance) => {
      if (!authInstance) return
      const { onAuthStateChanged } = await import('firebase/auth')
      unsubscribe = onAuthStateChanged(authInstance, async (u) => {
        setUser(u)
        setRoleLoading(true)
        if (u) {
          try {
            let profile = await userService.getUserProfile(u.uid)
            if (!profile) {
              // Check if this email was pre-authorized via invitation
              const invitation = await userService.getInvitationByEmail(u.email ?? '')
              const assignedRole = invitation?.role ?? null

              // First login: create profile (bootstrap or invitation may assign role)
              profile = {
                uid: u.uid,
                email: u.email ?? '',
                displayName: u.displayName ?? '',
                role: (assignedRole ?? null) as unknown as UserRole,
                createdAt: new Date().toISOString(),
              }
              await userService.createUserProfile(profile)
              // Re-read in case bootstrap assigned admin role
              profile = await userService.getUserProfile(u.uid) ?? profile

              // Clean up the invitation if it was used
              if (invitation) {
                try { await userService.deleteInvitationByEmail(u.email ?? '') } catch { /* non-critical */ }
              }
            } else if (!profile.role) {
              // Profile exists but has no role — try bootstrap (first admin)
              const bootstrapped = await userService.tryBootstrapAdmin(u.uid)
              if (bootstrapped) {
                profile = { ...profile, role: 'admin' as UserRole }
              }
            }
            console.info('[Auth] Profile loaded:', { uid: u.uid, role: profile.role, email: profile.email })
            setRole(profile.role)
          } catch (err) {
            console.error('[Auth] Failed to load/create profile:', err)
            setRole(null)
          }
        } else {
          setRole(null)
        }
        setLoading(false)
        setRoleLoading(false)
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
    return canWriteCollection(role, collection)
  }

  return (
    <AuthContext.Provider value={{ user, loading, roleLoading, signIn, signOut, isDemo: !isFirebaseConfigured, role, canWrite }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
