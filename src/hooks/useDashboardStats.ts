import { useState, useEffect } from 'react'
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
  const [data, setData] = useState<DashboardData>({
    cirugias: [], partos: [], dip: [], arepi: [], iaas: [],
    loading: true,
  })

  useEffect(() => {
    let cancelled = false
    setData((prev) => ({ ...prev, loading: true }))

    if (!isFirebaseConfigured) {
      // Demo mode: read from localStorage
      setData({
        cirugias: loadLocal<CirugiaTrazadora>(getLocalKey('cirugias', anio)),
        partos: loadLocal<PartoCesarea>(getLocalKey('partos', anio)),
        dip: loadLocal<DispositivoInvasivo>(getLocalKey('dip', anio)),
        arepi: loadLocal<AgenteRiesgoEpidemico>(getLocalKey('arepi', anio)),
        iaas: loadLocal<RegistroIAAS>(getLocalKey('registroIaas', anio)),
        loading: false,
      })
      return
    }

    // Parallel one-shot reads — 5 getDocs in parallel, no onSnapshot listeners
    const constraints = [where('anio', '==', anio), orderBy('createdAt', 'desc')]
    Promise.all([
      getAll<CirugiaTrazadora>('cirugias', constraints),
      getAll<PartoCesarea>('partos', constraints),
      getAll<DispositivoInvasivo>('dip', constraints),
      getAll<AgenteRiesgoEpidemico>('arepi', constraints),
      getAll<RegistroIAAS>('registroIaas', constraints),
    ]).then(([cirugias, partos, dip, arepi, iaas]) => {
      if (cancelled) return
      setData({ cirugias, partos, dip, arepi, iaas, loading: false })
    }).catch((err) => {
      console.error('[Dashboard] Failed to load stats:', err)
      if (!cancelled) setData((prev) => ({ ...prev, loading: false }))
    })

    return () => { cancelled = true }
  }, [anio])

  return data
}
