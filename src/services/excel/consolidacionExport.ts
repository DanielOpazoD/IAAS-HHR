import { INDICADORES_DIP, INDICADORES_AREPI, INDICADORES_CX_PARTOS } from '../../utils/constants'
import { XLSX, headerStyle, cellStyle, titleStyle, saveWorkbook, setColWidths, addCell, addFormulaCell } from './utils'

const subHeaderStyle: XLSX.CellStyle = {
  ...headerStyle,
  fill: { fgColor: { rgb: '155E75' } },
}

const varStyle: XLSX.CellStyle = {
  ...cellStyle,
  font: { ...cellStyle.font, color: { rgb: '6B7280' } },
}

function writeIndicatorBlock(
  ws: XLSX.WorkSheet,
  startRow: number,
  indicadores: readonly { id: string; nombre: string; irm: number; varInfeccion: string }[],
  meses: string[],
  getData: (indId: string, mes: string) => { infecciones: number; denominador: number },
  rateType: 'por1000' | 'porcentaje',
  title: string,
  cuatrimestreLabel: string,
  anio: number,
) {
  const mesColLetters = ['D', 'E', 'F', 'G']
  let r = startRow

  addCell(ws, `B${r}`, title, titleStyle)
  r++

  addCell(ws, `A${r}`, 'N°', subHeaderStyle)
  addCell(ws, `B${r}`, 'Indicador', subHeaderStyle)
  addCell(ws, `C${r}`, 'Variables', subHeaderStyle)
  meses.forEach((m, i) => addCell(ws, `${mesColLetters[i]}${r}`, m.slice(0, 3), subHeaderStyle))
  addCell(ws, `H${r}`, cuatrimestreLabel, subHeaderStyle)
  addCell(ws, `I${r}`, 'Tasa', subHeaderStyle)
  addCell(ws, `J${r}`, String(anio), subHeaderStyle)
  addCell(ws, `K${r}`, 'Tasa', subHeaderStyle)
  addCell(ws, `L${r}`, 'IRM', subHeaderStyle)
  r++

  indicadores.forEach((ind, idx) => {
    const varLabels = rateType === 'por1000'
      ? [ind.varInfeccion, 'N° Pacientes', 'N° Días exposición', 'Tasa por 1000 días']
      : [ind.varInfeccion, 'N° proc. vigilados', 'N° procedimientos', 'Tasa']

    for (let vi = 0; vi < 4; vi++) {
      if (vi === 0) {
        addCell(ws, `A${r}`, idx + 1, cellStyle)
        addCell(ws, `B${r}`, ind.nombre, cellStyle)
      }
      addCell(ws, `C${r}`, varLabels[vi], varStyle)

      if (vi < 3) {
        meses.forEach((mes, mi) => {
          const d = getData(ind.id, mes)
          const val = vi === 0 ? d.infecciones : d.denominador
          addCell(ws, `${mesColLetters[mi]}${r}`, val, cellStyle)
        })
        // Cuatrimestre total
        addFormulaCell(ws, `H${r}`, `SUM(D${r}:G${r})`, cellStyle)
        // Annual total placeholder
        addFormulaCell(ws, `J${r}`, `H${r}`, cellStyle)
      } else {
        // Tasa row with formulas
        const infRow = r - 3
        const denRow = r - 1
        const multiplier = rateType === 'por1000' ? '*1000' : '*100'

        meses.forEach((_mes, mi) => {
          addFormulaCell(ws, `${mesColLetters[mi]}${r}`,
            `IF(${mesColLetters[mi]}${denRow}=0,0,${mesColLetters[mi]}${infRow}/${mesColLetters[mi]}${denRow}${multiplier})`,
            cellStyle)
        })
        addFormulaCell(ws, `H${r}`, `IF(H${denRow}=0,0,H${infRow}/H${denRow}${multiplier})`, cellStyle)
        addFormulaCell(ws, `I${r}`, `H${r}`, cellStyle)
        addFormulaCell(ws, `J${r}`, `IF(J${denRow}=0,0,J${infRow}/J${denRow}${multiplier})`, cellStyle)
        addFormulaCell(ws, `K${r}`, `J${r}`, cellStyle)
        addCell(ws, `L${r}`, ind.irm, cellStyle)
      }
      r++
    }
  })

  return r
}

export function exportConsolidacion(
  anio: number,
  cuatrimestre: number,
  meses: string[],
  getDipData: (indId: string, mes: string) => { infecciones: number; denominador: number },
  getArepiData: (indId: string, mes: string) => { infecciones: number; denominador: number },
  getCxPartosData: (indId: string, mes: string) => { infecciones: number; denominador: number },
) {
  const wb = XLSX.utils.book_new()
  const cuatLabel = `${cuatrimestre}° cuatrimestre`

  // DIP sheet
  const wsDip: XLSX.WorkSheet = {}
  const dipEnd = writeIndicatorBlock(wsDip, 1, INDICADORES_DIP, meses, getDipData, 'por1000',
    `Tabla: Vigilancia DIP HHR ${cuatLabel} ${anio}`, cuatLabel, anio)
  wsDip['!ref'] = `A1:L${dipEnd}`
  setColWidths(wsDip, [5, 42, 22, 10, 10, 10, 10, 12, 10, 12, 10, 8])
  XLSX.utils.book_append_sheet(wb, wsDip, `DIP ${cuatrimestre}`)

  // AREpi sheet
  const wsArepi: XLSX.WorkSheet = {}
  const arepiEnd = writeIndicatorBlock(wsArepi, 1, INDICADORES_AREPI, meses, getArepiData, 'por1000',
    `Tabla: Vigilancia AREpi HHR ${cuatLabel} ${anio}`, cuatLabel, anio)
  wsArepi['!ref'] = `A1:L${arepiEnd}`
  setColWidths(wsArepi, [5, 50, 22, 10, 10, 10, 10, 12, 10, 12, 10, 8])
  XLSX.utils.book_append_sheet(wb, wsArepi, `AREpi ${cuatrimestre}`)

  // Cx Trazadoras sheet
  const wsCx: XLSX.WorkSheet = {}
  const cxEnd = writeIndicatorBlock(wsCx, 1, INDICADORES_CX_PARTOS, meses, getCxPartosData, 'porcentaje',
    `Tabla: Vigilancia Cx Trazadoras y Partos HHR ${cuatLabel} ${anio}`, cuatLabel, anio)
  wsCx['!ref'] = `A1:L${cxEnd}`
  setColWidths(wsCx, [5, 42, 25, 10, 10, 10, 10, 12, 10, 12, 10, 8])
  XLSX.utils.book_append_sheet(wb, wsCx, `Cx Partos ${cuatrimestre}`)

  saveWorkbook(wb, `Consolidacion_Tasas_${cuatLabel}_${anio}.xlsx`)
}
