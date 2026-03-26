export function calcTasaPor1000(infecciones: number, diasExposicion: number): number {
  if (diasExposicion === 0) return 0
  return (infecciones / diasExposicion) * 1000
}

export function calcTasaPorcentaje(infecciones: number, procedimientos: number): number {
  if (procedimientos === 0) return 0
  return (infecciones / procedimientos) * 100
}

export function getRateColor(tasa: number, irm: number): string {
  if (tasa === 0) return 'text-gray-500'
  if (tasa <= irm) return 'text-green-600'
  if (tasa <= irm * 1.5) return 'text-yellow-600'
  return 'text-red-600'
}

export function getRateBgColor(tasa: number, irm: number): string {
  if (tasa === 0) return 'bg-gray-50'
  if (tasa <= irm) return 'bg-green-50'
  if (tasa <= irm * 1.5) return 'bg-yellow-50'
  return 'bg-red-50'
}
