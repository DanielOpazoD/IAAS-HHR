import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import OnlineStatus from '@/components/ui/OnlineStatus'
import ScrollToTop from '@/components/ui/ScrollToTop'
import { usePageTitle } from '@/hooks/usePageTitle'

interface AppLayoutProps {
  anio: number
  onAnioChange: (anio: number) => void
}

export default function AppLayout({ anio, onAnioChange }: AppLayoutProps) {
  const location = useLocation()
  usePageTitle()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('iaas_sidebar_collapsed') === 'true' } catch { return false }
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile sidebar on navigation
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: close sidebar on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem('iaas_sidebar_collapsed', String(next)) } catch { /* ignore */ }
      return next
    })
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Skip to content link for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Ir al contenido principal
      </a>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: always fixed, never scrolls with page */}
      <div className={`
        fixed inset-y-0 left-0 z-50
        transition-transform duration-200
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Content offset to account for fixed sidebar */}
      <div className={`flex-1 flex flex-col min-w-0 transition-[margin] duration-200 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        <Header
          anio={anio}
          onAnioChange={onAnioChange}
          onMenuToggle={() => setMobileOpen((prev) => !prev)}
        />
        <OnlineStatus />
        <main id="main-content" className="flex-1 p-4 md:p-6 overflow-auto" tabIndex={-1}>
          <div key={location.pathname} className="page-transition">
            <Outlet context={{ anio }} />
          </div>
          <ScrollToTop />
        </main>
      </div>
    </div>
  )
}
