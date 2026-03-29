/**
 * Pill-shaped badge for binary YES/NO values in table cells.
 * Uses rounded-full for a modern, compact pill appearance.
 */
export default function Badge({ value, positiveColor = 'red' }: { value: string; positiveColor?: 'red' | 'gray' }) {
  if (!value) return null
  const isPositive = value === 'SI'

  if (positiveColor === 'red') {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${
        isPositive
          ? 'bg-red-100 text-red-700 ring-1 ring-red-200'
          : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
      }`}>
        {value}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${
      isPositive
        ? 'bg-red-100 text-red-700 ring-1 ring-red-200'
        : 'text-gray-400'
    }`}>
      {value}
    </span>
  )
}
