import { useState, useCallback } from 'react'
import { formatRut, validateRut } from '@/utils/rut'

/**
 * Shared hook for RUT field management with real-time validation.
 * Eliminates duplicated RUT logic across all 5 form components.
 *
 * @param onSet - Callback to update the parent form state with formatted RUT
 * @returns { error, handleChange, validate } - Error message, change handler, and manual validation trigger
 *
 * @example
 * const { error: rutError, handleChange: handleRutChange, validate: validateRutField } = useRutField(
 *   (value) => set('rut', value)
 * )
 */
export function useRutField(onSet: (value: string) => void) {
  const [error, setError] = useState('')

  const handleChange = useCallback(
    (value: string) => {
      const formatted = formatRut(value)
      onSet(formatted)
      if (formatted.length >= 3) {
        setError(validateRut(formatted) ? '' : 'RUT inválido')
      } else {
        setError('')
      }
    },
    [onSet]
  )

  /** Validate current RUT value. Returns true if valid or empty. */
  const validate = useCallback((currentRut: string): boolean => {
    if (!currentRut) return true
    const valid = validateRut(currentRut)
    if (!valid) setError('RUT inválido')
    return valid
  }, [])

  return { error, handleChange, validate }
}
