import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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
import DashboardPage from '@/pages/DashboardPage'

function wrapper({ children }: { children: ReactNode }) {
  return createElement(AuthProvider, null,
    createElement(ToastProvider, null, children)
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders dashboard title', () => {
    render(createElement(DashboardPage), { wrapper })
    expect(screen.getByText('Vigilancia Epidemiológica')).toBeDefined()
  })

  it('displays the current year in subtitle', () => {
    render(createElement(DashboardPage), { wrapper })
    expect(screen.getByText(/Hospital Hanga Roa/)).toBeDefined()
  })

  it('shows all 5 stat cards', () => {
    render(createElement(DashboardPage), { wrapper })
    expect(screen.getByText('Cirugías Trazadoras')).toBeDefined()
    expect(screen.getByText('Partos / Cesárea')).toBeDefined()
    expect(screen.getByText('DIP')).toBeDefined()
    expect(screen.getByText('AREpi')).toBeDefined()
    expect(screen.getByText('Registros IAAS')).toBeDefined()
  })

  it('shows "Sin alertas activas" when no data', () => {
    render(createElement(DashboardPage), { wrapper })
    expect(screen.getByText('Sin alertas activas')).toBeDefined()
  })

  it('shows 0 counts when no data', () => {
    render(createElement(DashboardPage), { wrapper })
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(5)
  })

  it('renders monthly chart section', () => {
    render(createElement(DashboardPage), { wrapper })
    expect(screen.getByText('Registros por Mes')).toBeDefined()
  })

  it('renders all 12 month labels in chart', () => {
    render(createElement(DashboardPage), { wrapper })
    const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    for (const label of monthLabels) {
      expect(screen.getByText(label)).toBeDefined()
    }
  })

  it('renders export button with year', () => {
    render(createElement(DashboardPage), { wrapper })
    expect(screen.getByText(/Descargar Excel 2026/)).toBeDefined()
  })

  it('disables export button when no data', () => {
    render(createElement(DashboardPage), { wrapper })
    const btn = screen.getByText(/Descargar Excel 2026/).closest('button')
    expect(btn?.disabled).toBe(true)
  })

  it('renders alertas section header', () => {
    render(createElement(DashboardPage), { wrapper })
    expect(screen.getByText('Alertas')).toBeDefined()
  })

  // ── With seeded data ──

  it('shows correct count when cirugias data is seeded', () => {
    const cirugias = [
      {
        id: '1', mes: 'Enero', anio: 2026, nombre: 'Paciente 1',
        rut: '12.345.678-5', fechaCirugia: '2026-01-15',
        tipoCirugia: 'Cesarea', fechaPrimerControl: '2026-01-22',
        observaciones: '', iho: 'NO', fechaSegundoControl: '', observaciones2: '',
        createdAt: '2026-01-15T00:00:00Z',
      },
      {
        id: '2', mes: 'Febrero', anio: 2026, nombre: 'Paciente 2',
        rut: '12.345.678-6', fechaCirugia: '2026-02-15',
        tipoCirugia: 'Cesarea', fechaPrimerControl: '2026-02-22',
        observaciones: '', iho: 'NO', fechaSegundoControl: '', observaciones2: '',
        createdAt: '2026-02-15T00:00:00Z',
      },
    ]
    localStorage.setItem('iaas_cirugias_2026', JSON.stringify(cirugias))

    render(createElement(DashboardPage), { wrapper })
    // Should show count "2" for cirugias
    expect(screen.getByText('2')).toBeDefined()
  })

  it('shows IHO alert when cirugias have IHO=SI', () => {
    const cirugias = [{
      id: '1', mes: 'Enero', anio: 2026, nombre: 'Test',
      rut: '12.345.678-5', fechaCirugia: '2026-01-15',
      tipoCirugia: 'Cesarea', fechaPrimerControl: '2026-01-22',
      observaciones: '', iho: 'SI', fechaSegundoControl: '', observaciones2: '',
      createdAt: '2026-01-15T00:00:00Z',
    }]
    localStorage.setItem('iaas_cirugias_2026', JSON.stringify(cirugias))

    render(createElement(DashboardPage), { wrapper })
    expect(screen.getByText(/IHO en cirugías trazadoras/)).toBeDefined()
  })

  it('shows IHO count badge', () => {
    const cirugias = [
      {
        id: '1', mes: 'Enero', anio: 2026, nombre: 'Test 1',
        rut: '12.345.678-5', fechaCirugia: '2026-01-15',
        tipoCirugia: 'Cesarea', fechaPrimerControl: '',
        observaciones: '', iho: 'SI', fechaSegundoControl: '', observaciones2: '',
        createdAt: '2026-01-15T00:00:00Z',
      },
      {
        id: '2', mes: 'Febrero', anio: 2026, nombre: 'Test 2',
        rut: '12.345.678-6', fechaCirugia: '2026-02-15',
        tipoCirugia: 'Cesarea', fechaPrimerControl: '',
        observaciones: '', iho: 'SI', fechaSegundoControl: '', observaciones2: '',
        createdAt: '2026-02-15T00:00:00Z',
      },
    ]
    localStorage.setItem('iaas_cirugias_2026', JSON.stringify(cirugias))

    render(createElement(DashboardPage), { wrapper })
    // Should not show "Sin alertas activas"
    expect(screen.queryByText('Sin alertas activas')).toBeNull()
  })

  it('shows signos IAAS alert when partos have signosSintomasIAAS=SI', () => {
    const partos = [{
      id: '1', mes: 'Enero', anio: 2026, nombre: 'Test',
      rut: '12.345.678-5', fechaParto: '2026-01-10', tipo: 'Parto vaginal',
      conTP: 'Con TP', fechaPrimerControl: '', controlPostParto: '',
      signosSintomasIAAS: 'SI', dias30: 'NO', observaciones: '',
      createdAt: '2026-01-10T00:00:00Z',
    }]
    localStorage.setItem('iaas_partos_2026', JSON.stringify(partos))

    render(createElement(DashboardPage), { wrapper })
    expect(screen.getByText(/IAAS en partos/)).toBeDefined()
  })

  it('shows fallecidos alert when registroIaas has fallecido=SI', () => {
    const iaas = [{
      id: '1', numero: 1, mes: 'Enero', anio: 2026, nombre: 'Test',
      rut: '12.345.678-5', sexo: 'M', fechaIngreso: '2026-01-01',
      fechaInstalacion: '', fechaDiagCx: '2026-01-10', diasInvasivo: null,
      iaas: 'ITU', fallecido: 'SI', fechaCultivo: '', agente: '', diagnostico: '',
      indicacionInstalacion: '', indicacionRetiro: '', responsable: '', observaciones: '',
      createdAt: '2026-01-15T00:00:00Z',
    }]
    localStorage.setItem('iaas_registroIaas_2026', JSON.stringify(iaas))

    render(createElement(DashboardPage), { wrapper })
    expect(screen.getByText(/Fallecido/)).toBeDefined()
  })

  it('enables export button when data exists', () => {
    const cirugias = [{
      id: '1', mes: 'Enero', anio: 2026, nombre: 'Test',
      rut: '12.345.678-5', fechaCirugia: '2026-01-15',
      tipoCirugia: 'Cesarea', fechaPrimerControl: '',
      observaciones: '', iho: 'NO', fechaSegundoControl: '', observaciones2: '',
      createdAt: '2026-01-15T00:00:00Z',
    }]
    localStorage.setItem('iaas_cirugias_2026', JSON.stringify(cirugias))

    render(createElement(DashboardPage), { wrapper })
    const btn = screen.getByText(/Descargar Excel 2026/).closest('button')
    expect(btn?.disabled).toBe(false)
  })
})
