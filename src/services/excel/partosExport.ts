import { PartoCesarea } from '../../types'
import { XLSX, headerStyle, cellStyle, titleStyle, saveWorkbook, setColWidths, addCell } from './utils'
import { formatDateDisplay } from '../../utils/dates'

export function exportPartos(data: PartoCesarea[], anio: number) {
  const wb = XLSX.utils.book_new()
  const ws: XLSX.WorkSheet = {}

  addCell(ws, 'A1', 'ENDOMETRITIS PUERPERAL', titleStyle)
  addCell(ws, 'C1', `Fuente: Estadística diaria paciente hospitalizado - ${anio}`, { font: { sz: 8, name: 'Arial', italic: true, color: { rgb: '666666' } } })

  const headers = ['Mes', 'Nombre del Paciente', 'RUT', 'Fecha Parto/Cesárea', 'Parto/Cesárea', 'Con/Sin TP', 'Fecha 1er Control', 'Control Post Parto', 'Signos IAAS', '30 días', 'Observaciones']
  const cols = 'ABCDEFGHIJK'
  headers.forEach((h, i) => addCell(ws, `${cols[i]}3`, h, headerStyle))

  data.forEach((row, i) => {
    const r = i + 4
    addCell(ws, `A${r}`, row.mes, cellStyle)
    addCell(ws, `B${r}`, row.nombre, cellStyle)
    addCell(ws, `C${r}`, row.rut, cellStyle)
    addCell(ws, `D${r}`, formatDateDisplay(row.fechaParto), cellStyle)
    addCell(ws, `E${r}`, row.tipo, cellStyle)
    addCell(ws, `F${r}`, row.conTP, cellStyle)
    addCell(ws, `G${r}`, formatDateDisplay(row.fechaPrimerControl), cellStyle)
    addCell(ws, `H${r}`, row.controlPostParto, cellStyle)
    addCell(ws, `I${r}`, row.signosSintomasIAAS, { ...cellStyle, font: { ...cellStyle.font, bold: true, color: { rgb: row.signosSintomasIAAS === 'SI' ? 'DC2626' : '16A34A' } } })
    addCell(ws, `J${r}`, row.dias30, cellStyle)
    addCell(ws, `K${r}`, row.observaciones, cellStyle)
  })

  ws['!ref'] = `A1:K${data.length + 3}`
  setColWidths(ws, [10, 28, 14, 16, 16, 10, 14, 40, 10, 15, 30])

  XLSX.utils.book_append_sheet(wb, ws, 'Partos-Cesárea (EP)')
  saveWorkbook(wb, `Partos_Cesarea_EP_${anio}.xlsx`)
}
