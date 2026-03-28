import { APP_CONFIG } from '@/utils/constants'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Vigilancia Epidemiológica',
  '/cirugias': 'Cirugías Trazadoras',
  '/partos': 'Partos / Cesárea',
  '/dip': 'DIP',
  '/arepi': 'AREpi',
  '/registro-iaas': 'Registro IAAS',
  '/consolidacion': 'Consolidación de Tasas',
  '/documentos': 'Documentos IAAS',
  '/importar': 'Importar Excel',
  '/admin/users': 'Usuarios',
  '/configuracion': 'Configuración',
}

const BASE_TITLE = `IAAS - ${APP_CONFIG.hospitalName}`

/** Updates document.title based on current route */
export function usePageTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    const pageTitle = ROUTE_TITLES[pathname]
    document.title = pageTitle ? `${pageTitle} | ${BASE_TITLE}` : BASE_TITLE
  }, [pathname])
}
