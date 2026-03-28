interface FilterBarProps {
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

/** Renders secondary (non-month) filters below the page title. Month filtering is handled by the Header slot. */
export default function FilterBar({
  secondaryFilter,
  filterSecondary,
  onFilterSecondaryChange,
  filteredCount,
  totalCount,
}: FilterBarProps) {
  return (
    <div className="mb-4 flex items-center gap-3">
      {secondaryFilter && (
        <select
          value={filterSecondary}
          onChange={(e) => onFilterSecondaryChange(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        >
          <option value="">{`Todos: ${secondaryFilter.label}`}</option>
          {secondaryFilter.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      )}
      {filterSecondary && (
        <span className="text-xs text-gray-500">
          {filteredCount} de {totalCount} registros
        </span>
      )}
    </div>
  )
}
