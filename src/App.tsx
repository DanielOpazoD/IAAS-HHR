import { useState, lazy, Suspense, ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import { canWriteCollection, isAdminRole } from '@/types/roles'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/components/auth/LoginPage'
import PendingApprovalPage from '@/components/auth/PendingApprovalPage'
import { getCurrentYear } from '@/utils/dates'
import LockScreen from '@/components/ui/LockScreen'
import { initSentry } from '@/config/sentry'

// Initialize Sentry before any React rendering
initSentry()

// Lazy-loaded pages (code-split per route)
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const CirugiasPage = lazy(() => import('@/pages/CirugiasPage'))
const PartosPage = lazy(() => import('@/pages/PartosPage'))
const DipPage = lazy(() => import('@/pages/DipPage'))
const ArepiPage = lazy(() => import('@/pages/ArepiPage'))
const RegistroIaasPage = lazy(() => import('@/pages/RegistroIaasPage'))
const ConsolidacionPage = lazy(() => import('@/pages/ConsolidacionPage'))
const ImportPage = lazy(() => import('@/pages/ImportPage'))
const AdminUsersPage = lazy(() => import('@/pages/AdminUsersPage'))
const ConfiguracionPage = lazy(() => import('@/pages/ConfiguracionPage'))
const DocumentosIaasPage = lazy(() => import('@/pages/DocumentosIaasPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-6 h-6 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-gray-400">Cargando modulo...</p>
      </div>
    </div>
  )
}

function RoleRoute({ collection, adminOnly, children }: { collection?: string; adminOnly?: boolean; children: ReactNode }) {
  const { role } = useAuth()
  if (adminOnly && !isAdminRole(role)) return <Navigate to="/" replace />
  if (collection && role && !isAdminRole(role) && !canWriteCollection(role, collection)) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

function ProtectedApp() {
  const { user, loading, roleLoading, role } = useAuth()
  const [anio, setAnio] = useState(getCurrentYear())

  if (loading || roleLoading) {
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

  if (role === null) return <PendingApprovalPage />

  return (
    <LockScreen>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AppLayout anio={anio} onAnioChange={setAnio} />}>
          <Route index element={<DashboardPage />} />
          <Route path="cirugias" element={<RoleRoute collection="cirugias"><CirugiasPage /></RoleRoute>} />
          <Route path="partos" element={<RoleRoute collection="partos"><PartosPage /></RoleRoute>} />
          <Route path="dip" element={<RoleRoute collection="dip"><DipPage /></RoleRoute>} />
          <Route path="arepi" element={<RoleRoute collection="arepi"><ArepiPage /></RoleRoute>} />
          <Route path="registro-iaas" element={<RoleRoute collection="registroIaas"><RegistroIaasPage /></RoleRoute>} />
          <Route path="consolidacion" element={<RoleRoute collection="consolidacion"><ConsolidacionPage /></RoleRoute>} />
          <Route path="importar" element={<RoleRoute adminOnly><ImportPage /></RoleRoute>} />
          <Route path="admin/users" element={<RoleRoute adminOnly><AdminUsersPage /></RoleRoute>} />
          <Route path="configuracion" element={<RoleRoute adminOnly><ConfiguracionPage /></RoleRoute>} />
          <Route path="documentos" element={<DocumentosIaasPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
    </LockScreen>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <ProtectedApp />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
