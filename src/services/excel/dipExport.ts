import { DispositivoInvasivo } from '@/types'
import { XLSX, headerStyle, subHeaderStyle, titleStyle, subtitleStyle, saveWorkbook, setColWidths, setRowHeight, addCell, addFormulaCell, getRowStyle, getRowStyleCenter, mergeCells } from './utils'
import { formatDateDisplay } from '@/utils/dates'

export function buildDipSheet(data: DispositivoInvasivo[], anio: number): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {}
  const colLetters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T']

  addCell(ws, 'A1', 'DISPOSITIVOS INVASIVOS PERMANENTES', titleStyle)
  addCell(ws, 'F1', `Fuente: estadística diaria de pacientes hospitalizados - ${anio}`, subtitleStyle)
  mergeCells(ws, { r: 0, c: 0 }, { r: 0, c: 4 })
  mergeCells(ws, { r: 0, c: 5 }, { r: 0, c: 19 })
  setRowHeight(ws, 0, 28)

  // DIP sub-headers
  addCell(ws, 'G2', 'DIP 1', subHeaderStyle)
  mergeCells(ws, { r: 1, c: 6 }, { r: 1, c: 8 })
  addCell(ws, 'J2', 'DIP 2', subHeaderStyle)
  mergeCells(ws, { r: 1, c: 9 }, { r: 1, c: 11 })
  addCell(ws, 'M2', 'DIP 3', subHeaderStyle)
  mergeCells(ws, { r: 1, c: 12 }, { r: 1, c: 14 })
  addCell(ws, 'P2', 'DIP 4', subHeaderStyle)
  mergeCells(ws, { r: 1, c: 15 }, { r: 1, c: 17 })
  setRowHeight(ws, 1, 22)

  const headers = ['Mes', 'Servicio', 'Nombre', 'RUT', 'Edad', 'DIP', 'F. Instalación', 'F. Retiro', 'N° Días', 'F. Instalación', 'F. Retiro', 'N° Días', 'F. Instalación', 'F. Retiro', 'N° Días', 'F. Instalación', 'F. Retiro', 'N° Días', 'Total', 'Revisión FC']
  headers.forEach((h, i) => addCell(ws, `${colLetters[i]}3`, h, headerStyle))
  setRowHeight(ws, 2, 30)

  data.forEach((row, i) => {
    const r = i + 4
    const s = getRowStyle(i)
    const sc = getRowStyleCenter(i)
    addCell(ws, `A${r}`, row.mes, sc)
    addCell(ws, `B${r}`, row.servicio, sc)
    addCell(ws, `C${r}`, row.nombre, s)
    addCell(ws, `D${r}`, row.rut, sc)
    addCell(ws, `E${r}`, row.edad, sc)
    addCell(ws, `F${r}`, row.tipoDIP, sc)

    for (let p = 0; p < 4; p++) {
      const periodo = row.periodos?.[p]
      const baseCol = 6 + p * 3
      if (periodo) {
        addCell(ws, `${colLetters[baseCol]}${r}`, formatDateDisplay(periodo.fechaInstalacion), sc)
        addCell(ws, `${colLetters[baseCol + 1]}${r}`, formatDateDisplay(periodo.fechaRetiro), sc)
        addFormulaCell(ws, `${colLetters[baseCol + 2]}${r}`,
          `IF(OR(${colLetters[baseCol]}${r}="",${colLetters[baseCol + 1]}${r}=""),"",${colLetters[baseCol + 1]}${r}-${colLetters[baseCol]}${r}+1)`,
          sc)
      } else {
        addCell(ws, `${colLetters[baseCol]}${r}`, '', sc)
        addCell(ws, `${colLetters[baseCol + 1]}${r}`, '', sc)
        addCell(ws, `${colLetters[baseCol + 2]}${r}`, '', sc)
      }
    }

    addFormulaCell(ws, `S${r}`, `I${r}+L${r}+O${r}+R${r}`, sc)
    addCell(ws, `T${r}`, row.revisionFC || '', s)
  })

  ws['!ref'] = `A1:T${data.length + 3}`
  setColWidths(ws, [11, 11, 28, 14, 7, 7, 12, 12, 8, 12, 12, 8, 12, 12, 8, 12, 12, 8, 8, 35])

  return ws
}

export function exportDip(data: DispositivoInvasivo[], anio: number) {
  const wb = XLSX.utils.book_new()
  const ws = buildDipSheet(data, anio)
  XLSX.utils.book_append_sheet(wb, ws, 'DIP')
  saveWorkbook(wb, `DIP_${anio}.xlsx`)
}
