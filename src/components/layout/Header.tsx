import { useAuth } from '../../context/AuthContext'
import { getCurrentYear } from '../../utils/dates'

interface HeaderProps {
  anio: number
  onAnioChange: (anio: number) => void
}

export default function Header({ anio, onAnioChange }: HeaderProps) {
  const { user, signOut } = useAuth()
  const currentYear = getCurrentYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <label className="text-sm text-gray-500">Año:</label>
        <select
          value={anio}
          onChange={(e) => onAnioChange(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <>
            <span className="text-sm text-gray-600">{user.displayName || user.email}</span>
            <button
              onClick={signOut}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-100"
            >
              Salir
            </button>
          </>
        )}
      </div>
    </header>
  )
}
