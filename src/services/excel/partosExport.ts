import { PartoCesarea } from '@/types'
import { XLSX, headerStyle, titleStyle, subtitleStyle, saveWorkbook, setColWidths, setRowHeight, addCell, getRowStyle, getRowStyleCenter, badgeYes, badgeNo, mergeCells } from './utils'
import { formatDateDisplay } from '@/utils/dates'

export function buildPartosSheet(data: PartoCesarea[], anio: number): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {}

  addCell(ws, 'A1', 'ENDOMETRITIS PUERPERAL', titleStyle)
  addCell(ws, 'D1', `Fuente: Estadística diaria paciente hospitalizado - ${anio}`, subtitleStyle)
  mergeCells(ws, { r: 0, c: 0 }, { r: 0, c: 2 })
  mergeCells(ws, { r: 0, c: 3 }, { r: 0, c: 10 })
  setRowHeight(ws, 0, 28)

  const headers = ['Mes', 'Nombre del Paciente', 'RUT', 'Fecha Parto/Cesárea', 'Parto/Cesárea', 'Con/Sin TP', 'Fecha 1er Control', 'Control Post Parto', 'Signos IAAS', '30 días', 'Observaciones']
  const cols = 'ABCDEFGHIJK'
  headers.forEach((h, i) => addCell(ws, `${cols[i]}3`, h, headerStyle))
  setRowHeight(ws, 2, 30)

  data.forEach((row, i) => {
    const r = i + 4
    const s = getRowStyle(i)
    const sc = getRowStyleCenter(i)
    addCell(ws, `A${r}`, row.mes, sc)
    addCell(ws, `B${r}`, row.nombre, s)
    addCell(ws, `C${r}`, row.rut, sc)
    addCell(ws, `D${r}`, formatDateDisplay(row.fechaParto), sc)
    addCell(ws, `E${r}`, row.tipo, sc)
    addCell(ws, `F${r}`, row.conTP, sc)
    addCell(ws, `G${r}`, formatDateDisplay(row.fechaPrimerControl), sc)
    addCell(ws, `H${r}`, row.controlPostParto, s)
    addCell(ws, `I${r}`, row.signosSintomasIAAS || '', row.signosSintomasIAAS === 'SI' ? badgeYes : badgeNo)
    addCell(ws, `J${r}`, row.dias30, sc)
    addCell(ws, `K${r}`, row.observaciones, s)
  })

  ws['!ref'] = `A1:K${data.length + 3}`
  setColWidths(ws, [11, 30, 14, 16, 16, 10, 14, 30, 10, 10, 30])

  return ws
}

export function exportPartos(data: PartoCesarea[], anio: number) {
  const wb = XLSX.utils.book_new()
  const ws = buildPartosSheet(data, anio)
  XLSX.utils.book_append_sheet(wb, ws, 'Partos-Cesárea (EP)')
  saveWorkbook(wb, `Partos_Cesarea_EP_${anio}.xlsx`)
}
