import { describe, it, expect } from 'vitest'
import {
  MESES,
  MESES_CORTOS,
  MESES_POR_CUATRIMESTRE,
  TIPOS_CIRUGIA,
  TIPOS_DIP,
  SERVICIOS,
  TIPOS_PARTO,
  INDICADORES_DIP,
  INDICADORES_AREPI,
  INDICADORES_CX_PARTOS,
  CX_PARTOS_SOURCE_MAP,
} from '@/utils/constants'

describe('Constants', () => {
  it('has 12 months in MESES', () => {
    expect(MESES).toHaveLength(12)
    expect(MESES[0]).toBe('Enero')
    expect(MESES[11]).toBe('Diciembre')
  })

  it('has 12 short months in MESES_CORTOS', () => {
    expect(MESES_CORTOS).toHaveLength(12)
    expect(MESES_CORTOS[0]).toBe('Ene')
    expect(MESES_CORTOS[11]).toBe('Dic')
  })

  it('cuatrimestres cover all 12 months', () => {
    const allMonths = [
      ...MESES_POR_CUATRIMESTRE[1],
      ...MESES_POR_CUATRIMESTRE[2],
      ...MESES_POR_CUATRIMESTRE[3],
    ]
    expect(allMonths).toHaveLength(12)
    expect(allMonths).toEqual([...MESES])
  })

  it('has expected surgery types', () => {
    expect(TIPOS_CIRUGIA).toContain('Colecistectomía Laparoscópica')
    expect(TIPOS_CIRUGIA).toContain('Cesárea')
    expect(TIPOS_CIRUGIA.length).toBeGreaterThanOrEqual(5)
  })

  it('has 3 DIP types', () => {
    expect(TIPOS_DIP).toEqual(['CVC', 'CUP', 'VMI'])
  })

  it('has 3 services', () => {
    expect(SERVICIOS).toEqual(['Cirugía', 'Medicina', 'UPC'])
  })

  it('has 2 birth types', () => {
    expect(TIPOS_PARTO).toEqual(['Parto vaginal', 'Cesárea'])
  })

  it('has correct number of IRM indicators', () => {
    expect(INDICADORES_DIP.length).toBe(7)
    expect(INDICADORES_AREPI.length).toBe(7)
    expect(INDICADORES_CX_PARTOS.length).toBe(7)
  })

  it('all indicators have required fields', () => {
    for (const ind of [...INDICADORES_DIP, ...INDICADORES_AREPI, ...INDICADORES_CX_PARTOS]) {
      expect(ind).toHaveProperty('id')
      expect(ind).toHaveProperty('nombre')
      expect(ind).toHaveProperty('irm')
      expect(typeof ind.irm).toBe('number')
    }
  })

  it('CX_PARTOS_SOURCE_MAP has entry for each CxPartos indicator', () => {
    for (const ind of INDICADORES_CX_PARTOS) {
      expect(CX_PARTOS_SOURCE_MAP).toHaveProperty(ind.id)
    }
  })

  it('CX_PARTOS_SOURCE_MAP entries have correct types', () => {
    for (const source of Object.values(CX_PARTOS_SOURCE_MAP)) {
      expect(['cirugia', 'parto']).toContain(source.type)
    }
  })
})
