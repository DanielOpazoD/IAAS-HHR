import XLSX from 'xlsx-js-style'
import { saveAs } from 'file-saver'

export const headerStyle: XLSX.CellStyle = {
  font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10, name: 'Arial' },
  fill: { fgColor: { rgb: '0E7490' } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: {
    top: { style: 'thin', color: { rgb: 'CCCCCC' } },
    bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
    left: { style: 'thin', color: { rgb: 'CCCCCC' } },
    right: { style: 'thin', color: { rgb: 'CCCCCC' } },
  },
}

export const cellStyle: XLSX.CellStyle = {
  font: { sz: 9, name: 'Arial' },
  border: {
    top: { style: 'thin', color: { rgb: 'E5E7EB' } },
    bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
    left: { style: 'thin', color: { rgb: 'E5E7EB' } },
    right: { style: 'thin', color: { rgb: 'E5E7EB' } },
  },
  alignment: { vertical: 'center' },
}

export const titleStyle: XLSX.CellStyle = {
  font: { bold: true, sz: 12, name: 'Arial', color: { rgb: '0E7490' } },
}

export function saveWorkbook(wb: XLSX.WorkBook, filename: string) {
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), filename)
}

export function setColWidths(ws: XLSX.WorkSheet, widths: number[]) {
  ws['!cols'] = widths.map((w) => ({ wch: w }))
}

export function addCell(ws: XLSX.WorkSheet, ref: string, value: string | number, style: XLSX.CellStyle) {
  ws[ref] = { v: value, s: style, t: typeof value === 'number' ? 'n' : 's' }
}

export function addFormulaCell(ws: XLSX.WorkSheet, ref: string, formula: string, style: XLSX.CellStyle) {
  ws[ref] = { f: formula, s: style, t: 'n' }
}

export { XLSX }
