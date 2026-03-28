import { describe, it, expect, vi } from 'vitest'

// Mock file-saver to prevent actual file downloads
vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}))

import { buildCirugiasSheet } from '@/services/excel/cirugiasExport'
import { buildPartosSheet } from '@/services/excel/partosExport'
import { buildArepiSheet } from '@/services/excel/arepiExport'
import type { CirugiaTrazadora, PartoCesarea, AgenteRiesgoEpidemico } from '@/types'

// ── Cirugias Export ──────────────────────────────────────────────────────────

const mockCirugia: CirugiaTrazadora = {
  mes: 'Enero' as const,
  anio: 2026,
  nombre: 'Juan Perez',
  rut: '12.345.678-5',
  fechaCirugia: '2026-01-15',
  tipoCirugia: 'Colecistectomia Laparoscopica',
  fechaPrimerControl: '2026-01-22',
  observaciones: 'Sin complicaciones',
  iho: 'NO',
  fechaSegundoControl: '2026-02-15',
  observaciones2: '',
}

describe('Excel Export - Cirugias', () => {
  it('buildCirugiasSheet creates a worksheet with title', () => {
    const ws = buildCirugiasSheet([mockCirugia], 2026)
    expect(ws['A1']?.v).toBe('CIRUGÍAS TRAZADORAS')
  })

  it('creates subtitle with year', () => {
    const ws = buildCirugiasSheet([mockCirugia], 2026)
    // Subtitle starts at column D (index 3)
    expect(ws['D1']?.v).toContain('2026')
  })

  it('creates headers on row 2 (headerRow=1)', () => {
    const ws = buildCirugiasSheet([mockCirugia], 2026)
    // headerRow=1 -> 1-based row 2
    expect(ws['A2']?.v).toBe('Mes')
    expect(ws['B2']?.v).toBe('Nombre del Paciente')
    expect(ws['C2']?.v).toBe('RUT')
    expect(ws['D2']?.v).toBe('Fecha de Cirugía')
    expect(ws['E2']?.v).toBe('Cirugía')
    expect(ws['H2']?.v).toBe('IHO')
  })

  it('populates data row correctly', () => {
    const ws = buildCirugiasSheet([mockCirugia], 2026)
    // headerRow=1 -> data starts at row 2 (0-based) -> row 3 in Excel
    expect(ws['A3']?.v).toBe('Enero')
    expect(ws['B3']?.v).toBe('Juan Perez')
    expect(ws['C3']?.v).toBe('12.345.678-5')
  })

  it('formats dates as DD/MM/YYYY', () => {
    const ws = buildCirugiasSheet([mockCirugia], 2026)
    // fechaCirugia is column D
    expect(ws['D3']?.v).toBe('15/01/2026')
    // fechaPrimerControl is column F
    expect(ws['F3']?.v).toBe('22/01/2026')
    // fechaSegundoControl is column I
    expect(ws['I3']?.v).toBe('15/02/2026')
  })

  it('handles empty dates gracefully', () => {
    const noDate = { ...mockCirugia, fechaSegundoControl: '' }
    const ws = buildCirugiasSheet([noDate], 2026)
    expect(ws['I3']?.v).toBe('')
  })

  it('applies different badge styles for IHO SI vs NO', () => {
    const siData = { ...mockCirugia, iho: 'SI' }
    const noData = { ...mockCirugia, iho: 'NO' }
    const wsSi = buildCirugiasSheet([siData], 2026)
    const wsNo = buildCirugiasSheet([noData], 2026)

    // IHO is column H (index 7), data at row 3
    const siStyle = wsSi['H3']?.s
    const noStyle = wsNo['H3']?.s
    expect(siStyle).toBeDefined()
    expect(noStyle).toBeDefined()
    // SI badge: red fill (FEE2E2), NO badge: green fill (DCFCE7)
    expect(siStyle?.fill?.fgColor?.rgb).toBe('FEE2E2')
    expect(noStyle?.fill?.fgColor?.rgb).toBe('DCFCE7')
  })

  it('handles empty data array', () => {
    const ws = buildCirugiasSheet([], 2026)
    expect(ws['A1']?.v).toBe('CIRUGÍAS TRAZADORAS')
    expect(ws['!ref']).toBeDefined()
    // No data rows
    expect(ws['A3']).toBeUndefined()
  })

  it('handles multiple records', () => {
    const records = [
      mockCirugia,
      { ...mockCirugia, nombre: 'Maria Lopez', mes: 'Febrero' as const },
    ]
    const ws = buildCirugiasSheet(records, 2026)
    expect(ws['A3']?.v).toBe('Enero')
    expect(ws['B3']?.v).toBe('Juan Perez')
    expect(ws['A4']?.v).toBe('Febrero')
    expect(ws['B4']?.v).toBe('Maria Lopez')
  })

  it('sets column widths', () => {
    const ws = buildCirugiasSheet([], 2026)
    expect(ws['!cols']).toBeDefined()
    expect(ws['!cols']!.length).toBe(10) // 10 columns in cirugias config
  })
})

// ── Partos Export ────────────────────────────────────────────────────────────

const mockParto: PartoCesarea = {
  mes: 'Marzo' as const,
  anio: 2026,
  nombre: 'Ana Torres',
  rut: '98.765.432-1',
  fechaParto: '2026-03-10',
  tipo: 'Cesarea',
  conTP: 'Con TP',
  fechaPrimerControl: '2026-03-17',
  controlPostParto: 'Normal',
  signosSintomasIAAS: 'NO',
  dias30: 'NO',
  observaciones: '',
}

describe('Excel Export - Partos', () => {
  it('buildPartosSheet creates a worksheet with title', () => {
    const ws = buildPartosSheet([mockParto], 2026)
    expect(ws['A1']?.v).toBe('ENDOMETRITIS PUERPERAL')
  })

  it('creates subtitle with year', () => {
    const ws = buildPartosSheet([mockParto], 2026)
    // Subtitle starts at column D (index 3)
    expect(ws['D1']?.v).toContain('2026')
  })

  it('creates headers on row 3 (headerRow=2)', () => {
    const ws = buildPartosSheet([mockParto], 2026)
    // headerRow=2 -> 1-based row 3
    expect(ws['A3']?.v).toBe('Mes')
    expect(ws['B3']?.v).toBe('Nombre del Paciente')
    expect(ws['C3']?.v).toBe('RUT')
    expect(ws['D3']?.v).toBe('Fecha Parto/Cesárea')
    expect(ws['E3']?.v).toBe('Parto/Cesárea')
    expect(ws['I3']?.v).toBe('Signos IAAS')
  })

  it('populates data row correctly', () => {
    const ws = buildPartosSheet([mockParto], 2026)
    // headerRow=2 -> data starts at row 3 (0-based) -> row 4 in Excel
    expect(ws['A4']?.v).toBe('Marzo')
    expect(ws['B4']?.v).toBe('Ana Torres')
    expect(ws['C4']?.v).toBe('98.765.432-1')
    expect(ws['E4']?.v).toBe('Cesarea')
    expect(ws['F4']?.v).toBe('Con TP')
  })

  it('formats fecha parto as DD/MM/YYYY', () => {
    const ws = buildPartosSheet([mockParto], 2026)
    expect(ws['D4']?.v).toBe('10/03/2026')
  })

  it('applies badge styles for Signos IAAS SI vs NO', () => {
    const siData = { ...mockParto, signosSintomasIAAS: 'SI' }
    const noData = { ...mockParto, signosSintomasIAAS: 'NO' }
    const wsSi = buildPartosSheet([siData], 2026)
    const wsNo = buildPartosSheet([noData], 2026)

    // Signos IAAS is column I (index 8), data at row 4
    const siStyle = wsSi['I4']?.s
    const noStyle = wsNo['I4']?.s
    expect(siStyle?.fill?.fgColor?.rgb).toBe('FEE2E2')
    expect(noStyle?.fill?.fgColor?.rgb).toBe('DCFCE7')
  })

  it('handles empty data array', () => {
    const ws = buildPartosSheet([], 2026)
    expect(ws['A1']?.v).toBe('ENDOMETRITIS PUERPERAL')
    expect(ws['!ref']).toBeDefined()
  })

  it('sets column widths for all 11 columns', () => {
    const ws = buildPartosSheet([], 2026)
    expect(ws['!cols']!.length).toBe(11)
  })
})

// ── AREpi Export ─────────────────────────────────────────────────────────────

const mockArepi: AgenteRiesgoEpidemico = {
  fechaVE: '2026-04-05',
  anio: 2026,
  servicioClinico: 'Medicina',
  nombre: 'Carlos Ruiz',
  edad: '45',
  rut: '11.222.333-4',
  tipoVigilancia: 'Activa',
  criteriosEpidemiologicos: 'Fiebre > 38.5, hemocultivos positivos',
}

describe('Excel Export - AREpi', () => {
  it('buildArepiSheet creates a worksheet with title', () => {
    const ws = buildArepiSheet([mockArepi], 2026)
    expect(ws['A1']?.v).toContain('AGENTES DE RIESGO EPIDÉMICO')
  })

  it('creates headers on row 3 (headerRow=2)', () => {
    const ws = buildArepiSheet([mockArepi], 2026)
    // headerRow=2 -> 1-based row 3
    expect(ws['A3']?.v).toBe('Fecha de la VE')
    expect(ws['B3']?.v).toBe('Servicio Clínico')
    expect(ws['C3']?.v).toBe('Nombre del Paciente')
    expect(ws['D3']?.v).toBe('Edad')
    expect(ws['E3']?.v).toBe('RUT')
    expect(ws['F3']?.v).toBe('Tipo de Vigilancia')
    expect(ws['G3']?.v).toBe('Criterios Epidemiológicos')
  })

  it('populates data row correctly', () => {
    const ws = buildArepiSheet([mockArepi], 2026)
    // headerRow=2 -> data starts at row 3 (0-based) -> row 4 in Excel
    expect(ws['A4']?.v).toBe('05/04/2026')
    expect(ws['B4']?.v).toBe('Medicina')
    expect(ws['C4']?.v).toBe('Carlos Ruiz')
    expect(ws['D4']?.v).toBe('45')
    expect(ws['E4']?.v).toBe('11.222.333-4')
    expect(ws['F4']?.v).toBe('Activa')
  })

  it('handles empty data array', () => {
    const ws = buildArepiSheet([], 2026)
    expect(ws['A1']?.v).toContain('AGENTES DE RIESGO EPIDÉMICO')
    expect(ws['!ref']).toBeDefined()
  })

  it('sets column widths for all 7 columns', () => {
    const ws = buildArepiSheet([], 2026)
    expect(ws['!cols']!.length).toBe(7)
  })
})

// ── Consolidacion Export ─────────────────────────────────────────────────────

import { exportConsolidacion } from '@/services/excel/consolidacionExport'
import { saveAs } from 'file-saver'

describe('Excel Export - Consolidacion', () => {
  it('calls saveAs with correct filename', () => {
    const mockSaveAs = vi.mocked(saveAs)
    mockSaveAs.mockClear()

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril']
    const getData = () => ({ infecciones: 0, denominador: 0 })

    exportConsolidacion(2026, 1, meses, getData, getData, getData)

    expect(mockSaveAs).toHaveBeenCalledTimes(1)
    const filename = mockSaveAs.mock.calls[0][1]
    expect(filename).toContain('Consolidacion_Tasas')
    expect(filename).toContain('2026')
  })

  it('passes data through getData callbacks', () => {
    const mockSaveAs = vi.mocked(saveAs)
    mockSaveAs.mockClear()

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril']
    const dipCalls: string[] = []
    const getDipData = (indId: string, mes: string) => {
      dipCalls.push(`${indId}:${mes}`)
      return { infecciones: 1, denominador: 100 }
    }
    const getData = () => ({ infecciones: 0, denominador: 0 })

    exportConsolidacion(2026, 1, meses, getDipData, getData, getData)

    // Should call getDipData for each DIP indicator x each month
    expect(dipCalls.length).toBeGreaterThan(0)
    // First call should be for first DIP indicator + Enero
    expect(dipCalls[0]).toContain('Enero')
  })

  it('works with different cuatrimestres', () => {
    const mockSaveAs = vi.mocked(saveAs)
    mockSaveAs.mockClear()

    const meses = ['Mayo', 'Junio', 'Julio', 'Agosto']
    const getData = () => ({ infecciones: 0, denominador: 0 })

    exportConsolidacion(2026, 2, meses, getData, getData, getData)

    expect(mockSaveAs).toHaveBeenCalledTimes(1)
    const filename = mockSaveAs.mock.calls[0][1] as string
    expect(filename).toContain('cuatrimestre')
  })
})
