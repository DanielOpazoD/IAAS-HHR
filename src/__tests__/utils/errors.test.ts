import { describe, it, expect } from 'vitest'
import { getErrorMessage } from '@/utils/errors'

describe('getErrorMessage', () => {
  it('extracts message from standard Error', () => {
    expect(getErrorMessage(new Error('something broke'))).toBe('something broke')
  })

  it('extracts code + message from Firebase-style errors', () => {
    const err = new Error('Permission denied')
    ;(err as unknown as { code: string }).code = 'permission-denied'
    expect(getErrorMessage(err)).toBe('permission-denied: Permission denied')
  })

  it('returns the string itself for string errors', () => {
    expect(getErrorMessage('plain string error')).toBe('plain string error')
  })

  it('returns fallback for unknown error types', () => {
    expect(getErrorMessage(42)).toBe('Error desconocido')
    expect(getErrorMessage(null)).toBe('Error desconocido')
    expect(getErrorMessage(undefined)).toBe('Error desconocido')
    expect(getErrorMessage({ foo: 'bar' })).toBe('Error desconocido')
  })
})
