# IAAS-HHR — Sistema de Vigilancia Epidemiológica

Sistema web para la enfermera de IAAS (Infecciones Asociadas a la Atención de Salud) del **Hospital Hanga Roa**, Rapa Nui.
Reemplaza planillas Excel manuales por una aplicación con almacenamiento en la nube, exportación Excel con fórmulas e importación de datos existentes.

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 · TypeScript 5.9 · Vite 8 |
| Estilos | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Backend | Firebase Firestore + Auth (Google login) |
| Excel | `xlsx-js-style` (export con fórmulas y estilos) |
| Tests | Vitest · Testing Library |
| Deploy | Netlify (SPA redirect) |

## Quick Start

```bash
# Requiere Node 20 (via nvm)
nvm use v20

# Instalar dependencias
cd iaas-app && npm install

# Modo demo (sin Firebase)
npm run dev

# Con Firebase: crear .env con las variables VITE_FIREBASE_*
# Ver .env.example
```

## Arquitectura

### Modo dual Firebase / Demo

La app detecta si `VITE_FIREBASE_API_KEY` existe:
- **Con Firebase**: Firestore real-time + Google Auth
- **Sin Firebase (demo)**: localStorage + usuario fake

### Estructura del proyecto

```
src/
├── config/           # Firebase config + registry definitions
│   ├── firebase.ts   # Firebase init con lazy auth
│   └── registries.tsx # Config declarativa de los 5 módulos
├── components/
│   ├── pages/        # GenericDataPage (CRUD genérico)
│   ├── forms/        # 5 formularios específicos
│   ├── layout/       # Sidebar, Header, AppLayout, PageHeader
│   ├── ui/           # DataTable, Modal, FormField, ErrorBoundary,
│   │                 # ConfirmDialog, FormActions
│   └── auth/         # LoginPage
├── hooks/
│   ├── useCollection.ts  # CRUD hook dual-mode
│   └── useFormState.ts   # Form state genérico
├── services/
│   ├── firestore.ts      # Firestore CRUD genérico
│   └── excel/            # 7 exportadores + importador + utilidades
├── pages/            # Thin wrappers → GenericDataPage
├── context/          # AuthContext
├── types/            # Interfaces TypeScript
└── utils/            # constants, dates, rates, rut
```

### Patrón GenericDataPage

Los 5 módulos de datos comparten estructura idéntica. En vez de duplicar código, cada página es un wrapper de 5 líneas que pasa un `RegistryConfig` al componente genérico:

```tsx
// src/pages/CirugiasPage.tsx
export default function CirugiasPage() {
  return <GenericDataPage config={cirugiaConfig} />
}
```

El `RegistryConfig` define: colección, columnas, formulario, export, filtros.

### Módulos

| Módulo | Colección | Descripción |
|--------|-----------|-------------|
| Cirugías Trazadoras | `cirugias` | Seguimiento de cirugías trazadoras |
| Partos/Cesárea (EP) | `partos` | Endometritis puerperal |
| DIP | `dip` | Dispositivos Invasivos Permanentes |
| AREpi | `arepi` | Agentes de Riesgo Epidémico |
| Registro IAAS | `registroIaas` | Registro maestro de infecciones |
| Consolidación | — | Tasas calculadas por cuatrimestre |

### Fórmulas de tasas

- **DIP/AREpi**: `(N° infecciones / N° días exposición) × 1000`
- **Cx/Partos**: `(N° IHO / N° procedimientos) × 100`
- **IRM**: Indicadores de Referencia Ministerial (fijos MINSAL)

## Scripts

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run test      # Tests con Vitest (watch)
npm run test:run  # Tests una vez
npm run lint      # ESLint
```

## Deploy

Configurado para Netlify en `netlify.toml`:
- Build: `npm run build`
- Publish: `dist`
- SPA redirect: `/* → /index.html 200`
