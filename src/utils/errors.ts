/**
 * Map of common Firebase error codes to user-friendly Spanish messages.
 */
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'permission-denied': 'No tienes permisos para esta acción',
  'unavailable': 'El servidor no está disponible. Verifica tu conexión a internet',
  'not-found': 'El registro no fue encontrado',
  'already-exists': 'Ya existe un registro con estos datos',
  'resource-exhausted': 'Se excedió el límite de solicitudes. Intenta de nuevo en unos minutos',
  'unauthenticated': 'Tu sesión expiró. Por favor inicia sesión nuevamente',
  'cancelled': 'La operación fue cancelada',
  'deadline-exceeded': 'La operación tardó demasiado. Intenta de nuevo',
  'data-loss': 'Se detectó pérdida de datos. Contacta al administrador',
  'internal': 'Error interno del servidor. Intenta de nuevo más tarde',
  'invalid-argument': 'Los datos enviados no son válidos',
  'failed-precondition': 'No se puede realizar esta operación en el estado actual',
  'out-of-range': 'Valor fuera de rango permitido',
  'unimplemented': 'Esta función aún no está disponible',
  'auth/user-not-found': 'Usuario no encontrado',
  'auth/wrong-password': 'Contraseña incorrecta',
  'auth/too-many-requests': 'Demasiados intentos. Intenta de nuevo más tarde',
  'auth/network-request-failed': 'Error de red. Verifica tu conexión a internet',
  'auth/popup-closed-by-user': 'Se cerró la ventana de inicio de sesión',
}

/**
 * Utility for consistent error message extraction across the app.
 * Handles Firebase errors, standard errors, and unknown error types.
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    // Firebase errors have a 'code' property
    if ('code' in err) {
      const code = (err as { code: string }).code
      const friendly = FIREBASE_ERROR_MESSAGES[code]
      if (friendly) return friendly
      return `${code}: ${err.message}`
    }
    return err.message
  }
  if (typeof err === 'string') return err
  return 'Error desconocido'
}
