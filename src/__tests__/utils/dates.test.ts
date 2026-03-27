import { describe, it, expect } from 'vitest'
import { getMesFromDate, getCuatrimestre, formatDateDisplay, getCurrentYear, calcDaysBetween } from '@/utils/dates'

describe('getMesFromDate', () => {
  it('returns correct month name for valid date', () => {
    expect(getMesFromDate('2026-01-15')).toBe('Enero')
    expect(getMesFromDate('2026-06-15')).toBe('Junio')
    expect(getMesFromDate('2026-12-15')).toBe('Diciembre')
  })

  it('returns empty string for empty input', () => {
    expect(getMesFromDate('')).toBe('')
  })
})

describe('getCuatrimestre', () => {
  it('returns 1 for Ene-Abr', () => {
    expect(getCuatrimestre('Enero')).toBe(1)
    expect(getCuatrimestre('Febrero')).toBe(1)
    expect(getCuatrimestre('Marzo')).toBe(1)
    expect(getCuatrimestre('Abril')).toBe(1)
  })

  it('returns 2 for May-Ago', () => {
    expect(getCuatrimestre('Mayo')).toBe(2)
    expect(getCuatrimestre('Agosto')).toBe(2)
  })

  it('returns 3 for Sep-Dic', () => {
    expect(getCuatrimestre('Septiembre')).toBe(3)
    expect(getCuatrimestre('Diciembre')).toBe(3)
  })
})

describe('formatDateDisplay', () => {
  it('converts ISO to DD/MM/YYYY', () => {
    expect(formatDateDisplay('2026-03-15')).toBe('15/03/2026')
  })

  it('returns empty for empty input', () => {
    expect(formatDateDisplay('')).toBe('')
  })
})

describe('getCurrentYear', () => {
  it('returns a four-digit year', () => {
    const year = getCurrentYear()
    expect(year).toBeGreaterThanOrEqual(2024)
    expect(year).toBeLessThanOrEqual(2100)
  })
})

describe('calcDaysBetween', () => {
  it('calculates days inclusive', () => {
    expect(calcDaysBetween('2026-01-01', '2026-01-01')).toBe(1)
    expect(calcDaysBetween('2026-01-01', '2026-01-10')).toBe(10)
    expect(calcDaysBetween('2026-01-01', '2026-01-31')).toBe(31)
  })

  it('returns null for empty inputs', () => {
    expect(calcDaysBetween('', '2026-01-10')).toBeNull()
    expect(calcDaysBetween('2026-01-01', '')).toBeNull()
  })

  it('returns null for negative range', () => {
    expect(calcDaysBetween('2026-01-10', '2026-01-01')).toBeNull()
  })
})
