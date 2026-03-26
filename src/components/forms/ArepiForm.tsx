import { useState } from 'react'
import { AgenteRiesgoEpidemico } from '../../types'
import { SERVICIOS } from '../../utils/constants'
import { formatRut } from '../../utils/rut'
import FormField, { Input, Select, Textarea } from '../ui/FormField'

interface ArepiFormProps {
  initial?: AgenteRiesgoEpidemico
  anio: number
  onSubmit: (data: Omit<AgenteRiesgoEpidemico, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export default function ArepiForm({ initial, anio, onSubmit, onCancel }: ArepiFormProps) {
  const [form, setForm] = useState({
    fechaVE: initial?.fechaVE || '',
    anio: initial?.anio || anio,
    servicioClinico: initial?.servicioClinico || SERVICIOS[0],
    nombre: initial?.nombre || '',
    edad: initial?.edad || '',
    rut: initial?.rut || '',
    tipoVigilancia: initial?.tipoVigilancia || '',
    criteriosEpidemiologicos: initial?.criteriosEpidemiologicos || '',
  })

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Nombre del Paciente">
          <Input value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required />
        </FormField>
        <FormField label="RUT">
          <Input value={form.rut} onChange={(e) => set('rut', formatRut(e.target.value))} placeholder="12.345.678-9" required />
        </FormField>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <FormField label="Fecha VE">
          <Input type="date" value={form.fechaVE} onChange={(e) => set('fechaVE', e.target.value)} required />
        </FormField>
        <FormField label="Servicio Clínico">
          <Select value={form.servicioClinico} onChange={(e) => set('servicioClinico', e.target.value)}>
            {SERVICIOS.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </FormField>
        <FormField label="Edad">
          <Input value={form.edad} onChange={(e) => set('edad', e.target.value)} />
        </FormField>
      </div>
      <FormField label="Tipo de Vigilancia Asociada al Paciente">
        <Input value={form.tipoVigilancia} onChange={(e) => set('tipoVigilancia', e.target.value)} />
      </FormField>
      <FormField label="Criterios Epidemiológicos Identificados">
        <Textarea value={form.criteriosEpidemiologicos} onChange={(e) => set('criteriosEpidemiologicos', e.target.value)} rows={3} />
      </FormField>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700">{initial?.id ? 'Actualizar' : 'Guardar'}</button>
      </div>
    </form>
  )
}
