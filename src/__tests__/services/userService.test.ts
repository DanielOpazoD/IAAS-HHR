import { describe, it, expect, beforeEach } from 'vitest'
import { getUserProfile, createUserProfile, updateUserRole, getAllUsers } from '@/services/userService'
import type { UserProfile } from '@/types/roles'

// Tests run in demo mode (no Firebase configured)

const mockUser: UserProfile = {
  uid: 'test-uid-1',
  email: 'test@hospital.cl',
  displayName: 'Test User',
  role: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
}

const mockUser2: UserProfile = {
  uid: 'test-uid-2',
  email: 'nurse@hospital.cl',
  displayName: 'Nurse User',
  role: 'pabellon',
  createdAt: '2026-02-01T00:00:00.000Z',
}

describe('userService (demo mode)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('createUserProfile', () => {
    it('creates a user profile in localStorage', async () => {
      await createUserProfile(mockUser)
      const users = await getAllUsers()
      expect(users).toHaveLength(1)
      expect(users[0].uid).toBe('test-uid-1')
      expect(users[0].email).toBe('test@hospital.cl')
    })

    it('can create multiple users', async () => {
      await createUserProfile(mockUser)
      await createUserProfile(mockUser2)
      const users = await getAllUsers()
      expect(users).toHaveLength(2)
    })
  })

  describe('getUserProfile', () => {
    it('returns null when user does not exist', async () => {
      const result = await getUserProfile('nonexistent')
      expect(result).toBeNull()
    })

    it('returns user profile when it exists', async () => {
      await createUserProfile(mockUser)
      const result = await getUserProfile('test-uid-1')
      expect(result).not.toBeNull()
      expect(result!.displayName).toBe('Test User')
      expect(result!.role).toBe('admin')
    })
  })

  describe('updateUserRole', () => {
    it('updates role of existing user', async () => {
      await createUserProfile(mockUser2)
      await updateUserRole('test-uid-2', 'matronas')

      const result = await getUserProfile('test-uid-2')
      expect(result!.role).toBe('matronas')
    })

    it('does nothing when user does not exist', async () => {
      // Should not throw
      await updateUserRole('nonexistent', 'admin')
      const users = await getAllUsers()
      expect(users).toHaveLength(0)
    })
  })

  describe('getAllUsers', () => {
    it('returns empty array when no users', async () => {
      const users = await getAllUsers()
      expect(users).toEqual([])
    })

    it('returns all created users', async () => {
      await createUserProfile(mockUser)
      await createUserProfile(mockUser2)

      const users = await getAllUsers()
      expect(users).toHaveLength(2)
      expect(users.map((u) => u.uid)).toContain('test-uid-1')
      expect(users.map((u) => u.uid)).toContain('test-uid-2')
    })
  })
})
