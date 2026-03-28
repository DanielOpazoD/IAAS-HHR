import Modal from '@/components/ui/Modal'
import type { RegistryConfig } from '@/config/registries'

type AnyRecord = Record<string, unknown>

interface GenericDataModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: RegistryConfig<any>
  open: boolean
  onClose: () => void
  editing: (AnyRecord & { id: string }) | undefined
  anio: number
  onSubmit: (formData: Omit<AnyRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  saving: boolean
  duplicateWarning: string | null
  onFormChange: (values: { rut?: string; mes?: string }) => void
  nextNumero: number | undefined
}

/**
 * Modal wrapper for GenericDataPage.
 * Renders the form component with duplicate-warning banner and submit/cancel actions.
 * Extracted from GenericDataPage to keep each file focused on a single responsibility.
 */
export default function GenericDataModal({
  config,
  open,
  onClose,
  editing,
  anio,
  onSubmit,
  saving,
  duplicateWarning,
  onFormChange,
  nextNumero,
}: GenericDataModalProps) {
  const { FormComponent, entityName, wideModal } = config

  const title = editing
    ? `Editar ${entityName.singular}`
    : `Nuev${entityName.singular.endsWith('a') || entityName.singular === 'Cirugía' ? 'a' : 'o'} ${entityName.singular}`

  return (
    <Modal open={open} onClose={onClose} title={title} wide={wideModal}>
      {duplicateWarning && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex items-start gap-2">
          <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {duplicateWarning}
        </div>
      )}
      <FormComponent
        initial={editing}
        anio={anio}
        onSubmit={onSubmit}
        onCancel={onClose}
        nextNumero={nextNumero}
        loading={saving}
        onFormChange={onFormChange}
      />
    </Modal>
  )
}
