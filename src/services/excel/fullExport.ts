import { CirugiaTrazadora, PartoCesarea, DispositivoInvasivo, AgenteRiesgoEpidemico, RegistroIAAS } from '@/types'
import { XLSX, saveWorkbook } from './utils'
import { buildCirugiasSheet } from './cirugiasExport'
import { buildPartosSheet } from './partosExport'
import { buildDipSheet } from './dipExport'
import { buildArepiSheet } from './arepiExport'
import { buildRegistroSheet } from './registroExport'

export interface FullExportData {
  cirugias: CirugiaTrazadora[]
  partos: PartoCesarea[]
  dip: DispositivoInvasivo[]
  arepi: AgenteRiesgoEpidemico[]
  registroIaas: RegistroIAAS[]
}

export function exportFullWorkbook(data: FullExportData, anio: number) {
  const wb = XLSX.utils.book_new()

  const cxSheet = buildCirugiasSheet(data.cirugias, anio)
  XLSX.utils.book_append_sheet(wb, cxSheet, 'Cirugías Trazadoras')

  const partosSheet = buildPartosSheet(data.partos, anio)
  XLSX.utils.book_append_sheet(wb, partosSheet, 'Partos-Cesárea (EP)')

  const dipSheet = buildDipSheet(data.dip, anio)
  XLSX.utils.book_append_sheet(wb, dipSheet, 'DIP')

  const arepiSheet = buildArepiSheet(data.arepi, anio)
  XLSX.utils.book_append_sheet(wb, arepiSheet, 'AREpi')

  const iaasSheet = buildRegistroSheet(data.registroIaas, anio)
  XLSX.utils.book_append_sheet(wb, iaasSheet, 'Registro IAAS')

  saveWorkbook(wb, `Vigilancia_IAAS_HHR_${anio}.xlsx`)
}
