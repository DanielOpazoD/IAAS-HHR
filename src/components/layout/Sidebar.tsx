import { useState, useRef, useEffect, useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ROLE_PERMISSIONS } from '@/types/roles'

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1', collection: undefined as string | undefined },
  { to: '/cirugias', label: 'Cirugias Trazadoras', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', collection: 'cirugias' as string | undefined },
  { to: '/partos', label: 'Partos / Cesarea', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', collection: 'partos' as string | undefined },
  { to: '/dip', label: 'DIP', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', collection: 'dip' as string | undefined },
  { to: '/arepi', label: 'AREpi', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z', collection: 'arepi' as string | undefined },
  { to: '/registro-iaas', label: 'Registro IAAS', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', collection: 'registroIaas' as string | undefined },
  { to: '/consolidacion', label: 'Consolidacion Tasas', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', collection: 'consolidacion' as string | undefined },
]

const adminMenuItems = [
  { to: '/importar', label: 'Importar Excel', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' },
  { to: '/admin/users', label: 'Usuarios', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { to: '/configuracion', label: 'Configuracion', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

function NavItem({ item, collapsed }: { item: typeof navItems[0]; collapsed: boolean }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 mx-3 px-3 py-2.5 text-sm rounded-xl transition-all ${
          isActive
            ? 'bg-white/15 text-white font-semibold shadow-sm'
            : 'text-primary-200 hover:bg-white/8 hover:text-white'
        } ${collapsed ? 'justify-center' : ''}`
      }
    >
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
      </svg>
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  )
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { role } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const filteredNavItems = useMemo(() => {
    if (!role || role === 'admin') return navItems
    const allowed = ROLE_PERMISSIONS[role].canWrite
    return navItems.filter((item) => !item.collection || (allowed as string[]).includes(item.collection))
  }, [role])

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [menuOpen])

  return (
    <aside data-testid="sidebar" className={`${collapsed ? 'w-[72px]' : 'w-64'} bg-gradient-to-b from-primary-900 to-primary-950 text-white h-screen flex flex-col flex-shrink-0 transition-[width] duration-200 overflow-y-auto`}>
      <div className={`p-5 pb-4 ${collapsed ? 'px-3' : ''}`}>
        <div className="flex items-center gap-3" ref={menuRef}>
          {/* Clickable logo icon with admin menu */}
          <div className="relative">
            <button
              onClick={() => role === 'admin' && setMenuOpen((prev) => !prev)}
              className={`w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0 transition-all ${
                role === 'admin' ? 'hover:bg-white/25 cursor-pointer active:scale-95' : ''
              }`}
              title={role === 'admin' ? 'Menu de administracion' : 'IAAS - Hospital Hanga Roa'}
              aria-haspopup={role === 'admin' ? 'true' : undefined}
              aria-expanded={menuOpen}
            >
              <svg className="w-6 h-6 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div className="absolute top-12 left-0 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in">
                {adminMenuItems.map((item) => (
                  <button
                    key={item.to}
                    onClick={() => {
                      navigate(item.to)
                      setMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-base font-bold tracking-tight truncate">Hospital Hanga Roa</h1>
              <p className="text-primary-300 text-[11px] font-medium">Vigilancia IAAS</p>
            </div>
          )}
        </div>
      </div>

      <div className="mx-5 border-t border-white/10 mb-2"></div>

      <nav className="flex-1 py-1 space-y-0.5">
        {filteredNavItems.map((item) => <NavItem key={item.to} item={item} collapsed={collapsed} />)}
      </nav>

      {/* Collapse toggle */}
      <div className="pb-4 px-3">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-primary-300 hover:text-white hover:bg-white/8 rounded-xl transition-all"
          title={collapsed ? 'Expandir menu' : 'Colapsar menu'}
        >
          <svg className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          {!collapsed && <span>Colapsar</span>}
        </button>
      </div>
    </aside>
  )
}
