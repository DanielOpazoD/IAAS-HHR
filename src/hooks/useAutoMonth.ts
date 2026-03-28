import { useEffect } from 'react'
import { getMesFromDate } from '@/utils/dates'
import type { Mes } from '@/utils/constants'

/**
 * Automatically derives 'mes' from a date field value.
 * Updates the form only when the derived month differs from the current one.
 *
 * @param dateValue - The date string (YYYY-MM-DD) to derive month from
 * @param currentMes - The current month value in the form
 * @param setMes - Setter function to update the month
 */
export function useAutoMonth(
  dateValue: string,
  currentMes: Mes | '',
  setMes: (mes: Mes) => void
): void {
  useEffect(() => {
    if (dateValue) {
      const mes = getMesFromDate(dateValue)
      if (mes && mes !== currentMes) setMes(mes)
    }
  }, [dateValue, currentMes, setMes])
}
