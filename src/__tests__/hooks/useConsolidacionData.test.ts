import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { createElement, ReactNode } from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { useConsolidacionData } from '@/hooks/useConsolidacionData'

function wrapper({ children }: { children: ReactNode }) {
  return createElement(AuthProvider, null, children)
}

describe('useConsolidacionData', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns getter functions', () => {
    const { result } = renderHook(() => useConsolidacionData(2026, 1), { wrapper })
    expect(typeof result.current.getDipData).toBe('function')
    expect(typeof result.current.getArepiData).toBe('function')
    expect(typeof result.current.getCxPartosData).toBe('function')
  })

  it('getDipData returns zeros for empty data', () => {
    const { result } = renderHook(() => useConsolidacionData(2026, 1), { wrapper })
    const data = result.current.getDipData('its_adultos_cvc', 'Enero')
    expect(data.infecciones).toBe(0)
    expect(data.denominador).toBe(0)
  })

  it('getArepiData returns zeros for empty data', () => {
    const { result } = renderHook(() => useConsolidacionData(2026, 1), { wrapper })
    const data = result.current.getArepiData('gi_lactantes', 'Enero')
    expect(data.infecciones).toBe(0)
    expect(data.denominador).toBe(0)
  })

  it('getCxPartosData returns zeros for empty data', () => {
    const { result } = renderHook(() => useConsolidacionData(2026, 1), { wrapper })
    const data = result.current.getCxPartosData('iho_cole_laparoscopica', 'Enero')
    expect(data.infecciones).toBe(0)
    expect(data.denominador).toBe(0)
  })

  it('getCxPartosData counts cirugias correctly', () => {
    const cirugias = Array.from({ length: 5 }, (_, i) => ({
      id: String(i + 1), mes: 'Enero', anio: 2026, nombre: `P${i}`,
      rut: `${i}`, fechaCirugia: '2026-01-10',
      tipoCirugia: 'Colecistectomía Laparoscópica',
      fechaPrimerControl: '', observaciones: '',
      iho: i === 0 ? 'SI' : 'NO',
      fechaSegundoControl: '', observaciones2: '',
      createdAt: new Date().toISOString(),
    }))
    localStorage.setItem('iaas_cirugias_2026', JSON.stringify(cirugias))

    const { result } = renderHook(() => useConsolidacionData(2026, 1), { wrapper })
    const data = result.current.getCxPartosData('iho_cole_laparoscopica', 'Enero')
    expect(data.denominador).toBe(5)
    expect(data.infecciones).toBe(1)
  })

  it('getDipData sums totalDias for CVC devices', () => {
    const dips = [
      { id: '1', mes: 'Enero', anio: 2026, servicio: 'UPC', nombre: 'P1',
        rut: '1', edad: '50', tipoDIP: 'CVC', periodos: [], totalDias: 10,
        revisionFC: '', createdAt: new Date().toISOString() },
      { id: '2', mes: 'Enero', anio: 2026, servicio: 'UPC', nombre: 'P2',
        rut: '2', edad: '60', tipoDIP: 'CVC', periodos: [], totalDias: 15,
        revisionFC: '', createdAt: new Date().toISOString() },
    ]
    localStorage.setItem('iaas_dip_2026', JSON.stringify(dips))

    const { result } = renderHook(() => useConsolidacionData(2026, 1), { wrapper })
    const data = result.current.getDipData('its_adultos_cvc', 'Enero')
    expect(data.denominador).toBe(25)  // 10 + 15
    expect(data.infecciones).toBe(0)
  })

  it('getCxPartosData counts partos correctly', () => {
    const partos = [
      { id: '1', mes: 'Marzo', anio: 2026, nombre: 'P1', rut: '1',
        fechaParto: '2026-03-10', tipo: 'Parto vaginal', conTP: '',
        fechaPrimerControl: '', controlPostParto: '',
        signosSintomasIAAS: 'SI', dias30: '', observaciones: '',
        createdAt: new Date().toISOString() },
      { id: '2', mes: 'Marzo', anio: 2026, nombre: 'P2', rut: '2',
        fechaParto: '2026-03-12', tipo: 'Parto vaginal', conTP: '',
        fechaPrimerControl: '', controlPostParto: '',
        signosSintomasIAAS: 'NO', dias30: '', observaciones: '',
        createdAt: new Date().toISOString() },
    ]
    localStorage.setItem('iaas_partos_2026', JSON.stringify(partos))

    const { result } = renderHook(() => useConsolidacionData(2026, 1), { wrapper })
    const data = result.current.getCxPartosData('endometritis_pv', 'Marzo')
    expect(data.denominador).toBe(2)
    expect(data.infecciones).toBe(1)
  })
})
