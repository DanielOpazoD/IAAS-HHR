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
  Firestore,
} from 'firebase/firestore'
import { db } from '@/config/firebase'

/** Asserts that Firestore is initialized (only called in Firebase mode) */
function getDb(): Firestore {
  if (!db) throw new Error('Firestore not initialized. Check Firebase configuration.')
  return db
}

/** Fetches all documents from a Firestore collection, optionally filtered by query constraints. */
export async function getAll<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<(T & { id: string })[]> {
  const q = query(collection(getDb(), collectionName), ...constraints)
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T & { id: string }))
}

/** Fetches a single document by ID. Returns null if not found. */
export async function getById<T>(
  collectionName: string,
  id: string
): Promise<(T & { id: string }) | null> {
  const docRef = doc(getDb(), collectionName, id)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() } as T & { id: string }
}

/** Creates a new document with automatic createdAt/updatedAt timestamps. Returns the new document ID. */
export async function create<T extends Record<string, unknown>>(
  collectionName: string,
  data: T
): Promise<string> {
  const docRef = await addDoc(collection(getDb(), collectionName), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return docRef.id
}

/** Updates an existing document. Automatically sets updatedAt timestamp. */
export async function update<T extends Record<string, unknown>>(
  collectionName: string,
  id: string,
  data: Partial<T>
): Promise<void> {
  const docRef = doc(getDb(), collectionName, id)
  await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() })
}

/** Permanently deletes a document by ID. */
export async function remove(collectionName: string, id: string): Promise<void> {
  const docRef = doc(getDb(), collectionName, id)
  await deleteDoc(docRef)
}

/**
 * Subscribes to real-time updates on a Firestore collection.
 * Returns an unsubscribe function to stop listening.
 *
 * @param collectionName - Firestore collection path
 * @param constraints - Query filters (where, orderBy, etc.)
 * @param callback - Called with updated data on each snapshot
 * @param onError - Error handler; defaults to console.error if not provided
 */
export function subscribe<T>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: (T & { id: string })[]) => void,
  onError: (error: Error) => void = (err) => console.error(`[Firestore] ${collectionName}:`, err)
): () => void {
  const q = query(collection(getDb(), collectionName), ...constraints)
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T & { id: string }))
      callback(data)
    },
    onError
  )
}

export { where, orderBy, query, collection }
export type { QueryConstraint }
