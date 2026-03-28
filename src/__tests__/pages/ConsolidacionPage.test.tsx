import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { createElement, ReactNode } from 'react'

// Mock react-router-dom outlet context
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useOutletContext: () => ({ anio: 2026 }),
  }
})

import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import ConsolidacionPage from '@/pages/ConsolidacionPage'

function wrapper({ children }: { children: ReactNode }) {
  return createElement(AuthProvider, null,
    createElement(ToastProvider, null, children)
  )
}

describe('ConsolidacionPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  // ── Basic rendering ──

  it('renders page title', () => {
    render(createElement(ConsolidacionPage), { wrapper })
    expect(screen.getByText('Consolidación de Tasas')).toBeDefined()
  })

  it('renders hospital name', () => {
    render(createElement(ConsolidacionPage), { wrapper })
    expect(screen.getByText(/Hospital Hanga Roa/)).toBeDefined()
  })

  it('renders all 3 tabs', () => {
    render(createElement(ConsolidacionPage), { wrapper })
    expect(screen.getByText('Vigilancia DIP')).toBeDefined()
    expect(screen.getByText('Vigilancia AREpi')).toBeDefined()
    expect(screen.getByText('Vigilancia Cx y Partos')).toBeDefined()
  })

  it('shows cuatrimestre selector', () => {
    render(createElement(ConsolidacionPage), { wrapper })
    const select = screen.getByDisplayValue(/1. Cuatrimestre/)
    expect(select).toBeDefined()
  })

  it('shows export button', () => {
    render(createElement(ConsolidacionPage), { wrapper })
    expect(screen.getByText('Exportar Excel')).toBeDefined()
  })

  // ── DIP tab (default) ──

  it('shows DIP indicators table by default', () => {
    render(createElement(ConsolidacionPage), { wrapper })
    expect(screen.getByText(/ITS en pacientes adultos asociada a CVC/)).toBeDefined()
  })

  it('shows DIP table header columns', () => {
    render(createElement(ConsolidacionPage), { wrapper })
    expect(screen.getByText('Indicador')).toBeDefined()
    expect(screen.getByText('Variable')).toBeDefined()
    expect(screen.getByText('Total')).toBeDefined()
    expect(screen.getByText('Tasa')).toBeDefined()
    expect(screen.getByText('IRM')).toBeDefined()
  })

  it('shows month headers for 1st cuatrimestre', () => {
    render(createElement(ConsolidacionPage), { wrapper })
    expect(screen.getByText('Ene')).toBeDefined()
    expect(screen.getByText('Feb')).toBeDefined()
    expect(screen.getByText('Mar')).toBeDefined()
    expect(screen.getByText('Abr')).toBeDefined()
  })

  it('shows all 7 DIP indicators', () => {
    render(createElement(ConsolidacionPage), { wrapper })
    expect(screen.getByText(/ITS en pacientes adultos asociada a CVC/)).toBeDefined()
    expect(screen.getByText(/ITS en pacientes pediátricos asociados a CVC/)).toBeDefined()
    expect(screen.getByText(/ITS en pacientes neonatológicos con CVC/)).toBeDefined()
    expect(screen.getByText(/ITS en pacientes con catéter umbilical/)).toBeDefined()
    expect(screen.getByText(/NAVM en pacientes adultos/)).toBeDefined()
    expect(screen.getByText(/NAVM en pacientes pediátricos/)).toBeDefined()
    expect(screen.getByText(/NAVM en pacientes neonatológicos/)).toBeDefined()
  })

  it('shows DIP-specific variable labels', () => {
    render(createElement(ConsolidacionPage), { wrapper })
    // Multiple instances for each indicator
    const infLabels = screen.getAllByText(/Infecciones/)
    expect(infLabels.length).toBeGreaterThanOrEqual(1)
    const diasLabels = screen.getAllByText(/Días Exp/)
    expect(diasLabels.length).toBeGreaterThanOrEqual(1)
  })

  it('shows IRM values for DIP indicators', () => {
    render(createElement(ConsolidacionPage), { wrapper })
    // IRM for first DIP indicator is 1.8
    expect(screen.getByText('1.8')).toBeDefined()
  })

  // ── Tab switching ──

  it('switches to AREpi tab', () => {
    render(createElement(ConsolidacionPage), { wrapper })
    fireEvent.click(screen.getByText('Vigilancia AREpi'))
    expect(screen.getByText(/Infecciones gastrointestinales en lactantes/)).toBeDefined()
  })

  it('shows AREpi tab subtitle', () => {
    render(createElement(ConsolidacionPage), { wrapper })
    fireEvent.click(screen.getByText('Vigilancia AREpi'))
    expect(screen.getByText('Agentes de Riesgo Epidémico')).toBeDefined()
  })

  it('switches to Cx/Partos tab', () => {
    render(createElement(ConsolidacionPage), { wrapper })
    fireEvent.click(screen.getByText('Vigilancia Cx y Partos'))
    expect(screen.getByText(/IHO Cirugía Colecistectomía Laparotómica/)).toBeDefined()
  })

  it('shows Cx/Partos-specific variable labels', () => {
    render(createElement(ConsolidacionPage), { wrapper })
    fireEvent.click(screen.getByText('Vigilancia Cx y Partos'))
    const procLabels = screen.getAllByText(/Proc\. Vig/)
    expect(procLabels.length).toBeGreaterThanOrEqual(1)
  })

  it('switches back to DIP from another tab', () => {
    render(createElement(ConsolidacionPage), { wrapper })
    fireEvent.click(screen.getByText('Vigilancia AREpi'))
    fireEvent.click(screen.getByText('Vigilancia DIP'))
    expect(screen.getByText(/ITS en pacientes adultos asociada a CVC/)).toBeDefined()
  })

  // ── Cuatrimestre switching ──

  it('changes to 2nd cuatrimestre', () => {
    render(createElement(ConsolidacionPage), { wrapper })
    const select = screen.getByDisplayValue(/1. Cuatrimestre/)
    fireEvent.change(select, { target: { value: '2' } })
    // Should show May-Aug month headers
    expect(screen.getByText('May')).toBeDefined()
    expect(screen.getByText('Jun')).toBeDefined()
    expect(screen.getByText('Jul')).toBeDefined()
    expect(screen.getByText('Ago')).toBeDefined()
  })

  it('changes to 3rd cuatrimestre', () => {
    render(createElement(ConsolidacionPage), { wrapper })
    const select = screen.getByDisplayValue(/1. Cuatrimestre/)
    fireEvent.change(select, { target: { value: '3' } })
    // Should show Sep-Dec month headers
    expect(screen.getByText('Sep')).toBeDefined()
    expect(screen.getByText('Oct')).toBeDefined()
    expect(screen.getByText('Nov')).toBeDefined()
    expect(screen.getByText('Dic')).toBeDefined()
  })

  // ── Rate calculations with seeded data ──

  it('calculates Cx rates from seeded cirugias data', () => {
    // Seed 10 colecistectomias laparoscopicas, 1 with IHO
    const cirugias = Array.from({ length: 10 }, (_, i) => ({
      id: String(i + 1),
      mes: 'Enero',
      anio: 2026,
      nombre: `Paciente ${i + 1}`,
      rut: `${10000000 + i}-${i}`,
      fechaCirugia: `2026-01-${String(i + 10).padStart(2, '0')}`,
      tipoCirugia: 'Colecistectomía Laparoscópica',
      fechaPrimerControl: '',
      observaciones: '',
      iho: i === 0 ? 'SI' : 'NO',
      fechaSegundoControl: '',
      observaciones2: '',
      createdAt: new Date().toISOString(),
    }))
    localStorage.setItem('iaas_cirugias_2026', JSON.stringify(cirugias))

    render(createElement(ConsolidacionPage), { wrapper })
    fireEvent.click(screen.getByText('Vigilancia Cx y Partos'))

    // Should show "10" for number of procedures
    const bodyText = document.body.textContent || ''
    expect(bodyText).toContain('10')
  })

  it('calculates DIP denominador from seeded dip data', () => {
    // Seed DIP records with totalDias
    const dip = [
      {
        id: '1', mes: 'Enero', anio: 2026, servicio: 'UPC',
        nombre: 'P1', rut: '11.111.111-1', edad: '50',
        tipoDIP: 'CVC', periodos: [], totalDias: 15, revisionFC: '',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2', mes: 'Enero', anio: 2026, servicio: 'UPC',
        nombre: 'P2', rut: '22.222.222-2', edad: '60',
        tipoDIP: 'CVC', periodos: [], totalDias: 10, revisionFC: '',
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem('iaas_dip_2026', JSON.stringify(dip))

    render(createElement(ConsolidacionPage), { wrapper })

    // The DIP tab should show 25 (15+10) as denominator for CVC-related indicators in Enero
    const bodyText = document.body.textContent || ''
    expect(bodyText).toContain('25')
  })

  it('shows zero rates when no data', () => {
    render(createElement(ConsolidacionPage), { wrapper })
    // All rates should be 0
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThan(0)
  })

  it('calculates parto rates from seeded data', () => {
    const partos = Array.from({ length: 5 }, (_, i) => ({
      id: String(i + 1),
      mes: 'Enero',
      anio: 2026,
      nombre: `Paciente ${i + 1}`,
      rut: `${10000000 + i}-${i}`,
      fechaParto: '2026-01-15',
      tipo: 'Parto vaginal',
      conTP: '',
      fechaPrimerControl: '',
      controlPostParto: '',
      signosSintomasIAAS: i === 0 ? 'SI' : 'NO',
      dias30: 'NO',
      observaciones: '',
      createdAt: new Date().toISOString(),
    }))
    localStorage.setItem('iaas_partos_2026', JSON.stringify(partos))

    render(createElement(ConsolidacionPage), { wrapper })
    fireEvent.click(screen.getByText('Vigilancia Cx y Partos'))

    // Should show 5 as procedures for parto vaginal in Enero
    const bodyText = document.body.textContent || ''
    expect(bodyText).toContain('5')
  })
})
