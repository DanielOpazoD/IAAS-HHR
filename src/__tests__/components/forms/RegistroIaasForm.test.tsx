import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RegistroIaasForm from '@/components/forms/RegistroIaasForm'

describe('RegistroIaasForm', () => {
  const defaultProps = {
    anio: 2026,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  }

  it('renders all field labels', () => {
    render(<RegistroIaasForm {...defaultProps} />)
    expect(screen.getByText('N°')).toBeInTheDocument()
    expect(screen.getByText('Nombre del Paciente')).toBeInTheDocument()
    expect(screen.getByText('RUT')).toBeInTheDocument()
    expect(screen.getByText('Sexo')).toBeInTheDocument()
    expect(screen.getByText('Fecha Ingreso')).toBeInTheDocument()
    expect(screen.getByText('Fecha Instalación')).toBeInTheDocument()
    expect(screen.getByText('Fecha DG / Fecha CX')).toBeInTheDocument()
    expect(screen.getByText('Días Invasivo')).toBeInTheDocument()
    expect(screen.getByText('IAAS')).toBeInTheDocument()
    expect(screen.getByText('Fallecido')).toBeInTheDocument()
    expect(screen.getByText('Fecha Cultivo')).toBeInTheDocument()
    expect(screen.getByText('Agente')).toBeInTheDocument()
    expect(screen.getByText('Diagnóstico')).toBeInTheDocument()
    expect(screen.getByText('Indicación de Instalación')).toBeInTheDocument()
    expect(screen.getByText('Indicación de Retiro')).toBeInTheDocument()
    expect(screen.getByText('Responsable')).toBeInTheDocument()
    expect(screen.getByText('Observaciones (Criterios, segundo agente, etc.)')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(<RegistroIaasForm {...defaultProps} onCancel={onCancel} />)
    fireEvent.click(screen.getByTestId('btn-cancel'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('shows Guardar label when creating', () => {
    render(<RegistroIaasForm {...defaultProps} />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent('Guardar')
  })

  it('shows Actualizar label when editing', () => {
    const initial = {
      id: '1', numero: 1, mes: 'Enero', anio: 2026, nombre: 'Test', rut: '12.345.678-5',
      sexo: 'M', fechaIngreso: '2026-01-01', fechaInstalacion: '2026-01-02',
      fechaDiagCx: '2026-01-03', diasInvasivo: 5, iaas: 'ITU', fallecido: 'NO',
      fechaCultivo: '2026-01-04', agente: 'E. coli', diagnostico: 'ITU',
      indicacionInstalacion: 'Retención', indicacionRetiro: 'Alta',
      responsable: 'Dr. Test', observaciones: 'Obs',
      createdAt: '', updatedAt: '',
    } as any
    render(<RegistroIaasForm {...defaultProps} initial={initial} />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent('Actualizar')
  })

  it('shows loading state', () => {
    render(<RegistroIaasForm {...defaultProps} loading={true} />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent('Guardando...')
  })

  it('populates fields from initial prop', () => {
    const initial = {
      id: '1', numero: 5, mes: 'Febrero', anio: 2026, nombre: 'Pedro Soto', rut: '11.222.333-4',
      sexo: 'M', fechaIngreso: '2026-02-01', fechaInstalacion: '2026-02-02',
      fechaDiagCx: '2026-02-03', diasInvasivo: 3, iaas: 'NAVM', fallecido: 'NO',
      fechaCultivo: '2026-02-04', agente: 'Pseudomonas', diagnostico: 'Neumonía',
      indicacionInstalacion: 'VM', indicacionRetiro: 'Extubación',
      responsable: 'Dra. Garcia', observaciones: 'Cultivo positivo',
      createdAt: '', updatedAt: '',
    } as any
    render(<RegistroIaasForm {...defaultProps} initial={initial} />)
    expect(screen.getByDisplayValue('Pedro Soto')).toBeInTheDocument()
    expect(screen.getByDisplayValue('11.222.333-4')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2026-02-01')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2026-02-02')).toBeInTheDocument()
    expect(screen.getByDisplayValue('NAVM')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Pseudomonas')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Neumonía')).toBeInTheDocument()
    expect(screen.getByDisplayValue('VM')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Extubación')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Dra. Garcia')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Cultivo positivo')).toBeInTheDocument()
  })

  it('uses nextNumero prop for default numero', () => {
    render(<RegistroIaasForm {...defaultProps} nextNumero={42} />)
    expect(screen.getByDisplayValue('42')).toBeInTheDocument()
  })

  it('disables buttons when loading', () => {
    render(<RegistroIaasForm {...defaultProps} loading={true} />)
    expect(screen.getByTestId('btn-cancel')).toBeDisabled()
    expect(screen.getByTestId('btn-submit')).toBeDisabled()
  })
})
