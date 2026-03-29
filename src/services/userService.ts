import { isFirebaseConfigured, db } from '@/config/firebase'
import { getLocalKey, loadLocal, saveLocal } from '@/utils/localStorage'
import type { UserProfile, UserRole } from '@/types/roles'

const LOCAL_KEY = getLocalKey('users')

function loadLocalUsers(): UserProfile[] {
  return loadLocal<UserProfile>(LOCAL_KEY) as UserProfile[]
}

function saveLocalUsers(users: UserProfile[]): void {
  saveLocal(LOCAL_KEY, users)
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured) {
    const users = loadLocalUsers()
    return users.find((u) => u.uid === uid) ?? null
  }
  const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(db!, 'users', uid))
  if (!snap.exists()) return null
  return snap.data() as UserProfile
}

/**
 * Check if the admin bootstrap marker exists.
 * If it doesn't, the first user to register becomes admin.
 */
async function isAdminBootstrapped(): Promise<boolean> {
  if (!isFirebaseConfigured) return false
  const { doc, getDoc } = await import('firebase/firestore')
  const snap = await getDoc(doc(db!, 'meta', 'adminBootstrapped'))
  return snap.exists()
}

/**
 * Mark the admin as bootstrapped so no future users can self-assign admin.
 */
async function markAdminBootstrapped(uid: string): Promise<void> {
  if (!isFirebaseConfigured) return
  const { doc, setDoc } = await import('firebase/firestore')
  await setDoc(doc(db!, 'meta', 'adminBootstrapped'), {
    uid,
    bootstrappedAt: new Date().toISOString(),
  })
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  if (!isFirebaseConfigured) {
    const users = loadLocalUsers()
    users.push(profile)
    saveLocalUsers(users)
    return
  }

  // Bootstrap: if no admin exists yet, make this user the admin
  const bootstrapped = await isAdminBootstrapped()
  if (!bootstrapped) {
    console.info('[Auth] No admin exists yet — bootstrapping first user as admin:', profile.email)
    profile = { ...profile, role: 'admin' as UserRole }
  }

  const { doc, setDoc } = await import('firebase/firestore')
  await setDoc(doc(db!, 'users', profile.uid), profile)

  // If we just bootstrapped, mark it so future users don't get auto-admin
  if (!bootstrapped) {
    try {
      await markAdminBootstrapped(profile.uid)
    } catch (err) {
      console.warn('[Auth] Failed to mark admin bootstrapped (non-critical):', err)
    }
  }
}

/**
 * Try to bootstrap an existing user as admin (if no admin exists yet).
 * Returns true if the user was promoted to admin.
 */
export async function tryBootstrapAdmin(uid: string): Promise<boolean> {
  if (!isFirebaseConfigured) return false
  const bootstrapped = await isAdminBootstrapped()
  if (bootstrapped) return false

  console.info('[Auth] No admin exists yet — promoting existing user to admin')
  const { doc, updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db!, 'users', uid), { role: 'admin' })
  try {
    await markAdminBootstrapped(uid)
  } catch (err) {
    console.warn('[Auth] Failed to mark admin bootstrapped (non-critical):', err)
  }
  return true
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
  if (!isFirebaseConfigured) {
    const users = loadLocalUsers()
    const idx = users.findIndex((u) => u.uid === uid)
    if (idx !== -1) {
      users[idx].role = role
      saveLocalUsers(users)
    }
    return
  }
  const { doc, updateDoc } = await import('firebase/firestore')
  await updateDoc(doc(db!, 'users', uid), { role })
}

export async function getAllUsers(): Promise<UserProfile[]> {
  if (!isFirebaseConfigured) {
    return loadLocalUsers()
  }
  const { collection, getDocs } = await import('firebase/firestore')
  const snap = await getDocs(collection(db!, 'users'))
  return snap.docs.map((d) => d.data() as UserProfile)
}

// ---------------------------------------------------------------------------
// Invitations (pre-authorized users)
// ---------------------------------------------------------------------------

export interface Invitation {
  email: string
  role: UserRole
  displayName: string
  invitedAt: string
  invitedBy: string
}

export async function getInvitationByEmail(email: string): Promise<Invitation | null> {
  if (!isFirebaseConfigured) return null
  const { collection, query, where, getDocs } = await import('firebase/firestore')
  const snap = await getDocs(query(collection(db!, 'invitations'), where('email', '==', email)))
  if (snap.empty) return null
  return snap.docs[0].data() as Invitation
}

export async function createInvitation(invitation: Invitation): Promise<void> {
  if (!isFirebaseConfigured) return
  const { collection, addDoc } = await import('firebase/firestore')
  await addDoc(collection(db!, 'invitations'), invitation)
}

export async function deleteInvitationByEmail(email: string): Promise<void> {
  if (!isFirebaseConfigured) return
  const { collection, query, where, getDocs, deleteDoc } = await import('firebase/firestore')
  const snap = await getDocs(query(collection(db!, 'invitations'), where('email', '==', email)))
  for (const d of snap.docs) {
    await deleteDoc(d.ref)
  }
}

export async function getAllInvitations(): Promise<Invitation[]> {
  if (!isFirebaseConfigured) return []
  const { collection, getDocs } = await import('firebase/firestore')
  const snap = await getDocs(collection(db!, 'invitations'))
  return snap.docs.map((d) => d.data() as Invitation)
}
