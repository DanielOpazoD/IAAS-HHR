interface FormActionsProps {
  onCancel: () => void
  isEditing: boolean
  submitLabel?: string
}

/** Shared cancel/submit button footer for all forms */
export default function FormActions({ onCancel, isEditing, submitLabel }: FormActionsProps) {
  return (
    <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-gray-100">
      <button
        type="button"
        onClick={onCancel}
        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
      >
        Cancelar
      </button>
      <button
        type="submit"
        className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
      >
        {submitLabel || (isEditing ? 'Actualizar' : 'Guardar')}
      </button>
    </div>
  )
}
