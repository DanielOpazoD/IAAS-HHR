import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { CirugiaTrazadora } from '../types'
import { useCollection } from '../hooks/useCollection'
import { formatDateDisplay } from '../utils/dates'
import { MESES } from '../utils/constants'
import PageHeader from '../components/layout/PageHeader'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import CirugiaForm from '../components/forms/CirugiaForm'
import { exportCirugias } from '../services/excel/cirugiasExport'

export default function CirugiasPage() {
  const { anio } = useOutletContext<{ anio: number }>()
  const { data, loading, add, update, remove } = useCollection<CirugiaTrazadora>('cirugias', anio)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CirugiaTrazadora | undefined>()
  const [filterMes, setFilterMes] = useState('')

  const filtered = filterMes ? data.filter((d) => d.mes === filterMes) : data

  const handleSubmit = async (formData: Omit<CirugiaTrazadora, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editing?.id) {
      await update(editing.id, formData)
    } else {
      await add(formData as CirugiaTrazadora)
    }
    setModalOpen(false)
    setEditing(undefined)
  }

  const handleEdit = (item: CirugiaTrazadora) => {
    setEditing(item)
    setModalOpen(true)
  }

  const handleDelete = async (item: CirugiaTrazadora) => {
    if (item.id && confirm('¿Eliminar este registro?')) {
      await remove(item.id)
    }
  }

  const columns = [
    { key: 'mes', label: 'Mes', className: 'w-20' },
    { key: 'nombre', label: 'Paciente' },
    { key: 'rut', label: 'RUT', className: 'w-28' },
    { key: 'fechaCirugia', label: 'Fecha Cx', render: (r: CirugiaTrazadora) => formatDateDisplay(r.fechaCirugia), className: 'w-24' },
    { key: 'tipoCirugia', label: 'Tipo Cirugía' },
    { key: 'fechaPrimerControl', label: '1er Control', render: (r: CirugiaTrazadora) => formatDateDisplay(r.fechaPrimerControl), className: 'w-24' },
    { key: 'iho', label: 'IHO', className: 'w-14', render: (r: CirugiaTrazadora) => (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.iho === 'SI' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{r.iho}</span>
    )},
    { key: 'observaciones', label: 'Obs.', className: 'max-w-[200px] truncate' },
  ]

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Cargando...</div>

  return (
    <>
      <PageHeader
        title="Cirugías Trazadoras"
        subtitle={`Fuente: Drive pabellón / Vigilancia epidemiológica - ${anio}`}
        onAdd={() => { setEditing(undefined); setModalOpen(true) }}
        onExport={() => exportCirugias(filtered, anio)}
      />
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
      <DataTable columns={columns} data={filtered} onEdit={handleEdit} onDelete={handleDelete} emptyMessage="No hay cirugías registradas" />
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(undefined) }} title={editing ? 'Editar Cirugía' : 'Nueva Cirugía'}>
        <CirugiaForm initial={editing} anio={anio} onSubmit={handleSubmit} onCancel={() => { setModalOpen(false); setEditing(undefined) }} />
      </Modal>
    </>
  )
}
