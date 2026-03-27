import { MESES } from './constants'

/**
 * Derives the month name from a YYYY-MM-DD date string.
 * Parses the string directly to avoid timezone issues
 * (e.g., '2026-01-01' being interpreted as Dec 31 in UTC-3).
 */
export function getMesFromDate(dateStr: string): string {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  const monthIdx = parseInt(parts[1], 10) - 1
  return MESES[monthIdx] ?? ''
}

export function getCuatrimestre(mes: string): number {
  const idx = MESES.indexOf(mes as typeof MESES[number])
  if (idx < 4) return 1
  if (idx < 8) return 2
  return 3
}

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export function getCurrentYear(): number {
  return new Date().getFullYear()
}

/**
 * Calculates inclusive day count between two YYYY-MM-DD date strings.
 * Uses noon UTC to avoid DST edge cases in day calculations.
 */
export function calcDaysBetween(start: string, end: string): number | null {
  if (!start || !end) return null
  const d1 = new Date(start + 'T12:00:00')
  const d2 = new Date(end + 'T12:00:00')
  const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return diff > 0 ? diff : null
}
