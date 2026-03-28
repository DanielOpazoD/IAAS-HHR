export type UserRole = 'admin' | 'pabellon' | 'matronas'

/** Valid collection names used throughout the app */
export type CollectionName = 'cirugias' | 'partos' | 'dip' | 'arepi' | 'registroIaas' | 'consolidacion'

/** Shape of a sidebar navigation item */
export interface NavItem {
  to: string
  label: string
  icon: string
  collection: CollectionName | undefined
}

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  role: UserRole
  createdAt: string
}

/**
 * Returns true if the given role has write access to the collection.
 * Centralizes the permission check to avoid repeated type assertions.
 */
export function canWriteCollection(role: UserRole, collection: string): boolean {
  return ROLE_PERMISSIONS[role].canWrite.includes(collection as CollectionName)
}

/**
 * Returns true if the role is 'admin'.
 * Centralizes the admin check to avoid inline string comparisons throughout the app.
 */
export function isAdminRole(role: UserRole | null | undefined): boolean {
  return role === 'admin'
}

/** Which collections each role can read/write */
export const ROLE_PERMISSIONS: Record<UserRole, {
  canWrite: CollectionName[]
  canRead: CollectionName[]
  label: string
}> = {
  admin: {
    canWrite: ['cirugias', 'partos', 'dip', 'arepi', 'registroIaas', 'consolidacion'],
    canRead: ['cirugias', 'partos', 'dip', 'arepi', 'registroIaas', 'consolidacion'],
    label: 'Enfermera IAAS (Admin)',
  },
  pabellon: {
    canWrite: ['cirugias', 'dip'],
    canRead: ['cirugias', 'dip'],
    label: 'Enfermera Pabellon',
  },
  matronas: {
    canWrite: ['partos'],
    canRead: ['partos'],
    label: 'Matrona',
  },
}
