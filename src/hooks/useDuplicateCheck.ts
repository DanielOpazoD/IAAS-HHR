/**
 * Checks for duplicate records based on rut + mes.
 * Returns a warning message if a duplicate is found, empty string otherwise.
 */
export function useDuplicateCheck(
  data: Array<Record<string, unknown>>,
  formValues: { rut?: string; mes?: string },
  editingId?: string
): string {
  if (!formValues.rut || !formValues.mes) return ''

  const duplicate = data.find((item) => {
    if (editingId && (item as { id?: string }).id === editingId) return false
    return item.rut === formValues.rut && item.mes === formValues.mes
  })

  if (duplicate) {
    const nombre = (duplicate.nombre as string) || 'desconocido'
    return `Ya existe un registro para este RUT en el mismo mes (${nombre}). Puede guardar de todas formas si es intencional.`
  }

  return ''
}
