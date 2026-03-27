import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ToastContainer from '@/components/ui/ToastContainer'
import type { Toast } from '@/hooks/useToast'

describe('ToastContainer', () => {
  const onRemove = vi.fn()

  it('renders nothing when toasts array is empty', () => {
    const { container } = render(<ToastContainer toasts={[]} onRemove={onRemove} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders toast messages', () => {
    const toasts: Toast[] = [
      { id: '1', message: 'Registro guardado', type: 'success' },
      { id: '2', message: 'Error al guardar', type: 'error' },
    ]
    render(<ToastContainer toasts={toasts} onRemove={onRemove} />)
    expect(screen.getByText('Registro guardado')).toBeInTheDocument()
    expect(screen.getByText('Error al guardar')).toBeInTheDocument()
  })

  it('has role status and aria-live polite', () => {
    const toasts: Toast[] = [{ id: '1', message: 'Test', type: 'info' }]
    render(<ToastContainer toasts={toasts} onRemove={onRemove} />)
    const container = screen.getByRole('status')
    expect(container).toHaveAttribute('aria-live', 'polite')
  })

  it('calls onRemove with toast id when clicking close button', () => {
    const removeFn = vi.fn()
    const toasts: Toast[] = [{ id: 'abc', message: 'Test toast', type: 'success' }]
    render(<ToastContainer toasts={toasts} onRemove={removeFn} />)
    fireEvent.click(screen.getByLabelText('Cerrar notificación'))
    expect(removeFn).toHaveBeenCalledWith('abc')
  })

  it('applies success styling', () => {
    const toasts: Toast[] = [{ id: '1', message: 'OK', type: 'success' }]
    const { container } = render(<ToastContainer toasts={toasts} onRemove={onRemove} />)
    const toast = container.querySelector('.bg-green-50')
    expect(toast).toBeInTheDocument()
  })

  it('applies error styling', () => {
    const toasts: Toast[] = [{ id: '1', message: 'Fail', type: 'error' }]
    const { container } = render(<ToastContainer toasts={toasts} onRemove={onRemove} />)
    const toast = container.querySelector('.bg-red-50')
    expect(toast).toBeInTheDocument()
  })

  it('applies info styling', () => {
    const toasts: Toast[] = [{ id: '1', message: 'Info', type: 'info' }]
    const { container } = render(<ToastContainer toasts={toasts} onRemove={onRemove} />)
    const toast = container.querySelector('.bg-blue-50')
    expect(toast).toBeInTheDocument()
  })

  it('renders multiple toasts simultaneously', () => {
    const toasts: Toast[] = [
      { id: '1', message: 'Primero', type: 'success' },
      { id: '2', message: 'Segundo', type: 'error' },
      { id: '3', message: 'Tercero', type: 'info' },
    ]
    render(<ToastContainer toasts={toasts} onRemove={onRemove} />)
    expect(screen.getByText('Primero')).toBeInTheDocument()
    expect(screen.getByText('Segundo')).toBeInTheDocument()
    expect(screen.getByText('Tercero')).toBeInTheDocument()
  })
})
