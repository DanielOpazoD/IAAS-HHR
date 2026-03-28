import { useState, useEffect } from 'react'

interface FormActionsProps {
  onCancel: () => void
  isEditing: boolean
  submitLabel?: string
  loading?: boolean
}

/** Shared cancel/submit button footer for all forms */
export default function FormActions({ onCancel, isEditing, submitLabel, loading }: FormActionsProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [wasLoading, setWasLoading] = useState(false)

  // Detect transition from loading=true to loading=false (successful save)
  useEffect(() => {
    if (loading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: tracks prop transition
      setWasLoading(true)
    } else if (wasLoading) {
      setShowSuccess(true)
      setWasLoading(false)
      const timer = setTimeout(() => setShowSuccess(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [loading, wasLoading])

  const buttonContent = () => {
    if (showSuccess) {
      return (
        <>
          <svg className="w-4 h-4 animate-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Guardado
        </>
      )
    }
    if (loading) {
      return (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Guardando...
        </>
      )
    }
    return submitLabel || (isEditing ? 'Actualizar' : 'Guardar')
  }

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
        className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 ${
          showSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-primary-600 hover:bg-primary-700'
        }`}
        data-testid="btn-submit"
      >
        {buttonContent()}
      </button>
    </div>
  )
}
