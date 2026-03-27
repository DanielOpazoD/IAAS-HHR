import { MESES } from '@/utils/constants'

interface FilterBarProps {
  hasMonthFilter?: boolean
  filterMes: string
  onFilterMesChange: (mes: string) => void
  secondaryFilter?: {
    key: string
    label: string
    options: readonly string[]
  }
  filterSecondary: string
  onFilterSecondaryChange: (value: string) => void
  filteredCount: number
  totalCount: number
}

/** Reusable filter bar extracted from GenericDataPage */
export default function FilterBar({
  hasMonthFilter,
  filterMes,
  onFilterMesChange,
  secondaryFilter,
  filterSecondary,
  onFilterSecondaryChange,
  filteredCount,
  totalCount,
}: FilterBarProps) {
  const hasActiveFilter = filterMes || filterSecondary

  return (
    <div className="mb-4 flex items-center gap-3">
      {hasMonthFilter && (
        <select
          value={filterMes}
          onChange={(e) => onFilterMesChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="">Todos los meses</option>
          {MESES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      )}
      {secondaryFilter && (
        <select
          value={filterSecondary}
          onChange={(e) => onFilterSecondaryChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="">{`Todos: ${secondaryFilter.label}`}</option>
          {secondaryFilter.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      )}
      {hasActiveFilter && (
        <span className="text-xs text-gray-500">
          {filteredCount} de {totalCount} registros
        </span>
      )}
    </div>
  )
}
