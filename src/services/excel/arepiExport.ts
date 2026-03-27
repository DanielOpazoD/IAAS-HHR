import { AgenteRiesgoEpidemico } from '@/types'
import { XLSX, saveWorkbook } from './utils'
import { buildSheet, SheetConfig } from './sheetBuilder'
import { formatDateDisplay } from '@/utils/dates'

const arepiConfig: SheetConfig<AgenteRiesgoEpidemico> = {
  title: { text: 'INFECCIÓN POR AGENTES DE RIESGO EPIDÉMICO (AREpi)', span: 4 },
  subtitle: { text: 'Solicitud y resultados de exámenes, ficha clínica', startCol: 4, endCol: 6 },
  headerRow: 2,
  columns: [
    { header: 'Fecha de la VE', width: 14, getValue: (d) => formatDateDisplay(d.fechaVE), center: true },
    { header: 'Servicio Clínico', width: 16, getValue: (d) => d.servicioClinico, center: true },
    { header: 'Nombre del Paciente', width: 30, getValue: (d) => d.nombre },
    { header: 'Edad', width: 8, getValue: (d) => d.edad, center: true },
    { header: 'RUT', width: 14, getValue: (d) => d.rut, center: true },
    { header: 'Tipo de Vigilancia', width: 25, getValue: (d) => d.tipoVigilancia },
    { header: 'Criterios Epidemiológicos', width: 40, getValue: (d) => d.criteriosEpidemiologicos },
  ],
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function buildArepiSheet(data: AgenteRiesgoEpidemico[], anio: number): XLSX.WorkSheet {
  return buildSheet(data, arepiConfig)
}

export function exportArepi(data: AgenteRiesgoEpidemico[], anio: number) {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, buildArepiSheet(data, anio), 'AREpi')
  saveWorkbook(wb, `AREpi_${anio}.xlsx`)
}
