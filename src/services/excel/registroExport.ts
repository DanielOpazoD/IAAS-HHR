import { RegistroIAAS } from '../../types'
import { XLSX, headerStyle, cellStyle, titleStyle, saveWorkbook, setColWidths, addCell } from './utils'
import { formatDateDisplay } from '../../utils/dates'

export function exportRegistroIaas(data: RegistroIAAS[], anio: number) {
  const wb = XLSX.utils.book_new()
  const ws: XLSX.WorkSheet = {}

  const headers = ['N°', 'Mes', 'Nombre Paciente', 'RUT', 'Sexo', 'F. Ingreso', 'F. Instalación', 'F. DG/CX', 'Días Invasivo', 'IAAS', 'Fallecido', 'F. Cultivo', 'Agente', 'Diagnóstico', 'Ind. Instalación', 'Ind. Retiro', 'Responsable', 'Observaciones']
  const colLetters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R']
  headers.forEach((h, i) => addCell(ws, `${colLetters[i]}1`, h, headerStyle))

  data.forEach((row, i) => {
    const r = i + 2
    addCell(ws, `A${r}`, row.numero, cellStyle)
    addCell(ws, `B${r}`, row.mes, cellStyle)
    addCell(ws, `C${r}`, row.nombre, cellStyle)
    addCell(ws, `D${r}`, row.rut, cellStyle)
    addCell(ws, `E${r}`, row.sexo, cellStyle)
    addCell(ws, `F${r}`, formatDateDisplay(row.fechaIngreso), cellStyle)
    addCell(ws, `G${r}`, formatDateDisplay(row.fechaInstalacion), cellStyle)
    addCell(ws, `H${r}`, formatDateDisplay(row.fechaDiagCx), cellStyle)
    addCell(ws, `I${r}`, row.diasInvasivo ?? '', cellStyle)
    addCell(ws, `J${r}`, row.iaas, cellStyle)
    addCell(ws, `K${r}`, row.fallecido, { ...cellStyle, font: { ...cellStyle.font, bold: row.fallecido === 'SI', color: { rgb: row.fallecido === 'SI' ? 'DC2626' : '000000' } } })
    addCell(ws, `L${r}`, formatDateDisplay(row.fechaCultivo), cellStyle)
    addCell(ws, `M${r}`, row.agente, cellStyle)
    addCell(ws, `N${r}`, row.diagnostico, cellStyle)
    addCell(ws, `O${r}`, row.indicacionInstalacion, cellStyle)
    addCell(ws, `P${r}`, row.indicacionRetiro, cellStyle)
    addCell(ws, `Q${r}`, row.responsable, cellStyle)
    addCell(ws, `R${r}`, row.observaciones, cellStyle)
  })

  ws['!ref'] = `A1:R${data.length + 1}`
  setColWidths(ws, [5, 10, 28, 14, 6, 12, 12, 12, 10, 10, 10, 12, 15, 20, 20, 20, 15, 30])

  XLSX.utils.book_append_sheet(wb, ws, 'IAAS')
  saveWorkbook(wb, `Registro_IAAS_${anio}.xlsx`)
}
