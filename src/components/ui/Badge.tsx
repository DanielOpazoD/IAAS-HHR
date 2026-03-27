/** Inline badge for YES/NO values in table cells (IHO, IAAS, Fallecido, etc.) */
export default function Badge({ value, positiveColor = 'red' }: { value: string; positiveColor?: 'red' | 'gray' }) {
  const isPositive = value === 'SI'
  if (positiveColor === 'red') {
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${isPositive ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
        {value}
      </span>
    )
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${isPositive ? 'bg-red-100 text-red-700' : 'text-gray-500'}`}>
      {value}
    </span>
  )
}
