# IAAS - Vigilancia Epidemiologica

Sistema web para la vigilancia de **Infecciones Asociadas a la Atencion de Salud (IAAS)** del **Hospital Hanga Roa**, Rapa Nui (Isla de Pascua), Chile.

Reemplaza planillas Excel manuales por una aplicacion web con almacenamiento en la nube, calculo automatico de tasas, exportacion Excel con formulas, control de acceso por roles y funcionamiento offline.

**Desarrollador**: Daniel Opazo

---

## Tabla de Contenidos

- [Stack Tecnologico](#stack-tecnologico)
- [Arquitectura](#arquitectura)
- [Modulos](#modulos)
- [Formulas de Tasas](#formulas-de-tasas)
- [Glosario de Dominio](#glosario-de-dominio)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalacion y Configuracion](#instalacion-y-configuracion)
- [Variables de Entorno](#variables-de-entorno)
- [Scripts Disponibles](#scripts-disponibles)
- [Roles y Permisos](#roles-y-permisos)
- [Seguridad](#seguridad)
- [Flujo de Datos](#flujo-de-datos)
- [Deploy](#deploy)

---

## Stack Tecnologico

| Capa | Tecnologia |
|------|------------|
| Frontend | React 19 + TypeScript 5.9 + Vite 8 |
| Estilos | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Backend | Firebase 12 (Firestore + Auth con Google OAuth) |
| Excel | `xlsx-js-style` (exportacion con formulas y estilos) |
| Tests unitarios | Vitest + Testing Library |
| Tests E2E | Playwright |
| Deploy | Netlify (SPA redirect) |

---

## Arquitectura

### Modo Dual: Firebase / localStorage

La app detecta automaticamente si existen las variables de entorno `VITE_FIREBASE_*`:

- **Con Firebase (produccion)**: Firestore en tiempo real + Google Auth + persistencia IndexedDB para funcionamiento offline.
- **Sin Firebase (demo/desarrollo)**: localStorage como almacenamiento + usuario fake. No requiere configuracion alguna.

### Strategy Pattern con `useCollection`

El hook `useCollection` es el corazon del acceso a datos. Al iniciar la app, selecciona automaticamente el adaptador correcto (Firebase o localStorage) segun la configuracion disponible. Todos los componentes consumen la misma interfaz independientemente del backend.

### Registros Configurativos con `GenericDataPage`

Los 5 modulos CRUD comparten estructura identica. En vez de duplicar codigo, cada pagina es un wrapper minimo que pasa un objeto `RegistryConfig` al componente generico:

```tsx
// src/pages/CirugiasPage.tsx
export default function CirugiasPage() {
  return <GenericDataPage config={cirugiaConfig} />
}
```

El `RegistryConfig` define: coleccion Firestore, columnas de tabla, formulario, configuracion de exportacion y filtros.

### Offline-First

Firestore utiliza persistencia IndexedDB. Los datos cacheados se muestran instantaneamente mientras la sincronizacion ocurre en segundo plano.

### Code Splitting

Las 10 paginas de la aplicacion se cargan de forma lazy (`React.lazy`) para optimizar el tiempo de carga inicial.

---

## Modulos

La aplicacion cuenta con 5 registros de datos y 1 modulo de consolidacion:

| # | Modulo | Coleccion | Descripcion |
|---|--------|-----------|-------------|
| 1 | **Cirugias Trazadoras** | `cirugias` | Seguimiento de cirugias trazadoras (colecistectomia, cesarea, hernia, cataratas) |
| 2 | **Endometritis Puerperal** | `partos` | Partos y cesareas con monitoreo postparto |
| 3 | **DIP** | `dip` | Dispositivos Invasivos Permanentes (CVC, CUP, VMI) con dias de exposicion |
| 4 | **AREpi** | `arepi` | Agentes de Riesgo Epidemico |
| 5 | **Registro IAAS** | `registroIaas` | Registro maestro de infecciones |
| 6 | **Consolidacion de Tasas** | — | Indicadores ministeriales calculados automaticamente por cuatrimestre |

---

## Formulas de Tasas

Las tasas se calculan segun las formulas ministeriales del MINSAL:

| Tipo | Formula |
|------|---------|
| **DIP** | Tasa = (N° infecciones / N° dias exposicion) x 1000 |
| **AREpi** | Tasa = (N° infecciones / N° DCO) x 1000 |
| **Cx / Partos** | Tasa = (N° IHO / N° procedimientos) x 100 |

Los **IRM** (Indicadores de Referencia Ministerial) son umbrales fijos definidos por el MINSAL y se almacenan en `src/utils/constants.ts` como `INDICADORES_DIP`, `INDICADORES_AREPI` e `INDICADORES_CX_PARTOS`.

---

## Glosario de Dominio

| Sigla | Significado |
|-------|-------------|
| **IAAS** | Infecciones Asociadas a la Atencion de Salud |
| **IHO** | Infeccion de Herida Operatoria (Operative Wound Infection) |
| **ITS** | Infeccion del Torrente Sanguineo (Bloodstream Infection) |
| **NAVM** | Neumonia Asociada a Ventilacion Mecanica |
| **CVC** | Cateter Venoso Central |
| **CUP** | Cateter Urinario Permanente |
| **VMI** | Ventilacion Mecanica Invasiva |
| **conTP** | Con Trabajo de Parto (with labor) |
| **DCO** | Dias Cama Ocupados (Occupied Bed-Days) |
| **RUT** | Rol Unico Tributario (cedula de identidad chilena, formato XX.XXX.XXX-K) |
| **Cuatrimestre** | Periodo de 4 meses: Ene-Abr, May-Ago, Sep-Dic |
| **IRM** | Indicador de Referencia Ministerial (umbral de tasa de referencia del MINSAL) |
| **DIP** | Dispositivos Invasivos Permanentes |
| **AREpi** | Agentes de Riesgo Epidemico |
| **EP** | Endometritis Puerperal |

---

## Estructura del Proyecto

```
src/
├── components/         # Componentes de UI
│   ├── auth/           # Login, PendingApproval
│   ├── forms/          # 5 formularios especificos de dominio
│   ├── layout/         # AppLayout, Sidebar, Header
│   ├── pages/          # GenericDataPage, GenericDataModal
│   └── ui/             # Componentes reutilizables (DataTable, Modal, Badge, etc.)
├── config/             # Inicializacion Firebase, definiciones de registros
├── context/            # Providers: Auth, Toast, HeaderSlot
├── hooks/              # 13 custom hooks (useCollection, useFormState, etc.)
├── pages/              # 10 paginas de rutas (lazy-loaded)
├── schemas/            # Esquemas de validacion con Zod
├── services/           # CRUD Firestore, importacion/exportacion Excel
├── types/              # Interfaces TypeScript, definicion de roles RBAC
└── utils/              # Utilidades: fechas, RUT, calculo de tasas, constantes
```

Archivos clave en la raiz:

```
├── .env.example            # Variables de entorno requeridas
├── firebase.json           # Configuracion Firebase local
├── firestore.rules         # Reglas de seguridad Firestore (RBAC)
├── firestore.indexes.json  # Indices compuestos de Firestore
├── netlify.toml            # Configuracion de deploy en Netlify
├── playwright.config.ts    # Configuracion de tests E2E
├── vitest.config.ts        # Configuracion de tests unitarios
└── vite.config.ts          # Configuracion de Vite
```

---

## Instalacion y Configuracion

### Prerrequisitos

- **Node.js v20+** (se recomienda usar `nvm`)

### Inicio rapido

```bash
# Activar Node 20 con nvm
nvm use v20

# Instalar dependencias
npm install

# Ejecutar en modo demo (sin Firebase, usa localStorage)
npm run dev
```

### Con Firebase (produccion)

```bash
# Copiar archivo de variables de entorno de ejemplo
cp .env.example .env.local

# Completar las credenciales de Firebase en .env.local
# (ver seccion "Variables de Entorno" mas abajo)

# Ejecutar con Firebase
npm run dev
```

---

## Variables de Entorno

Crear un archivo `.env.local` en la raiz del proyecto con las siguientes variables. Si se dejan vacias o no existe el archivo, la app funciona en **modo demo** con localStorage.

```
# Configuracion Firebase (dejar vacio para modo demo/localStorage)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Monitoreo de errores (opcional)
VITE_SENTRY_DSN=
```

> **Nota**: El archivo `.env.local` esta incluido en `.gitignore` y nunca debe ser commiteado al repositorio.

---

## Scripts Disponibles

```bash
npm run dev              # Servidor de desarrollo (Vite)
npm run build            # Build de produccion (tsc + vite build)
npm run lint             # Verificacion de codigo con ESLint
npm run test             # Tests unitarios con Vitest (modo watch)
npm run test:run         # Tests unitarios (ejecucion unica)
npm run test:coverage    # Reporte de cobertura de tests
npm run test:e2e         # Tests end-to-end con Playwright
```

---

## Roles y Permisos

El sistema implementa RBAC (Role-Based Access Control) con 3 roles:

| Rol | Cirugias | Partos/EP | DIP | AREpi | Registro IAAS | Consolidacion | Admin |
|-----|----------|-----------|-----|-------|---------------|---------------|-------|
| **admin** | R/W | R/W | R/W | R/W | R/W | R/W | Si |
| **pabellon** | R/W | Solo lectura | R/W | Solo lectura | Solo lectura | Solo lectura | No |
| **matronas** | Solo lectura | R/W | Solo lectura | Solo lectura | Solo lectura | Solo lectura | No |

- **admin**: Enfermera IAAS. Acceso completo a todos los modulos y panel de administracion.
- **pabellon**: Enfermera de Pabellon. Puede crear/editar cirugias y DIP.
- **matronas**: Matronas. Pueden crear/editar registros de partos y endometritis puerperal.

---

## Seguridad

- **Firebase Security Rules**: Las reglas en `firestore.rules` refuerzan el RBAC a nivel de base de datos. Cada coleccion valida el rol del usuario antes de permitir escritura.
- **Google OAuth**: Autenticacion mediante cuenta de Google.
- **Bloqueo por inactividad**: Pantalla de bloqueo con PIN tras 5 minutos de inactividad.
- **CSP Headers**: Configurados en Netlify via `netlify.toml`.
- **Variables sensibles**: `.env.local` excluido de git. Credenciales nunca se commitean.

---

## Flujo de Datos

```
Usuario
  │
  ▼
React Form (validacion Zod)
  │
  ▼
useCollection hook
  │
  ├─── Firebase Adapter ──────► Firestore (produccion)
  │                                  │
  │                            Security Rules (RBAC)
  │                                  │
  │                            IndexedDB Cache (offline)
  │
  └─── localStorage Adapter ──► localStorage (demo)
```

En modo produccion:
1. El usuario completa un formulario validado con Zod.
2. `useCollection` delega al adaptador Firebase.
3. Firestore aplica las Security Rules (RBAC) antes de persistir.
4. Los datos se cachean en IndexedDB para acceso offline.
5. Los cambios se sincronizan automaticamente cuando se recupera la conexion.

---

## Deploy

Configurado para **Netlify** en `netlify.toml`:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **SPA redirect**: `/* → /index.html 200`

Las variables de entorno de produccion se configuran en el panel de Netlify (Site settings > Environment variables).
