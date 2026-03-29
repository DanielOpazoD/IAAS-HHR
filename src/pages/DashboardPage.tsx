import { useState, useMemo, lazy, Suspense } from 'react'
import { useOutletContext } from 'react-router-dom'
import Icon from '@/components/ui/Icon'
import { useCollection } from '@/hooks/useCollection'
import { useToastContext } from '@/context/ToastContext'
import { CirugiaTrazadora, PartoCesarea, DispositivoInvasivo, AgenteRiesgoEpidemico, RegistroIAAS } from '@/types'
import { MESES, MESES_CORTOS } from '@/utils/constants'
import { getErrorMessage } from '@/utils/errors'
import { exportFullWorkbook } from '@/services/excel/fullExport'

const ConsolidacionPage = lazy(() => import('@/pages/ConsolidacionPage'))

const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'consolidacion', label: 'Consolidación de Tasas' },
] as const
type TabId = typeof TABS[number]['id']

interface StatCardProps {
  label: string
  count: number
  icon: string
  accent: string
  /** Count for current month */
  currentMonth?: number
  /** Count for previous month */
  prevMonth?: number
}

function StatCard({ label, count, icon, accent, currentMonth, prevMonth }: StatCardProps) {
  const hasTrend = currentMonth !== undefined && prevMonth !== undefined
  const diff = hasTrend ? currentMonth - prevMonth : 0
  const isUp = diff > 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
          <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
          </svg>
        </div>
        <span className="text-3xl font-bold text-gray-800 tabular-nums">{count}</span>
      </div>
      <p className="text-xs text-gray-500 font-medium leading-tight mb-2">{label}</p>
      {hasTrend && (
        <div className="flex items-center gap-1.5 pt-2 border-t border-gray-50">
          {diff === 0 ? (
            <span className="text-xs text-gray-400">Sin cambios este mes</span>
          ) : (
            <>
              <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                isUp ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {isUp ? '▲' : '▼'} {Math.abs(diff)}
              </span>
              <span className="text-xs text-gray-400">vs mes anterior</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function MiniBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-8 text-right">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className="bg-primary-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-6">{value}</span>
    </div>
  )
}

function TabLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-32">
      <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function DashboardPage() {
  const { anio } = useOutletContext<{ anio: number }>()
  const [activeTab, setActiveTab] = useState<TabId>('resumen')

  const { data: cirugias } = useCollection<CirugiaTrazadora>('cirugias', anio)
  const { data: partos } = useCollection<PartoCesarea>('partos', anio)
  const { data: dip } = useCollection<DispositivoInvasivo>('dip', anio)
  const { data: arepi } = useCollection<AgenteRiesgoEpidemico>('arepi', anio)
  const { data: iaas } = useCollection<RegistroIAAS>('registroIaas', anio)

  const { ihoCount, iaasPartos, fallecidos, totalRegistros, monthlyData, maxMonthly, trends } = useMemo(() => {
    const iho = cirugias.filter((c) => c.iho === 'SI').length
    const iaasP = partos.filter((p) => p.signosSintomasIAAS === 'SI').length
    const fall = iaas.filter((r) => r.fallecido === 'SI').length
    const total = cirugias.length + partos.length + dip.length + arepi.length + iaas.length

    const monthly = MESES.map((mes, i) => ({
      label: MESES_CORTOS[i],
      value: cirugias.filter((c) => c.mes === mes).length
        + partos.filter((p) => p.mes === mes).length
        + dip.filter((d) => d.mes === mes).length,
    }))
    const maxM = Math.max(...monthly.map((m) => m.value), 1)

    // Trend: current month vs previous month counts per collection
    const now = new Date()
    const curMes = MESES[now.getMonth()]
    const prevMes = MESES[now.getMonth() === 0 ? 11 : now.getMonth() - 1]
    const trend = (arr: { mes?: string; fechaVE?: string }[]) => ({
      current: arr.filter((r) => r.mes === curMes).length,
      prev: arr.filter((r) => r.mes === prevMes).length,
    })
    // AREpi uses fechaVE (no mes field) — count by matching MESES index against date month
    const trendArepi = (arr: { fechaVE?: string }[]) => {
      const curIdx = now.getMonth()
      const prevIdx = now.getMonth() === 0 ? 11 : now.getMonth() - 1
      return {
        current: arr.filter((r) => r.fechaVE && new Date(r.fechaVE).getMonth() === curIdx).length,
        prev: arr.filter((r) => r.fechaVE && new Date(r.fechaVE).getMonth() === prevIdx).length,
      }
    }

    return {
      ihoCount: iho,
      iaasPartos: iaasP,
      fallecidos: fall,
      totalRegistros: total,
      monthlyData: monthly,
      maxMonthly: maxM,
      trends: {
        cirugias: trend(cirugias),
        partos: trend(partos),
        dip: trend(dip),
        arepi: trendArepi(arepi),
        iaas: trend(iaas),
      },
    }
  }, [cirugias, partos, dip, arepi, iaas])

  const { addToast } = useToastContext()

  const handleExportAll = () => {
    try {
      exportFullWorkbook({ cirugias, partos, dip, arepi, registroIaas: iaas }, anio)
      addToast(`Excel ${anio} exportado correctamente`, 'success')
    } catch (err) {
      addToast(`Error al exportar: ${getErrorMessage(err)}`, 'error')
    }
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vigilancia Epidemiológica</h2>
          <p className="text-sm text-gray-500 mt-0.5">Hospital Hanga Roa — {anio}</p>
        </div>
        {activeTab === 'resumen' && (
          <button
            onClick={handleExportAll}
            disabled={totalRegistros === 0}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="download" className="w-5 h-5" />
            Descargar Excel {anio}
          </button>
        )}
      </div>

      {/* Internal tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-primary-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'resumen' && (
            <div className="space-y-5">
              {/* Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard label="Cirugías Trazadoras" count={cirugias.length} icon="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" accent="bg-blue-50 text-blue-600" currentMonth={trends.cirugias.current} prevMonth={trends.cirugias.prev} />
                <StatCard label="Partos / Cesárea" count={partos.length} icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" accent="bg-pink-50 text-pink-600" currentMonth={trends.partos.current} prevMonth={trends.partos.prev} />
                <StatCard label="DIP" count={dip.length} icon="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" accent="bg-amber-50 text-amber-600" currentMonth={trends.dip.current} prevMonth={trends.dip.prev} />
                <StatCard label="AREpi" count={arepi.length} icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" accent="bg-purple-50 text-purple-600" currentMonth={trends.arepi.current} prevMonth={trends.arepi.prev} />
                <StatCard label="Registros IAAS" count={iaas.length} icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" accent="bg-teal-50 text-teal-600" currentMonth={trends.iaas.current} prevMonth={trends.iaas.prev} />
              </div>

              {/* Bottom section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Alertas */}
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Alertas</h3>
                  </div>
                  <div className="space-y-2">
                    {ihoCount > 0 && (
                      <div className="flex items-center gap-2.5 text-sm p-3 bg-red-50 rounded-xl text-red-700 font-medium">
                        <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold">{ihoCount}</span>
                        IHO en cirugías trazadoras
                      </div>
                    )}
                    {iaasPartos > 0 && (
                      <div className="flex items-center gap-2.5 text-sm p-3 bg-orange-50 rounded-xl text-orange-700 font-medium">
                        <span className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold">{iaasPartos}</span>
                        Signos/síntomas IAAS en partos
                      </div>
                    )}
                    {fallecidos > 0 && (
                      <div className="flex items-center gap-2.5 text-sm p-3 bg-red-50 rounded-xl text-red-800 font-medium">
                        <span className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center text-xs font-bold">{fallecidos}</span>
                        Fallecido(s) registrado(s)
                      </div>
                    )}
                    {ihoCount === 0 && iaasPartos === 0 && fallecidos === 0 && (
                      <div className="flex items-center gap-2.5 text-sm p-3 bg-green-50 rounded-xl text-green-700 font-medium">
                        <Icon name="check" className="w-5 h-5" />
                        Sin alertas activas
                      </div>
                    )}
                  </div>
                </div>

                {/* Registros por mes */}
                <div className="lg:col-span-2 bg-gray-50 rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                      <Icon name="chart" className="w-4 h-4 text-primary-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Registros por Mes</h3>
                  </div>
                  <div className="space-y-2">
                    {monthlyData.map((m) => (
                      <MiniBar key={m.label} label={m.label} value={m.value} max={maxMonthly} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'consolidacion' && (
            <Suspense fallback={<TabLoadingFallback />}>
              <ConsolidacionPage anio={anio} preloaded={{ cirugias, partos, dip }} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  )
}
