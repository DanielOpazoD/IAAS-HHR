import { useState, useEffect, useRef, useCallback } from 'react'
import { hashPin } from '../../utils/crypto'

const PIN_STORAGE_KEY = 'iaas_lock_pin'
const LOCK_ENABLED_KEY = 'iaas_lock_enabled'
const LOCK_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes of inactivity

export default function LockScreen({ children }: { children: React.ReactNode }) {
  const [locked, setLocked] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)

  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    const enabled = localStorage.getItem(LOCK_ENABLED_KEY) === 'true'
    const hasPin = !!localStorage.getItem(PIN_STORAGE_KEY)
    if (!enabled || !hasPin) return

    timerRef.current = setTimeout(() => {
      setLocked(true)
      setPin('')
      setError('')
    }, LOCK_TIMEOUT_MS)
  }, [])

  // Set up activity listeners once on mount
  useEffect(() => {
    const EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const

    const onActivity = () => {
      // Only reset timer when not locked
      if (!timerRef.current && localStorage.getItem(LOCK_ENABLED_KEY) !== 'true') return
      startTimer()
    }

    EVENTS.forEach((e) => window.addEventListener(e, onActivity))
    // Start initial inactivity timer (will only lock after LOCK_TIMEOUT_MS)
    startTimer()

    return () => {
      EVENTS.forEach((e) => window.removeEventListener(e, onActivity))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [startTimer])

  // Focus PIN input when locked
  useEffect(() => {
    if (locked && inputRef.current) {
      inputRef.current.focus()
    }
  }, [locked])

  // Focus trap: while locked, Tab always returns focus to the PIN input
  useEffect(() => {
    if (!locked) return
    const trap = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [locked])

  const handleUnlock = async () => {
    const storedHash = localStorage.getItem(PIN_STORAGE_KEY)
    const inputHash = await hashPin(pin)
    if (inputHash === storedHash) {
      setLocked(false)
      setPin('')
      setError('')
      startTimer()
    } else {
      setError('PIN incorrecto')
      setPin('')
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pin.length >= 4) {
      handleUnlock()
    }
  }

  if (!locked) return <>{children}</>

  return (
    <div
      className="fixed inset-0 z-[200] bg-gradient-to-b from-primary-900 to-primary-950 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Pantalla bloqueada — ingresa tu PIN para continuar"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h2 className="text-lg font-bold text-gray-900 mb-1">Pantalla bloqueada</h2>
        <p className="text-sm text-gray-400 mb-6">Ingresa tu PIN para continuar</p>

        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          maxLength={8}
          aria-label="PIN de desbloqueo"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ''))
            setError('')
          }}
          onKeyDown={handleKeyDown}
          placeholder="PIN"
          className="w-full px-4 py-3 text-center text-lg font-mono tracking-[0.5em] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
          autoComplete="off"
        />

        {error && (
          <p className="text-sm text-red-600 mb-4">{error}</p>
        )}

        <button
          onClick={handleUnlock}
          disabled={pin.length < 4}
          className="w-full py-3 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Desbloquear
        </button>

        <p className="text-xs text-gray-300 mt-4">Hospital Hanga Roa - IAAS</p>
      </div>
    </div>
  )
}
