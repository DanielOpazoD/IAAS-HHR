import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useHeaderSlot } from '@/context/HeaderSlotContext'
import { getCurrentYear } from '@/utils/dates'
import SyncStatus from '@/components/ui/SyncStatus'
import Icon from '@/components/ui/Icon'

interface HeaderProps {
  anio: number
  onAnioChange: (anio: number) => void
  onMenuToggle?: () => void
}

export default function Header({ anio, onAnioChange, onMenuToggle }: HeaderProps) {
  const { user, signOut } = useAuth()
  const { slot } = useHeaderSlot()
  const currentYear = getCurrentYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const main = document.getElementById('main-content')
    if (!main) return
    const onScroll = () => setScrolled(main.scrollTop > 4)
    main.addEventListener('scroll', onScroll, { passive: true })
    return () => main.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-10 transition-shadow duration-200 ${scrolled ? 'shadow-sm' : ''}`}>
      <div className="flex items-center gap-3">
        {/* Mobile hamburger menu */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg lg:hidden"
            aria-label="Abrir menú"
          >
            <Icon name="menu" className="w-5 h-5" />
          </button>
        )}
        <label htmlFor="header-year-select" className="text-sm text-gray-400 font-medium">Año</label>
        <select
          id="header-year-select"
          value={anio}
          onChange={(e) => onAnioChange(Number(e.target.value))}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {/* Slot: controles extra inyectados por la página activa (ej. selector de mes) */}
        {slot && (
          <>
            <div className="w-px h-5 bg-gray-200" />
            {slot}
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <SyncStatus />
        {user && (
          <>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-600 font-medium">{user.displayName || user.email}</span>
            </div>
            <button
              onClick={signOut}
              className="text-sm text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              title="Cerrar sesión"
            >
              <Icon name="logout" className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </header>
  )
}
