import { describe, it, expect } from 'vitest'
import { getErrorMessage } from '@/utils/errors'

describe('getErrorMessage', () => {
  it('extracts message from standard Error', () => {
    expect(getErrorMessage(new Error('something broke'))).toBe('something broke')
  })

  it('returns friendly Spanish message for known Firebase error codes', () => {
    const err = new Error('Permission denied')
    ;(err as unknown as { code: string }).code = 'permission-denied'
    expect(getErrorMessage(err)).toBe('No tienes permisos para esta acción')
  })

  it('falls back to code + message for unknown Firebase error codes', () => {
    const err = new Error('Something weird')
    ;(err as unknown as { code: string }).code = 'unknown-code'
    expect(getErrorMessage(err)).toBe('unknown-code: Something weird')
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
