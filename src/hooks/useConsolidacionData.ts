import { useState, useEffect, useMemo, useCallback } from 'react'
import { isFirebaseConfigured } from '@/config/firebase'
import { getAll } from '@/services/firestore'
import { getLocalKey, loadLocal } from '@/utils/localStorage'
import { where, orderBy } from 'firebase/firestore'
import { CirugiaTrazadora, PartoCesarea, DispositivoInvasivo, DatosConsolidacion } from '@/types'
import { CX_PARTOS_SOURCE_MAP } from '@/utils/constants'

/**
 * Encapsulates consolidation rate calculation logic.
 *
 * Receives cirugias/partos/dip as parameters (not fetched here) to avoid
 * duplicate data fetching. Only `consolidacion` (manual override data)
 * is fetched here via one-shot read (getDocs, no onSnapshot listener).
 */
export function useConsolidacionData(
  anio: number,
  cuatrimestre: number,
  cirugias: (CirugiaTrazadora & { id: string })[],
  partos: (PartoCesarea & { id: string })[],
  dip: (DispositivoInvasivo & { id: string })[]
) {
  // Demo mode: derive consolidacion data synchronously from localStorage
  const localConsolidacion = useMemo(() => {
    if (isFirebaseConfigured) return [] as (DatosConsolidacion & { id: string })[]
    return loadLocal<DatosConsolidacion>(getLocalKey('consolidacion', anio))
  }, [anio])

  // Firebase mode: async one-shot read
  const [firestoreConsolidacion, setFirestoreConsolidacion] = useState<(DatosConsolidacion & { id: string })[]>([])

  useEffect(() => {
    if (!isFirebaseConfigured) return
    const constraints = [where('anio', '==', anio), orderBy('createdAt', 'desc')]
    getAll<DatosConsolidacion>('consolidacion', constraints)
      .then(setFirestoreConsolidacion)
      .catch((err) => console.error('[Consolidacion] Failed to load overrides:', err))
  }, [anio])

  const consolidacion = isFirebaseConfigured ? firestoreConsolidacion : localConsolidacion

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
