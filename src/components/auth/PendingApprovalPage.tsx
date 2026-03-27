import { useAuth } from '@/context/AuthContext'

export default function PendingApprovalPage() {
  const { signOut } = useAuth()

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
          Tu cuenta esta pendiente de aprobacion por la enfermera IAAS. Contacta a tu administrador.
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
