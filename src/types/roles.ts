export type UserRole = 'admin' | 'pabellon' | 'matronas'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  role: UserRole
  createdAt: string
}

/** Which collections each role can write to */
export const ROLE_PERMISSIONS: Record<UserRole, {
  canWrite: string[]
  label: string
}> = {
  admin: {
    canWrite: ['cirugias', 'partos', 'dip', 'arepi', 'registroIaas', 'consolidacion'],
    label: 'Enfermera IAAS (Admin)',
  },
  pabellon: {
    canWrite: ['cirugias', 'dip'],
    label: 'Enfermera Pabellon',
  },
  matronas: {
    canWrite: ['partos'],
    label: 'Matrona',
  },
}
