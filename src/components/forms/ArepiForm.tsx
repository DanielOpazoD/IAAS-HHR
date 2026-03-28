import { useCallback, FormEvent } from 'react'
import { AgenteRiesgoEpidemico } from '@/types'
import { SERVICIOS } from '@/utils/constants'
import { useFormState } from '@/hooks/useFormState'
import { useRutField } from '@/hooks/useRutField'
import { useFormValidation } from '@/hooks/useFormValidation'
import { arepiSchema } from '@/schemas'
import { useFormChangeNotify } from '@/hooks/useFormChangeNotify'
import FormField, { Input, Select, Textarea } from '@/components/ui/FormField'
import FormActions from '@/components/ui/FormActions'

type FormData = Omit<AgenteRiesgoEpidemico, 'id' | 'createdAt' | 'updatedAt'>

interface Props {
  initial?: AgenteRiesgoEpidemico
  anio: number
  onSubmit: (data: FormData) => void
  onCancel: () => void
  loading?: boolean
  onFormChange?: (values: { rut?: string; mes?: string }) => void
}

export default function ArepiForm({ initial, anio, onSubmit, onCancel, loading, onFormChange }: Props) {
  const { form, set } = useFormState<FormData>(initial, {
    fechaVE: '', anio, servicioClinico: SERVICIOS[0],
    nombre: '', edad: '', rut: '', tipoVigilancia: '', criteriosEpidemiologicos: '',
  })

  const setRut = useCallback((v: string) => set('rut', v), [set])
  const { error: rutError, handleChange: handleRutChange, validate: validateRutField } = useRutField(setRut)
  const { validate, getError } = useFormValidation(arepiSchema)

  useFormChangeNotify({ rut: form.rut }, onFormChange)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validateRutField(form.rut)) return
    if (!validate(form)) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Nombre del Paciente" required error={getError('nombre') || undefined}>
          <Input value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required />
        </FormField>
        <FormField label="RUT" required error={rutError}>
          <Input value={form.rut} onChange={(e) => handleRutChange(e.target.value)} placeholder="12.345.678-9" required aria-invalid={!!rutError} />
        </FormField>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <FormField label="Fecha VE" error={getError('fechaVE') || undefined}>
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
      <FormActions onCancel={onCancel} isEditing={!!initial?.id} loading={loading} />
    </form>
  )
}
