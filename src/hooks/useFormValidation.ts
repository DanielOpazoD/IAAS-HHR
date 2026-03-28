import { useState, useCallback } from 'react'
import { z } from 'zod'

export function useFormValidation<T>(schema: z.ZodType<T>) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const validate = useCallback((data: unknown): data is T => {
    const result = schema.safeParse(data)
    if (result.success) {
      setFieldErrors({})
      return true
    }
    // Extract field errors from Zod v4
    const errors: Record<string, string> = {}
    const issues = result.error.issues
    for (const issue of issues) {
      const path = issue.path.join('.')
      if (path && !errors[path]) {
        errors[path] = issue.message
      }
    }
    setFieldErrors(errors)
    return false
  }, [schema])

  const clearErrors = useCallback(() => setFieldErrors({}), [])
  const getError = useCallback((field: string) => fieldErrors[field] || '', [fieldErrors])

  return { validate, fieldErrors, clearErrors, getError }
}
