/**
 * Skeleton loading placeholder for data tables.
 * Shows animated pulse rows simulating table content.
 */
export default function SkeletonTable({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      {/* Header */}
      <div className="bg-gray-50/80 px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 rounded flex-1" />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-4 py-3.5 flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className={`h-3.5 bg-gray-100 rounded ${c === 0 ? 'w-16' : 'flex-1'}`}
                style={{ opacity: 1 - r * 0.1 }}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Footer */}
      <div className="px-4 py-2.5 bg-gray-50/50 border-t border-gray-100">
        <div className="h-3 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  )
}
