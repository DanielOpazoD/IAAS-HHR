import { APP_CONFIG } from '@/utils/constants'
import { useState, useEffect } from 'react'
import { hashPin } from '../utils/crypto'

const APP_VERSION = '2.2.0'
const PIN_STORAGE_KEY = 'iaas_lock_pin'
const LOCK_ENABLED_KEY = 'iaas_lock_enabled'

export default function ConfiguracionPage() {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [lockEnabled, setLockEnabled] = useState(false)
  const [hasExistingPin, setHasExistingPin] = useState(false)
  const [pinMessage, setPinMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(PIN_STORAGE_KEY)
    const enabled = localStorage.getItem(LOCK_ENABLED_KEY) === 'true'
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: reads localStorage once on mount
    setHasExistingPin(!!stored)
    setLockEnabled(enabled)
  }, [])

  const handleSavePin = async () => {
    setPinMessage(null)
    if (pin.length < 4) {
      setPinMessage({ type: 'error', text: 'El PIN debe tener al menos 4 digitos' })
      return
    }
    if (!/^\d+$/.test(pin)) {
      setPinMessage({ type: 'error', text: 'El PIN solo debe contener numeros' })
      return
    }
    if (pin !== confirmPin) {
      setPinMessage({ type: 'error', text: 'Los PIN no coinciden' })
      return
    }
    const hashed = await hashPin(pin)
    localStorage.setItem(PIN_STORAGE_KEY, hashed)
    localStorage.setItem(LOCK_ENABLED_KEY, 'true')
    setLockEnabled(true)
    setHasExistingPin(true)
    setPin('')
    setConfirmPin('')
    setPinMessage({ type: 'success', text: 'PIN guardado correctamente' })
  }

  const handleRemovePin = () => {
    localStorage.removeItem(PIN_STORAGE_KEY)
    localStorage.setItem(LOCK_ENABLED_KEY, 'false')
    setLockEnabled(false)
    setHasExistingPin(false)
    setPin('')
    setConfirmPin('')
    setPinMessage({ type: 'success', text: 'Bloqueo de pantalla desactivado' })
  }

  const handleToggleLock = (enabled: boolean) => {
    if (enabled && !hasExistingPin) {
      setPinMessage({ type: 'error', text: 'Primero debes configurar un PIN' })
      return
    }
    localStorage.setItem(LOCK_ENABLED_KEY, String(enabled))
    setLockEnabled(enabled)
    setPinMessage({ type: 'success', text: enabled ? 'Bloqueo activado' : 'Bloqueo desactivado' })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configuracion</h2>
        <p className="text-sm text-gray-400 mt-0.5">Ajustes generales de la aplicacion</p>
      </div>

      {/* Version info */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Informacion del programa
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Aplicacion</span>
            <span className="text-sm font-semibold text-gray-900">IAAS - {APP_CONFIG.hospitalName}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Version</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-lg">
              v{APP_VERSION}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Modulo</span>
            <span className="text-sm text-gray-700">Vigilancia Epidemiologica IAAS</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-500">Tecnologia</span>
            <span className="text-sm text-gray-700">React + Firebase</span>
          </div>
        </div>
      </section>

      {/* Screen lock with PIN */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Bloqueo de pantalla
        </h3>

        {/* Toggle */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-700">Activar bloqueo con PIN</p>
            <p className="text-xs text-gray-400 mt-0.5">Requiere PIN para desbloquear la aplicacion</p>
          </div>
          <button
            onClick={() => handleToggleLock(!lockEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${lockEnabled ? 'bg-primary-600' : 'bg-gray-200'}`}
            role="switch"
            aria-checked={lockEnabled}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${lockEnabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        {/* PIN form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {hasExistingPin ? 'Nuevo PIN' : 'Crear PIN'}
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              placeholder="Minimo 4 digitos"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent tracking-[0.3em] text-center font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              placeholder="Repetir PIN"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent tracking-[0.3em] text-center font-mono"
            />
          </div>

          {pinMessage && (
            <div className={`text-sm px-3 py-2 rounded-lg ${pinMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {pinMessage.text}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSavePin}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
            >
              {hasExistingPin ? 'Cambiar PIN' : 'Guardar PIN'}
            </button>
            {hasExistingPin && (
              <button
                onClick={handleRemovePin}
                className="px-5 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
              >
                Eliminar PIN
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
