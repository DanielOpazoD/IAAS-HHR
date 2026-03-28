import { z } from 'zod'
import { MESES, TIPOS_CIRUGIA, TIPOS_DIP, SERVICIOS, TIPOS_PARTO } from '@/utils/constants'

// --- Shared helpers ---

/** Matches YYYY-MM-DD or empty string */
const datePattern = /^\d{4}-\d{2}-\d{2}$/
const dateOrEmpty = z.string().refine(
  (v) => v === '' || datePattern.test(v),
  { message: 'Debe ser una fecha YYYY-MM-DD o vacío' },
)

const mesSchema = z.enum(MESES).or(z.literal(''))

const siNoEmpty = z.enum(['SI', 'NO', ''])
const sexoSchema = z.enum(['M', 'F', ''])

const nombreSchema = z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(200, 'Nombre no puede exceder 200 caracteres')
const rutSchema = z.string().min(1, 'RUT es requerido')
const anioSchema = z.number().int().nonnegative('Año debe ser no negativo')

// --- Schemas ---

/** Cirugías Trazadoras */
export const cirugiaSchema = z.object({
  mes: mesSchema,
  anio: anioSchema,
  nombre: nombreSchema,
  rut: rutSchema,
  fechaCirugia: dateOrEmpty,
  tipoCirugia: z.enum(TIPOS_CIRUGIA),
  fechaPrimerControl: dateOrEmpty,
  observaciones: z.string(),
  iho: siNoEmpty,
  fechaSegundoControl: dateOrEmpty,
  observaciones2: z.string(),
})

/** Partos/Cesárea */
export const partoSchema = z.object({
  mes: mesSchema,
  anio: anioSchema,
  nombre: nombreSchema,
  rut: rutSchema,
  fechaParto: dateOrEmpty,
  tipo: z.enum(TIPOS_PARTO),
  conTP: z.enum(['Con TP', 'Sin TP', '']),
  fechaPrimerControl: dateOrEmpty,
  controlPostParto: z.string(),
  signosSintomasIAAS: siNoEmpty,
  dias30: z.string(),
  observaciones: z.string(),
})

/** Single DIP period */
const periodoSchema = z.object({
  fechaInstalacion: dateOrEmpty,
  fechaRetiro: dateOrEmpty,
  numDias: z.number().nonnegative().nullable(),
})

/** DIP - Dispositivos Invasivos Permanentes */
export const dipSchema = z.object({
  mes: mesSchema,
  anio: anioSchema,
  servicio: z.enum(SERVICIOS),
  nombre: nombreSchema,
  rut: rutSchema,
  edad: z.string(),
  tipoDIP: z.enum(TIPOS_DIP),
  periodos: z.array(periodoSchema),
  totalDias: z.number().nonnegative('Total días debe ser no negativo'),
  revisionFC: z.string(),
})

/** AREpi - Agentes de Riesgo Epidémico */
export const arepiSchema = z.object({
  fechaVE: dateOrEmpty,
  anio: anioSchema,
  servicioClinico: z.enum(SERVICIOS),
  nombre: nombreSchema,
  edad: z.string(),
  rut: rutSchema,
  tipoVigilancia: z.string(),
  criteriosEpidemiologicos: z.string(),
})

/** Registro IAAS */
export const registroIaasSchema = z.object({
  numero: z.number().int().nonnegative('Número debe ser no negativo'),
  mes: mesSchema,
  anio: anioSchema,
  nombre: nombreSchema,
  rut: rutSchema,
  sexo: sexoSchema,
  fechaIngreso: dateOrEmpty,
  fechaInstalacion: dateOrEmpty,
  fechaDiagCx: dateOrEmpty,
  diasInvasivo: z.number().nonnegative().nullable(),
  iaas: z.string(),
  fallecido: siNoEmpty,
  fechaCultivo: dateOrEmpty,
  agente: z.string(),
  diagnostico: z.string(),
  indicacionInstalacion: z.string(),
  indicacionRetiro: z.string(),
  responsable: z.string(),
  observaciones: z.string(),
})

// --- Validation helper ---

/**
 * Validates unknown data against a Zod schema.
 * Returns a discriminated union with the parsed data or an array of error messages.
 */
export function validateRecord<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const errors = result.error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
    return `${path}${issue.message}`
  })
  return { success: false, errors }
}
