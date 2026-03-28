/**
 * Formats a raw RUT string into the standard Chilean format XX.XXX.XXX-Y.
 * Accepts digits and the letter K in any format and returns a formatted RUT.
 * @param value - Raw input string (e.g. "12345678k" or "12.345.678-K")
 * @returns Formatted RUT string (e.g. "12.345.678-K")
 */
export function formatRut(value: string): string {
  const clean = value.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length <= 1) return clean
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${formatted}-${dv}`
}

/**
 * Validates a Chilean RUT using the official modulus-11 algorithm.
 * Accepts formatted or unformatted RUTs (dots, dashes and spaces are stripped).
 * @param rut - RUT string in any format (e.g. "12.345.678-K" or "12345678k")
 * @returns `true` if the check digit is correct, `false` otherwise
 */
export function validateRut(rut: string): boolean {
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length < 2) return false
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  let sum = 0
  let mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const expected = 11 - (sum % 11)
  const dvExpected = expected === 11 ? '0' : expected === 10 ? 'K' : String(expected)
  return dv === dvExpected
}

/**
 * Strips all formatting characters from a RUT string, leaving only digits and K.
 * Converts lowercase k to uppercase K.
 * @param rut - RUT string in any format (e.g. "12.345.678-k")
 * @returns Clean RUT string (e.g. "12345678K")
 */
export function cleanRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase()
}
