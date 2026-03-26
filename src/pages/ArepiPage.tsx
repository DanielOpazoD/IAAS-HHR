import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AgenteRiesgoEpidemico } from '../types'
import { useCollection } from '../hooks/useCollection'
import { formatDateDisplay } from '../utils/dates'
import PageHeader from '../components/layout/PageHeader'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import ArepiForm from '../components/forms/ArepiForm'
import { exportArepi } from '../services/excel/arepiExport'

export default function ArepiPage() {
  const { anio } = useOutletContext<{ anio: number }>()
  const { data, loading, add, update, remove } = useCollection<AgenteRiesgoEpidemico>('arepi', anio)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AgenteRiesgoEpidemico | undefined>()

  const handleSubmit = async (formData: Omit<AgenteRiesgoEpidemico, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editing?.id) {
      await update(editing.id, formData)
    } else {
      await add(formData as AgenteRiesgoEpidemico)
    }
    setModalOpen(false)
    setEditing(undefined)
  }

  const handleEdit = (item: AgenteRiesgoEpidemico) => { setEditing(item); setModalOpen(true) }
  const handleDelete = async (item: AgenteRiesgoEpidemico) => {
    if (item.id && confirm('¿Eliminar este registro?')) await remove(item.id)
  }

  const columns = [
    { key: 'fechaVE', label: 'Fecha VE', render: (r: AgenteRiesgoEpidemico) => formatDateDisplay(r.fechaVE), className: 'w-24' },
    { key: 'servicioClinico', label: 'Servicio', className: 'w-24' },
    { key: 'nombre', label: 'Paciente' },
    { key: 'edad', label: 'Edad', className: 'w-14' },
    { key: 'rut', label: 'RUT', className: 'w-28' },
    { key: 'tipoVigilancia', label: 'Tipo Vigilancia' },
    { key: 'criteriosEpidemiologicos', label: 'Criterios', className: 'max-w-[250px] truncate' },
  ]

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Cargando...</div>

  return (
    <>
      <PageHeader title="Agentes de Riesgo Epidémico (AREpi)" subtitle={`Solicitud y resultados de exámenes, ficha clínica - ${anio}`} onAdd={() => { setEditing(undefined); setModalOpen(true) }} onExport={() => exportArepi(data, anio)} />
      <DataTable columns={columns} data={data} onEdit={handleEdit} onDelete={handleDelete} />
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(undefined) }} title={editing ? 'Editar AREpi' : 'Nuevo AREpi'}>
        <ArepiForm initial={editing} anio={anio} onSubmit={handleSubmit} onCancel={() => { setModalOpen(false); setEditing(undefined) }} />
      </Modal>
    </>
  )
}
