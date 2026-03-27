import XLSX from 'xlsx-js-style'
import { MESES } from '@/utils/constants'
import type {
  CirugiaTrazadora,
  PartoCesarea,
  DispositivoInvasivo,
  PeriodoDIP,
  AgenteRiesgoEpidemico,
  RegistroIAAS,
} from '@/types'

/** Excel cell value (string, number, Date, boolean, or null) */
type CellValue = string | number | boolean | Date | null | undefined

function toDateStr(val: CellValue): string {
  if (!val) return ''
  if (val instanceof Date) return val.toISOString().slice(0, 10)
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val)
    if (d) return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`
  }
  if (typeof val === 'string') {
    const parts = val.match(/(\d{2})-(\d{2})-(\d{4})/)
    if (parts) return `${parts[3]}-${parts[2]}-${parts[1]}`
    return val
  }
  return String(val)
}

function normMes(val: CellValue): string {
  if (!val) return ''
  const s = String(val).trim()
  return MESES.find((m) => m.toLowerCase() === s.toLowerCase()) || s
}

function str(val: CellValue): string {
  if (val == null) return ''
  return String(val).trim()
}

function inferAnio(ws: XLSX.WorkSheet): number {
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  for (let r = range.s.r; r <= Math.min(range.e.r, 50); r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })]
      if (!cell) continue
      const v = cell.v
      if (v instanceof Date) return v.getFullYear()
      if (typeof v === 'number' && v > 40000 && v < 60000) {
        const d = XLSX.SSF.parse_date_code(v)
        if (d) return d.y
      }
    }
  }
  return new Date().getFullYear()
}

function getRows(ws: XLSX.WorkSheet, startRow: number): CellValue[][] {
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  const rows: CellValue[][] = []
  for (let r = startRow; r <= range.e.r; r++) {
    const row: CellValue[] = []
    let hasData = false
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })]
      const v = cell ? cell.v : null
      row.push(v)
      if (v != null && v !== '') hasData = true
    }
    if (hasData) rows.push(row)
  }
  return rows
}

export interface ImportResult {
  cirugias: (CirugiaTrazadora & { id: string })[]
  partos: (PartoCesarea & { id: string })[]
  dip: (DispositivoInvasivo & { id: string })[]
  arepi: (AgenteRiesgoEpidemico & { id: string })[]
  registroIaas: (RegistroIAAS & { id: string })[]
  anio: number
}

function normTipoCirugia(val: string): string {
  const lower = val.toLowerCase()
  if (lower.includes('laparoscópica') || lower.includes('laparoscopica')) return 'Colecistectomía Laparoscópica'
  if (lower.includes('laparotómica') || lower.includes('laparotomica')) return 'Colecistectomía Laparotómica'
  if (lower.includes('cesárea') || lower.includes('cesarea') || lower.includes('césarea')) return 'Cesárea'
  if (lower.includes('hernia')) return 'Hernia Inguinal c/s malla'
  if (lower.includes('catarata')) return 'Cataratas c/s LIO'
  return val
}

function normTipoParto(val: string): string {
  const lower = val.toLowerCase()
  if (lower.includes('vaginal')) return 'Parto vaginal'
  if (lower.includes('cesárea') || lower.includes('cesarea') || lower.includes('césarea')) return 'Cesárea'
  return val
}

function parseCirugias(ws: XLSX.WorkSheet): { data: (CirugiaTrazadora & { id: string })[]; anio: number } {
  const anio = inferAnio(ws)
  const rows = getRows(ws, 2) // skip header row (row 0=title, row 1=headers)
  const data: (CirugiaTrazadora & { id: string })[] = []

  for (const row of rows) {
    const mes = normMes(row[0])
    const nombre = str(row[1])
    if (!nombre) continue

    data.push({
      id: crypto.randomUUID(),
      mes,
      anio,
      nombre,
      rut: str(row[2]),
      fechaCirugia: toDateStr(row[3]),
      tipoCirugia: normTipoCirugia(str(row[4])),
      fechaPrimerControl: toDateStr(row[5]),
      observaciones: str(row[6]),
      iho: str(row[7]) || '',
      fechaSegundoControl: toDateStr(row[8]),
      observaciones2: str(row[9]),
      createdAt: new Date().toISOString(),
    })
  }
  return { data, anio }
}

function parsePartos(ws: XLSX.WorkSheet): { data: (PartoCesarea & { id: string })[]; anio: number } {
  const anio = inferAnio(ws)
  const rows = getRows(ws, 3) // row 0=title, row 1=blank, row 2=headers
  const data: (PartoCesarea & { id: string })[] = []

  for (const row of rows) {
    const mes = normMes(row[0])
    const nombre = str(row[1])
    if (!nombre) continue

    data.push({
      id: crypto.randomUUID(),
      mes,
      anio,
      nombre,
      rut: str(row[2]),
      fechaParto: toDateStr(row[3]),
      tipo: normTipoParto(str(row[4])),
      conTP: str(row[5]),
      fechaPrimerControl: toDateStr(row[6]),
      controlPostParto: str(row[7]),
      signosSintomasIAAS: str(row[8]),
      dias30: str(row[9]),
      observaciones: str(row[10]),
      createdAt: new Date().toISOString(),
    })
  }
  return { data, anio }
}

function parseDIP(ws: XLSX.WorkSheet): { data: (DispositivoInvasivo & { id: string })[]; anio: number } {
  const anio = inferAnio(ws)
  const rows = getRows(ws, 3) // row 0=title, row 1=DIP headers, row 2=column headers
  const data: (DispositivoInvasivo & { id: string })[] = []

  for (const row of rows) {
    const mes = normMes(row[0])
    const nombre = str(row[2])
    if (!nombre) continue

    const periodos: PeriodoDIP[] = []
    // DIP 1: cols G(6), H(7), I(8)
    // DIP 2: cols J(9), K(10), L(11)
    // DIP 3: cols M(12), N(13), O(14)
    // DIP 4: cols P(15), Q(16), R(17)
    const periodCols = [
      [6, 7, 8],
      [9, 10, 11],
      [12, 13, 14],
      [15, 16, 17],
    ]

    for (const [instCol, retCol, diasCol] of periodCols) {
      const fi = toDateStr(row[instCol])
      const fr = toDateStr(row[retCol])
      const dias = row[diasCol]
      if (fi || fr || (typeof dias === 'number' && dias > 0)) {
        periodos.push({
          fechaInstalacion: fi,
          fechaRetiro: fr,
          numDias: typeof dias === 'number' && dias > 0 ? dias : null,
        })
      }
    }

    // If no periods parsed but there's days in col I, create one period
    if (periodos.length === 0) {
      const fi = toDateStr(row[6])
      const fr = toDateStr(row[7])
      periodos.push({ fechaInstalacion: fi, fechaRetiro: fr, numDias: null })
    }

    const totalDias = typeof row[18] === 'number' ? row[18] : periodos.reduce((s, p) => s + (p.numDias || 0), 0)

    data.push({
      id: crypto.randomUUID(),
      mes,
      anio,
      servicio: str(row[1]),
      nombre,
      rut: str(row[3]),
      edad: str(row[4]),
      tipoDIP: str(row[5]),
      periodos,
      totalDias,
      revisionFC: str(row[19]),
      createdAt: new Date().toISOString(),
    })
  }
  return { data, anio }
}

function parseArepi(ws: XLSX.WorkSheet): { data: (AgenteRiesgoEpidemico & { id: string })[]; anio: number } {
  const anio = inferAnio(ws)
  const rows = getRows(ws, 3)
  const data: (AgenteRiesgoEpidemico & { id: string })[] = []

  for (const row of rows) {
    const nombre = str(row[2])
    if (!nombre) continue

    data.push({
      id: crypto.randomUUID(),
      fechaVE: toDateStr(row[0]),
      anio,
      servicioClinico: str(row[1]),
      nombre,
      edad: str(row[3]),
      rut: str(row[4]),
      tipoVigilancia: str(row[5]),
      criteriosEpidemiologicos: str(row[6]),
      createdAt: new Date().toISOString(),
    })
  }
  return { data, anio }
}

function parseRegistroIAAS(ws: XLSX.WorkSheet): { data: (RegistroIAAS & { id: string })[]; anio: number } {
  const anio = inferAnio(ws)
  const rows = getRows(ws, 1) // row 0=headers
  const data: (RegistroIAAS & { id: string })[] = []

  for (const row of rows) {
    const nombre = str(row[2])
    if (!nombre) continue

    data.push({
      id: crypto.randomUUID(),
      numero: typeof row[0] === 'number' ? row[0] : data.length + 1,
      mes: normMes(row[1]),
      anio,
      nombre,
      rut: str(row[3]),
      sexo: str(row[4]),
      fechaIngreso: toDateStr(row[5]),
      fechaInstalacion: toDateStr(row[6]),
      fechaDiagCx: toDateStr(row[7]),
      diasInvasivo: typeof row[8] === 'number' ? row[8] : null,
      iaas: str(row[9]),
      fallecido: str(row[10]),
      fechaCultivo: toDateStr(row[11]),
      agente: str(row[12]),
      diagnostico: str(row[13]),
      indicacionInstalacion: str(row[14]),
      indicacionRetiro: str(row[15]),
      responsable: str(row[16]),
      observaciones: str(row[17]),
      createdAt: new Date().toISOString(),
    })
  }
  return { data, anio }
}

// Sheet name matching (flexible)
function findSheet(wb: XLSX.WorkBook, keywords: string[]): XLSX.WorkSheet | null {
  for (const name of wb.SheetNames) {
    const lower = name.toLowerCase()
    if (keywords.some((k) => lower.includes(k))) return wb.Sheets[name]
  }
  return null
}

export function parseExcelFile(buffer: ArrayBuffer): ImportResult {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true })

  const cxSheet = findSheet(wb, ['cirugia', 'trazadora'])
  const partosSheet = findSheet(wb, ['parto', 'cesárea', 'cesarea', 'endometritis'])
  const dipSheet = findSheet(wb, ['dip', 'dispositivo'])
  const arepiSheet = findSheet(wb, ['arepi', 'agente'])
  const iaasSheet = findSheet(wb, ['iaas'])

  const cx = cxSheet ? parseCirugias(cxSheet) : { data: [], anio: new Date().getFullYear() }
  const partos = partosSheet ? parsePartos(partosSheet) : { data: [], anio: cx.anio }
  const dip = dipSheet ? parseDIP(dipSheet) : { data: [], anio: cx.anio }
  const arepi = arepiSheet ? parseArepi(arepiSheet) : { data: [], anio: cx.anio }
  const iaas = iaasSheet ? parseRegistroIAAS(iaasSheet) : { data: [], anio: cx.anio }

  const anio = cx.anio || partos.anio || dip.anio || new Date().getFullYear()

  return {
    cirugias: cx.data,
    partos: partos.data,
    dip: dip.data,
    arepi: arepi.data,
    registroIaas: iaas.data,
    anio,
  }
}
