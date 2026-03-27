import { useEffect, useMemo } from 'react'

/**
 * Notifies the parent component when form values relevant to
 * duplicate detection change (rut, mes).
 *
 * Eliminates the repeated useEffect pattern across all 5 form components.
 */
export function useFormChangeNotify(
  values: { rut?: string; mes?: string },
  onFormChange?: (values: { rut?: string; mes?: string }) => void
): void {
  // Stable reference: only changes when rut or mes actually change
  const stableValues = useMemo(
    () => ({ rut: values.rut, mes: values.mes }),
    [values.rut, values.mes]
  )

  useEffect(() => {
    onFormChange?.(stableValues)
  }, [stableValues, onFormChange])
}
