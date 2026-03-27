import { AgenteRiesgoEpidemico } from '@/types'
import { XLSX, headerStyle, titleStyle, subtitleStyle, saveWorkbook, setColWidths, setRowHeight, addCell, getRowStyle, getRowStyleCenter, mergeCells } from './utils'
import { formatDateDisplay } from '@/utils/dates'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function buildArepiSheet(data: AgenteRiesgoEpidemico[], anio: number): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {}

  addCell(ws, 'A1', 'INFECCIÓN POR AGENTES DE RIESGO EPIDÉMICO (AREpi)', titleStyle)
  addCell(ws, 'E1', 'Solicitud y resultados de exámenes, ficha clínica', subtitleStyle)
  mergeCells(ws, { r: 0, c: 0 }, { r: 0, c: 3 })
  mergeCells(ws, { r: 0, c: 4 }, { r: 0, c: 6 })
  setRowHeight(ws, 0, 28)

  const headers = ['Fecha de la VE', 'Servicio Clínico', 'Nombre del Paciente', 'Edad', 'RUT', 'Tipo de Vigilancia', 'Criterios Epidemiológicos']
  const cols = 'ABCDEFG'
  headers.forEach((h, i) => addCell(ws, `${cols[i]}3`, h, headerStyle))
  setRowHeight(ws, 2, 30)

  data.forEach((row, i) => {
    const r = i + 4
    const s = getRowStyle(i)
    const sc = getRowStyleCenter(i)
    addCell(ws, `A${r}`, formatDateDisplay(row.fechaVE), sc)
    addCell(ws, `B${r}`, row.servicioClinico, sc)
    addCell(ws, `C${r}`, row.nombre, s)
    addCell(ws, `D${r}`, row.edad, sc)
    addCell(ws, `E${r}`, row.rut, sc)
    addCell(ws, `F${r}`, row.tipoVigilancia, s)
    addCell(ws, `G${r}`, row.criteriosEpidemiologicos, s)
  })

  ws['!ref'] = `A1:G${data.length + 3}`
  setColWidths(ws, [14, 16, 30, 8, 14, 25, 40])

  return ws
}

export function exportArepi(data: AgenteRiesgoEpidemico[], anio: number) {
  const wb = XLSX.utils.book_new()
  const ws = buildArepiSheet(data, anio)
  XLSX.utils.book_append_sheet(wb, ws, 'AREpi')
  saveWorkbook(wb, `AREpi_${anio}.xlsx`)
}
