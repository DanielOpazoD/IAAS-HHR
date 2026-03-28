import Icon from '@/components/ui/Icon'

interface PageHeaderProps {
  title: string
  onAdd?: () => void
  onExport?: () => void
  addLabel?: string
}

export default function PageHeader({ title, onAdd, onExport, addLabel = 'Agregar' }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3" data-testid="page-header">
      <div>
        <h2 className="text-2xl font-bold text-gray-900" data-testid="page-title">{title}</h2>
      </div>
      <div className="flex gap-2">
        {onExport && (
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            data-testid="btn-export"
          >
            <Icon name="download" className="w-4 h-4" />
            Excel
          </button>
        )}
        {onAdd && (
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 shadow-sm hover:shadow-md transition-all"
            title={`${addLabel} (Ctrl+N)`}
            data-testid="btn-add"
          >
            <Icon name="plus" className="w-4 h-4" />
            {addLabel}
          </button>
        )}
      </div>
    </div>
  )
}
