import XLSX from 'xlsx-js-style'
import { MESES, type Mes } from '@/utils/constants'
import { validateRut, formatRut } from '@/utils/rut'
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

// ---------------------------------------------------------------------------
// Sanitization helpers
// ---------------------------------------------------------------------------

/**
 * Returns a trimmed string capped at maxLen characters.
 * Prevents unbounded text from malformed Excel files.
 */
function sanitizeStr(val: CellValue, maxLen = 200): string {
  if (val == null) return ''
  return String(val).trim().slice(0, maxLen)
}

/**
 * Returns val if it exists in the allowed list, otherwise returns ''.
 * Used to enforce enum-like fields (sexo, tipoCirugia, etc.).
 */
function validateEnum(val: string, allowed: readonly string[]): string {
  return allowed.includes(val) ? val : ''
}

/**
 * Clamps a numeric value to [min, max]. Returns null if val is not a number.
 */
function clampNum(val: CellValue, min: number, max: number): number | null {
  if (typeof val !== 'number' || isNaN(val)) return null
  return Math.min(max, Math.max(min, Math.round(val)))
}

/**
 * Validates and formats a RUT. Returns the formatted RUT if valid, '' otherwise.
 */
function sanitizeRut(val: CellValue): string {
  const raw = sanitizeStr(val, 20)
  if (!raw) return ''
  if (!validateRut(raw)) {
    console.warn(`[excelImport] RUT inválido ignorado: ${raw}`)
    return raw // keep the value but warn — don't silently drop patient data
  }
  return formatRut(raw)
}

// ---------------------------------------------------------------------------
// Existing helpers (unchanged)
// ---------------------------------------------------------------------------

/**
 * Converts any Excel cell value to a YYYY-MM-DD string.
 *
 * Handles:
 * - Date objects (from xlsx cellDates:true) — uses LOCAL date methods to avoid
 *   UTC timezone off-by-one errors (e.g. midnight local → previous day in UTC)
 * - Excel serial numbers
 * - String dates in DD/MM/YYYY, DD-MM-YYYY, or YYYY-MM-DD format
 */
function toDateStr(val: CellValue): string {
  if (val == null || val === '') return ''

  // Date object (cellDates: true) — use local time to avoid UTC timezone shift
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return ''
    const y = val.getFullYear()
    const m = String(val.getMonth() + 1).padStart(2, '0')
    const d = String(val.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  // Excel serial date number
  if (typeof val === 'number') {
    if (!isFinite(val)) return ''
    const d = XLSX.SSF.parse_date_code(val)
    if (d && d.y > 1900) return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`
  }

  if (typeof val === 'string') {
    const s = val.trim()
    if (!s) return ''
    // Already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
    // DD/MM/YYYY or D/M/YYYY (common in Chilean Excel files)
    const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (slash) return `${slash[3]}-${String(slash[2]).padStart(2, '0')}-${String(slash[1]).padStart(2, '0')}`
    // DD-MM-YYYY
    const dash = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
    if (dash) return `${dash[3]}-${String(dash[2]).padStart(2, '0')}-${String(dash[1]).padStart(2, '0')}`
    return s
  }

  return ''
}

function normMes(val: CellValue): Mes | '' {
  if (!val) return ''
  const s = String(val).trim()
  return MESES.find((m) => m.toLowerCase() === s.toLowerCase()) ?? (s as Mes)
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

// ---------------------------------------------------------------------------
// Allowed values for enum fields
// ---------------------------------------------------------------------------

const TIPOS_CIRUGIA = [
  'Colecistectomía Laparoscópica',
  'Colecistectomía Laparotómica',
  'Cesárea',
  'Hernia Inguinal c/s malla',
  'Cataratas c/s LIO',
] as const

const TIPOS_PARTO = ['Parto vaginal', 'Cesárea'] as const

const TIPOS_DIP = ['CVC', 'VMI', 'CUP'] as const

const VALORES_SI_NO = ['SI', 'NO', ''] as const

const SEXOS = ['M', 'F', 'Masculino', 'Femenino', ''] as const

// ---------------------------------------------------------------------------
// Normalizers
// ---------------------------------------------------------------------------

function normTipoCirugia(val: string): string {
  const lower = val.toLowerCase()
  if (lower.includes('laparoscópica') || lower.includes('laparoscopica')) return 'Colecistectomía Laparoscópica'
  if (lower.includes('laparotómica') || lower.includes('laparotomica')) return 'Colecistectomía Laparotómica'
  if (lower.includes('cesárea') || lower.includes('cesarea') || lower.includes('césarea')) return 'Cesárea'
  if (lower.includes('hernia')) return 'Hernia Inguinal c/s malla'
  if (lower.includes('catarata')) return 'Cataratas c/s LIO'
  // If still unrecognized, validate against whitelist
  return validateEnum(val, TIPOS_CIRUGIA) || val
}

function normTipoParto(val: string): string {
  const lower = val.toLowerCase()
  if (lower.includes('vaginal')) return 'Parto vaginal'
  if (lower.includes('cesárea') || lower.includes('cesarea') || lower.includes('césarea')) return 'Cesárea'
  return validateEnum(val, TIPOS_PARTO) || val
}

// ---------------------------------------------------------------------------
// Parsers — each wrapped in try-catch so one bad sheet can't block the rest
// ---------------------------------------------------------------------------

function parseCirugias(ws: XLSX.WorkSheet): { data: (CirugiaTrazadora & { id: string })[]; anio: number } {
  try {
    const anio = inferAnio(ws)
    const rows = getRows(ws, 2)
    const data: (CirugiaTrazadora & { id: string })[] = []

    for (const row of rows) {
      const nombre = sanitizeStr(row[1])
      if (!nombre) continue

      data.push({
        id: crypto.randomUUID(),
        mes: normMes(row[0]) as Mes,
        anio,
        nombre,
        rut: sanitizeRut(row[2]),
        fechaCirugia: toDateStr(row[3]),
        tipoCirugia: normTipoCirugia(sanitizeStr(row[4])),
        fechaPrimerControl: toDateStr(row[5]),
        observaciones: sanitizeStr(row[6], 500),
        iho: validateEnum(sanitizeStr(row[7]).toUpperCase(), VALORES_SI_NO) || '',
        fechaSegundoControl: toDateStr(row[8]),
        observaciones2: sanitizeStr(row[9], 500),
        createdAt: new Date().toISOString(),
      })
    }
    return { data, anio }
  } catch (err) {
    console.warn('[excelImport] Error al parsear hoja Cirugías:', err)
    return { data: [], anio: new Date().getFullYear() }
  }
}

function parsePartos(ws: XLSX.WorkSheet): { data: (PartoCesarea & { id: string })[]; anio: number } {
  try {
    const anio = inferAnio(ws)
    const rows = getRows(ws, 3)
    const data: (PartoCesarea & { id: string })[] = []

    for (const row of rows) {
      const nombre = sanitizeStr(row[1])
      if (!nombre) continue

      data.push({
        id: crypto.randomUUID(),
        mes: normMes(row[0]) as Mes,
        anio,
        nombre,
        rut: sanitizeRut(row[2]),
        fechaParto: toDateStr(row[3]),
        tipo: normTipoParto(sanitizeStr(row[4])),
        conTP: sanitizeStr(row[5], 50),
        fechaPrimerControl: toDateStr(row[6]),
        controlPostParto: sanitizeStr(row[7], 500),
        signosSintomasIAAS: sanitizeStr(row[8], 500),
        dias30: sanitizeStr(row[9], 50),
        observaciones: sanitizeStr(row[10], 500),
        createdAt: new Date().toISOString(),
      })
    }
    return { data, anio }
  } catch (err) {
    console.warn('[excelImport] Error al parsear hoja Partos:', err)
    return { data: [], anio: new Date().getFullYear() }
  }
}

function parseDIP(ws: XLSX.WorkSheet): { data: (DispositivoInvasivo & { id: string })[]; anio: number } {
  try {
    const anio = inferAnio(ws)
    const rows = getRows(ws, 3)
    const data: (DispositivoInvasivo & { id: string })[] = []

    for (const row of rows) {
      const nombre = sanitizeStr(row[2])
      if (!nombre) continue

      const periodos: PeriodoDIP[] = []
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
            numDias: clampNum(dias, 0, 3650),
          })
        }
      }

      if (periodos.length === 0) {
        periodos.push({ fechaInstalacion: toDateStr(row[6]), fechaRetiro: toDateStr(row[7]), numDias: null })
      }

      const rawTotalDias = typeof row[18] === 'number' ? row[18] : periodos.reduce((s, p) => s + (p.numDias || 0), 0)
      const totalDias = clampNum(rawTotalDias, 0, 3650) ?? 0

      data.push({
        id: crypto.randomUUID(),
        mes: normMes(row[0]) as Mes,
        anio,
        servicio: sanitizeStr(row[1], 100),
        nombre,
        rut: sanitizeRut(row[3]),
        edad: sanitizeStr(row[4], 10),
        tipoDIP: validateEnum(sanitizeStr(row[5]), TIPOS_DIP) || sanitizeStr(row[5], 10),
        periodos,
        totalDias,
        revisionFC: sanitizeStr(row[19], 500),
        createdAt: new Date().toISOString(),
      })
    }
    return { data, anio }
  } catch (err) {
    console.warn('[excelImport] Error al parsear hoja DIP:', err)
    return { data: [], anio: new Date().getFullYear() }
  }
}

function parseArepi(ws: XLSX.WorkSheet): { data: (AgenteRiesgoEpidemico & { id: string })[]; anio: number } {
  try {
    const anio = inferAnio(ws)
    const rows = getRows(ws, 3)
    const data: (AgenteRiesgoEpidemico & { id: string })[] = []

    for (const row of rows) {
      const nombre = sanitizeStr(row[2])
      if (!nombre) continue

      data.push({
        id: crypto.randomUUID(),
        fechaVE: toDateStr(row[0]),
        anio,
        servicioClinico: sanitizeStr(row[1], 100),
        nombre,
        edad: sanitizeStr(row[3], 10),
        rut: sanitizeRut(row[4]),
        tipoVigilancia: sanitizeStr(row[5], 100),
        criteriosEpidemiologicos: sanitizeStr(row[6], 500),
        createdAt: new Date().toISOString(),
      })
    }
    return { data, anio }
  } catch (err) {
    console.warn('[excelImport] Error al parsear hoja AREpi:', err)
    return { data: [], anio: new Date().getFullYear() }
  }
}

function parseRegistroIAAS(ws: XLSX.WorkSheet): { data: (RegistroIAAS & { id: string })[]; anio: number } {
  try {
    const anio = inferAnio(ws)
    const rows = getRows(ws, 1)
    const data: (RegistroIAAS & { id: string })[] = []

    for (const row of rows) {
      const nombre = sanitizeStr(row[2])
      if (!nombre) continue

      data.push({
        id: crypto.randomUUID(),
        numero: clampNum(row[0], 1, 9999) ?? data.length + 1,
        mes: normMes(row[1]) as Mes,
        anio,
        nombre,
        rut: sanitizeRut(row[3]),
        sexo: validateEnum(sanitizeStr(row[4], 10), SEXOS) || sanitizeStr(row[4], 10),
        fechaIngreso: toDateStr(row[5]),
        fechaInstalacion: toDateStr(row[6]),
        fechaDiagCx: toDateStr(row[7]),
        diasInvasivo: clampNum(row[8], 0, 365),
        iaas: sanitizeStr(row[9], 200),
        fallecido: validateEnum(sanitizeStr(row[10]).toUpperCase(), VALORES_SI_NO) || sanitizeStr(row[10], 10),
        fechaCultivo: toDateStr(row[11]),
        agente: sanitizeStr(row[12], 200),
        diagnostico: sanitizeStr(row[13], 500),
        indicacionInstalacion: sanitizeStr(row[14], 500),
        indicacionRetiro: sanitizeStr(row[15], 500),
        responsable: sanitizeStr(row[16], 200),
        observaciones: sanitizeStr(row[17], 500),
        createdAt: new Date().toISOString(),
      })
    }
    return { data, anio }
  } catch (err) {
    console.warn('[excelImport] Error al parsear hoja Registro IAAS:', err)
    return { data: [], anio: new Date().getFullYear() }
  }
}

// ---------------------------------------------------------------------------
// Sheet finder & public entry point
// ---------------------------------------------------------------------------

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
