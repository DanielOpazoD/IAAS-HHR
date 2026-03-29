import { ReactNode, useState, useMemo, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import Icon from '@/components/ui/Icon'

interface Column<T> {
  key: string
  label: string
  render?: (item: T) => ReactNode
  className?: string
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  emptyMessage?: string
  /** Optional CTA shown in empty state (e.g. "Agregar primer registro") */
  onEmptyAction?: () => void
  emptyActionLabel?: string
  searchable?: boolean
  searchKeys?: string[]
  pageSize?: number
  /** Si se pasa, el buscador pasa a ser controlado externamente y no se muestra dentro de la tabla */
  search?: string
  onSearchChange?: (v: string) => void
}

type SortDir = 'asc' | 'desc'

const PAGE_SIZE_DEFAULT = 25

export default function DataTable<T extends { id?: string }>({
  columns,
  data,
  onEdit,
  onDelete,
  emptyMessage = 'No hay registros',
  onEmptyAction,
  emptyActionLabel = 'Agregar primer registro',
  searchable = true,
  searchKeys = ['nombre', 'rut'],
  pageSize = PAGE_SIZE_DEFAULT,
  search: externalSearch,
  onSearchChange,
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState('')
  const isControlled = externalSearch !== undefined
  const search = isControlled ? externalSearch : internalSearch
  const setSearch = isControlled ? (onSearchChange ?? (() => {})) : setInternalSearch
  const debouncedSearch = useDebounce(search, 300)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(0)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const processed = useMemo(() => {
    let result = data

    // Search filter
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim()
      result = result.filter((item) => {
        const rec = item as Record<string, unknown>
        return searchKeys.some((key) => {
          const val = rec[key]
          return typeof val === 'string' && val.toLowerCase().includes(q)
        })
      })
    }

    // Sort
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const va = (a as Record<string, unknown>)[sortKey]
        const vb = (b as Record<string, unknown>)[sortKey]
        const sa = typeof va === 'string' ? va : String(va ?? '')
        const sb = typeof vb === 'string' ? vb : String(vb ?? '')
        const cmp = sa.localeCompare(sb, 'es', { numeric: true })
        return sortDir === 'asc' ? cmp : -cmp
      })
    }

    return result
  }, [data, debouncedSearch, searchKeys, sortKey, sortDir])

  // Reset page when data/filters change
  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize))
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: clamp page when filter reduces total
    setPage((prev) => Math.min(prev, Math.max(0, totalPages - 1)))
  }, [totalPages])

  const paginatedData = useMemo(() => {
    if (processed.length <= pageSize) return processed
    const start = page * pageSize
    return processed.slice(start, start + pageSize)
  }, [processed, page, pageSize])

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 px-8 text-center" data-testid="empty-state">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon name="document" className="w-8 h-8 text-gray-300" strokeWidth={1} />
        </div>
        <p className="text-gray-700 font-semibold mb-1" data-testid="empty-message">{emptyMessage}</p>
        <p className="text-xs text-gray-400 mb-5">Los registros aparecerán aquí al ser agregados</p>
        {onEmptyAction && (
          <button
            onClick={onEmptyAction}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
          >
            <Icon name="plus" className="w-4 h-4" />
            {emptyActionLabel}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" data-testid="data-table">
      {/* Search bar — solo se muestra si no está controlado externamente */}
      {searchable && !isControlled && data.length > 3 && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative max-w-xs">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o RUT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                aria-label="Limpiar búsqueda"
              >
                <Icon name="close" className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.className || ''} ${col.sortable !== false ? 'cursor-pointer select-none hover:text-gray-700' : ''}`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  onKeyDown={(e) => { if (col.sortable !== false && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); handleSort(col.key) } }}
                  tabIndex={col.sortable !== false ? 0 : undefined}
                  role={col.sortable !== false ? 'button' : undefined}
                  aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <Icon name="chevron-up" className={`w-3 h-3 ${sortDir === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </span>
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((item, idx) => (
              <tr key={item.id || idx} className={`hover:bg-primary-50/40 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-gray-700 ${col.className || ''}`}>
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                          title="Editar"
                          aria-label="Editar registro"
                          data-testid="btn-edit"
                        >
                          <Icon name="edit" className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Eliminar"
                          aria-label="Eliminar registro"
                          data-testid="btn-delete"
                        >
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer with count and pagination */}
      <div className="px-4 py-2.5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between" aria-live="polite" role="status">
        <p className="text-xs text-gray-400">
          {search
            ? `${processed.length} de ${data.length} registro${data.length !== 1 ? 's' : ''}`
            : `${data.length} registro${data.length !== 1 ? 's' : ''}`}
          {processed.length > pageSize && ` — pag. ${page + 1} de ${totalPages}`}
        </p>
        <div className="flex items-center gap-2">
          {sortKey && (
            <button
              onClick={() => { setSortKey(null); setSortDir('asc') }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Quitar orden
            </button>
          )}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-100"
                aria-label="Pagina anterior"
              >
                <Icon name="chevron-left" className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-500 font-medium min-w-[3rem] text-center">{page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-100"
                aria-label="Pagina siguiente"
              >
                <Icon name="chevron-right" className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
