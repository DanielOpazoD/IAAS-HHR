import { Timestamp } from 'firebase/firestore'

/** Base fields shared by all records (audit trail) */
export interface BaseRecord {
  id?: string
  createdAt?: Timestamp | string
  updatedAt?: Timestamp | string
  createdBy?: string
  updatedBy?: string
}

/** Cirugías Trazadoras - Tracer surgery tracking */
export interface CirugiaTrazadora extends BaseRecord {
  mes: string
  anio: number
  nombre: string
  rut: string
  fechaCirugia: string
  tipoCirugia: string
  fechaPrimerControl: string
  observaciones: string
  iho: string
  fechaSegundoControl: string
  observaciones2: string
}

/** Partos/Cesárea - Puerperal endometritis tracking */
export interface PartoCesarea extends BaseRecord {
  mes: string
  anio: number
  nombre: string
  rut: string
  fechaParto: string
  tipo: string
  conTP: string
  fechaPrimerControl: string
  controlPostParto: string
  signosSintomasIAAS: string
  dias30: string
  observaciones: string
}

/** Single installation/removal period for an invasive device */
export interface PeriodoDIP {
  fechaInstalacion: string
  fechaRetiro: string
  numDias: number | null
}

/** DIP - Permanent Invasive Devices (CVC, CUP, VMI) */
export interface DispositivoInvasivo extends BaseRecord {
  mes: string
  anio: number
  servicio: string
  nombre: string
  rut: string
  edad: string
  tipoDIP: string
  periodos: PeriodoDIP[]
  totalDias: number
  revisionFC: string
}

/** AREpi - Epidemic Risk Agents */
export interface AgenteRiesgoEpidemico extends BaseRecord {
  fechaVE: string
  anio: number
  servicioClinico: string
  nombre: string
  edad: string
  rut: string
  tipoVigilancia: string
  criteriosEpidemiologicos: string
}

/** Master IAAS infection registry */
export interface RegistroIAAS extends BaseRecord {
  numero: number
  mes: string
  anio: number
  nombre: string
  rut: string
  sexo: string
  fechaIngreso: string
  fechaInstalacion: string
  fechaDiagCx: string
  diasInvasivo: number | null
  iaas: string
  fallecido: string
  fechaCultivo: string
  agente: string
  diagnostico: string
  indicacionInstalacion: string
  indicacionRetiro: string
  responsable: string
  observaciones: string
}

/** Variable indicator data (DIP / AREpi) */
export interface IndicadorVariable {
  infecciones: number
  pacientes: number
  diasExposicion: number
  tasa: number
}

/** Surgery/birth indicator data */
export interface IndicadorCxPartos {
  infecciones: number
  procedimientosVigilados: number
  procedimientos: number
  tasa: number
}

/** Consolidation data by cuatrimestre */
export interface DatosConsolidacion extends BaseRecord {
  anio: number
  cuatrimestre: number
  dipData: Record<string, Record<string, IndicadorVariable>>
  arepiData: Record<string, Record<string, IndicadorVariable>>
  cxPartosData: Record<string, Record<string, IndicadorCxPartos>>
}
