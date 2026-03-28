/** Central configuration for the application. Change here to update everywhere. */
export const APP_CONFIG = {
  hospitalName: 'Hospital Hanga Roa',
  location: 'Rapa Nui - Chile',
  systemName: 'Vigilancia IAAS',
  version: 'v2.2.0',
} as const

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril',
  'Mayo', 'Junio', 'Julio', 'Agosto',
  'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
] as const

export const MESES_CORTOS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
] as const

export const CUATRIMESTRES: Record<number, number[]> = {
  1: [0, 1, 2, 3],
  2: [4, 5, 6, 7],
  3: [8, 9, 10, 11],
}

export const MESES_POR_CUATRIMESTRE: Record<number, string[]> = {
  1: ['Enero', 'Febrero', 'Marzo', 'Abril'],
  2: ['Mayo', 'Junio', 'Julio', 'Agosto'],
  3: ['Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
}

export const TIPOS_CIRUGIA = [
  'Colecistectomía Laparoscópica',
  'Colecistectomía Laparotómica',
  'Cesárea',
  'Hernia Inguinal c/s malla',
  'Cataratas c/s LIO',
] as const

export const TIPOS_DIP = ['CVC', 'CUP', 'VMI'] as const

export const SERVICIOS = ['Cirugía', 'Medicina', 'UPC'] as const

export const TIPOS_PARTO = ['Parto vaginal', 'Cesárea'] as const

export const INDICADORES_DIP = [
  { id: 'its_adultos_cvc', nombre: 'ITS en pacientes adultos asociada a CVC', varInfeccion: 'N° ITS', irm: 1.8 },
  { id: 'its_pediatricos_cvc', nombre: 'ITS en pacientes pediátricos asociados a CVC', varInfeccion: 'N° ITS', irm: 2.3 },
  { id: 'its_neonatologicos_cvc', nombre: 'ITS en pacientes neonatológicos con CVC', varInfeccion: 'N° ITS', irm: 2.1 },
  { id: 'its_cateter_umbilical', nombre: 'ITS en pacientes con catéter umbilical', varInfeccion: 'N° ITS', irm: 0.7 },
  { id: 'navm_adultos', nombre: 'NAVM en pacientes adultos', varInfeccion: 'N° NAVM', irm: 5.6 },
  { id: 'navm_pediatricos', nombre: 'NAVM en pacientes pediátricos', varInfeccion: 'N° NAVM', irm: 2.9 },
  { id: 'navm_neonatologicos', nombre: 'NAVM en pacientes neonatológicos', varInfeccion: 'N° NAVM', irm: 6.3 },
] as const

export const INDICADORES_AREPI = [
  { id: 'gi_lactantes', nombre: 'Infecciones gastrointestinales en lactantes', varInfeccion: 'N° inf GI', irm: 0.7 },
  { id: 'resp_lactantes', nombre: 'Infecciones respiratorias virales en lactantes', varInfeccion: 'N° Inf Resp', irm: 1.4 },
  { id: 'sars_pediatricos', nombre: 'IR por SARS-CoV2 en pacientes pediátricos hospitalizados', varInfeccion: 'N° IR SARS-CoV2', irm: 0.2 },
  { id: 'cd_adultos_upc', nombre: 'SDA por C. difficile en pacientes adultos UPC', varInfeccion: 'N° SDA por CD', irm: 0.72 },
  { id: 'cd_adultos_mq', nombre: 'SDA por C. difficile en pacientes adultos MQ', varInfeccion: 'N° SDA por CD', irm: 0.32 },
  { id: 'sars_adultos_no_upc', nombre: 'IR por SARS-CoV2 en pacientes adultos hospitalizados no UPC', varInfeccion: 'N° IR SARS-CoV2', irm: 0.4 },
  { id: 'sars_adultos_upc', nombre: 'IR por SARS-CoV2 en pacientes adultos hospitalizados en UPC', varInfeccion: 'N° IR SARS-CoV2', irm: 0.2 },
] as const

export const INDICADORES_CX_PARTOS = [
  { id: 'iho_cole_laparotomica', nombre: 'IHO Cirugía Colecistectomía Laparotómica', varInfeccion: 'N° de IHO Post cole. Laparotómica', irm: 0.9 },
  { id: 'iho_cole_laparoscopica', nombre: 'IHO Cirugía Colecistectomía Laparoscópica', varInfeccion: 'N° IHO post cole. Laparoscópica', irm: 0.2 },
  { id: 'iho_hernia', nombre: 'IHO Cirugía Hernia Inguinal en adulto c/s malla', varInfeccion: 'N° IHO hernias inguinales adultos', irm: 0.4 },
  { id: 'iho_cesarea', nombre: 'IHO Cirugía de Cesárea C/S TP', varInfeccion: 'N° de IHO Post cesárea c/s TP', irm: 0.8 },
  { id: 'endoftalmitis', nombre: 'Endoftalmitis en cirugía de cataratas C/S LIO', varInfeccion: 'N° de endoftalmitis', irm: 0.08 },
  { id: 'endometritis_pv', nombre: 'Endometritis de Pacientes Post Parto Vaginal', varInfeccion: 'N° de endometritis PV', irm: 0.2 },
  { id: 'endometritis_cesarea', nombre: 'Endometritis en Cesárea sin TP', varInfeccion: 'N° de endometritis cs/stp', irm: 0.1 },
] as const

/**
 * Mapping from CxPartos indicator IDs to their data source configuration.
 * Used by ConsolidacionPage to dynamically calculate rates without hardcoded conditionals.
 */
export type CxPartosSource =
  | { type: 'cirugia'; tipoCirugia: string; ihoField: 'iho' }
  | { type: 'parto'; tipoParto: string; conTP?: string; iaasField: 'signosSintomasIAAS' }

export const CX_PARTOS_SOURCE_MAP: Record<string, CxPartosSource> = {
  iho_cole_laparoscopica: { type: 'cirugia', tipoCirugia: 'Colecistectomía Laparoscópica', ihoField: 'iho' },
  iho_cole_laparotomica: { type: 'cirugia', tipoCirugia: 'Colecistectomía Laparotómica', ihoField: 'iho' },
  iho_hernia: { type: 'cirugia', tipoCirugia: 'Hernia Inguinal c/s malla', ihoField: 'iho' },
  iho_cesarea: { type: 'cirugia', tipoCirugia: 'Cesárea', ihoField: 'iho' },
  endoftalmitis: { type: 'cirugia', tipoCirugia: 'Cataratas c/s LIO', ihoField: 'iho' },
  endometritis_pv: { type: 'parto', tipoParto: 'Parto vaginal', iaasField: 'signosSintomasIAAS' },
  endometritis_cesarea: { type: 'parto', tipoParto: 'Cesárea', conTP: 'Sin TP', iaasField: 'signosSintomasIAAS' },
}
