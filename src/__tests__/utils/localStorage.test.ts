import { describe, it, expect, beforeEach } from 'vitest'
import { getLocalKey, loadLocal, saveLocal } from '@/utils/localStorage'

describe('localStorage utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getLocalKey', () => {
    it('generates key with year', () => {
      expect(getLocalKey('cirugias', 2026)).toBe('iaas_cirugias_2026')
    })

    it('generates key without year', () => {
      expect(getLocalKey('users')).toBe('iaas_users')
    })

    it('generates key with undefined year', () => {
      expect(getLocalKey('arepi', undefined)).toBe('iaas_arepi')
    })
  })

  describe('loadLocal', () => {
    it('returns empty array when key does not exist', () => {
      expect(loadLocal('nonexistent')).toEqual([])
    })

    it('returns parsed data when key exists', () => {
      const data = [{ id: '1', name: 'test' }]
      localStorage.setItem('test_key', JSON.stringify(data))
      expect(loadLocal('test_key')).toEqual(data)
    })

    it('returns empty array on invalid JSON', () => {
      localStorage.setItem('bad_key', 'not valid json{{{')
      expect(loadLocal('bad_key')).toEqual([])
    })

    it('returns empty array for empty string', () => {
      localStorage.setItem('empty', '')
      expect(loadLocal('empty')).toEqual([])
    })
  })

  describe('saveLocal', () => {
    it('saves data to localStorage', () => {
      const data = [{ id: '1', name: 'test' }]
      saveLocal('save_key', data)
      expect(JSON.parse(localStorage.getItem('save_key')!)).toEqual(data)
    })

    it('overwrites existing data', () => {
      saveLocal('overwrite', [{ id: '1' }])
      saveLocal('overwrite', [{ id: '2' }])
      expect(JSON.parse(localStorage.getItem('overwrite')!)).toEqual([{ id: '2' }])
    })

    it('saves empty array', () => {
      saveLocal('empty_arr', [])
      expect(JSON.parse(localStorage.getItem('empty_arr')!)).toEqual([])
    })
  })

  describe('roundtrip', () => {
    it('save then load returns same data', () => {
      const key = getLocalKey('dip', 2025)
      const data = [
        { id: 'a', nombre: 'Juan', rut: '12.345.678-5' },
        { id: 'b', nombre: 'María', rut: '11.111.111-1' },
      ]
      saveLocal(key, data)
      expect(loadLocal(key)).toEqual(data)
    })
  })
})
