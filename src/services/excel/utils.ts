import XLSX from 'xlsx-js-style'
import { saveAs } from 'file-saver'

// ── Color palette ──
const TEAL_DARK = '0C5C6F'
const TEAL_MID = '0E7490'
const GRAY_BORDER = 'CBD5E1'
const GRAY_LIGHT = 'F1F5F9'
const WHITE = 'FFFFFF'

// ── Styles ──

export const headerStyle: XLSX.CellStyle = {
  font: { bold: true, color: { rgb: WHITE }, sz: 9, name: 'Calibri' },
  fill: { fgColor: { rgb: TEAL_MID } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: {
    top: { style: 'thin', color: { rgb: TEAL_DARK } },
    bottom: { style: 'medium', color: { rgb: TEAL_DARK } },
    left: { style: 'thin', color: { rgb: TEAL_DARK } },
    right: { style: 'thin', color: { rgb: TEAL_DARK } },
  },
}

export const subHeaderStyle: XLSX.CellStyle = {
  font: { bold: true, color: { rgb: WHITE }, sz: 9, name: 'Calibri' },
  fill: { fgColor: { rgb: '155E75' } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: {
    top: { style: 'thin', color: { rgb: TEAL_DARK } },
    bottom: { style: 'thin', color: { rgb: TEAL_DARK } },
    left: { style: 'thin', color: { rgb: TEAL_DARK } },
    right: { style: 'thin', color: { rgb: TEAL_DARK } },
  },
}

export const cellStyle: XLSX.CellStyle = {
  font: { sz: 9, name: 'Calibri', color: { rgb: '334155' } },
  border: {
    top: { style: 'thin', color: { rgb: GRAY_BORDER } },
    bottom: { style: 'thin', color: { rgb: GRAY_BORDER } },
    left: { style: 'thin', color: { rgb: GRAY_BORDER } },
    right: { style: 'thin', color: { rgb: GRAY_BORDER } },
  },
  alignment: { vertical: 'center' },
}

export const cellStyleAlt: XLSX.CellStyle = {
  ...cellStyle,
  fill: { fgColor: { rgb: GRAY_LIGHT } },
}

export const cellStyleCenter: XLSX.CellStyle = {
  ...cellStyle,
  alignment: { horizontal: 'center', vertical: 'center' },
}

export const cellStyleCenterAlt: XLSX.CellStyle = {
  ...cellStyleCenter,
  fill: { fgColor: { rgb: GRAY_LIGHT } },
}

export const titleStyle: XLSX.CellStyle = {
  font: { bold: true, sz: 13, name: 'Calibri', color: { rgb: TEAL_DARK } },
  alignment: { vertical: 'center' },
}

export const subtitleStyle: XLSX.CellStyle = {
  font: { sz: 8, name: 'Calibri', italic: true, color: { rgb: '64748B' } },
  alignment: { vertical: 'center' },
}

export const badgeYes: XLSX.CellStyle = {
  font: { bold: true, sz: 9, name: 'Calibri', color: { rgb: 'B91C1C' } },
  fill: { fgColor: { rgb: 'FEE2E2' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border: {
    top: { style: 'thin', color: { rgb: GRAY_BORDER } },
    bottom: { style: 'thin', color: { rgb: GRAY_BORDER } },
    left: { style: 'thin', color: { rgb: GRAY_BORDER } },
    right: { style: 'thin', color: { rgb: GRAY_BORDER } },
  },
}

export const badgeNo: XLSX.CellStyle = {
  font: { bold: true, sz: 9, name: 'Calibri', color: { rgb: '15803D' } },
  fill: { fgColor: { rgb: 'DCFCE7' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border: {
    top: { style: 'thin', color: { rgb: GRAY_BORDER } },
    bottom: { style: 'thin', color: { rgb: GRAY_BORDER } },
    left: { style: 'thin', color: { rgb: GRAY_BORDER } },
    right: { style: 'thin', color: { rgb: GRAY_BORDER } },
  },
}

export const badgeDanger: XLSX.CellStyle = {
  font: { bold: true, sz: 9, name: 'Calibri', color: { rgb: WHITE } },
  fill: { fgColor: { rgb: 'DC2626' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border: {
    top: { style: 'thin', color: { rgb: GRAY_BORDER } },
    bottom: { style: 'thin', color: { rgb: GRAY_BORDER } },
    left: { style: 'thin', color: { rgb: GRAY_BORDER } },
    right: { style: 'thin', color: { rgb: GRAY_BORDER } },
  },
}

// ── Helpers ──

export function saveWorkbook(wb: XLSX.WorkBook, filename: string) {
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), filename)
}

export function setColWidths(ws: XLSX.WorkSheet, widths: number[]) {
  ws['!cols'] = widths.map((w) => ({ wch: w }))
}

export function setRowHeight(ws: XLSX.WorkSheet, row: number, height: number) {
  if (!ws['!rows']) ws['!rows'] = []
  ws['!rows'][row] = { hpt: height }
}

export function addCell(ws: XLSX.WorkSheet, ref: string, value: string | number, style: XLSX.CellStyle) {
  ws[ref] = { v: value, s: style, t: typeof value === 'number' ? 'n' : 's' }
}

export function addFormulaCell(ws: XLSX.WorkSheet, ref: string, formula: string, style: XLSX.CellStyle) {
  ws[ref] = { f: formula, s: style, t: 'n' }
}

export function getRowStyle(rowIndex: number) {
  return rowIndex % 2 === 0 ? cellStyle : cellStyleAlt
}

export function getRowStyleCenter(rowIndex: number) {
  return rowIndex % 2 === 0 ? cellStyleCenter : cellStyleCenterAlt
}

export function mergeCells(ws: XLSX.WorkSheet, s: { r: number; c: number }, e: { r: number; c: number }) {
  if (!ws['!merges']) ws['!merges'] = []
  ws['!merges'].push({ s, e })
}

export { XLSX }
