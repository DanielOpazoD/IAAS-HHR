import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FormActions from '@/components/ui/FormActions'

describe('FormActions', () => {
  it('renders cancel and submit buttons', () => {
    render(<FormActions onCancel={vi.fn()} isEditing={false} />)
    expect(screen.getByTestId('btn-cancel')).toBeInTheDocument()
    expect(screen.getByTestId('btn-submit')).toBeInTheDocument()
  })

  it('shows "Guardar" when not editing', () => {
    render(<FormActions onCancel={vi.fn()} isEditing={false} />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent('Guardar')
  })

  it('shows "Actualizar" when editing', () => {
    render(<FormActions onCancel={vi.fn()} isEditing={true} />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent('Actualizar')
  })

  it('shows custom submitLabel', () => {
    render(<FormActions onCancel={vi.fn()} isEditing={false} submitLabel="Enviar" />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent('Enviar')
  })

  it('calls onCancel when clicking cancel', () => {
    const onCancel = vi.fn()
    render(<FormActions onCancel={onCancel} isEditing={false} />)
    fireEvent.click(screen.getByTestId('btn-cancel'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('shows "Guardando..." when loading', () => {
    render(<FormActions onCancel={vi.fn()} isEditing={false} loading={true} />)
    expect(screen.getByTestId('btn-submit')).toHaveTextContent('Guardando...')
  })

  it('disables both buttons when loading', () => {
    render(<FormActions onCancel={vi.fn()} isEditing={false} loading={true} />)
    expect(screen.getByTestId('btn-cancel')).toBeDisabled()
    expect(screen.getByTestId('btn-submit')).toBeDisabled()
  })

  it('buttons are enabled when not loading', () => {
    render(<FormActions onCancel={vi.fn()} isEditing={false} />)
    expect(screen.getByTestId('btn-cancel')).not.toBeDisabled()
    expect(screen.getByTestId('btn-submit')).not.toBeDisabled()
  })

  it('submit button has type submit', () => {
    render(<FormActions onCancel={vi.fn()} isEditing={false} />)
    expect(screen.getByTestId('btn-submit')).toHaveAttribute('type', 'submit')
  })

  it('cancel button has type button (does not submit form)', () => {
    render(<FormActions onCancel={vi.fn()} isEditing={false} />)
    expect(screen.getByTestId('btn-cancel')).toHaveAttribute('type', 'button')
  })
})
