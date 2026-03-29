#!/usr/bin/env node
/**
 * Sets the admin role for a user in Firestore.
 *
 * Usage:
 *   node scripts/set-admin.mjs <user-email>
 *
 * Requires:
 *   - firebase-admin (installed as dev dependency)
 *   - GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service account key,
 *     OR running on a machine with default credentials (e.g. after `gcloud auth application-default login`)
 *
 * Alternative (no service account needed):
 *   Go to Firebase Console → Firestore → users collection → find the document → set role to "admin"
 */

import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const email = process.argv[2]
if (!email) {
  console.error('Usage: node scripts/set-admin.mjs <user-email>')
  process.exit(1)
}

initializeApp({
  credential: applicationDefault(),
  projectId: 'iaas-hhr',
})

const db = getFirestore()

async function main() {
  // Find user by email
  const snap = await db.collection('users').where('email', '==', email).get()

  if (snap.empty) {
    console.error(`No user found with email: ${email}`)
    console.error('\nMake sure the user has logged in at least once.')
    console.error('Available users:')
    const all = await db.collection('users').get()
    all.forEach((doc) => {
      const d = doc.data()
      console.error(`  - ${d.email} (role: ${d.role ?? 'null'}) [uid: ${doc.id}]`)
    })
    process.exit(1)
  }

  const userDoc = snap.docs[0]
  const data = userDoc.data()
  console.log(`Found user: ${data.email} (current role: ${data.role ?? 'null'})`)

  await userDoc.ref.update({ role: 'admin' })
  console.log(`✅ Role updated to 'admin' for ${data.email}`)
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
