import { XLSX, headerStyle, titleStyle, subtitleStyle, addCell, setColWidths, setRowHeight, mergeCells, getRowStyle, getRowStyleCenter } from './utils'

export interface SheetColumn<T> {
  header: string
  width: number
  getValue: (item: T, index: number) => string | number
  /** Override the base style for this cell (e.g. badge styles). */
  getStyle?: (item: T, baseStyle: XLSX.CellStyle) => XLSX.CellStyle
  /** If true, uses centered row style instead of left-aligned. */
  center?: boolean
}

export interface SheetTitle {
  text: string
  /** How many columns the title spans (from col 0). */
  span: number
}

export interface SheetSubtitle {
  text: string
  /** Column index where the subtitle starts. */
  startCol: number
  /** Column index where the subtitle ends (inclusive). */
  endCol: number
}

export interface SheetConfig<T> {
  title: SheetTitle
  subtitle?: SheetSubtitle
  columns: SheetColumn<T>[]
  /**
   * Row index where column headers are placed.
   * Title is always on row 0. Data starts on headerRow + 1.
   * Default: 2 (leaving row 1 blank between title and headers).
   */
  headerRow?: number
}

const COL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/**
 * Builds a standardized data sheet with title, subtitle, headers, and data rows.
 * Eliminates boilerplate duplicated across all export functions.
 */
export function buildSheet<T>(data: T[], config: SheetConfig<T>): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {}
  const cols = config.columns.length
  const headerRow = config.headerRow ?? 2
  const dataStartRow = headerRow + 1

  // Title (always row 0)
  addCell(ws, 'A1', config.title.text, titleStyle)
  mergeCells(ws, { r: 0, c: 0 }, { r: 0, c: config.title.span - 1 })
  setRowHeight(ws, 0, 28)

  // Subtitle (optional, same row as title but different columns)
  if (config.subtitle) {
    const subCol = COL_LETTERS[config.subtitle.startCol]
    addCell(ws, `${subCol}1`, config.subtitle.text, subtitleStyle)
    mergeCells(ws, { r: 0, c: config.subtitle.startCol }, { r: 0, c: config.subtitle.endCol })
  }

  // Column headers
  const hRowExcel = headerRow + 1 // 1-based for cell refs
  config.columns.forEach((col, ci) => {
    addCell(ws, `${COL_LETTERS[ci]}${hRowExcel}`, col.header, headerStyle)
  })
  setRowHeight(ws, headerRow, 30)

  // Data rows
  data.forEach((item, ri) => {
    const rowExcel = dataStartRow + ri + 1 // 1-based

    config.columns.forEach((col, ci) => {
      const value = col.getValue(item, ri)
      const baseStyle = col.center ? getRowStyleCenter(ri) : getRowStyle(ri)
      const style = col.getStyle ? col.getStyle(item, baseStyle) : baseStyle
      addCell(ws, `${COL_LETTERS[ci]}${rowExcel}`, value, style)
    })
  })

  // Column widths
  setColWidths(ws, config.columns.map(c => c.width))

  // Sheet range
  const lastDataRow = dataStartRow + data.length // 1-based last row
  const lastCol = COL_LETTERS[cols - 1]
  ws['!ref'] = `A1:${lastCol}${Math.max(lastDataRow, hRowExcel)}`

  return ws
}
