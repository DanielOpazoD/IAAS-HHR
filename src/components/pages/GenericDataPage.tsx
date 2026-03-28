import { useState, useCallback, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useCollection } from '@/hooks/useCollection'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { useConfirm } from '@/hooks/useConfirm'
import { useToastContext } from '@/context/ToastContext'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { useAuth } from '@/context/AuthContext'
import { useHeaderSlot } from '@/context/HeaderSlotContext'
import { getErrorMessage } from '@/utils/errors'
import { MESES } from '@/utils/constants'
import PageHeader from '@/components/layout/PageHeader'
import DataTable from '@/components/ui/DataTable'
import SkeletonTable from '@/components/ui/SkeletonTable'
import FilterBar from '@/components/ui/FilterBar'
import GenericDataModal from '@/components/pages/GenericDataModal'
import type { RegistryConfig } from '@/config/registries'

/**
 * Generic CRUD page — driven by a declarative RegistryConfig.
 *
 * Responsibilities:
 * - Data fetching, filtering and search state
 * - CRUD handlers (add / update / remove)
 * - Keyboard shortcuts and header slot injection
 * - Delegates modal rendering to GenericDataModal
 */
// `any` required: TS interfaces lack index signatures needed by Record<string, unknown>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function GenericDataPage({ config }: { config: RegistryConfig<any> }) {
  type T = Record<string, unknown>
  const { canWrite: canWriteFn } = useAuth()
  const writable = canWriteFn(config.collectionName)
  const { anio } = useOutletContext<{ anio: number }>()
  const { data, loading, add, update, remove } = useCollection<T>(config.collectionName, anio)

  // UI state
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<(T & { id: string }) | undefined>()
  const [filterMes, setFilterMes] = useState('')
  const [filterSecondary, setFilterSecondary] = useState('')
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const { confirm, ConfirmDialog } = useConfirm()
  const { addToast } = useToastContext()
  const { setSlot, clearSlot } = useHeaderSlot()
  useUnsavedChanges(modalOpen)

  // Inject month selector + search into the Header slot
  useEffect(() => {
    setSlot(
      <div className="flex items-center gap-2">
        {config.hasMonthFilter && (
          <>
            <select
              id="header-month-select"
              aria-label="Filtrar por mes"
              value={filterMes}
              onChange={(e) => setFilterMes(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            >
              <option value="">Todos los meses</option>
              {MESES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="w-px h-5 bg-gray-200" />
          </>
        )}
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar..."
            aria-label="Buscar registros"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors w-44"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Limpiar búsqueda"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    )
    return () => clearSlot()
  }, [config.hasMonthFilter, filterMes, search, setSlot, clearSlot])

  // Filtering
  const filtered = data.filter((d) => {
    const rec = d as Record<string, unknown>
    if (config.hasMonthFilter && filterMes && rec[config.filterKey || 'mes'] !== filterMes) return false
    if (config.secondaryFilter && filterSecondary && rec[config.secondaryFilter.key] !== filterSecondary) return false
    return true
  })

  const nextNumero = config.getNextNumero?.(data)

  // CRUD handlers
  const handleSubmit = async (formData: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => {
    setSaving(true)
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
    } catch (err) {
      addToast(`Error al guardar: ${getErrorMessage(err)}`, 'error')
    } finally {
      setSaving(false)
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
      } catch (err) {
        addToast(`Error al eliminar: ${getErrorMessage(err)}`, 'error')
      }
    }
  }

  const handleExport = () => {
    try {
      config.exportFn(filtered, anio)
      addToast('Excel exportado correctamente', 'success')
    } catch (err) {
      addToast(`Error al exportar: ${getErrorMessage(err)}`, 'error')
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

  // Ctrl+N → open new record modal
  useKeyboardShortcut('n', openNew, { ctrl: true, disabled: modalOpen || !writable })

  if (loading) {
    return (
      <>
        <PageHeader title={config.title} />
        <SkeletonTable rows={6} cols={config.columns.length} />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={config.title}
        onAdd={writable ? openNew : undefined}
        onExport={handleExport}
      />

      {config.secondaryFilter && (
        <FilterBar
          secondaryFilter={config.secondaryFilter}
          filterSecondary={filterSecondary}
          onFilterSecondaryChange={setFilterSecondary}
          filteredCount={filtered.length}
          totalCount={data.length}
        />
      )}

      {/* Record count when month filter is active but no secondary filter */}
      {config.hasMonthFilter && filterMes && !config.secondaryFilter && (
        <p className="mb-4 text-xs text-gray-500">{filtered.length} de {data.length} registros</p>
      )}

      <DataTable
        columns={config.columns}
        data={filtered}
        onEdit={writable ? handleEdit : undefined}
        onDelete={writable ? handleDelete : undefined}
        emptyMessage={`No hay ${config.entityName.plural} registrad${config.entityName.plural.endsWith('as') ? 'a' : 'o'}s`}
        search={search}
        onSearchChange={setSearch}
      />

      <GenericDataModal
        config={config}
        open={modalOpen}
        onClose={closeModal}
        editing={editing}
        anio={anio}
        data={data as Record<string, unknown>[]}
        onSubmit={handleSubmit}
        saving={saving}
        nextNumero={nextNumero}
      />

      {ConfirmDialog}
    </>
  )
}
