import { APP_CONFIG } from '@/utils/constants'
import { useState, memo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useToastContext } from '@/context/ToastContext'
import { useCollection } from '@/hooks/useCollection'
import { useConsolidacionData } from '@/hooks/useConsolidacionData'
import { CirugiaTrazadora, PartoCesarea, DispositivoInvasivo } from '@/types'
import { MESES_POR_CUATRIMESTRE, INDICADORES_DIP, INDICADORES_AREPI, INDICADORES_CX_PARTOS } from '@/utils/constants'
import { calcTasaPor1000, calcTasaPorcentaje, getRateBgColor } from '@/utils/rates'
import { getErrorMessage } from '@/utils/errors'
import { exportConsolidacion } from '@/services/excel/consolidacionExport'

const TABS = [
  { id: 'dip', label: 'Vigilancia DIP', subtitle: 'Dispositivos Invasivos Permanentes', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
  { id: 'arepi', label: 'Vigilancia AREpi', subtitle: 'Agentes de Riesgo Epidémico', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z' },
  { id: 'cxPartos', label: 'Vigilancia Cx y Partos', subtitle: 'Cirugías Trazadoras y Partos', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
] as const

type TabId = typeof TABS[number]['id']

const RateTable = memo(function RateTable({
  indicadores,
  meses,
  getData,
  rateType,
}: {
  indicadores: readonly { id: string; nombre: string; irm: number }[]
  meses: string[]
  getData: (indId: string, mes: string) => { infecciones: number; denominador: number }
  rateType: 'por1000' | 'porcentaje'
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs table-fixed">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-3 py-2.5 text-left font-medium text-gray-600 w-8">N°</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600 w-[140px]">Indicador</th>
              <th className="px-3 py-2.5 text-left font-medium text-gray-600 w-20">Variable</th>
              {meses.map((m) => <th key={m} className="px-3 py-2.5 text-center font-medium text-gray-600 w-16">{m.slice(0, 3)}</th>)}
              <th className="px-3 py-2.5 text-center font-medium text-gray-600 w-16">Total</th>
              <th className="px-3 py-2.5 text-center font-medium text-gray-600 w-16">Tasa</th>
              <th className="px-3 py-2.5 text-center font-medium text-gray-600 w-14">IRM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {indicadores.map((ind, idx) => {
              const rows = ['infecciones', 'denominador', 'tasa']
              const labels = rateType === 'por1000'
                ? ['N° Infecciones', 'N° Días Exp.', 'Tasa x1000 días']
                : ['N° Infecciones', 'N° Proc. Vig.', 'Tasa %']

              let totalInf = 0, totalDen = 0
              const mesData = meses.map((mes) => {
                const d = getData(ind.id, mes)
                totalInf += d.infecciones
                totalDen += d.denominador
                return d
              })
              const totalTasa = rateType === 'por1000'
                ? calcTasaPor1000(totalInf, totalDen)
                : calcTasaPorcentaje(totalInf, totalDen)

              return rows.map((row, ri) => (
                <tr key={`${ind.id}-${row}`} className={ri === 0 ? 'border-t-2 border-gray-200' : ''}>
                  {ri === 0 && <td rowSpan={3} className="px-3 py-1.5 font-medium text-gray-900 align-top">{idx + 1}</td>}
                  {ri === 0 && <td rowSpan={3} className="px-3 py-1.5 text-gray-700 align-top text-[11px] w-[140px] break-words">{ind.nombre}</td>}
                  <td className="px-3 py-1 text-gray-500">{labels[ri]}</td>
                  {meses.map((mes, mi) => {
                    const d = mesData[mi]
                    const val = row === 'infecciones' ? d.infecciones
                      : row === 'denominador' ? d.denominador
                      : rateType === 'por1000' ? calcTasaPor1000(d.infecciones, d.denominador)
                      : calcTasaPorcentaje(d.infecciones, d.denominador)
                    return (
                      <td key={mes} className={`px-3 py-1 text-center ${row === 'tasa' ? getRateBgColor(val, ind.irm) : ''}`}>
                        {row === 'tasa' ? (val === 0 ? '0' : val.toFixed(2)) : val}
                      </td>
                    )
                  })}
                  <td className="px-3 py-1 text-center font-medium">
                    {row === 'infecciones' ? totalInf : row === 'denominador' ? totalDen : (totalTasa === 0 ? '0' : totalTasa.toFixed(2))}
                  </td>
                  <td className={`px-3 py-1 text-center font-bold ${row === 'tasa' ? getRateBgColor(totalTasa, ind.irm) : ''}`}>
                    {row === 'tasa' ? (totalTasa === 0 ? '0' : totalTasa.toFixed(2)) : ''}
                  </td>
                  {ri === 0 && <td rowSpan={3} className="px-3 py-1.5 text-center text-gray-500 align-middle">{ind.irm}</td>}
                </tr>
              ))
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
})

interface ConsolidacionPageProps {
  /** When rendered as an embedded tab, anio is passed as prop instead of outlet context */
  anio?: number
  /**
   * Pre-fetched data from a parent component (e.g. DashboardPage).
   * When provided, ConsolidacionPage skips its own subscriptions to avoid
   * duplicate Firestore listeners which cause internal assertion failures.
   */
  preloaded?: {
    cirugias: (CirugiaTrazadora & { id: string })[]
    partos: (PartoCesarea & { id: string })[]
    dip: (DispositivoInvasivo & { id: string })[]
  }
}

export default function ConsolidacionPage({ anio: propAnio, preloaded }: ConsolidacionPageProps = {}) {
  const ctx = useOutletContext<{ anio: number } | null>()
  const anio = propAnio ?? ctx?.anio ?? new Date().getFullYear()
  const [cuatrimestre, setCuatrimestre] = useState(1)
  const [activeTab, setActiveTab] = useState<TabId>('dip')
  const meses = MESES_POR_CUATRIMESTRE[cuatrimestre]

  // Only subscribe to collections not already provided by the parent.
  // This prevents duplicate Firestore subscriptions when embedded in DashboardPage.
  const { data: ownCirugias } = useCollection<CirugiaTrazadora>('cirugias', preloaded ? undefined : anio)
  const { data: ownPartos } = useCollection<PartoCesarea>('partos', preloaded ? undefined : anio)
  const { data: ownDip } = useCollection<DispositivoInvasivo>('dip', preloaded ? undefined : anio)

  const cirugias = preloaded?.cirugias ?? ownCirugias
  const partos = preloaded?.partos ?? ownPartos
  const dip = preloaded?.dip ?? ownDip

  const { getDipData, getArepiData, getCxPartosData } = useConsolidacionData(anio, cuatrimestre, cirugias, partos, dip)

  const { addToast } = useToastContext()

  const handleExport = () => {
    try {
      exportConsolidacion(anio, cuatrimestre, meses, getDipData, getArepiData, getCxPartosData)
      addToast('Consolidación exportada correctamente', 'success')
    } catch (err) {
      addToast(`Error al exportar: ${getErrorMessage(err)}`, 'error')
    }
  }

  const currentTab = TABS.find((t) => t.id === activeTab)!

  return (
    <div>
      {/* Header con controles — igual que antes */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Consolidación de Tasas</h2>
          <p className="text-sm text-gray-500">{APP_CONFIG.hospitalName} - {anio}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={cuatrimestre}
            onChange={(e) => setCuatrimestre(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value={1}>1° Cuatrimestre (Ene-Abr)</option>
            <option value={2}>2° Cuatrimestre (May-Ago)</option>
            <option value={3}>3° Cuatrimestre (Sep-Dic)</option>
          </select>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-5">
        <div className="flex border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-primary-700 bg-primary-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
              </svg>
              <span className="truncate">{tab.label}</span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab subtitle */}
        <div className="px-5 py-3 bg-stone-700 text-white flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={currentTab.icon} />
          </svg>
          <span className="text-sm font-medium">{currentTab.subtitle}</span>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'dip' && (
        <RateTable indicadores={INDICADORES_DIP} meses={meses} getData={getDipData} rateType="por1000" />
      )}
      {activeTab === 'arepi' && (
        <RateTable indicadores={INDICADORES_AREPI} meses={meses} getData={getArepiData} rateType="por1000" />
      )}
      {activeTab === 'cxPartos' && (
        <RateTable indicadores={INDICADORES_CX_PARTOS} meses={meses} getData={getCxPartosData} rateType="porcentaje" />
      )}
    </div>
  )
}
