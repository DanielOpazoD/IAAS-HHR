import { CirugiaTrazadora } from '@/types'
import { XLSX, saveWorkbook, badgeYes, badgeNo } from './utils'
import { buildSheet, SheetConfig } from './sheetBuilder'
import { formatDateDisplay } from '@/utils/dates'

function cirugiasConfig(anio: number): SheetConfig<CirugiaTrazadora> {
  return {
    title: { text: 'CIRUGÍAS TRAZADORAS', span: 3 },
    subtitle: { text: `Fuente: Drive pabellón cirugías trazadoras / vigilancia epidemiológica ${anio}`, startCol: 3, endCol: 9 },
    headerRow: 1,
    columns: [
      { header: 'Mes', width: 11, getValue: (d) => d.mes, center: true },
      { header: 'Nombre del Paciente', width: 30, getValue: (d) => d.nombre },
      { header: 'RUT', width: 14, getValue: (d) => d.rut, center: true },
      { header: 'Fecha de Cirugía', width: 14, getValue: (d) => formatDateDisplay(d.fechaCirugia), center: true },
      { header: 'Cirugía', width: 30, getValue: (d) => d.tipoCirugia },
      { header: 'Fecha 1er Control', width: 14, getValue: (d) => formatDateDisplay(d.fechaPrimerControl), center: true },
      { header: 'Observaciones', width: 30, getValue: (d) => d.observaciones },
      {
        header: 'IHO', width: 7, center: true,
        getValue: (d) => d.iho || '',
        getStyle: (d, base) => d.iho === 'SI' ? badgeYes : (d.iho === 'NO' ? badgeNo : base),
      },
      { header: 'Fecha 2do Control', width: 14, getValue: (d) => formatDateDisplay(d.fechaSegundoControl), center: true },
      { header: 'Observaciones', width: 30, getValue: (d) => d.observaciones2 || '' },
    ],
  }
}

export function buildCirugiasSheet(data: CirugiaTrazadora[], anio: number): XLSX.WorkSheet {
  return buildSheet(data, cirugiasConfig(anio))
}

export function exportCirugias(data: CirugiaTrazadora[], anio: number) {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, buildCirugiasSheet(data, anio), 'Cirugías Trazadoras')
  saveWorkbook(wb, `Cirugias_Trazadoras_${anio}.xlsx`)
}
