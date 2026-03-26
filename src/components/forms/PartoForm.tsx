import { useState, useEffect } from 'react'
import { PartoCesarea } from '../../types'
import { TIPOS_PARTO, MESES } from '../../utils/constants'
import { formatRut } from '../../utils/rut'
import { getMesFromDate } from '../../utils/dates'
import FormField, { Input, Select, Textarea } from '../ui/FormField'

interface PartoFormProps {
  initial?: PartoCesarea
  anio: number
  onSubmit: (data: Omit<PartoCesarea, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export default function PartoForm({ initial, anio, onSubmit, onCancel }: PartoFormProps) {
  const [form, setForm] = useState<Omit<PartoCesarea, 'id' | 'createdAt' | 'updatedAt'>>({
    mes: initial?.mes || '',
    anio: initial?.anio || anio,
    nombre: initial?.nombre || '',
    rut: initial?.rut || '',
    fechaParto: initial?.fechaParto || '',
    tipo: initial?.tipo || TIPOS_PARTO[0],
    conTP: initial?.conTP || '',
    fechaPrimerControl: initial?.fechaPrimerControl || '',
    controlPostParto: initial?.controlPostParto || '',
    signosSintomasIAAS: initial?.signosSintomasIAAS || 'NO',
    dias30: initial?.dias30 || '',
    observaciones: initial?.observaciones || '',
  })

  useEffect(() => {
    if (form.fechaParto) {
      const mes = getMesFromDate(form.fechaParto)
      if (mes !== form.mes) setForm((f) => ({ ...f, mes }))
    }
  }, [form.fechaParto])

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
        <FormField label="Fecha Parto/Cesárea">
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
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancelar</button>
        <button type="submit" className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700">{initial?.id ? 'Actualizar' : 'Guardar'}</button>
      </div>
    </form>
  )
}
