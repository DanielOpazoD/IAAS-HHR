import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { PartoCesarea } from '../types'
import { useCollection } from '../hooks/useCollection'
import { formatDateDisplay } from '../utils/dates'
import { MESES } from '../utils/constants'
import PageHeader from '../components/layout/PageHeader'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import PartoForm from '../components/forms/PartoForm'
import { exportPartos } from '../services/excel/partosExport'

export default function PartosPage() {
  const { anio } = useOutletContext<{ anio: number }>()
  const { data, loading, add, update, remove } = useCollection<PartoCesarea>('partos', anio)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PartoCesarea | undefined>()
  const [filterMes, setFilterMes] = useState('')

  const filtered = filterMes ? data.filter((d) => d.mes === filterMes) : data

  const handleSubmit = async (formData: Omit<PartoCesarea, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editing?.id) {
      await update(editing.id, formData)
    } else {
      await add(formData as PartoCesarea)
    }
    setModalOpen(false)
    setEditing(undefined)
  }

  const handleEdit = (item: PartoCesarea) => { setEditing(item); setModalOpen(true) }
  const handleDelete = async (item: PartoCesarea) => {
    if (item.id && confirm('¿Eliminar este registro?')) await remove(item.id)
  }

  const columns = [
    { key: 'mes', label: 'Mes', className: 'w-20' },
    { key: 'nombre', label: 'Paciente' },
    { key: 'rut', label: 'RUT', className: 'w-28' },
    { key: 'fechaParto', label: 'Fecha', render: (r: PartoCesarea) => formatDateDisplay(r.fechaParto), className: 'w-24' },
    { key: 'tipo', label: 'Tipo', className: 'w-28' },
    { key: 'conTP', label: 'TP', className: 'w-16' },
    { key: 'controlPostParto', label: 'Control Post Parto', className: 'max-w-[200px] truncate' },
    { key: 'signosSintomasIAAS', label: 'IAAS', className: 'w-14', render: (r: PartoCesarea) => (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.signosSintomasIAAS === 'SI' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{r.signosSintomasIAAS}</span>
    )},
  ]

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Cargando...</div>

  return (
    <>
      <PageHeader title="Endometritis Puerperal" subtitle={`Partos / Cesárea - ${anio}`} onAdd={() => { setEditing(undefined); setModalOpen(true) }} onExport={() => exportPartos(filtered, anio)} />
      <div className="mb-4">
        <select value={filterMes} onChange={(e) => setFilterMes(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value="">Todos los meses</option>
          {MESES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <DataTable columns={columns} data={filtered} onEdit={handleEdit} onDelete={handleDelete} />
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(undefined) }} title={editing ? 'Editar Parto/Cesárea' : 'Nuevo Parto/Cesárea'}>
        <PartoForm initial={editing} anio={anio} onSubmit={handleSubmit} onCancel={() => { setModalOpen(false); setEditing(undefined) }} />
      </Modal>
    </>
  )
}
