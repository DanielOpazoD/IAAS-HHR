import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import DataTable from '@/components/ui/DataTable'

interface TestItem {
  id: string
  nombre: string
  rut: string
  edad: number
}

const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'rut', label: 'RUT' },
  { key: 'edad', label: 'Edad' },
]

const sampleData: TestItem[] = [
  { id: '1', nombre: 'Juan Pérez', rut: '12.345.678-9', edad: 45 },
  { id: '2', nombre: 'María López', rut: '98.765.432-1', edad: 32 },
  { id: '3', nombre: 'Carlos Ruiz', rut: '11.222.333-4', edad: 58 },
  { id: '4', nombre: 'Ana Torres', rut: '55.666.777-8', edad: 27 },
]

describe('DataTable', () => {
  it('shows empty state when data is empty', () => {
    render(<DataTable columns={columns} data={[]} />)
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    expect(screen.getByTestId('empty-message')).toHaveTextContent('No hay registros')
  })

  it('shows custom empty message', () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="Sin datos" />)
    expect(screen.getByTestId('empty-message')).toHaveTextContent('Sin datos')
  })

  it('renders column headers', () => {
    render(<DataTable columns={columns} data={sampleData} />)
    expect(screen.getByText('Nombre')).toBeInTheDocument()
    expect(screen.getByText('RUT')).toBeInTheDocument()
    expect(screen.getByText('Edad')).toBeInTheDocument()
  })

  it('renders data rows', () => {
    render(<DataTable columns={columns} data={sampleData} />)
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('María López')).toBeInTheDocument()
    expect(screen.getByText('12.345.678-9')).toBeInTheDocument()
  })

  it('shows record count in footer', () => {
    render(<DataTable columns={columns} data={sampleData} />)
    expect(screen.getByText('4 registros')).toBeInTheDocument()
  })

  it('shows singular count for one record', () => {
    render(<DataTable columns={columns} data={[sampleData[0]]} />)
    expect(screen.getByText('1 registro')).toBeInTheDocument()
  })

  it('shows search bar when data has more than 3 items', () => {
    render(<DataTable columns={columns} data={sampleData} />)
    expect(screen.getByPlaceholderText('Buscar por nombre o RUT...')).toBeInTheDocument()
  })

  it('hides search bar when data has 3 or fewer items', () => {
    render(<DataTable columns={columns} data={sampleData.slice(0, 3)} />)
    expect(screen.queryByPlaceholderText('Buscar por nombre o RUT...')).toBeNull()
  })

  it('hides search bar when searchable is false', () => {
    render(<DataTable columns={columns} data={sampleData} searchable={false} />)
    expect(screen.queryByPlaceholderText('Buscar por nombre o RUT...')).toBeNull()
  })

  it('filters data by search term (after debounce)', () => {
    vi.useFakeTimers()
    render(<DataTable columns={columns} data={sampleData} />)
    const input = screen.getByPlaceholderText('Buscar por nombre o RUT...')
    fireEvent.change(input, { target: { value: 'Juan' } })
    act(() => { vi.advanceTimersByTime(300) })
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.queryByText('María López')).toBeNull()
    expect(screen.getByText('1 de 4 registros')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('shows clear search button when searching', () => {
    render(<DataTable columns={columns} data={sampleData} />)
    const input = screen.getByPlaceholderText('Buscar por nombre o RUT...')
    fireEvent.change(input, { target: { value: 'test' } })
    expect(screen.getByLabelText('Limpiar búsqueda')).toBeInTheDocument()
  })

  it('clears search when clicking clear button', () => {
    render(<DataTable columns={columns} data={sampleData} />)
    const input = screen.getByPlaceholderText('Buscar por nombre o RUT...')
    fireEvent.change(input, { target: { value: 'Juan' } })
    fireEvent.click(screen.getByLabelText('Limpiar búsqueda'))
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('María López')).toBeInTheDocument()
  })

  it('sorts data when clicking column header', () => {
    const { container } = render(<DataTable columns={columns} data={sampleData} />)
    fireEvent.click(screen.getByText('Nombre'))
    const rows = container.querySelectorAll('tbody tr')
    expect(rows[0]).toHaveTextContent('Ana Torres')
    expect(rows[3]).toHaveTextContent('María López')
  })

  it('toggles sort direction on second click', () => {
    const { container } = render(<DataTable columns={columns} data={sampleData} />)
    fireEvent.click(screen.getByText('Nombre'))
    fireEvent.click(screen.getByText('Nombre'))
    const rows = container.querySelectorAll('tbody tr')
    expect(rows[0]).toHaveTextContent('María López')
  })

  it('shows "Quitar orden" button when sorted', () => {
    render(<DataTable columns={columns} data={sampleData} />)
    fireEvent.click(screen.getByText('Nombre'))
    expect(screen.getByText('Quitar orden')).toBeInTheDocument()
  })

  it('renders edit button when onEdit is provided', () => {
    const onEdit = vi.fn()
    render(<DataTable columns={columns} data={sampleData} onEdit={onEdit} />)
    const editBtns = screen.getAllByTestId('btn-edit')
    expect(editBtns).toHaveLength(4)
  })

  it('calls onEdit with correct item', () => {
    const onEdit = vi.fn()
    render(<DataTable columns={columns} data={sampleData} onEdit={onEdit} />)
    const editBtns = screen.getAllByTestId('btn-edit')
    fireEvent.click(editBtns[0])
    expect(onEdit).toHaveBeenCalledWith(sampleData[0])
  })

  it('renders delete button when onDelete is provided', () => {
    const onDelete = vi.fn()
    render(<DataTable columns={columns} data={sampleData} onDelete={onDelete} />)
    const deleteBtns = screen.getAllByTestId('btn-delete')
    expect(deleteBtns).toHaveLength(4)
  })

  it('calls onDelete with correct item', () => {
    const onDelete = vi.fn()
    render(<DataTable columns={columns} data={sampleData} onDelete={onDelete} />)
    const deleteBtns = screen.getAllByTestId('btn-delete')
    fireEvent.click(deleteBtns[1])
    expect(onDelete).toHaveBeenCalledWith(sampleData[1])
  })

  it('renders Acciones header when onEdit or onDelete is set', () => {
    render(<DataTable columns={columns} data={sampleData} onEdit={vi.fn()} />)
    expect(screen.getByText('Acciones')).toBeInTheDocument()
  })

  it('does not render Acciones header without callbacks', () => {
    render(<DataTable columns={columns} data={sampleData} />)
    expect(screen.queryByText('Acciones')).toBeNull()
  })

  it('uses custom render function for columns', () => {
    const customCols = [
      { key: 'nombre', label: 'Nombre', render: (item: TestItem) => <strong>{item.nombre.toUpperCase()}</strong> },
    ]
    render(<DataTable columns={customCols} data={sampleData} />)
    expect(screen.getByText('JUAN PÉREZ')).toBeInTheDocument()
  })
})
