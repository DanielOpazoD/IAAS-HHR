import { useState, useEffect } from 'react'
import { CirugiaTrazadora } from '../../types'
import { TIPOS_CIRUGIA, MESES } from '../../utils/constants'
import { formatRut } from '../../utils/rut'
import { getMesFromDate } from '../../utils/dates'
import FormField, { Input, Select, Textarea } from '../ui/FormField'

interface CirugiaFormProps {
  initial?: CirugiaTrazadora
  anio: number
  onSubmit: (data: Omit<CirugiaTrazadora, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export default function CirugiaForm({ initial, anio, onSubmit, onCancel }: CirugiaFormProps) {
  const [form, setForm] = useState<Omit<CirugiaTrazadora, 'id' | 'createdAt' | 'updatedAt'>>({
    mes: initial?.mes || '',
    anio: initial?.anio || anio,
    nombre: initial?.nombre || '',
    rut: initial?.rut || '',
    fechaCirugia: initial?.fechaCirugia || '',
    tipoCirugia: initial?.tipoCirugia || TIPOS_CIRUGIA[0],
    fechaPrimerControl: initial?.fechaPrimerControl || '',
    observaciones: initial?.observaciones || '',
    iho: initial?.iho || 'NO',
    fechaSegundoControl: initial?.fechaSegundoControl || '',
    observaciones2: initial?.observaciones2 || '',
  })

  useEffect(() => {
    if (form.fechaCirugia) {
      const mes = getMesFromDate(form.fechaCirugia)
      if (mes !== form.mes) setForm((f) => ({ ...f, mes }))
    }
  }, [form.fechaCirugia])

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
          <Input
            value={form.rut}
            onChange={(e) => set('rut', formatRut(e.target.value))}
            placeholder="12.345.678-9"
            required
          />
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
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700">
          {initial?.id ? 'Actualizar' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
