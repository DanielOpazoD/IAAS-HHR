import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    message: '¿Está seguro de eliminar este registro?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  }

  it('renders nothing when open is false', () => {
    const { container } = render(
      <ConfirmDialog {...defaultProps} open={false} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders default title', () => {
    render(<ConfirmDialog {...defaultProps} />)
    expect(screen.getByText('Confirmar acción')).toBeInTheDocument()
  })

  it('renders custom title', () => {
    render(<ConfirmDialog {...defaultProps} title="Eliminar registro" />)
    expect(screen.getByText('Eliminar registro')).toBeInTheDocument()
  })

  it('renders message', () => {
    render(<ConfirmDialog {...defaultProps} />)
    expect(screen.getByText('¿Está seguro de eliminar este registro?')).toBeInTheDocument()
  })

  it('renders default button labels', () => {
    render(<ConfirmDialog {...defaultProps} />)
    expect(screen.getByText('Confirmar')).toBeInTheDocument()
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
  })

  it('renders custom button labels', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmLabel="Sí, eliminar"
        cancelLabel="No, volver"
      />
    )
    expect(screen.getByText('Sí, eliminar')).toBeInTheDocument()
    expect(screen.getByText('No, volver')).toBeInTheDocument()
  })

  it('calls onConfirm when clicking confirm button', () => {
    const onConfirm = vi.fn()
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByTestId('btn-confirm'))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onCancel when clicking cancel button', () => {
    const onCancel = vi.fn()
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />)
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls onCancel when clicking backdrop', () => {
    const onCancel = vi.fn()
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />)
    const backdrop = screen.getByTestId('confirm-dialog').querySelector('.fixed.inset-0')
    fireEvent.click(backdrop!)
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('applies danger variant styling', () => {
    render(<ConfirmDialog {...defaultProps} variant="danger" />)
    const confirmBtn = screen.getByTestId('btn-confirm')
    expect(confirmBtn.className).toContain('bg-red-600')
  })

  it('applies default variant styling', () => {
    render(<ConfirmDialog {...defaultProps} variant="default" />)
    const confirmBtn = screen.getByTestId('btn-confirm')
    expect(confirmBtn.className).toContain('bg-primary-600')
  })
})
