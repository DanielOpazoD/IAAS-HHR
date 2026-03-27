import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useCollection } from '@/hooks/useCollection'
import { MESES } from '@/utils/constants'
import PageHeader from '@/components/layout/PageHeader'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import type { BaseRecord } from '@/types'
import type { RegistryConfig } from '@/config/registries'

/**
 * Generic CRUD page component. Replaces 5 near-identical page files
 * with a single reusable component driven by a RegistryConfig.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function GenericDataPage({ config }: { config: RegistryConfig<any> }) {
  type T = Record<string, unknown>
  const { anio } = useOutletContext<{ anio: number }>()
  const { data, loading, add, update, remove } = useCollection<T>(config.collectionName, anio)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<(T & { id: string }) | undefined>()
  const [filterMes, setFilterMes] = useState('')
  const { confirm, ConfirmDialog } = useConfirm()

  const filtered =
    config.hasMonthFilter && filterMes
      ? data.filter((d) => (d as Record<string, unknown>)[config.filterKey || 'mes'] === filterMes)
      : data

  const nextNumero = config.getNextNumero?.(data)

  const handleSubmit = async (formData: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editing?.id) {
      await update(editing.id, formData)
    } else {
      await add(formData as T)
    }
    setModalOpen(false)
    setEditing(undefined)
  }

  const handleEdit = (item: T & { id: string }) => {
    setEditing(item)
    setModalOpen(true)
  }

  const handleDelete = async (item: T & { id: string }) => {
    const ok = await confirm('¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.', {
      title: 'Eliminar registro',
      variant: 'danger',
    })
    if (ok && item.id) {
      await remove(item.id)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(undefined)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="w-6 h-6 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  const { FormComponent } = config

  return (
    <>
      <PageHeader
        title={config.title}
        subtitle={config.subtitle(anio)}
        onAdd={() => { setEditing(undefined); setModalOpen(true) }}
        onExport={() => config.exportFn(filtered, anio)}
      />

      {config.hasMonthFilter && (
        <div className="mb-4">
          <select
            value={filterMes}
            onChange={(e) => setFilterMes(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">Todos los meses</option>
            {MESES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      )}

      <DataTable
        columns={config.columns}
        data={filtered}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage={`No hay ${config.entityName.plural} registrad${config.entityName.plural.endsWith('as') ? 'a' : 'o'}s`}
      />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? `Editar ${config.entityName.singular}` : `Nuev${config.entityName.singular.endsWith('a') || config.entityName.singular === 'Cirugía' ? 'a' : 'o'} ${config.entityName.singular}`}
        wide={config.wideModal}
      >
        <FormComponent
          initial={editing}
          anio={anio}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          nextNumero={nextNumero}
        />
      </Modal>

      {ConfirmDialog}
    </>
  )
}
