import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore'
import { db } from '../config/firebase'

export async function getAll<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<(T & { id: string })[]> {
  const q = query(collection(db, collectionName), ...constraints)
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T & { id: string }))
}

export async function getById<T>(
  collectionName: string,
  id: string
): Promise<(T & { id: string }) | null> {
  const docRef = doc(db, collectionName, id)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() } as T & { id: string }
}

export async function create(
  collectionName: string,
  data: Record<string, any>
): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return docRef.id
}

export async function update(
  collectionName: string,
  id: string,
  data: Record<string, any>
): Promise<void> {
  const docRef = doc(db, collectionName, id)
  await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() })
}

export async function remove(collectionName: string, id: string): Promise<void> {
  const docRef = doc(db, collectionName, id)
  await deleteDoc(docRef)
}

export function subscribe<T>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: (T & { id: string })[]) => void
): () => void {
  const q = query(collection(db, collectionName), ...constraints)
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T & { id: string }))
    callback(data)
  })
}

export { where, orderBy, query, collection }
export type { QueryConstraint }
