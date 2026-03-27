import { describe, it, expect } from 'vitest'
import { formatRut, validateRut, cleanRut } from '@/utils/rut'

describe('formatRut', () => {
  it('formats a valid RUT with dots and dash', () => {
    expect(formatRut('171234567')).toBe('17.123.456-7')
    expect(formatRut('12345678K')).toBe('12.345.678-K')
  })

  it('handles already formatted input', () => {
    expect(formatRut('17.123.456-7')).toBe('17.123.456-7')
  })

  it('converts k to uppercase', () => {
    expect(formatRut('12345678k')).toBe('12.345.678-K')
  })

  it('handles short input', () => {
    expect(formatRut('1')).toBe('1')
    expect(formatRut('')).toBe('')
  })
})

describe('validateRut', () => {
  it('validates correct RUTs', () => {
    expect(validateRut('17.312.473-2')).toBe(true)
    expect(validateRut('15.890.442-K')).toBe(true)
    expect(validateRut('11.111.111-1')).toBe(true)
  })

  it('rejects invalid RUTs', () => {
    expect(validateRut('17.312.473-0')).toBe(false)
    expect(validateRut('12.345.678-0')).toBe(false)
  })

  it('rejects too short input', () => {
    expect(validateRut('1')).toBe(false)
    expect(validateRut('')).toBe(false)
  })
})

describe('cleanRut', () => {
  it('removes dots and dashes', () => {
    expect(cleanRut('17.312.473-2')).toBe('173124732')
    expect(cleanRut('15.890.442-K')).toBe('15890442K')
  })

  it('converts k to uppercase', () => {
    expect(cleanRut('15890442k')).toBe('15890442K')
  })
})
