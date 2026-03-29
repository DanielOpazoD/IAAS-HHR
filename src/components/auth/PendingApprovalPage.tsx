import { useAuth } from '@/context/AuthContext'

export default function PendingApprovalPage() {
  const { signOut, authError } = useAuth()

  // Network or permission error — different message than "pending approval"
  if (authError) {
    const isNetwork = authError === 'network'
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isNetwork ? 'bg-amber-100' : 'bg-red-100'}`}>
            <svg className={`w-8 h-8 ${isNetwork ? 'text-amber-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isNetwork ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 11-12.728 0M12 9v4m0 4h.01" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19H19a2 2 0 001.75-2.98L13.75 4.02a2 2 0 00-3.5 0L3.25 16.02A2 2 0 005.07 19z" />
              )}
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {isNetwork ? 'Error de conexion' : 'Error de permisos'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isNetwork
              ? 'No se pudo conectar con el servidor. Verifica tu conexion a internet e intenta nuevamente.'
              : 'No tienes permisos para acceder al sistema. Contacta al administrador del equipo IAAS.'}
          </p>
          <div className="flex gap-3 justify-center">
            {isNetwork && (
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Reintentar
              </button>
            )}
            <button
              onClick={signOut}
              className="px-6 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Legitimate pending approval (role === null, no error)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Cuenta pendiente de aprobacion</h2>
        <p className="text-gray-600 mb-6">
          Tu cuenta esta pendiente de aprobacion por el equipo IAAS. Contacta a tu administrador.
        </p>
        <button
          onClick={signOut}
          className="px-6 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
        >
          Cerrar sesion
        </button>
      </div>
    </div>
  )
}
