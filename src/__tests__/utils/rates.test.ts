import { describe, it, expect } from 'vitest'
import { calcTasaPor1000, calcTasaPorcentaje, getRateColor, getRateBgColor } from '@/utils/rates'

describe('calcTasaPor1000', () => {
  it('calculates rate per 1000', () => {
    expect(calcTasaPor1000(5, 500)).toBe(10)
    expect(calcTasaPor1000(1, 1000)).toBe(1)
  })

  it('returns 0 when denominator is 0', () => {
    expect(calcTasaPor1000(5, 0)).toBe(0)
  })

  it('returns 0 when numerator is 0', () => {
    expect(calcTasaPor1000(0, 500)).toBe(0)
  })
})

describe('calcTasaPorcentaje', () => {
  it('calculates percentage', () => {
    expect(calcTasaPorcentaje(1, 100)).toBe(1)
    expect(calcTasaPorcentaje(5, 50)).toBe(10)
  })

  it('returns 0 when denominator is 0', () => {
    expect(calcTasaPorcentaje(5, 0)).toBe(0)
  })
})

describe('getRateColor', () => {
  it('returns gray for zero rate', () => {
    expect(getRateColor(0, 5)).toBe('text-gray-500')
  })

  it('returns green when rate <= IRM', () => {
    expect(getRateColor(3, 5)).toBe('text-green-600')
    expect(getRateColor(5, 5)).toBe('text-green-600')
  })

  it('returns yellow when rate <= 1.5x IRM', () => {
    expect(getRateColor(6, 5)).toBe('text-yellow-600')
    expect(getRateColor(7.5, 5)).toBe('text-yellow-600')
  })

  it('returns red when rate > 1.5x IRM', () => {
    expect(getRateColor(8, 5)).toBe('text-red-600')
  })
})

describe('getRateBgColor', () => {
  it('returns correct bg classes matching rate thresholds', () => {
    expect(getRateBgColor(0, 5)).toBe('bg-gray-50')
    expect(getRateBgColor(3, 5)).toBe('bg-green-50')
    expect(getRateBgColor(6, 5)).toBe('bg-yellow-50')
    expect(getRateBgColor(8, 5)).toBe('bg-red-50')
  })
})
