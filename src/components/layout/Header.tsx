import { useAuth } from '@/context/AuthContext'
import { getCurrentYear } from '@/utils/dates'

interface HeaderProps {
  anio: number
  onAnioChange: (anio: number) => void
}

export default function Header({ anio, onAnioChange }: HeaderProps) {
  const { user, signOut } = useAuth()
  const currentYear = getCurrentYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-400 font-medium">Año</label>
        <select
          value={anio}
          onChange={(e) => onAnioChange(Number(e.target.value))}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        {user && (
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </>
        )}
      </div>
    </header>
  )
}
