import { useOutletContext } from 'react-router-dom'
import { useCollection } from '../hooks/useCollection'
import { CirugiaTrazadora, PartoCesarea, DispositivoInvasivo, AgenteRiesgoEpidemico, RegistroIAAS } from '../types'

function StatCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{count}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { anio } = useOutletContext<{ anio: number }>()
  const { data: cirugias } = useCollection<CirugiaTrazadora>('cirugias', anio)
  const { data: partos } = useCollection<PartoCesarea>('partos', anio)
  const { data: dip } = useCollection<DispositivoInvasivo>('dip', anio)
  const { data: arepi } = useCollection<AgenteRiesgoEpidemico>('arepi', anio)
  const { data: iaas } = useCollection<RegistroIAAS>('registroIaas', anio)

  const ihoCount = cirugias.filter((c) => c.iho === 'SI').length
  const iaasPartos = partos.filter((p) => p.signosSintomasIAAS === 'SI').length

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Dashboard</h2>
      <p className="text-sm text-gray-500 mb-6">Resumen de vigilancia epidemiológica IAAS - {anio}</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Cirugías Trazadoras" count={cirugias.length} color="text-primary-700" />
        <StatCard label="Partos / Cesárea" count={partos.length} color="text-primary-700" />
        <StatCard label="DIP" count={dip.length} color="text-primary-700" />
        <StatCard label="AREpi" count={arepi.length} color="text-primary-700" />
        <StatCard label="Registros IAAS" count={iaas.length} color="text-primary-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-medium text-gray-900 mb-3">Alertas</h3>
          <div className="space-y-2">
            {ihoCount > 0 && (
              <div className="flex items-center gap-2 text-sm p-2 bg-red-50 rounded-lg text-red-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {ihoCount} IHO detectada(s) en cirugías trazadoras
              </div>
            )}
            {iaasPartos > 0 && (
              <div className="flex items-center gap-2 text-sm p-2 bg-red-50 rounded-lg text-red-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {iaasPartos} signos/síntomas IAAS en partos
              </div>
            )}
            {iaas.filter((r) => r.fallecido === 'SI').length > 0 && (
              <div className="flex items-center gap-2 text-sm p-2 bg-red-50 rounded-lg text-red-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {iaas.filter((r) => r.fallecido === 'SI').length} fallecido(s) registrado(s)
              </div>
            )}
            {ihoCount === 0 && iaasPartos === 0 && iaas.filter((r) => r.fallecido === 'SI').length === 0 && (
              <p className="text-sm text-green-600 p-2 bg-green-50 rounded-lg">Sin alertas activas</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-medium text-gray-900 mb-3">Registros por Mes</h3>
          <div className="space-y-1.5 text-sm">
            {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((mes) => {
              const total = cirugias.filter((c) => c.mes === mes).length + partos.filter((p) => p.mes === mes).length + dip.filter((d) => d.mes === mes).length
              if (total === 0) return null
              return (
                <div key={mes} className="flex justify-between">
                  <span className="text-gray-600">{mes}</span>
                  <span className="font-medium">{total} registros</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
