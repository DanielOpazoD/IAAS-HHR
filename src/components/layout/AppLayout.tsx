import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

interface AppLayoutProps {
  anio: number
  onAnioChange: (anio: number) => void
}

export default function AppLayout({ anio, onAnioChange }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('iaas_sidebar_collapsed') === 'true' } catch { return false }
  })

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem('iaas_sidebar_collapsed', String(next)) } catch { /* ignore */ }
      return next
    })
  }

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header anio={anio} onAnioChange={onAnioChange} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet context={{ anio }} />
        </main>
      </div>
    </div>
  )
}
