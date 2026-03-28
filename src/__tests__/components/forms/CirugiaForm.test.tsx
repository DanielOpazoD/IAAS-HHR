import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CirugiaForm from '@/components/forms/CirugiaForm'

describe('CirugiaForm', () => {
  const defaultProps = {
    anio: 2026,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  }

  it('renders all field labels', () => {
    render(<CirugiaForm {...defaultProps} />)
    expect(screen.getByText('Nombre del Paciente')).toBeInTheDocument()
    expect(screen.getByText('RUT')).toBeInTheDocument()
    expect(screen.getByText('Fecha Cirugía')).toBeInTheDocument()
    expect(screen.getByText('Tipo de Cirugía')).toBeInTheDocument()
    expect(screen.getByText('Mes')).toBeInTheDocument()
    expect(screen.getByText('Fecha Primer Control')).toBeInTheDocument()
    expect(screen.getByText('IHO (Infección Herida Operatoria)')).toBeInTheDocument()
    expect(screen.getByText('Observaciones (Primer Control)')).toBeInTheDocument()
    expect(screen.getByText('Fecha Segundo Control')).toBeInTheDocument()
    expect(screen.getByText('Observaciones (Segundo Control)')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(<CirugiaForm {...defaultProps} onCancel={onCancel} />)
    fireEvent.click(screen.getByTestId('btn-cancel'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('shows Guardar label when creating', () => {
    render(<CirugiaForm {...defaultProps} />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent('Guardar')
  })

  it('shows Actualizar label when editing', () => {
    const initial = {
      id: '1', mes: 'Enero', anio: 2026, nombre: 'Test', rut: '12.345.678-5',
      fechaCirugia: '2026-01-15', tipoCirugia: 'Colecistectomía Laparoscópica',
      fechaPrimerControl: '', observaciones: '', iho: 'NO',
      fechaSegundoControl: '', observaciones2: '',
      createdAt: '', updatedAt: '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
    render(<CirugiaForm {...defaultProps} initial={initial} />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent('Actualizar')
  })

  it('shows loading state', () => {
    render(<CirugiaForm {...defaultProps} loading={true} />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent('Guardando...')
  })

  it('populates fields from initial prop', () => {
    const initial = {
      id: '1', mes: 'Enero', anio: 2026, nombre: 'Juan Perez', rut: '12.345.678-5',
      fechaCirugia: '2026-01-15', tipoCirugia: 'Colecistectomía Laparoscópica',
      fechaPrimerControl: '2026-01-22', observaciones: 'Sin novedad', iho: 'NO',
      fechaSegundoControl: '2026-02-01', observaciones2: 'Todo bien',
      createdAt: '', updatedAt: '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
    render(<CirugiaForm {...defaultProps} initial={initial} />)
    expect(screen.getByDisplayValue('Juan Perez')).toBeInTheDocument()
    expect(screen.getByDisplayValue('12.345.678-5')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2026-01-15')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Sin novedad')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Todo bien')).toBeInTheDocument()
  })

  it('disables buttons when loading', () => {
    render(<CirugiaForm {...defaultProps} loading={true} />)
    expect(screen.getByTestId('btn-cancel')).toBeDisabled()
    expect(screen.getByTestId('btn-submit')).toBeDisabled()
  })
})
