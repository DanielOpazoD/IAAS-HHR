import { useEffect, useState } from 'react'
import { RegistroIAAS } from '@/types'
import { formatRut, validateRut } from '@/utils/rut'
import { getMesFromDate } from '@/utils/dates'
import { useFormState } from '@/hooks/useFormState'
import FormField, { Input, Select, Textarea } from '@/components/ui/FormField'
import FormActions from '@/components/ui/FormActions'

type FormData = Omit<RegistroIAAS, 'id' | 'createdAt' | 'updatedAt'>

interface Props {
  initial?: RegistroIAAS
  anio: number
  nextNumero?: number
  onSubmit: (data: FormData) => void
  onCancel: () => void
}

export default function RegistroIaasForm({ initial, anio, nextNumero = 1, onSubmit, onCancel }: Props) {
  const { form, set } = useFormState<FormData>(initial, {
    numero: nextNumero, mes: '', anio, nombre: '', rut: '', sexo: '',
    fechaIngreso: '', fechaInstalacion: '', fechaDiagCx: '',
    diasInvasivo: null, iaas: '', fallecido: 'NO', fechaCultivo: '',
    agente: '', diagnostico: '', indicacionInstalacion: '',
    indicacionRetiro: '', responsable: '', observaciones: '',
  })
  const [rutError, setRutError] = useState('')

  useEffect(() => {
    if (form.fechaIngreso) {
      const mes = getMesFromDate(form.fechaIngreso)
      if (mes !== form.mes) set('mes', mes)
    }
  }, [form.fechaIngreso])

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
      <div className="grid grid-cols-3 gap-4">
        <FormField label="N°">
          <Input type="number" value={form.numero} onChange={(e) => set('numero', parseInt(e.target.value) || 0)} />
        </FormField>
        <FormField label="Nombre del Paciente" required>
          <Input value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required />
        </FormField>
        <FormField label="RUT" required error={rutError}>
          <Input value={form.rut} onChange={(e) => handleRutChange(e.target.value)} placeholder="12.345.678-9" required />
        </FormField>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <FormField label="Sexo">
          <Select value={form.sexo} onChange={(e) => set('sexo', e.target.value)}>
            <option value="">--</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </Select>
        </FormField>
        <FormField label="Fecha Ingreso">
          <Input type="date" value={form.fechaIngreso} onChange={(e) => set('fechaIngreso', e.target.value)} />
        </FormField>
        <FormField label="Fecha Instalación">
          <Input type="date" value={form.fechaInstalacion} onChange={(e) => set('fechaInstalacion', e.target.value)} />
        </FormField>
        <FormField label="Fecha DG / Fecha CX">
          <Input type="date" value={form.fechaDiagCx} onChange={(e) => set('fechaDiagCx', e.target.value)} />
        </FormField>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <FormField label="Días Invasivo">
          <Input type="number" value={form.diasInvasivo ?? ''} onChange={(e) => set('diasInvasivo', e.target.value ? parseInt(e.target.value) : null)} />
        </FormField>
        <FormField label="IAAS">
          <Input value={form.iaas} onChange={(e) => set('iaas', e.target.value)} />
        </FormField>
        <FormField label="Fallecido">
          <Select value={form.fallecido} onChange={(e) => set('fallecido', e.target.value)}>
            <option value="NO">NO</option>
            <option value="SI">SI</option>
          </Select>
        </FormField>
        <FormField label="Fecha Cultivo">
          <Input type="date" value={form.fechaCultivo} onChange={(e) => set('fechaCultivo', e.target.value)} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Agente">
          <Input value={form.agente} onChange={(e) => set('agente', e.target.value)} />
        </FormField>
        <FormField label="Diagnóstico">
          <Input value={form.diagnostico} onChange={(e) => set('diagnostico', e.target.value)} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Indicación de Instalación">
          <Input value={form.indicacionInstalacion} onChange={(e) => set('indicacionInstalacion', e.target.value)} />
        </FormField>
        <FormField label="Indicación de Retiro">
          <Input value={form.indicacionRetiro} onChange={(e) => set('indicacionRetiro', e.target.value)} />
        </FormField>
      </div>
      <FormField label="Responsable">
        <Input value={form.responsable} onChange={(e) => set('responsable', e.target.value)} />
      </FormField>
      <FormField label="Observaciones (Criterios, segundo agente, etc.)">
        <Textarea value={form.observaciones} onChange={(e) => set('observaciones', e.target.value)} rows={2} />
      </FormField>
      <FormActions onCancel={onCancel} isEditing={!!initial?.id} />
    </form>
  )
}
