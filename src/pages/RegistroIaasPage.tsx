import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { RegistroIAAS } from '../types'
import { useCollection } from '../hooks/useCollection'
import { formatDateDisplay } from '../utils/dates'
import { MESES } from '../utils/constants'
import PageHeader from '../components/layout/PageHeader'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import RegistroIaasForm from '../components/forms/RegistroIaasForm'
import { exportRegistroIaas } from '../services/excel/registroExport'

export default function RegistroIaasPage() {
  const { anio } = useOutletContext<{ anio: number }>()
  const { data, loading, add, update, remove } = useCollection<RegistroIAAS>('registroIaas', anio)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RegistroIAAS | undefined>()
  const [filterMes, setFilterMes] = useState('')

  const filtered = filterMes ? data.filter((d) => d.mes === filterMes) : data
  const nextNumero = data.length > 0 ? Math.max(...data.map((d) => d.numero || 0)) + 1 : 1

  const handleSubmit = async (formData: Omit<RegistroIAAS, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editing?.id) {
      await update(editing.id, formData)
    } else {
      await add(formData as RegistroIAAS)
    }
    setModalOpen(false)
    setEditing(undefined)
  }

  const handleEdit = (item: RegistroIAAS) => { setEditing(item); setModalOpen(true) }
  const handleDelete = async (item: RegistroIAAS) => {
    if (item.id && confirm('¿Eliminar este registro?')) await remove(item.id)
  }

  const columns = [
    { key: 'numero', label: 'N°', className: 'w-12' },
    { key: 'mes', label: 'Mes', className: 'w-20' },
    { key: 'nombre', label: 'Paciente' },
    { key: 'rut', label: 'RUT', className: 'w-28' },
    { key: 'sexo', label: 'Sexo', className: 'w-12' },
    { key: 'fechaDiagCx', label: 'Fecha DG/CX', render: (r: RegistroIAAS) => formatDateDisplay(r.fechaDiagCx), className: 'w-24' },
    { key: 'iaas', label: 'IAAS', className: 'w-20' },
    { key: 'agente', label: 'Agente' },
    { key: 'diagnostico', label: 'Diagnóstico' },
    { key: 'fallecido', label: 'Fall.', className: 'w-14', render: (r: RegistroIAAS) => (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${r.fallecido === 'SI' ? 'bg-red-100 text-red-700' : 'text-gray-500'}`}>{r.fallecido}</span>
    )},
  ]

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Cargando...</div>

  return (
    <>
      <PageHeader title="Registro IAAS" subtitle={`${anio}`} onAdd={() => { setEditing(undefined); setModalOpen(true) }} onExport={() => exportRegistroIaas(filtered, anio)} />
      <div className="mb-4">
        <select value={filterMes} onChange={(e) => setFilterMes(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value="">Todos los meses</option>
          {MESES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <DataTable columns={columns} data={filtered} onEdit={handleEdit} onDelete={handleDelete} />
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(undefined) }} title={editing ? 'Editar Registro IAAS' : 'Nuevo Registro IAAS'} wide>
        <RegistroIaasForm initial={editing} anio={anio} nextNumero={nextNumero} onSubmit={handleSubmit} onCancel={() => { setModalOpen(false); setEditing(undefined) }} />
      </Modal>
    </>
  )
}
