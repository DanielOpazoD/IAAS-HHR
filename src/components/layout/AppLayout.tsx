import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

interface AppLayoutProps {
  anio: number
  onAnioChange: (anio: number) => void
}

export default function AppLayout({ anio, onAnioChange }: AppLayoutProps) {
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('iaas_sidebar_collapsed') === 'true' } catch { return false }
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem('iaas_sidebar_collapsed', String(next)) } catch { /* ignore */ }
      return next
    })
  }

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: hidden on mobile, slide-in on mobileOpen */}
      <div className={`
        fixed inset-y-0 left-0 z-50 lg:static lg:z-auto
        transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          anio={anio}
          onAnioChange={onAnioChange}
          onMenuToggle={() => setMobileOpen((prev) => !prev)}
        />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet context={{ anio }} />
        </main>
      </div>
    </div>
  )
}
