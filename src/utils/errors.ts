/**
 * Utility for consistent error message extraction across the app.
 * Handles Firebase errors, standard errors, and unknown error types.
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    // Firebase errors have a 'code' property
    if ('code' in err) {
      const code = (err as { code: string }).code
      return `${code}: ${err.message}`
    }
    return err.message
  }
  if (typeof err === 'string') return err
  return 'Error desconocido'
}
