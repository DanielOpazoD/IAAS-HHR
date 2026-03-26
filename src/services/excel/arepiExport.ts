import { AgenteRiesgoEpidemico } from '../../types'
import { XLSX, headerStyle, cellStyle, titleStyle, saveWorkbook, setColWidths, addCell } from './utils'
import { formatDateDisplay } from '../../utils/dates'

export function exportArepi(data: AgenteRiesgoEpidemico[], anio: number) {
  const wb = XLSX.utils.book_new()
  const ws: XLSX.WorkSheet = {}

  addCell(ws, 'A1', 'INFECCIÓN POR AGENTES DE RIESGO EPIDÉMICO (AREpi)', titleStyle)
  addCell(ws, 'E1', 'Solicitud y resultados de exámenes, ficha clínica', { font: { sz: 8, name: 'Arial', italic: true, color: { rgb: '666666' } } })

  const headers = ['Fecha de la VE', 'Servicio Clínico', 'Nombre del Paciente', 'Edad', 'RUT', 'Tipo de Vigilancia', 'Criterios Epidemiológicos']
  const cols = 'ABCDEFG'
  headers.forEach((h, i) => addCell(ws, `${cols[i]}3`, h, headerStyle))

  data.forEach((row, i) => {
    const r = i + 4
    addCell(ws, `A${r}`, formatDateDisplay(row.fechaVE), cellStyle)
    addCell(ws, `B${r}`, row.servicioClinico, cellStyle)
    addCell(ws, `C${r}`, row.nombre, cellStyle)
    addCell(ws, `D${r}`, row.edad, cellStyle)
    addCell(ws, `E${r}`, row.rut, cellStyle)
    addCell(ws, `F${r}`, row.tipoVigilancia, cellStyle)
    addCell(ws, `G${r}`, row.criteriosEpidemiologicos, cellStyle)
  })

  ws['!ref'] = `A1:G${data.length + 3}`
  setColWidths(ws, [14, 14, 28, 8, 14, 25, 40])

  XLSX.utils.book_append_sheet(wb, ws, 'AREpi')
  saveWorkbook(wb, `AREpi_${anio}.xlsx`)
}
