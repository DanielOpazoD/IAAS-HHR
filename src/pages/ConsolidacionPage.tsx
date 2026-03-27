import { useState, useMemo, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useCollection } from '@/hooks/useCollection'
import { useToastContext } from '@/context/ToastContext'
import { CirugiaTrazadora, PartoCesarea, DispositivoInvasivo, DatosConsolidacion } from '@/types'
import { MESES_POR_CUATRIMESTRE, INDICADORES_DIP, INDICADORES_AREPI, INDICADORES_CX_PARTOS } from '@/utils/constants'
import { calcTasaPor1000, calcTasaPorcentaje, getRateBgColor } from '@/utils/rates'
import { exportConsolidacion } from '@/services/excel/consolidacionExport'

function RateTable({
  title,
  indicadores,
  meses,
  getData,
  rateType,
}: {
  title: string
  indicadores: readonly { id: string; nombre: string; irm: number }[]
  meses: string[]
  getData: (indId: string, mes: string) => { infecciones: number; denominador: number }
  rateType: 'por1000' | 'porcentaje'
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
      <div className="px-5 py-3 bg-primary-800 text-white font-medium text-sm">{title}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-3 py-2 text-left font-medium text-gray-600 w-8">N°</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">Indicador</th>
              <th className="px-3 py-2 text-left font-medium text-gray-600 w-20">Variable</th>
              {meses.map((m) => <th key={m} className="px-3 py-2 text-center font-medium text-gray-600 w-16">{m.slice(0, 3)}</th>)}
              <th className="px-3 py-2 text-center font-medium text-gray-600 w-16">Total</th>
              <th className="px-3 py-2 text-center font-medium text-gray-600 w-16">Tasa</th>
              <th className="px-3 py-2 text-center font-medium text-gray-600 w-14">IRM</th>
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
                  {ri === 0 && <td rowSpan={3} className="px-3 py-1.5 text-gray-700 align-top text-[11px]">{ind.nombre}</td>}
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
}

export default function ConsolidacionPage() {
  const { anio } = useOutletContext<{ anio: number }>()
  const [cuatrimestre, setCuatrimestre] = useState(1)
  const meses = MESES_POR_CUATRIMESTRE[cuatrimestre]

  const { data: cirugias } = useCollection<CirugiaTrazadora>('cirugias', anio)
  const { data: partos } = useCollection<PartoCesarea>('partos', anio)
  const { data: dip } = useCollection<DispositivoInvasivo>('dip', anio)
  const { data: consolidacion } = useCollection<DatosConsolidacion>('consolidacion', anio)

  const manualData = useMemo(
    () => consolidacion.find((c) => c.cuatrimestre === cuatrimestre),
    [consolidacion, cuatrimestre]
  )

  const getDipData = useCallback((indId: string, mes: string) => {
    const manual = manualData?.dipData?.[indId]?.[mes]
    if (manual) return { infecciones: manual.infecciones, denominador: manual.diasExposicion }

    const tipoDIP = indId.startsWith('its_') ? 'CVC' :
                    indId.startsWith('navm_') ? 'VMI' : 'CUP'
    const mesDip = dip.filter((d) => d.mes === mes && d.tipoDIP === tipoDIP)
    return {
      infecciones: 0,
      denominador: mesDip.reduce((sum, d) => sum + (d.totalDias || 0), 0),
    }
  }, [manualData, dip])

  const getArepiData = useCallback((indId: string, mes: string) => {
    const manual = manualData?.arepiData?.[indId]?.[mes]
    if (manual) return { infecciones: manual.infecciones, denominador: manual.diasExposicion }
    return { infecciones: 0, denominador: 0 }
  }, [manualData])

  const getCxPartosData = useCallback((indId: string, mes: string) => {
    const manual = manualData?.cxPartosData?.[indId]?.[mes]
    if (manual) return { infecciones: manual.infecciones, denominador: manual.procedimientosVigilados }

    if (indId === 'iho_cole_laparoscopica') {
      const cx = cirugias.filter((c) => c.mes === mes && c.tipoCirugia === 'Colecistectomía Laparoscópica')
      return { infecciones: cx.filter((c) => c.iho === 'SI').length, denominador: cx.length }
    }
    if (indId === 'iho_cole_laparotomica') {
      const cx = cirugias.filter((c) => c.mes === mes && c.tipoCirugia === 'Colecistectomía Laparotómica')
      return { infecciones: cx.filter((c) => c.iho === 'SI').length, denominador: cx.length }
    }
    if (indId === 'iho_hernia') {
      const cx = cirugias.filter((c) => c.mes === mes && c.tipoCirugia === 'Hernia Inguinal c/s malla')
      return { infecciones: cx.filter((c) => c.iho === 'SI').length, denominador: cx.length }
    }
    if (indId === 'iho_cesarea') {
      const cx = cirugias.filter((c) => c.mes === mes && c.tipoCirugia === 'Cesárea')
      return { infecciones: cx.filter((c) => c.iho === 'SI').length, denominador: cx.length }
    }
    if (indId === 'endoftalmitis') {
      const cx = cirugias.filter((c) => c.mes === mes && c.tipoCirugia === 'Cataratas c/s LIO')
      return { infecciones: cx.filter((c) => c.iho === 'SI').length, denominador: cx.length }
    }
    if (indId === 'endometritis_pv') {
      const p = partos.filter((pt) => pt.mes === mes && pt.tipo === 'Parto vaginal')
      return { infecciones: p.filter((pt) => pt.signosSintomasIAAS === 'SI').length, denominador: p.length }
    }
    if (indId === 'endometritis_cesarea') {
      const p = partos.filter((pt) => pt.mes === mes && pt.tipo === 'Cesárea' && pt.conTP === 'Sin TP')
      return { infecciones: p.filter((pt) => pt.signosSintomasIAAS === 'SI').length, denominador: p.length }
    }
    return { infecciones: 0, denominador: 0 }
  }, [manualData, cirugias, partos])

  const { addToast } = useToastContext()

  const handleExport = () => {
    try {
      exportConsolidacion(anio, cuatrimestre, meses, getDipData, getArepiData, getCxPartosData)
      addToast('Consolidación exportada correctamente', 'success')
    } catch {
      addToast('Error al exportar consolidación', 'error')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Consolidación de Tasas</h2>
          <p className="text-sm text-gray-500">Hospital Hanga Roa - {anio}</p>
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

      <RateTable title="Vigilancia DIP - Dispositivos Invasivos Permanentes" indicadores={INDICADORES_DIP} meses={meses} getData={getDipData} rateType="por1000" />
      <RateTable title="Vigilancia AREpi - Agentes de Riesgo Epidémico" indicadores={INDICADORES_AREPI} meses={meses} getData={getArepiData} rateType="por1000" />
      <RateTable title="Vigilancia Cirugías Trazadoras y Partos" indicadores={INDICADORES_CX_PARTOS} meses={meses} getData={getCxPartosData} rateType="porcentaje" />
    </div>
  )
}
