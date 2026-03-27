import { useState, useEffect } from 'react'

/**
 * Shows a small banner when the browser is offline.
 * Hidden when online.
 */
export default function OnlineStatus() {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)

    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  if (online) return null

  return (
    <div className="bg-amber-500 text-white text-sm font-medium px-4 py-2 flex items-center justify-center gap-2 print:hidden">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728M12 12h.01M8.464 8.464a5 5 0 010 7.072M15.536 8.464a5 5 0 000 7.072"
        />
        <line x1="4" y1="4" x2="20" y2="20" strokeWidth={2} strokeLinecap="round" />
      </svg>
      Sin conexión a internet
    </div>
  )
}
