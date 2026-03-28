import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PartoForm from '@/components/forms/PartoForm'

describe('PartoForm', () => {
  const defaultProps = {
    anio: 2026,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  }

  it('renders all field labels', () => {
    render(<PartoForm {...defaultProps} />)
    expect(screen.getByText('Nombre del Paciente')).toBeInTheDocument()
    expect(screen.getByText('RUT')).toBeInTheDocument()
    expect(screen.getByText('Fecha Parto/Cesárea')).toBeInTheDocument()
    expect(screen.getByText('Tipo')).toBeInTheDocument()
    expect(screen.getByText('Con / Sin Trabajo de Parto')).toBeInTheDocument()
    expect(screen.getByText('Fecha Primer Control')).toBeInTheDocument()
    expect(screen.getByText('Signos y Síntomas IAAS')).toBeInTheDocument()
    expect(screen.getByText('Control Post Parto (Observaciones)')).toBeInTheDocument()
    expect(screen.getByText('30 días')).toBeInTheDocument()
    expect(screen.getByText('Observaciones')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(<PartoForm {...defaultProps} onCancel={onCancel} />)
    fireEvent.click(screen.getByTestId('btn-cancel'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('shows Guardar label when creating', () => {
    render(<PartoForm {...defaultProps} />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent('Guardar')
  })

  it('shows Actualizar label when editing', () => {
    const initial = {
      id: '1', mes: 'Enero', anio: 2026, nombre: 'Test', rut: '12.345.678-5',
      fechaParto: '2026-01-15', tipo: 'Parto Vaginal', conTP: 'Con TP',
      fechaPrimerControl: '', controlPostParto: '', signosSintomasIAAS: 'NO',
      dias30: '', observaciones: '',
      createdAt: '', updatedAt: '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
    render(<PartoForm {...defaultProps} initial={initial} />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent('Actualizar')
  })

  it('shows loading state', () => {
    render(<PartoForm {...defaultProps} loading={true} />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent('Guardando...')
  })

  it('populates fields from initial prop', () => {
    const initial = {
      id: '1', mes: 'Enero', anio: 2026, nombre: 'Maria Lopez', rut: '11.222.333-4',
      fechaParto: '2026-01-10', tipo: 'Cesárea', conTP: 'Sin TP',
      fechaPrimerControl: '2026-01-17', controlPostParto: 'Normal',
      signosSintomasIAAS: 'NO', dias30: 'Sin eventos', observaciones: 'Obs test',
      createdAt: '', updatedAt: '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
    render(<PartoForm {...defaultProps} initial={initial} />)
    expect(screen.getByDisplayValue('Maria Lopez')).toBeInTheDocument()
    expect(screen.getByDisplayValue('11.222.333-4')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2026-01-10')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Normal')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Sin eventos')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Obs test')).toBeInTheDocument()
  })

  it('disables buttons when loading', () => {
    render(<PartoForm {...defaultProps} loading={true} />)
    expect(screen.getByTestId('btn-cancel')).toBeDisabled()
    expect(screen.getByTestId('btn-submit')).toBeDisabled()
  })
})
