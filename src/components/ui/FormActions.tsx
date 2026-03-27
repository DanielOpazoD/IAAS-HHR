interface FormActionsProps {
  onCancel: () => void
  isEditing: boolean
  submitLabel?: string
  loading?: boolean
}

/** Shared cancel/submit button footer for all forms */
export default function FormActions({ onCancel, isEditing, submitLabel, loading }: FormActionsProps) {
  return (
    <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-gray-100">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="btn-cancel"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        data-testid="btn-submit"
      >
        {loading && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {loading ? 'Guardando...' : (submitLabel || (isEditing ? 'Actualizar' : 'Guardar'))}
      </button>
    </div>
  )
}
