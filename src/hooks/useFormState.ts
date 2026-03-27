import { useState } from 'react'

/**
 * Generic form state hook. Replaces the repeated useState + set() pattern
 * found in all 5 form components.
 *
 * @param initial - Existing record (for editing) or undefined (for new)
 * @param defaults - Default values for a new empty form
 */
export function useFormState<T extends Record<string, unknown>>(
  initial: Partial<T> | undefined,
  defaults: T
) {
  const [form, setForm] = useState<T>(() => {
    if (!initial) return { ...defaults }
    return { ...defaults, ...initial }
  })

  /** Type-safe setter for individual fields */
  const set = <K extends keyof T>(key: K, value: T[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  /** Reset to defaults or initial values */
  const reset = () => setForm(initial ? { ...defaults, ...initial } : { ...defaults })

  return { form, setForm, set, reset }
}
