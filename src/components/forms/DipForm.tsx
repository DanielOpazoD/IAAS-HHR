import { useState, useMemo, useEffect, useCallback, FormEvent } from 'react'
import { DispositivoInvasivo, PeriodoDIP } from '@/types'
import { TIPOS_DIP, SERVICIOS, MESES } from '@/utils/constants'
import { getMesFromDate, calcDaysBetween } from '@/utils/dates'
import { useRutField } from '@/hooks/useRutField'
import FormField, { Input, Select, Textarea } from '@/components/ui/FormField'
import FormActions from '@/components/ui/FormActions'

type FormData = Omit<DispositivoInvasivo, 'id' | 'createdAt' | 'updatedAt'>

interface Props {
  initial?: DispositivoInvasivo
  anio: number
  onSubmit: (data: FormData) => void
  onCancel: () => void
  loading?: boolean
  onFormChange?: (values: { rut?: string; mes?: string }) => void
}

const emptyPeriodo: PeriodoDIP = { fechaInstalacion: '', fechaRetiro: '', numDias: null }

export default function DipForm({ initial, anio, onSubmit, onCancel, loading, onFormChange }: Props) {
  const [form, setForm] = useState<FormData>({
    mes: initial?.mes || '',
    anio: initial?.anio || anio,
    servicio: initial?.servicio || SERVICIOS[0],
    nombre: initial?.nombre || '',
    rut: initial?.rut || '',
    edad: initial?.edad || '',
    tipoDIP: initial?.tipoDIP || TIPOS_DIP[0],
    periodos: initial?.periodos?.length ? initial.periodos : [{ ...emptyPeriodo }],
    totalDias: initial?.totalDias || 0,
    revisionFC: initial?.revisionFC || '',
  })

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const setRut = useCallback((v: string) => set('rut', v), [])
  const { error: rutError, handleChange: handleRutChange, validate: validateRutField } = useRutField(setRut)

  /**
   * Stable dependency key for periodos date changes.
   * Prevents the old bug where .map().join() in useEffect deps created a
   * new string every render, causing infinite re-render loops.
   */
  const periodosKey = useMemo(
    () => form.periodos.map((p) => `${p.fechaInstalacion}|${p.fechaRetiro}`).join(','),
    [form.periodos]
  )

  useEffect(() => {
    const periodos = form.periodos.map((p) => ({
      ...p,
      numDias: calcDaysBetween(p.fechaInstalacion, p.fechaRetiro),
    }))
    const totalDias = periodos.reduce((sum, p) => sum + (p.numDias || 0), 0)
    setForm((f) => ({ ...f, periodos, totalDias }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodosKey])

  useEffect(() => {
    if (form.periodos[0]?.fechaInstalacion) {
      const mes = getMesFromDate(form.periodos[0].fechaInstalacion)
      if (mes && mes !== form.mes) setForm((f) => ({ ...f, mes }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.periodos[0]?.fechaInstalacion])

  const setPeriodo = (idx: number, key: keyof PeriodoDIP, value: string) => {
    setForm((f) => {
      const periodos = [...f.periodos]
      periodos[idx] = { ...periodos[idx], [key]: value }
      return { ...f, periodos }
    })
  }

  const addPeriodo = () => {
    if (form.periodos.length < 4) setForm((f) => ({ ...f, periodos: [...f.periodos, { ...emptyPeriodo }] }))
  }

  const removePeriodo = (idx: number) => {
    if (form.periodos.length > 1) setForm((f) => ({ ...f, periodos: f.periodos.filter((_, i) => i !== idx) }))
  }

  useEffect(() => {
    onFormChange?.({ rut: form.rut, mes: form.mes })
  }, [form.rut, form.mes, onFormChange])

  /** Validate that no period has fechaRetiro before fechaInstalacion */
  const dateErrors = useMemo(() => {
    return form.periodos.map((p) => {
      if (p.fechaInstalacion && p.fechaRetiro && p.fechaRetiro < p.fechaInstalacion) {
        return 'Fecha retiro debe ser posterior a instalación'
      }
      return ''
    })
  }, [form.periodos])

  const hasDateErrors = dateErrors.some(Boolean)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validateRutField(form.rut)) return
    if (hasDateErrors) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Nombre del Paciente" required>
          <Input value={form.nombre} onChange={(e) => set('nombre', e.target.value)} required />
        </FormField>
        <FormField label="RUT" required error={rutError}>
          <Input value={form.rut} onChange={(e) => handleRutChange(e.target.value)} placeholder="12.345.678-9" required aria-invalid={!!rutError} />
        </FormField>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <FormField label="Servicio">
          <Select value={form.servicio} onChange={(e) => set('servicio', e.target.value)}>
            {SERVICIOS.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </FormField>
        <FormField label="Edad">
          <Input value={form.edad} onChange={(e) => set('edad', e.target.value)} placeholder="ej: 68a" />
        </FormField>
        <FormField label="Tipo DIP">
          <Select value={form.tipoDIP} onChange={(e) => set('tipoDIP', e.target.value)}>
            {TIPOS_DIP.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </FormField>
        <FormField label="Mes">
          <Select value={form.mes} onChange={(e) => set('mes', e.target.value)}>
            <option value="">Auto</option>
            {MESES.map((m) => <option key={m} value={m}>{m}</option>)}
          </Select>
        </FormField>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Períodos de Instalación</label>
          {form.periodos.length < 4 && (
            <button type="button" onClick={addPeriodo} className="text-xs text-primary-600 hover:text-primary-700">+ Agregar período</button>
          )}
        </div>
        {form.periodos.map((p, idx) => (
          <div key={idx}>
            <div className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg items-end">
              <FormField label={`Instalación ${idx + 1}`}>
                <Input type="date" value={p.fechaInstalacion} onChange={(e) => setPeriodo(idx, 'fechaInstalacion', e.target.value)} />
              </FormField>
              <FormField label="Retiro" error={dateErrors[idx]}>
                <Input type="date" value={p.fechaRetiro} onChange={(e) => setPeriodo(idx, 'fechaRetiro', e.target.value)} aria-invalid={!!dateErrors[idx]} />
              </FormField>
              <FormField label="N° Días">
                <Input value={p.numDias != null ? String(p.numDias) : ''} disabled className="bg-gray-100" />
              </FormField>
              <div className="flex items-end pb-0.5">
                {form.periodos.length > 1 && (
                  <button type="button" onClick={() => removePeriodo(idx)} className="p-2 text-red-400 hover:text-red-600" aria-label="Eliminar período">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        <div className="text-sm text-gray-600">Total días: <span className="font-semibold">{form.totalDias}</span></div>
      </div>

      <FormField label="Revisión Ficha Clínica">
        <Textarea value={form.revisionFC} onChange={(e) => set('revisionFC', e.target.value)} rows={2} />
      </FormField>
      <FormActions onCancel={onCancel} isEditing={!!initial?.id} loading={loading} />
    </form>
  )
}
