import { useEffect, useState } from 'react'
import { CirugiaTrazadora } from '@/types'
import { TIPOS_CIRUGIA, MESES } from '@/utils/constants'
import { formatRut, validateRut } from '@/utils/rut'
import { getMesFromDate } from '@/utils/dates'
import { useFormState } from '@/hooks/useFormState'
import FormField, { Input, Select, Textarea } from '@/components/ui/FormField'
import FormActions from '@/components/ui/FormActions'

type FormData = Omit<CirugiaTrazadora, 'id' | 'createdAt' | 'updatedAt'>

interface Props {
  initial?: CirugiaTrazadora
  anio: number
  onSubmit: (data: FormData) => void
  onCancel: () => void
}

export default function CirugiaForm({ initial, anio, onSubmit, onCancel }: Props) {
  const { form, set } = useFormState<FormData>(initial, {
    mes: '', anio, nombre: '', rut: '', fechaCirugia: '',
    tipoCirugia: TIPOS_CIRUGIA[0], fechaPrimerControl: '', observaciones: '',
    iho: 'NO', fechaSegundoControl: '', observaciones2: '',
  })
  const [rutError, setRutError] = useState('')

  useEffect(() => {
    if (form.fechaCirugia) {
      const mes = getMesFromDate(form.fechaCirugia)
      if (mes !== form.mes) set('mes', mes)
    }
  }, [form.fechaCirugia])

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
        <FormField label="Fecha Cirugía">
          <Input type="date" value={form.fechaCirugia} onChange={(e) => set('fechaCirugia', e.target.value)} required />
        </FormField>
        <FormField label="Tipo de Cirugía">
          <Select value={form.tipoCirugia} onChange={(e) => set('tipoCirugia', e.target.value)}>
            {TIPOS_CIRUGIA.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </FormField>
        <FormField label="Mes">
          <Select value={form.mes} onChange={(e) => set('mes', e.target.value)}>
            <option value="">Auto</option>
            {MESES.map((m) => <option key={m} value={m}>{m}</option>)}
          </Select>
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Fecha Primer Control">
          <Input type="date" value={form.fechaPrimerControl} onChange={(e) => set('fechaPrimerControl', e.target.value)} />
        </FormField>
        <FormField label="IHO (Infección Herida Operatoria)">
          <Select value={form.iho} onChange={(e) => set('iho', e.target.value)}>
            <option value="NO">NO</option>
            <option value="SI">SI</option>
          </Select>
        </FormField>
      </div>
      <FormField label="Observaciones (Primer Control)">
        <Textarea value={form.observaciones} onChange={(e) => set('observaciones', e.target.value)} rows={2} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Fecha Segundo Control">
          <Input type="date" value={form.fechaSegundoControl} onChange={(e) => set('fechaSegundoControl', e.target.value)} />
        </FormField>
      </div>
      <FormField label="Observaciones (Segundo Control)">
        <Textarea value={form.observaciones2} onChange={(e) => set('observaciones2', e.target.value)} rows={2} />
      </FormField>
      <FormActions onCancel={onCancel} isEditing={!!initial?.id} />
    </form>
  )
}
