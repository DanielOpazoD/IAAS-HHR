import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DipForm from '@/components/forms/DipForm'

describe('DipForm', () => {
  const defaultProps = {
    anio: 2026,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  }

  it('renders all field labels', () => {
    render(<DipForm {...defaultProps} />)
    expect(screen.getByText('Nombre del Paciente')).toBeInTheDocument()
    expect(screen.getByText('RUT')).toBeInTheDocument()
    expect(screen.getByText('Servicio')).toBeInTheDocument()
    expect(screen.getByText('Edad')).toBeInTheDocument()
    expect(screen.getByText('Tipo DIP')).toBeInTheDocument()
    expect(screen.getByText('Mes')).toBeInTheDocument()
    expect(screen.getByText('Períodos de Instalación')).toBeInTheDocument()
    expect(screen.getByText('Instalación 1')).toBeInTheDocument()
    expect(screen.getByText('Retiro')).toBeInTheDocument()
    expect(screen.getByText('N° Días')).toBeInTheDocument()
    expect(screen.getByText('Revisión Ficha Clínica')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(<DipForm {...defaultProps} onCancel={onCancel} />)
    fireEvent.click(screen.getByTestId('btn-cancel'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('shows Guardar label when creating', () => {
    render(<DipForm {...defaultProps} />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent('Guardar')
  })

  it('shows Actualizar label when editing', () => {
    const initial = {
      id: '1', mes: 'Enero', anio: 2026, servicio: 'UCI', nombre: 'Test',
      rut: '12.345.678-5', edad: '65a', tipoDIP: 'CVC',
      periodos: [{ fechaInstalacion: '2026-01-01', fechaRetiro: '2026-01-05', numDias: 4 }],
      totalDias: 4, revisionFC: '',
      createdAt: '', updatedAt: '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
    render(<DipForm {...defaultProps} initial={initial} />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent('Actualizar')
  })

  it('shows loading state', () => {
    render(<DipForm {...defaultProps} loading={true} />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent('Guardando...')
  })

  it('populates fields from initial prop', () => {
    const initial = {
      id: '1', mes: 'Enero', anio: 2026, servicio: 'UCI', nombre: 'Carlos Diaz',
      rut: '11.222.333-4', edad: '70a', tipoDIP: 'CVC',
      periodos: [{ fechaInstalacion: '2026-01-01', fechaRetiro: '2026-01-05', numDias: 4 }],
      totalDias: 4, revisionFC: 'Revisado',
      createdAt: '', updatedAt: '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
    render(<DipForm {...defaultProps} initial={initial} />)
    expect(screen.getByDisplayValue('Carlos Diaz')).toBeInTheDocument()
    expect(screen.getByDisplayValue('11.222.333-4')).toBeInTheDocument()
    expect(screen.getByDisplayValue('70a')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Revisado')).toBeInTheDocument()
  })

  it('can add a periodo', () => {
    render(<DipForm {...defaultProps} />)
    expect(screen.getByText('Instalación 1')).toBeInTheDocument()
    expect(screen.queryByText('Instalación 2')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('+ Agregar período'))

    expect(screen.getByText('Instalación 2')).toBeInTheDocument()
  })

  it('can remove a periodo', () => {
    render(<DipForm {...defaultProps} />)
    // Add a second periodo first
    fireEvent.click(screen.getByText('+ Agregar período'))
    expect(screen.getByText('Instalación 2')).toBeInTheDocument()

    // Remove buttons should now be visible (2 periodos = 2 remove buttons)
    const removeButtons = screen.getAllByLabelText('Eliminar período')
    expect(removeButtons.length).toBe(2)

    fireEvent.click(removeButtons[1])
    expect(screen.queryByText('Instalación 2')).not.toBeInTheDocument()
  })

  it('shows total days', () => {
    render(<DipForm {...defaultProps} />)
    expect(screen.getByText('Total días:')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('does not show remove button with only one periodo', () => {
    render(<DipForm {...defaultProps} />)
    expect(screen.queryByLabelText('Eliminar período')).not.toBeInTheDocument()
  })

  it('disables buttons when loading', () => {
    render(<DipForm {...defaultProps} loading={true} />)
    expect(screen.getByTestId('btn-cancel')).toBeDisabled()
    expect(screen.getByTestId('btn-submit')).toBeDisabled()
  })
})
