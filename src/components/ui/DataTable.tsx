import { ReactNode, useState, useMemo, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

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
  searchable?: boolean
  searchKeys?: string[]
  pageSize?: number
}

type SortDir = 'asc' | 'desc'

const PAGE_SIZE_DEFAULT = 25

export default function DataTable<T extends { id?: string }>({
  columns,
  data,
  onEdit,
  onDelete,
  emptyMessage = 'No hay registros',
  searchable = true,
  searchKeys = ['nombre', 'rut'],
  pageSize = PAGE_SIZE_DEFAULT,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
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
    setPage((prev) => Math.min(prev, Math.max(0, totalPages - 1)))
  }, [totalPages])

  const paginatedData = useMemo(() => {
    if (processed.length <= pageSize) return processed
    const start = page * pageSize
    return processed.slice(start, start + pageSize)
  }, [processed, page, pageSize])

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center" data-testid="empty-state">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500 font-semibold mb-1" data-testid="empty-message">{emptyMessage}</p>
        <p className="text-xs text-gray-300">Los registros apareceran aqui al ser agregados</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" data-testid="data-table">
      {/* Search bar */}
      {searchable && data.length > 3 && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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
                      <svg className={`w-3 h-3 ${sortDir === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </span>
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginatedData.map((item, idx) => (
              <tr key={item.id || idx} className="hover:bg-primary-50/30 transition-colors">
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
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
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
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-xs text-gray-500 font-medium min-w-[3rem] text-center">{page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-100"
                aria-label="Pagina siguiente"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
