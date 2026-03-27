import { useState } from 'react'
import { AgenteRiesgoEpidemico } from '@/types'
import { SERVICIOS } from '@/utils/constants'
import { formatRut, validateRut } from '@/utils/rut'
import { useFormState } from '@/hooks/useFormState'
import FormField, { Input, Select, Textarea } from '@/components/ui/FormField'
import FormActions from '@/components/ui/FormActions'

type FormData = Omit<AgenteRiesgoEpidemico, 'id' | 'createdAt' | 'updatedAt'>

interface Props {
  initial?: AgenteRiesgoEpidemico
  anio: number
  onSubmit: (data: FormData) => void
  onCancel: () => void
}

export default function ArepiForm({ initial, anio, onSubmit, onCancel }: Props) {
  const { form, set } = useFormState<FormData>(initial, {
    fechaVE: '', anio, servicioClinico: SERVICIOS[0],
    nombre: '', edad: '', rut: '', tipoVigilancia: '', criteriosEpidemiologicos: '',
  })
  const [rutError, setRutError] = useState('')

  const handleRutChange = (value: string) => {
    const formatted = formatRut(value)
    set('rut', formatted)
    if (formatted.length >= 3) {
      setRutError(validateRut(formatted) ? '' : 'RUT inválido')
    } else {
      setRutError('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.rut && !validateRut(form.rut)) {
      setRutError('RUT inválido')
      return
    }
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Nombre del Paciente" required>
          <Input value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required />
        </FormField>
        <FormField label="RUT" required error={rutError}>
          <Input value={form.rut} onChange={(e) => handleRutChange(e.target.value)} placeholder="12.345.678-9" required />
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
      <FormActions onCancel={onCancel} isEditing={!!initial?.id} />
    </form>
  )
}
