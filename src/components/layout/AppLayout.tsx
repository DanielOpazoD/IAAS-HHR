import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

interface AppLayoutProps {
  anio: number
  onAnioChange: (anio: number) => void
}

export default function AppLayout({ anio, onAnioChange }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header anio={anio} onAnioChange={onAnioChange} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet context={{ anio }} />
        </main>
      </div>
    </div>
  )
}
