import { describe, it, expect, vi } from 'vitest'

vi.mock('file-saver', () => ({ saveAs: vi.fn() }))

import { buildSheet, SheetConfig } from '@/services/excel/sheetBuilder'

interface TestData {
  name: string
  value: number
}

const config: SheetConfig<TestData> = {
  title: { text: 'Test Title', span: 2 },
  columns: [
    { header: 'Name', width: 20, getValue: (d) => d.name },
    { header: 'Value', width: 10, getValue: (d) => d.value, center: true },
  ],
}

describe('buildSheet', () => {
  it('creates title cell at A1', () => {
    const ws = buildSheet([], config)
    expect(ws['A1']?.v).toBe('Test Title')
  })

  it('creates header cells on the correct row (default headerRow=2)', () => {
    const ws = buildSheet([], config)
    // Default headerRow=2 -> 1-based row 3 -> A3, B3
    expect(ws['A3']?.v).toBe('Name')
    expect(ws['B3']?.v).toBe('Value')
  })

  it('populates data rows after headers', () => {
    const data = [
      { name: 'Alice', value: 100 },
      { name: 'Bob', value: 200 },
    ]
    const ws = buildSheet(data, config)
    // headerRow=2 -> data starts at row 3 (0-based) -> row 4 in Excel
    expect(ws['A4']?.v).toBe('Alice')
    expect(ws['B4']?.v).toBe(100)
    expect(ws['A5']?.v).toBe('Bob')
    expect(ws['B5']?.v).toBe(200)
  })

  it('sets column widths from config', () => {
    const ws = buildSheet([], config)
    expect(ws['!cols']).toEqual([{ wch: 20 }, { wch: 10 }])
  })

  it('sets sheet reference range', () => {
    const ws = buildSheet([{ name: 'A', value: 1 }], config)
    expect(ws['!ref']).toBeDefined()
    // Should cover from A1 to at least B4
    expect(ws['!ref']).toMatch(/^A1:B\d+$/)
  })

  it('creates merge cells for title', () => {
    const ws = buildSheet([], config)
    expect(ws['!merges']).toBeDefined()
    expect(ws['!merges']!.length).toBeGreaterThanOrEqual(1)
    // Title spans 2 columns: merge from (0,0) to (0,1)
    const titleMerge = ws['!merges']![0]
    expect(titleMerge.s).toEqual({ r: 0, c: 0 })
    expect(titleMerge.e).toEqual({ r: 0, c: 1 })
  })

  it('handles subtitle on the same row as title', () => {
    const configWithSub: SheetConfig<TestData> = {
      ...config,
      subtitle: { text: 'Subtitle text', startCol: 2, endCol: 4 },
    }
    const ws = buildSheet([], configWithSub)
    // Subtitle at column C (index 2), row 1
    expect(ws['C1']?.v).toBe('Subtitle text')
  })

  it('creates merge for subtitle', () => {
    const configWithSub: SheetConfig<TestData> = {
      ...config,
      subtitle: { text: 'Sub', startCol: 2, endCol: 4 },
    }
    const ws = buildSheet([], configWithSub)
    // Should have at least 2 merges: title + subtitle
    expect(ws['!merges']!.length).toBeGreaterThanOrEqual(2)
    const subMerge = ws['!merges']!.find(
      (m) => m.s.c === 2 && m.e.c === 4
    )
    expect(subMerge).toBeDefined()
  })

  it('handles custom headerRow', () => {
    const customConfig: SheetConfig<TestData> = {
      ...config,
      headerRow: 1,
    }
    const ws = buildSheet([], customConfig)
    // headerRow=1 -> 1-based row 2 -> A2, B2
    expect(ws['A2']?.v).toBe('Name')
    expect(ws['B2']?.v).toBe('Value')
  })

  it('places data correctly with custom headerRow', () => {
    const customConfig: SheetConfig<TestData> = {
      ...config,
      headerRow: 1,
    }
    const ws = buildSheet([{ name: 'X', value: 42 }], customConfig)
    // headerRow=1 -> data at row 2 (0-based) -> row 3 in Excel
    expect(ws['A3']?.v).toBe('X')
    expect(ws['B3']?.v).toBe(42)
  })

  it('sets numeric type for number values', () => {
    const ws = buildSheet([{ name: 'Test', value: 99 }], config)
    expect(ws['B4']?.t).toBe('n')
  })

  it('sets string type for text values', () => {
    const ws = buildSheet([{ name: 'Test', value: 99 }], config)
    expect(ws['A4']?.t).toBe('s')
  })

  it('applies centered style for center columns', () => {
    const ws = buildSheet([{ name: 'A', value: 1 }], config)
    // Column B (Value) has center: true
    expect(ws['B4']?.s?.alignment?.horizontal).toBe('center')
  })

  it('applies alternating row styles', () => {
    const data = [
      { name: 'A', value: 1 },
      { name: 'B', value: 2 },
    ]
    const ws = buildSheet(data, config)
    // Row 0 (even) has no fill, row 1 (odd) has alt fill
    const row1Style = ws['A4']?.s
    const row2Style = ws['A5']?.s
    // Odd rows get the alt style with a gray background
    expect(row2Style?.fill?.fgColor?.rgb).toBe('F1F5F9')
    // Even rows have no fill (or undefined)
    expect(row1Style?.fill).toBeUndefined()
  })

  it('handles empty data array gracefully', () => {
    const ws = buildSheet([], config)
    expect(ws['A1']?.v).toBe('Test Title')
    expect(ws['!ref']).toBeDefined()
    // No data rows, so A4 should not exist
    expect(ws['A4']).toBeUndefined()
  })

  it('supports custom getStyle on columns', () => {
    const customConfig: SheetConfig<TestData> = {
      title: { text: 'Title', span: 2 },
      columns: [
        { header: 'Name', width: 20, getValue: (d) => d.name },
        {
          header: 'Value', width: 10,
          getValue: (d) => d.value,
          getStyle: (item, _base) => {
            if (item.value > 50) return { font: { bold: true } }
            return _base
          },
        },
      ],
    }
    const ws = buildSheet([{ name: 'High', value: 100 }], customConfig)
    expect(ws['B4']?.s?.font?.bold).toBe(true)
  })

  it('sets row height for title row', () => {
    const ws = buildSheet([], config)
    expect(ws['!rows']).toBeDefined()
    expect(ws['!rows']![0]?.hpt).toBe(28)
  })
})
