import { APP_CONFIG } from '@/utils/constants'

export default function DocumentosIaasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Documentos IAAS</h2>
        <p className="text-sm text-gray-500 mt-0.5">{APP_CONFIG.hospitalName}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
        <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
        </div>
        <p className="text-gray-700 font-semibold mb-1">Módulo en desarrollo</p>
        <p className="text-sm text-gray-400 max-w-xs mx-auto">
          Próximamente: protocolos, circulares, normativas y documentos del programa IAAS.
        </p>
      </div>
    </div>
  )
}
