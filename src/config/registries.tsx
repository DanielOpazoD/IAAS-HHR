import { ReactNode } from 'react'
import { formatDateDisplay } from '@/utils/dates'
import Badge from '@/components/ui/Badge'
import type {
  BaseRecord,
  CirugiaTrazadora,
  PartoCesarea,
  DispositivoInvasivo,
  AgenteRiesgoEpidemico,
  RegistroIAAS,
} from '@/types'

// ── Column definition ──

export interface ColumnDef<T> {
  key: string
  label: string
  render?: (item: T) => ReactNode
  className?: string
}

// ── Form component props (shared contract) ──

export interface FormComponentProps<T> {
  initial?: T
  anio: number
  onSubmit: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
  nextNumero?: number
  loading?: boolean
  onFormChange?: (values: { rut?: string; mes?: string }) => void
}

// ── Registry configuration ──

export interface FilterDef {
  key: string
  label: string
  options: readonly string[]
}

export interface RegistryConfig<T extends BaseRecord> {
  collectionName: string
  title: string
  subtitle: (anio: number) => string
  entityName: { singular: string; plural: string }
  columns: ColumnDef<T & { id: string }>[]
  FormComponent: React.ComponentType<FormComponentProps<T>>
  exportFn: (data: (T & { id: string })[], anio: number) => void
  wideModal?: boolean
  hasMonthFilter?: boolean
  filterKey?: string
  /** Additional filter (e.g. surgery type) */
  secondaryFilter?: FilterDef
  getNextNumero?: (data: (T & { id: string })[]) => number
}

// ── Cirugías Trazadoras ──

import CirugiaForm from '@/components/forms/CirugiaForm'
import { exportCirugias } from '@/services/excel/cirugiasExport'
import { TIPOS_CIRUGIA } from '@/utils/constants'

export const cirugiaConfig: RegistryConfig<CirugiaTrazadora> = {
  collectionName: 'cirugias',
  title: 'Cirugías Trazadoras',
  subtitle: (anio) => `Fuente: Drive pabellón / Vigilancia epidemiológica - ${anio}`,
  entityName: { singular: 'Cirugía', plural: 'cirugías' },
  hasMonthFilter: true,
  filterKey: 'mes',
  secondaryFilter: { key: 'tipoCirugia', label: 'Tipo de cirugía', options: TIPOS_CIRUGIA },
  FormComponent: CirugiaForm,
  exportFn: exportCirugias,
  columns: [
    { key: 'mes', label: 'Mes', className: 'w-20' },
    { key: 'nombre', label: 'Paciente' },
    { key: 'rut', label: 'RUT', className: 'w-28' },
    { key: 'fechaCirugia', label: 'Fecha Cx', render: (r) => formatDateDisplay(r.fechaCirugia), className: 'w-24' },
    { key: 'tipoCirugia', label: 'Tipo Cirugía' },
    { key: 'fechaPrimerControl', label: '1er Control', render: (r) => formatDateDisplay(r.fechaPrimerControl), className: 'w-24' },
    { key: 'iho', label: 'IHO', className: 'w-14', render: (r) => <Badge value={r.iho} /> },
    { key: 'observaciones', label: 'Obs.', className: 'max-w-[200px] truncate' },
  ],
}

// ── Partos / Cesárea ──

import PartoForm from '@/components/forms/PartoForm'
import { exportPartos } from '@/services/excel/partosExport'

export const partoConfig: RegistryConfig<PartoCesarea> = {
  collectionName: 'partos',
  title: 'Endometritis Puerperal',
  subtitle: (anio) => `Partos / Cesárea - ${anio}`,
  entityName: { singular: 'Parto/Cesárea', plural: 'partos' },
  hasMonthFilter: true,
  filterKey: 'mes',
  FormComponent: PartoForm,
  exportFn: exportPartos,
  columns: [
    { key: 'mes', label: 'Mes', className: 'w-20' },
    { key: 'nombre', label: 'Paciente' },
    { key: 'rut', label: 'RUT', className: 'w-28' },
    { key: 'fechaParto', label: 'Fecha', render: (r) => formatDateDisplay(r.fechaParto), className: 'w-24' },
    { key: 'tipo', label: 'Tipo', className: 'w-28' },
    { key: 'conTP', label: 'TP', className: 'w-16' },
    { key: 'controlPostParto', label: 'Control Post Parto', className: 'max-w-[200px] truncate' },
    { key: 'signosSintomasIAAS', label: 'IAAS', className: 'w-14', render: (r) => <Badge value={r.signosSintomasIAAS} /> },
  ],
}

// ── DIP ──

import DipForm from '@/components/forms/DipForm'
import { exportDip } from '@/services/excel/dipExport'

export const dipConfig: RegistryConfig<DispositivoInvasivo> = {
  collectionName: 'dip',
  title: 'Dispositivos Invasivos Permanentes (DIP)',
  subtitle: (anio) => `${anio}`,
  entityName: { singular: 'DIP', plural: 'dispositivos' },
  hasMonthFilter: true,
  filterKey: 'mes',
  wideModal: true,
  FormComponent: DipForm,
  exportFn: exportDip,
  columns: [
    { key: 'mes', label: 'Mes', className: 'w-20' },
    { key: 'servicio', label: 'Servicio', className: 'w-20' },
    { key: 'nombre', label: 'Paciente' },
    { key: 'rut', label: 'RUT', className: 'w-28' },
    { key: 'edad', label: 'Edad', className: 'w-14' },
    { key: 'tipoDIP', label: 'DIP', className: 'w-14' },
    { key: 'periodo1', label: 'Instalación', render: (r) => r.periodos?.[0] ? formatDateDisplay(r.periodos[0].fechaInstalacion) : '', className: 'w-24' },
    { key: 'periodo1r', label: 'Retiro', render: (r) => r.periodos?.[0] ? formatDateDisplay(r.periodos[0].fechaRetiro) : '', className: 'w-24' },
    { key: 'totalDias', label: 'Total Días', className: 'w-20' },
    { key: 'revisionFC', label: 'Revisión FC', className: 'max-w-[200px] truncate' },
  ],
}

// ── AREpi ──

import ArepiForm from '@/components/forms/ArepiForm'
import { exportArepi } from '@/services/excel/arepiExport'

export const arepiConfig: RegistryConfig<AgenteRiesgoEpidemico> = {
  collectionName: 'arepi',
  title: 'Agentes de Riesgo Epidémico (AREpi)',
  subtitle: (anio) => `Solicitud y resultados de exámenes, ficha clínica - ${anio}`,
  entityName: { singular: 'AREpi', plural: 'agentes' },
  hasMonthFilter: false,
  FormComponent: ArepiForm,
  exportFn: exportArepi,
  columns: [
    { key: 'fechaVE', label: 'Fecha VE', render: (r) => formatDateDisplay(r.fechaVE), className: 'w-24' },
    { key: 'servicioClinico', label: 'Servicio', className: 'w-24' },
    { key: 'nombre', label: 'Paciente' },
    { key: 'edad', label: 'Edad', className: 'w-14' },
    { key: 'rut', label: 'RUT', className: 'w-28' },
    { key: 'tipoVigilancia', label: 'Tipo Vigilancia' },
    { key: 'criteriosEpidemiologicos', label: 'Criterios', className: 'max-w-[250px] truncate' },
  ],
}

// ── Registro IAAS ──

import RegistroIaasForm from '@/components/forms/RegistroIaasForm'
import { exportRegistroIaas } from '@/services/excel/registroExport'

export const registroIaasConfig: RegistryConfig<RegistroIAAS> = {
  collectionName: 'registroIaas',
  title: 'Registro IAAS',
  subtitle: (anio) => `${anio}`,
  entityName: { singular: 'Registro IAAS', plural: 'infecciones' },
  hasMonthFilter: true,
  filterKey: 'mes',
  wideModal: true,
  FormComponent: RegistroIaasForm,
  exportFn: exportRegistroIaas,
  getNextNumero: (data) => data.length > 0 ? Math.max(...data.map((d) => d.numero || 0)) + 1 : 1,
  columns: [
    { key: 'numero', label: 'N°', className: 'w-12' },
    { key: 'mes', label: 'Mes', className: 'w-20' },
    { key: 'nombre', label: 'Paciente' },
    { key: 'rut', label: 'RUT', className: 'w-28' },
    { key: 'sexo', label: 'Sexo', className: 'w-12' },
    { key: 'fechaDiagCx', label: 'Fecha DG/CX', render: (r) => formatDateDisplay(r.fechaDiagCx), className: 'w-24' },
    { key: 'iaas', label: 'IAAS', className: 'w-20' },
    { key: 'agente', label: 'Agente' },
    { key: 'diagnostico', label: 'Diagnóstico' },
    { key: 'fallecido', label: 'Fall.', className: 'w-14', render: (r) => <Badge value={r.fallecido} positiveColor="gray" /> },
  ],
}
