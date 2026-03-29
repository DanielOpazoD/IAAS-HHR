import { useMemo, useCallback } from 'react'
import { useCollection } from '@/hooks/useCollection'
import { CirugiaTrazadora, PartoCesarea, DispositivoInvasivo, DatosConsolidacion } from '@/types'
import { CX_PARTOS_SOURCE_MAP } from '@/utils/constants'

/**
 * Encapsulates consolidation rate calculation logic.
 *
 * Receives cirugias/partos/dip as parameters (not fetched here) to avoid
 * duplicate Firestore subscriptions when rendered inside DashboardPage, which
 * already subscribes to those same collections. Duplicate simultaneous
 * onSnapshot subscriptions with IndexedDB persistence trigger Firestore
 * internal assertion failures (ID: b815/ca9).
 *
 * Only `consolidacion` (manual override data) is fetched here since no
 * other page subscribes to it.
 */
export function useConsolidacionData(
  anio: number,
  cuatrimestre: number,
  cirugias: (CirugiaTrazadora & { id: string })[],
  partos: (PartoCesarea & { id: string })[],
  dip: (DispositivoInvasivo & { id: string })[]
) {
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

    const source = CX_PARTOS_SOURCE_MAP[indId]
    if (!source) return { infecciones: 0, denominador: 0 }

    if (source.type === 'cirugia') {
      const cx = cirugias.filter((c) => c.mes === mes && c.tipoCirugia === source.tipoCirugia)
      return { infecciones: cx.filter((c) => c[source.ihoField] === 'SI').length, denominador: cx.length }
    }

    // source.type === 'parto'
    const p = partos.filter((pt) => pt.mes === mes && pt.tipo === source.tipoParto && (!source.conTP || pt.conTP === source.conTP))
    return { infecciones: p.filter((pt) => pt[source.iaasField] === 'SI').length, denominador: p.length }
  }, [manualData, cirugias, partos])

  return { getDipData, getArepiData, getCxPartosData }
}
