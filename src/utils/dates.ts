import { MESES } from './constants'

export function getMesFromDate(dateStr: string): string {
  if (!dateStr) return ''
  const month = new Date(dateStr).getMonth()
  return MESES[month]
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

export function calcDaysBetween(start: string, end: string): number | null {
  if (!start || !end) return null
  const d1 = new Date(start)
  const d2 = new Date(end)
  const diff = Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return diff > 0 ? diff : null
}
