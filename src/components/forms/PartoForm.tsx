import { useCallback, FormEvent } from 'react'
import { PartoCesarea } from '@/types'
import { TIPOS_PARTO, type Mes } from '@/utils/constants'
import { useFormState } from '@/hooks/useFormState'
import { useRutField } from '@/hooks/useRutField'
import { useFormValidation } from '@/hooks/useFormValidation'
import { partoSchema } from '@/schemas'
import { useAutoMonth } from '@/hooks/useAutoMonth'
import { useFormChangeNotify } from '@/hooks/useFormChangeNotify'
import FormField, { Input, Select, Textarea } from '@/components/ui/FormField'
import FormActions from '@/components/ui/FormActions'

type FormData = Omit<PartoCesarea, 'id' | 'createdAt' | 'updatedAt'>

interface Props {
  initial?: PartoCesarea
  anio: number
  onSubmit: (data: FormData) => void
  onCancel: () => void
  loading?: boolean
  onFormChange?: (values: { rut?: string; mes?: string }) => void
}

export default function PartoForm({ initial, anio, onSubmit, onCancel, loading, onFormChange }: Props) {
  const { form, set } = useFormState<FormData>(initial, {
    mes: '' as Mes, anio, nombre: '', rut: '', fechaParto: '',
    tipo: TIPOS_PARTO[0], conTP: '', fechaPrimerControl: '',
    controlPostParto: '', signosSintomasIAAS: 'NO', dias30: '', observaciones: '',
  })

  const setRut = useCallback((v: string) => set('rut', v), [set])
  const { error: rutError, handleChange: handleRutChange, validate: validateRutField } = useRutField(setRut)
  const { validate, getError } = useFormValidation(partoSchema)

  const setMes = useCallback((m: Mes) => set('mes', m), [set])
  useAutoMonth(form.fechaParto, form.mes, setMes)
  useFormChangeNotify({ rut: form.rut, mes: form.mes }, onFormChange)

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
        <FormField label="Fecha Parto/Cesárea" error={getError('fechaParto') || undefined}>
          <Input type="date" value={form.fechaParto} onChange={(e) => set('fechaParto', e.target.value)} required />
        </FormField>
        <FormField label="Tipo">
          <Select value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
            {TIPOS_PARTO.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </FormField>
        <FormField label="Con / Sin Trabajo de Parto">
          <Select value={form.conTP} onChange={(e) => set('conTP', e.target.value)}>
            <option value="">N/A</option>
            <option value="Con TP">Con TP</option>
            <option value="Sin TP">Sin TP</option>
          </Select>
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Fecha Primer Control">
          <Input type="date" value={form.fechaPrimerControl} onChange={(e) => set('fechaPrimerControl', e.target.value)} />
        </FormField>
        <FormField label="Signos y Síntomas IAAS">
          <Select value={form.signosSintomasIAAS} onChange={(e) => set('signosSintomasIAAS', e.target.value)}>
            <option value="NO">NO</option>
            <option value="SI">SI</option>
          </Select>
        </FormField>
      </div>
      <FormField label="Control Post Parto (Observaciones)">
        <Textarea value={form.controlPostParto} onChange={(e) => set('controlPostParto', e.target.value)} rows={2} />
      </FormField>
      <FormField label="30 días">
        <Textarea value={form.dias30} onChange={(e) => set('dias30', e.target.value)} rows={1} />
      </FormField>
      <FormField label="Observaciones">
        <Textarea value={form.observaciones} onChange={(e) => set('observaciones', e.target.value)} rows={2} />
      </FormField>
      <FormActions onCancel={onCancel} isEditing={!!initial?.id} loading={loading} />
    </form>
  )
}
