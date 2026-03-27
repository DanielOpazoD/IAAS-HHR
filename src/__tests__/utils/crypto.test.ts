import { describe, it, expect } from 'vitest'
import { hashPin } from '@/utils/crypto'

describe('hashPin', () => {
  it('returns a 64-character hex string', async () => {
    const result = await hashPin('1234')
    expect(result).toHaveLength(64)
    expect(/^[0-9a-f]+$/.test(result)).toBe(true)
  })

  it('returns consistent hash for same input', async () => {
    const a = await hashPin('5678')
    const b = await hashPin('5678')
    expect(a).toBe(b)
  })

  it('returns different hashes for different inputs', async () => {
    const a = await hashPin('1234')
    const b = await hashPin('5678')
    expect(a).not.toBe(b)
  })

  it('handles long PINs', async () => {
    const result = await hashPin('12345678')
    expect(result).toHaveLength(64)
  })
})
