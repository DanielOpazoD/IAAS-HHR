import { RegistroIAAS } from '@/types'
import { XLSX, headerStyle, titleStyle, saveWorkbook, setColWidths, setRowHeight, addCell, getRowStyle, getRowStyleCenter, badgeDanger, mergeCells } from './utils'
import { formatDateDisplay } from '@/utils/dates'

export function buildRegistroSheet(data: RegistroIAAS[], anio: number): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {}

  addCell(ws, 'A1', `REGISTRO DE INFECCIONES ASOCIADAS A LA ATENCIÓN DE SALUD ${anio}`, titleStyle)
  mergeCells(ws, { r: 0, c: 0 }, { r: 0, c: 17 })
  setRowHeight(ws, 0, 28)

  const headers = ['N°', 'Mes', 'Nombre Paciente', 'RUT', 'Sexo', 'F. Ingreso', 'F. Instalación', 'F. DG/CX', 'Días Invasivo', 'IAAS', 'Fallecido', 'F. Cultivo', 'Agente', 'Diagnóstico', 'Ind. Instalación', 'Ind. Retiro', 'Responsable', 'Observaciones']
  const colLetters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R']
  headers.forEach((h, i) => addCell(ws, `${colLetters[i]}2`, h, headerStyle))
  setRowHeight(ws, 1, 30)

  data.forEach((row, i) => {
    const r = i + 3
    const s = getRowStyle(i)
    const sc = getRowStyleCenter(i)
    addCell(ws, `A${r}`, row.numero, sc)
    addCell(ws, `B${r}`, row.mes, sc)
    addCell(ws, `C${r}`, row.nombre, s)
    addCell(ws, `D${r}`, row.rut, sc)
    addCell(ws, `E${r}`, row.sexo, sc)
    addCell(ws, `F${r}`, formatDateDisplay(row.fechaIngreso), sc)
    addCell(ws, `G${r}`, formatDateDisplay(row.fechaInstalacion), sc)
    addCell(ws, `H${r}`, formatDateDisplay(row.fechaDiagCx), sc)
    addCell(ws, `I${r}`, row.diasInvasivo ?? '', sc)
    addCell(ws, `J${r}`, row.iaas, sc)
    addCell(ws, `K${r}`, row.fallecido || '', row.fallecido === 'SI' ? badgeDanger : sc)
    addCell(ws, `L${r}`, formatDateDisplay(row.fechaCultivo), sc)
    addCell(ws, `M${r}`, row.agente, s)
    addCell(ws, `N${r}`, row.diagnostico, s)
    addCell(ws, `O${r}`, row.indicacionInstalacion, s)
    addCell(ws, `P${r}`, row.indicacionRetiro, s)
    addCell(ws, `Q${r}`, row.responsable, s)
    addCell(ws, `R${r}`, row.observaciones, s)
  })

  ws['!ref'] = `A1:R${data.length + 2}`
  setColWidths(ws, [5, 11, 28, 14, 7, 12, 12, 12, 10, 10, 10, 12, 16, 22, 20, 20, 16, 30])

  return ws
}

export function exportRegistroIaas(data: RegistroIAAS[], anio: number) {
  const wb = XLSX.utils.book_new()
  const ws = buildRegistroSheet(data, anio)
  XLSX.utils.book_append_sheet(wb, ws, 'Registro IAAS')
  saveWorkbook(wb, `Registro_IAAS_${anio}.xlsx`)
}
