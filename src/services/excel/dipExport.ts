import { DispositivoInvasivo } from '../../types'
import { XLSX, headerStyle, cellStyle, titleStyle, saveWorkbook, setColWidths, addCell, addFormulaCell } from './utils'
import { formatDateDisplay } from '../../utils/dates'

export function exportDip(data: DispositivoInvasivo[], anio: number) {
  const wb = XLSX.utils.book_new()
  const ws: XLSX.WorkSheet = {}

  addCell(ws, 'B1', 'DISPOSITIVOS INVASIVOS PERMANENTES', titleStyle)
  addCell(ws, 'E1', `Fuente: estadística diaria de pacientes hospitalizados - ${anio}`, { font: { sz: 8, name: 'Arial', italic: true, color: { rgb: '666666' } } })

  addCell(ws, 'G2', 'DIP 1', { ...headerStyle, fill: { fgColor: { rgb: '155E75' } } })
  addCell(ws, 'J2', 'DIP 2', { ...headerStyle, fill: { fgColor: { rgb: '155E75' } } })
  addCell(ws, 'M2', 'DIP 3', { ...headerStyle, fill: { fgColor: { rgb: '155E75' } } })
  addCell(ws, 'P2', 'DIP 4', { ...headerStyle, fill: { fgColor: { rgb: '155E75' } } })

  const headers = ['Mes', 'Servicio', 'Nombre', 'RUT', 'Edad', 'DIP', 'F. Instalación', 'F. Retiro', 'N° Días', 'F. Instalación', 'F. Retiro', 'N° Días', 'F. Instalación', 'F. Retiro', 'N° Días', 'F. Instalación', 'F. Retiro', 'N° Días', 'Total', 'Revisión FC']
  const colLetters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T']
  headers.forEach((h, i) => addCell(ws, `${colLetters[i]}3`, h, headerStyle))

  data.forEach((row, i) => {
    const r = i + 4
    addCell(ws, `A${r}`, row.mes, cellStyle)
    addCell(ws, `B${r}`, row.servicio, cellStyle)
    addCell(ws, `C${r}`, row.nombre, cellStyle)
    addCell(ws, `D${r}`, row.rut, cellStyle)
    addCell(ws, `E${r}`, row.edad, cellStyle)
    addCell(ws, `F${r}`, row.tipoDIP, cellStyle)

    for (let p = 0; p < 4; p++) {
      const periodo = row.periodos?.[p]
      const baseCol = 6 + p * 3
      if (periodo) {
        addCell(ws, `${colLetters[baseCol]}${r}`, formatDateDisplay(periodo.fechaInstalacion), cellStyle)
        addCell(ws, `${colLetters[baseCol + 1]}${r}`, formatDateDisplay(periodo.fechaRetiro), cellStyle)
        addFormulaCell(ws, `${colLetters[baseCol + 2]}${r}`,
          `IF(OR(${colLetters[baseCol]}${r}="",${colLetters[baseCol + 1]}${r}=""),"",${colLetters[baseCol + 1]}${r}-${colLetters[baseCol]}${r}+1)`,
          cellStyle)
      } else {
        addCell(ws, `${colLetters[baseCol]}${r}`, '', cellStyle)
        addCell(ws, `${colLetters[baseCol + 1]}${r}`, '', cellStyle)
        addCell(ws, `${colLetters[baseCol + 2]}${r}`, '', cellStyle)
      }
    }

    addFormulaCell(ws, `S${r}`, `I${r}+L${r}+O${r}+R${r}`, cellStyle)
    addCell(ws, `T${r}`, row.revisionFC, cellStyle)
  })

  ws['!ref'] = `A1:T${data.length + 3}`
  setColWidths(ws, [10, 10, 28, 14, 6, 6, 12, 12, 8, 12, 12, 8, 12, 12, 8, 12, 12, 8, 8, 40])

  XLSX.utils.book_append_sheet(wb, ws, 'DIP')
  saveWorkbook(wb, `DIP_${anio}.xlsx`)
}
