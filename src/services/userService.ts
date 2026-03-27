import { isFirebaseConfigured, db } from '@/config/firebase'
import type { UserProfile, UserRole } from '@/types/roles'

const LOCAL_KEY = 'iaas_users'

function loadLocalUsers(): UserProfile[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
  } catch {
    return []
  }
}

function saveLocalUsers(users: UserProfile[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(users))
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

export async function createUserProfile(profile: UserProfile): Promise<void> {
  if (!isFirebaseConfigured) {
    const users = loadLocalUsers()
    users.push(profile)
    saveLocalUsers(users)
    return
  }
  const { doc, setDoc } = await import('firebase/firestore')
  await setDoc(doc(db!, 'users', profile.uid), profile)
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
