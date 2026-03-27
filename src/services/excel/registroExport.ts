import { RegistroIAAS } from '@/types'
import { XLSX, saveWorkbook, badgeDanger } from './utils'
import { buildSheet, SheetConfig } from './sheetBuilder'
import { formatDateDisplay } from '@/utils/dates'

const registroConfig = (anio: number): SheetConfig<RegistroIAAS> => ({
  title: { text: `REGISTRO DE INFECCIONES ASOCIADAS A LA ATENCIÓN DE SALUD ${anio}`, span: 18 },
  headerRow: 1,
  columns: [
    { header: 'N°', width: 5, getValue: (d) => d.numero, center: true },
    { header: 'Mes', width: 11, getValue: (d) => d.mes, center: true },
    { header: 'Nombre Paciente', width: 28, getValue: (d) => d.nombre },
    { header: 'RUT', width: 14, getValue: (d) => d.rut, center: true },
    { header: 'Sexo', width: 7, getValue: (d) => d.sexo, center: true },
    { header: 'F. Ingreso', width: 12, getValue: (d) => formatDateDisplay(d.fechaIngreso), center: true },
    { header: 'F. Instalación', width: 12, getValue: (d) => formatDateDisplay(d.fechaInstalacion), center: true },
    { header: 'F. DG/CX', width: 12, getValue: (d) => formatDateDisplay(d.fechaDiagCx), center: true },
    { header: 'Días Invasivo', width: 10, getValue: (d) => d.diasInvasivo ?? '', center: true },
    { header: 'IAAS', width: 10, getValue: (d) => d.iaas, center: true },
    { header: 'Fallecido', width: 10, getValue: (d) => d.fallecido || '', center: true, getStyle: (d, base) => d.fallecido === 'SI' ? badgeDanger : base },
    { header: 'F. Cultivo', width: 12, getValue: (d) => formatDateDisplay(d.fechaCultivo), center: true },
    { header: 'Agente', width: 16, getValue: (d) => d.agente },
    { header: 'Diagnóstico', width: 22, getValue: (d) => d.diagnostico },
    { header: 'Ind. Instalación', width: 20, getValue: (d) => d.indicacionInstalacion },
    { header: 'Ind. Retiro', width: 20, getValue: (d) => d.indicacionRetiro },
    { header: 'Responsable', width: 16, getValue: (d) => d.responsable },
    { header: 'Observaciones', width: 30, getValue: (d) => d.observaciones },
  ],
})

export function buildRegistroSheet(data: RegistroIAAS[], anio: number): XLSX.WorkSheet {
  return buildSheet(data, registroConfig(anio))
}

export function exportRegistroIaas(data: RegistroIAAS[], anio: number) {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, buildRegistroSheet(data, anio), 'Registro IAAS')
  saveWorkbook(wb, `Registro_IAAS_${anio}.xlsx`)
}
