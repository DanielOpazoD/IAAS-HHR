import { CirugiaTrazadora } from '@/types'
import { XLSX, headerStyle, titleStyle, subtitleStyle, saveWorkbook, setColWidths, setRowHeight, addCell, getRowStyle, getRowStyleCenter, badgeYes, badgeNo, mergeCells } from './utils'
import { formatDateDisplay } from '@/utils/dates'

export function buildCirugiasSheet(data: CirugiaTrazadora[], anio: number): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {}

  // Title row
  addCell(ws, 'A1', 'CIRUGÍAS TRAZADORAS', titleStyle)
  addCell(ws, 'D1', `Fuente: Drive pabellón cirugías trazadoras / vigilancia epidemiológica ${anio}`, subtitleStyle)
  mergeCells(ws, { r: 0, c: 0 }, { r: 0, c: 2 })
  mergeCells(ws, { r: 0, c: 3 }, { r: 0, c: 9 })
  setRowHeight(ws, 0, 28)

  // Header row
  const headers = ['Mes', 'Nombre del Paciente', 'RUT', 'Fecha de Cirugía', 'Cirugía', 'Fecha 1er Control', 'Observaciones', 'IHO', 'Fecha 2do Control', 'Observaciones']
  const cols = 'ABCDEFGHIJ'
  headers.forEach((h, i) => addCell(ws, `${cols[i]}2`, h, headerStyle))
  setRowHeight(ws, 1, 30)

  data.forEach((row, i) => {
    const r = i + 3
    const s = getRowStyle(i)
    const sc = getRowStyleCenter(i)
    addCell(ws, `A${r}`, row.mes, sc)
    addCell(ws, `B${r}`, row.nombre, s)
    addCell(ws, `C${r}`, row.rut, sc)
    addCell(ws, `D${r}`, formatDateDisplay(row.fechaCirugia), sc)
    addCell(ws, `E${r}`, row.tipoCirugia, s)
    addCell(ws, `F${r}`, formatDateDisplay(row.fechaPrimerControl), sc)
    addCell(ws, `G${r}`, row.observaciones, s)
    addCell(ws, `H${r}`, row.iho || '', row.iho === 'SI' ? badgeYes : badgeNo)
    addCell(ws, `I${r}`, formatDateDisplay(row.fechaSegundoControl), sc)
    addCell(ws, `J${r}`, row.observaciones2 || '', s)
  })

  ws['!ref'] = `A1:J${data.length + 2}`
  setColWidths(ws, [11, 30, 14, 14, 30, 14, 30, 7, 14, 30])

  return ws
}

export function exportCirugias(data: CirugiaTrazadora[], anio: number) {
  const wb = XLSX.utils.book_new()
  const ws = buildCirugiasSheet(data, anio)
  XLSX.utils.book_append_sheet(wb, ws, 'Cirugías Trazadoras')
  saveWorkbook(wb, `Cirugias_Trazadoras_${anio}.xlsx`)
}
