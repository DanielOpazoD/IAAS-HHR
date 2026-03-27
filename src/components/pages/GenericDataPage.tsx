import { useState, useEffect, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useCollection } from '@/hooks/useCollection'
import { MESES } from '@/utils/constants'
import PageHeader from '@/components/layout/PageHeader'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import SkeletonTable from '@/components/ui/SkeletonTable'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import { useToastContext } from '@/context/ToastContext'
import type { BaseRecord } from '@/types'
import type { RegistryConfig } from '@/config/registries'

/**
 * Generic CRUD page component. Replaces 5 near-identical page files
 * with a single reusable component driven by a RegistryConfig.
 */
// `any` required: TS interfaces lack index signatures needed by Record<string, unknown>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function GenericDataPage({ config }: { config: RegistryConfig<any> }) {
  type T = Record<string, unknown>
  const { anio } = useOutletContext<{ anio: number }>()
  const { data, loading, add, update, remove } = useCollection<T>(config.collectionName, anio)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<(T & { id: string }) | undefined>()
  const [filterMes, setFilterMes] = useState('')
  const [filterSecondary, setFilterSecondary] = useState('')
  const { confirm, ConfirmDialog } = useConfirm()
  const { addToast } = useToastContext()

  const filtered = data.filter((d) => {
    const rec = d as Record<string, unknown>
    if (config.hasMonthFilter && filterMes && rec[config.filterKey || 'mes'] !== filterMes) return false
    if (config.secondaryFilter && filterSecondary && rec[config.secondaryFilter.key] !== filterSecondary) return false
    return true
  })

  const nextNumero = config.getNextNumero?.(data)

  const handleSubmit = async (formData: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editing?.id) {
        await update(editing.id, formData)
        addToast(`${config.entityName.singular} actualizado correctamente`, 'success')
      } else {
        await add(formData as T)
        addToast(`${config.entityName.singular} guardado correctamente`, 'success')
      }
      setModalOpen(false)
      setEditing(undefined)
    } catch {
      addToast(`Error al guardar ${config.entityName.singular.toLowerCase()}`, 'error')
    }
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
      try {
        await remove(item.id)
        addToast('Registro eliminado', 'info')
      } catch {
        addToast('Error al eliminar registro', 'error')
      }
    }
  }

  const openNew = useCallback(() => {
    setEditing(undefined)
    setModalOpen(true)
  }, [])

  const closeModal = () => {
    setModalOpen(false)
    setEditing(undefined)
  }

  // Keyboard shortcut: Ctrl+N to add new record
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !modalOpen) {
        e.preventDefault()
        openNew()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [modalOpen, openNew])

  if (loading) {
    return (
      <>
        <PageHeader title={config.title} subtitle={config.subtitle(anio)} />
        <SkeletonTable rows={6} cols={config.columns.length} />
      </>
    )
  }

  const { FormComponent } = config

  return (
    <>
      <PageHeader
        title={config.title}
        subtitle={config.subtitle(anio)}
        onAdd={openNew}
        onExport={() => {
          try {
            config.exportFn(filtered, anio)
            addToast('Excel exportado correctamente', 'success')
          } catch {
            addToast('Error al exportar Excel', 'error')
          }
        }}
      />

      {(config.hasMonthFilter || config.secondaryFilter) && (
        <div className="mb-4 flex items-center gap-3">
          {config.hasMonthFilter && (
            <select
              value={filterMes}
              onChange={(e) => setFilterMes(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="">Todos los meses</option>
              {MESES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          )}
          {config.secondaryFilter && (
            <select
              value={filterSecondary}
              onChange={(e) => setFilterSecondary(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="">{`Todos: ${config.secondaryFilter.label}`}</option>
              {config.secondaryFilter.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          )}
          {(filterMes || filterSecondary) && (
            <span className="text-xs text-gray-500">
              {filtered.length} de {data.length} registros
            </span>
          )}
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
