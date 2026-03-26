import { useState, useEffect } from 'react'
import { RegistroIAAS } from '../../types'
import { MESES } from '../../utils/constants'
import { formatRut } from '../../utils/rut'
import { getMesFromDate } from '../../utils/dates'
import FormField, { Input, Select, Textarea } from '../ui/FormField'

interface RegistroIaasFormProps {
  initial?: RegistroIAAS
  anio: number
  nextNumero: number
  onSubmit: (data: Omit<RegistroIAAS, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export default function RegistroIaasForm({ initial, anio, nextNumero, onSubmit, onCancel }: RegistroIaasFormProps) {
  const [form, setForm] = useState({
    numero: initial?.numero || nextNumero,
    mes: initial?.mes || '',
    anio: initial?.anio || anio,
    nombre: initial?.nombre || '',
    rut: initial?.rut || '',
    sexo: initial?.sexo || '',
    fechaIngreso: initial?.fechaIngreso || '',
    fechaInstalacion: initial?.fechaInstalacion || '',
    fechaDiagCx: initial?.fechaDiagCx || '',
    diasInvasivo: initial?.diasInvasivo ?? null,
    iaas: initial?.iaas || '',
    fallecido: initial?.fallecido || 'NO',
    fechaCultivo: initial?.fechaCultivo || '',
    agente: initial?.agente || '',
    diagnostico: initial?.diagnostico || '',
    indicacionInstalacion: initial?.indicacionInstalacion || '',
    indicacionRetiro: initial?.indicacionRetiro || '',
    responsable: initial?.responsable || '',
    observaciones: initial?.observaciones || '',
  })

  useEffect(() => {
    if (form.fechaIngreso) {
      const mes = getMesFromDate(form.fechaIngreso)
      if (mes !== form.mes) setForm((f) => ({ ...f, mes }))
    }
  }, [form.fechaIngreso])

  const set = (key: string, value: string | number | null) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form as Omit<RegistroIAAS, 'id' | 'createdAt' | 'updatedAt'>)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <FormField label="N°">
          <Input type="number" value={form.numero} onChange={(e) => set('numero', parseInt(e.target.value) || 0)} />
        </FormField>
        <FormField label="Nombre del Paciente">
          <Input value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required />
        </FormField>
        <FormField label="RUT">
          <Input value={form.rut} onChange={(e) => set('rut', formatRut(e.target.value))} placeholder="12.345.678-9" required />
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
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700">{initial?.id ? 'Actualizar' : 'Guardar'}</button>
      </div>
    </form>
  )
}
