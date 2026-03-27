/**
 * Shared localStorage helpers for demo mode.
 * Consolidates key generation, load, and save logic
 * previously duplicated in useCollection and ImportPage.
 */

/** Generate a consistent localStorage key for a collection + year */
export function getLocalKey(collectionName: string, anio?: number): string {
  return anio ? `iaas_${collectionName}_${anio}` : `iaas_${collectionName}`
}

/** Load data from localStorage, returning [] on error */
export function loadLocal<T>(key: string): (T & { id: string })[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

/** Save data to localStorage */
export function saveLocal<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}
