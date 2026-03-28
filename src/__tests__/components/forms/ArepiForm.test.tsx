import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ArepiForm from '@/components/forms/ArepiForm'

describe('ArepiForm', () => {
  const defaultProps = {
    anio: 2026,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  }

  it('renders all field labels', () => {
    render(<ArepiForm {...defaultProps} />)
    expect(screen.getByText('Nombre del Paciente')).toBeInTheDocument()
    expect(screen.getByText('RUT')).toBeInTheDocument()
    expect(screen.getByText('Fecha VE')).toBeInTheDocument()
    expect(screen.getByText('Servicio Clínico')).toBeInTheDocument()
    expect(screen.getByText('Edad')).toBeInTheDocument()
    expect(screen.getByText('Tipo de Vigilancia Asociada al Paciente')).toBeInTheDocument()
    expect(screen.getByText('Criterios Epidemiológicos Identificados')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(<ArepiForm {...defaultProps} onCancel={onCancel} />)
    fireEvent.click(screen.getByTestId('btn-cancel'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('shows Guardar label when creating', () => {
    render(<ArepiForm {...defaultProps} />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent('Guardar')
  })

  it('shows Actualizar label when editing', () => {
    const initial = {
      id: '1', fechaVE: '2026-01-10', anio: 2026, servicioClinico: 'UCI',
      nombre: 'Test', edad: '55a', rut: '12.345.678-5',
      tipoVigilancia: 'Respiratoria', criteriosEpidemiologicos: 'Fiebre',
      createdAt: '', updatedAt: '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
    render(<ArepiForm {...defaultProps} initial={initial} />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent('Actualizar')
  })

  it('shows loading state', () => {
    render(<ArepiForm {...defaultProps} loading={true} />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent('Guardando...')
  })

  it('populates fields from initial prop', () => {
    const initial = {
      id: '1', fechaVE: '2026-01-10', anio: 2026, servicioClinico: 'UCI',
      nombre: 'Ana Torres', edad: '45a', rut: '11.222.333-4',
      tipoVigilancia: 'Respiratoria', criteriosEpidemiologicos: 'Fiebre alta',
      createdAt: '', updatedAt: '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
    render(<ArepiForm {...defaultProps} initial={initial} />)
    expect(screen.getByDisplayValue('Ana Torres')).toBeInTheDocument()
    expect(screen.getByDisplayValue('11.222.333-4')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2026-01-10')).toBeInTheDocument()
    expect(screen.getByDisplayValue('45a')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Respiratoria')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Fiebre alta')).toBeInTheDocument()
  })

  it('disables buttons when loading', () => {
    render(<ArepiForm {...defaultProps} loading={true} />)
    expect(screen.getByTestId('btn-cancel')).toBeDisabled()
    expect(screen.getByTestId('btn-submit')).toBeDisabled()
  })
})
