import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { DispositivoInvasivo } from '../types'
import { useCollection } from '../hooks/useCollection'
import { formatDateDisplay } from '../utils/dates'
import { MESES } from '../utils/constants'
import PageHeader from '../components/layout/PageHeader'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import DipForm from '../components/forms/DipForm'
import { exportDip } from '../services/excel/dipExport'

export default function DipPage() {
  const { anio } = useOutletContext<{ anio: number }>()
  const { data, loading, add, update, remove } = useCollection<DispositivoInvasivo>('dip', anio)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<DispositivoInvasivo | undefined>()
  const [filterMes, setFilterMes] = useState('')

  const filtered = filterMes ? data.filter((d) => d.mes === filterMes) : data

  const handleSubmit = async (formData: Omit<DispositivoInvasivo, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editing?.id) {
      await update(editing.id, formData)
    } else {
      await add(formData as DispositivoInvasivo)
    }
    setModalOpen(false)
    setEditing(undefined)
  }

  const handleEdit = (item: DispositivoInvasivo) => { setEditing(item); setModalOpen(true) }
  const handleDelete = async (item: DispositivoInvasivo) => {
    if (item.id && confirm('¿Eliminar este registro?')) await remove(item.id)
  }

  const columns = [
    { key: 'mes', label: 'Mes', className: 'w-20' },
    { key: 'servicio', label: 'Servicio', className: 'w-20' },
    { key: 'nombre', label: 'Paciente' },
    { key: 'rut', label: 'RUT', className: 'w-28' },
    { key: 'edad', label: 'Edad', className: 'w-14' },
    { key: 'tipoDIP', label: 'DIP', className: 'w-14' },
    { key: 'periodo1', label: 'Instalación', render: (r: DispositivoInvasivo) => r.periodos?.[0] ? formatDateDisplay(r.periodos[0].fechaInstalacion) : '', className: 'w-24' },
    { key: 'periodo1r', label: 'Retiro', render: (r: DispositivoInvasivo) => r.periodos?.[0] ? formatDateDisplay(r.periodos[0].fechaRetiro) : '', className: 'w-24' },
    { key: 'totalDias', label: 'Total Días', className: 'w-20' },
    { key: 'revisionFC', label: 'Revisión FC', className: 'max-w-[200px] truncate' },
  ]

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Cargando...</div>

  return (
    <>
      <PageHeader title="Dispositivos Invasivos Permanentes (DIP)" subtitle={`${anio}`} onAdd={() => { setEditing(undefined); setModalOpen(true) }} onExport={() => exportDip(filtered, anio)} />
      <div className="mb-4">
        <select value={filterMes} onChange={(e) => setFilterMes(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
          <option value="">Todos los meses</option>
          {MESES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <DataTable columns={columns} data={filtered} onEdit={handleEdit} onDelete={handleDelete} />
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(undefined) }} title={editing ? 'Editar DIP' : 'Nuevo DIP'} wide>
        <DipForm initial={editing} anio={anio} onSubmit={handleSubmit} onCancel={() => { setModalOpen(false); setEditing(undefined) }} />
      </Modal>
    </>
  )
}
