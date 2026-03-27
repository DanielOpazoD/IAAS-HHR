# Guia de Contribucion

## Requisitos
- Node.js 20+
- npm 10+

## Setup

```bash
git clone https://github.com/DanielOpazoD/IAAS-HHR.git
cd iaas-app
npm install
cp .env.example .env  # Configurar Firebase o dejar vacio para modo demo
npm run dev
```

## Scripts disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Build de produccion (tsc + vite) |
| `npm run lint` | Linting con ESLint |
| `npm run test` | Tests en modo watch |
| `npm run test:run` | Tests una sola vez |
| `npm run test:coverage` | Tests con reporte de cobertura |
| `npm run test:e2e` | Tests E2E con Playwright |

## Estructura del proyecto

```
src/
├── config/        # Firebase + RegistryConfigs declarativos
├── components/
│   ├── forms/     # Formularios por entidad
│   ├── layout/    # Sidebar, Header, AppLayout
│   ├── pages/     # GenericDataPage (CRUD generico)
│   ├── auth/      # Login, PendingApproval
│   └── ui/        # DataTable, Modal, Badge, etc.
├── hooks/         # useCollection, useDebounce, useFormState, etc.
├── services/      # Firestore CRUD + Excel export/import
├── context/       # AuthContext, ToastContext
├── types/         # Interfaces TypeScript
├── utils/         # Helpers: fechas, RUT, tasas, crypto
└── pages/         # Paginas lazy-loaded
```

## Convenciones

- TypeScript estricto (sin `any` salvo casos justificados)
- Tests: Vitest + Testing Library para unit, Playwright para E2E
- Commits: prefijo convencional (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`)
- Formularios: usar hooks compartidos (useFormState, useRutField, useAutoMonth)
- CRUD: siempre via useCollection (nunca Firestore directo desde componentes)

## Agregar un nuevo modulo

1. Crear interfaz en `src/types/index.ts`
2. Crear formulario en `src/components/forms/`
3. Crear config en `src/config/registries.tsx`
4. Crear pagina wrapper en `src/pages/`
5. Agregar ruta en `src/App.tsx` con RoleRoute
6. Agregar al sidebar en `src/components/layout/Sidebar.tsx`
7. Agregar coleccion a ROLE_PERMISSIONS en `src/types/roles.ts`
8. Crear funcion de export en `src/services/excel/`
