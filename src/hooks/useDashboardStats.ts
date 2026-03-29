import { useState, useEffect, useMemo } from 'react'
import { isFirebaseConfigured } from '@/config/firebase'
import { getAll } from '@/services/firestore'
import { getLocalKey, loadLocal } from '@/utils/localStorage'
import { where, orderBy } from 'firebase/firestore'
import type { CirugiaTrazadora, PartoCesarea, DispositivoInvasivo, AgenteRiesgoEpidemico, RegistroIAAS } from '@/types'

interface DashboardData {
  cirugias: (CirugiaTrazadora & { id: string })[]
  partos: (PartoCesarea & { id: string })[]
  dip: (DispositivoInvasivo & { id: string })[]
  arepi: (AgenteRiesgoEpidemico & { id: string })[]
  iaas: (RegistroIAAS & { id: string })[]
  loading: boolean
}

type Collections = Omit<DashboardData, 'loading'>

const emptyCollections: Collections = {
  cirugias: [],
  partos: [],
  dip: [],
  arepi: [],
  iaas: [],
}

/**
 * Fetches all dashboard data in parallel using one-shot reads (getDocs).
 *
 * Unlike useCollection (which creates persistent onSnapshot listeners),
 * this hook makes a single parallel fetch and doesn't maintain live subscriptions.
 * This is ideal for the Dashboard which only needs summary statistics and
 * eliminates the risk of Firestore assertion errors from too many concurrent listeners.
 *
 * Data is refetched when `anio` changes.
 */
export function useDashboardStats(anio: number): DashboardData {
  // Demo mode: derive data synchronously from localStorage (no effect needed)
  const localData = useMemo(() => {
    if (isFirebaseConfigured) return emptyCollections
    return {
      cirugias: loadLocal<CirugiaTrazadora>(getLocalKey('cirugias', anio)),
      partos: loadLocal<PartoCesarea>(getLocalKey('partos', anio)),
      dip: loadLocal<DispositivoInvasivo>(getLocalKey('dip', anio)),
      arepi: loadLocal<AgenteRiesgoEpidemico>(getLocalKey('arepi', anio)),
      iaas: loadLocal<RegistroIAAS>(getLocalKey('registroIaas', anio)),
    }
  }, [anio])

  // Firebase mode: async one-shot reads
  const [result, setResult] = useState<{ data: Collections; loading: boolean }>({
    data: emptyCollections,
    loading: isFirebaseConfigured,
  })

  useEffect(() => {
    if (!isFirebaseConfigured) return
    let cancelled = false

    const constraints = [where('anio', '==', anio), orderBy('createdAt', 'desc')]
    Promise.all([
      getAll<CirugiaTrazadora>('cirugias', constraints),
      getAll<PartoCesarea>('partos', constraints),
      getAll<DispositivoInvasivo>('dip', constraints),
      getAll<AgenteRiesgoEpidemico>('arepi', constraints),
      getAll<RegistroIAAS>('registroIaas', constraints),
    ]).then(([cirugias, partos, dip, arepi, iaas]) => {
      if (!cancelled) {
        setResult({ data: { cirugias, partos, dip, arepi, iaas }, loading: false })
      }
    }).catch((err) => {
      console.error('[Dashboard] Failed to load stats:', err)
      if (!cancelled) setResult((prev) => ({ ...prev, loading: false }))
    })

    return () => { cancelled = true }
  }, [anio])

  const collections = isFirebaseConfigured ? result.data : localData
  const loading = isFirebaseConfigured ? result.loading : false
  return { ...collections, loading }
}
