import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '@/components/ui/Modal'

describe('Modal', () => {
  it('renders nothing when open is false', () => {
    const { container } = render(
      <Modal open={false} onClose={vi.fn()} title="Test">
        <p>Content</p>
      </Modal>
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders title and children when open', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Mi Modal">
        <p>Contenido del modal</p>
      </Modal>
    )
    expect(screen.getByText('Mi Modal')).toBeInTheDocument()
    expect(screen.getByText('Contenido del modal')).toBeInTheDocument()
  })

  it('has role dialog and aria-modal', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Test">
        <p>Body</p>
      </Modal>
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('has aria-labelledby linking to title', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Título">
        <p>Body</p>
      </Modal>
    )
    const dialog = screen.getByRole('dialog')
    const labelledBy = dialog.getAttribute('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    const titleEl = document.getElementById(labelledBy!)
    expect(titleEl?.textContent).toBe('Título')
  })

  it('calls onClose when clicking the close button', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>Body</p>
      </Modal>
    )
    const closeBtn = screen.getByLabelText('Cerrar')
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when pressing Escape', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>Body</p>
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when clicking backdrop', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>Body</p>
      </Modal>
    )
    const backdrop = screen.getByRole('dialog').querySelector('[aria-hidden="true"]')
    fireEvent.click(backdrop!)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('locks body scroll when open', () => {
    const { unmount } = render(
      <Modal open={true} onClose={vi.fn()} title="Test">
        <p>Body</p>
      </Modal>
    )
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('applies wide class when wide prop is true', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Test" wide>
        <p>Body</p>
      </Modal>
    )
    const dialog = screen.getByTestId('modal')
    expect(dialog.innerHTML).toContain('max-w-4xl')
  })

  it('applies default width when wide is not set', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Test">
        <p>Body</p>
      </Modal>
    )
    const dialog = screen.getByTestId('modal')
    expect(dialog.innerHTML).toContain('max-w-2xl')
  })
})
