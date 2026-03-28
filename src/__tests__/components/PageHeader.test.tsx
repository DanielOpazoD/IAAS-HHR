import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PageHeader from '@/components/layout/PageHeader'

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="Cirugías Trazadoras" />)
    expect(screen.getByTestId('page-title')).toHaveTextContent('Cirugías Trazadoras')
  })

  it('renders add button when onAdd is provided', () => {
    render(<PageHeader title="Test" onAdd={vi.fn()} />)
    expect(screen.getByTestId('btn-add')).toBeInTheDocument()
    expect(screen.getByTestId('btn-add')).toHaveTextContent('Agregar')
  })

  it('renders custom add label', () => {
    render(<PageHeader title="Test" onAdd={vi.fn()} addLabel="Nuevo registro" />)
    expect(screen.getByTestId('btn-add')).toHaveTextContent('Nuevo registro')
  })

  it('calls onAdd when clicking add button', () => {
    const onAdd = vi.fn()
    render(<PageHeader title="Test" onAdd={onAdd} />)
    fireEvent.click(screen.getByTestId('btn-add'))
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('renders export button when onExport is provided', () => {
    render(<PageHeader title="Test" onExport={vi.fn()} />)
    expect(screen.getByTestId('btn-export')).toBeInTheDocument()
    expect(screen.getByTestId('btn-export')).toHaveTextContent('Excel')
  })

  it('calls onExport when clicking export button', () => {
    const onExport = vi.fn()
    render(<PageHeader title="Test" onExport={onExport} />)
    fireEvent.click(screen.getByTestId('btn-export'))
    expect(onExport).toHaveBeenCalledOnce()
  })

  it('does not render add button when onAdd is not provided', () => {
    render(<PageHeader title="Test" />)
    expect(screen.queryByTestId('btn-add')).toBeNull()
  })

  it('does not render export button when onExport is not provided', () => {
    render(<PageHeader title="Test" />)
    expect(screen.queryByTestId('btn-export')).toBeNull()
  })

  it('renders both add and export buttons together', () => {
    render(<PageHeader title="Test" onAdd={vi.fn()} onExport={vi.fn()} />)
    expect(screen.getByTestId('btn-add')).toBeInTheDocument()
    expect(screen.getByTestId('btn-export')).toBeInTheDocument()
  })

  it('add button shows Ctrl+N tooltip', () => {
    render(<PageHeader title="Test" onAdd={vi.fn()} addLabel="Agregar" />)
    expect(screen.getByTestId('btn-add')).toHaveAttribute('title', 'Agregar (Ctrl+N)')
  })
})
