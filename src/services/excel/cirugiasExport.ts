import { CirugiaTrazadora } from '../../types'
import { XLSX, headerStyle, cellStyle, titleStyle, saveWorkbook, setColWidths, addCell } from './utils'
import { formatDateDisplay } from '../../utils/dates'

export function exportCirugias(data: CirugiaTrazadora[], anio: number) {
  const wb = XLSX.utils.book_new()
  const ws: XLSX.WorkSheet = {}

  addCell(ws, 'A1', 'CIRUGÍAS TRAZADORAS', titleStyle)
  addCell(ws, 'C1', `Fuente: Drive pabellón cirugías trazadoras / vigilancia epidemiológica ${anio}`, { font: { sz: 8, name: 'Arial', italic: true, color: { rgb: '666666' } } })

  const headers = ['Mes', 'Nombre del Paciente', 'RUT', 'Fecha de Cirugía', 'Cirugía', 'Fecha 1er Control', 'Observaciones', 'IHO', 'Fecha 2do Control', 'Observaciones']
  const cols = 'ABCDEFGHIJ'
  headers.forEach((h, i) => addCell(ws, `${cols[i]}2`, h, headerStyle))

  data.forEach((row, i) => {
    const r = i + 3
    addCell(ws, `A${r}`, row.mes, cellStyle)
    addCell(ws, `B${r}`, row.nombre, cellStyle)
    addCell(ws, `C${r}`, row.rut, cellStyle)
    addCell(ws, `D${r}`, formatDateDisplay(row.fechaCirugia), cellStyle)
    addCell(ws, `E${r}`, row.tipoCirugia, cellStyle)
    addCell(ws, `F${r}`, formatDateDisplay(row.fechaPrimerControl), cellStyle)
    addCell(ws, `G${r}`, row.observaciones, cellStyle)
    addCell(ws, `H${r}`, row.iho, { ...cellStyle, font: { ...cellStyle.font, bold: true, color: { rgb: row.iho === 'SI' ? 'DC2626' : '16A34A' } } })
    addCell(ws, `I${r}`, formatDateDisplay(row.fechaSegundoControl), cellStyle)
    addCell(ws, `J${r}`, row.observaciones2, cellStyle)
  })

  ws['!ref'] = `A1:J${data.length + 2}`
  setColWidths(ws, [10, 28, 14, 14, 30, 14, 35, 6, 14, 35])

  XLSX.utils.book_append_sheet(wb, ws, 'Cirugias Trazadoras')
  saveWorkbook(wb, `Cirugias_Trazadoras_${anio}.xlsx`)
}
