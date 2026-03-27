import { PartoCesarea } from '@/types'
import { XLSX, saveWorkbook, badgeYes, badgeNo } from './utils'
import { buildSheet, SheetConfig } from './sheetBuilder'
import { formatDateDisplay } from '@/utils/dates'

function partosConfig(anio: number): SheetConfig<PartoCesarea> {
  return {
    title: { text: 'ENDOMETRITIS PUERPERAL', span: 3 },
    subtitle: { text: `Fuente: Estadística diaria paciente hospitalizado - ${anio}`, startCol: 3, endCol: 10 },
    headerRow: 2,
    columns: [
      { header: 'Mes', width: 11, getValue: (d) => d.mes, center: true },
      { header: 'Nombre del Paciente', width: 30, getValue: (d) => d.nombre },
      { header: 'RUT', width: 14, getValue: (d) => d.rut, center: true },
      { header: 'Fecha Parto/Cesárea', width: 16, getValue: (d) => formatDateDisplay(d.fechaParto), center: true },
      { header: 'Parto/Cesárea', width: 16, getValue: (d) => d.tipo, center: true },
      { header: 'Con/Sin TP', width: 10, getValue: (d) => d.conTP, center: true },
      { header: 'Fecha 1er Control', width: 14, getValue: (d) => formatDateDisplay(d.fechaPrimerControl), center: true },
      { header: 'Control Post Parto', width: 30, getValue: (d) => d.controlPostParto },
      {
        header: 'Signos IAAS', width: 10, center: true,
        getValue: (d) => d.signosSintomasIAAS || '',
        getStyle: (d, base) => d.signosSintomasIAAS === 'SI' ? badgeYes : (d.signosSintomasIAAS === 'NO' ? badgeNo : base),
      },
      { header: '30 días', width: 10, getValue: (d) => d.dias30, center: true },
      { header: 'Observaciones', width: 30, getValue: (d) => d.observaciones },
    ],
  }
}

export function buildPartosSheet(data: PartoCesarea[], anio: number): XLSX.WorkSheet {
  return buildSheet(data, partosConfig(anio))
}

export function exportPartos(data: PartoCesarea[], anio: number) {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, buildPartosSheet(data, anio), 'Partos-Cesárea (EP)')
  saveWorkbook(wb, `Partos_Cesarea_EP_${anio}.xlsx`)
}
