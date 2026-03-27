import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/components/auth/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import CirugiasPage from '@/pages/CirugiasPage'
import PartosPage from '@/pages/PartosPage'
import DipPage from '@/pages/DipPage'
import ArepiPage from '@/pages/ArepiPage'
import RegistroIaasPage from '@/pages/RegistroIaasPage'
import ConsolidacionPage from '@/pages/ConsolidacionPage'
import ImportPage from '@/pages/ImportPage'
import { getCurrentYear } from '@/utils/dates'

function ProtectedApp() {
  const { user, loading } = useAuth()
  const [anio, setAnio] = useState(getCurrentYear())

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) return <LoginPage />

  return (
    <Routes>
      <Route element={<AppLayout anio={anio} onAnioChange={setAnio} />}>
        <Route index element={<DashboardPage />} />
        <Route path="cirugias" element={<CirugiasPage />} />
        <Route path="partos" element={<PartosPage />} />
        <Route path="dip" element={<DipPage />} />
        <Route path="arepi" element={<ArepiPage />} />
        <Route path="registro-iaas" element={<RegistroIaasPage />} />
        <Route path="consolidacion" element={<ConsolidacionPage />} />
        <Route path="importar" element={<ImportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ProtectedApp />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
