# ADR-001: Strategy Pattern para useCollection

## Estado
Aceptado (2026-03-27)

## Contexto
El hook useCollection manejaba dos modos de almacenamiento (Firebase y localStorage) con if/else entrelazados en cada metodo CRUD. Esto generaba:
- 6 checks de `isFirebaseConfigured` dispersos
- Casts inseguros (`as unknown as Record`)
- Imposibilidad de testear cada modo en aislamiento

## Decision
Aplicar Strategy Pattern con dos adapters intercambiables:
- `useFirebaseAdapter<T>` — suscripcion real-time via Firestore
- `useLocalStorageAdapter<T>` — persistencia local para modo demo

El hook useCollection selecciona el adapter una vez y delega todas las operaciones. Solo retiene responsabilidad de permisos y manejo de errores.

## Consecuencias
- Cada adapter es testeable en aislamiento (11 tests nuevos)
- Agregar un nuevo backend (IndexedDB, Supabase) solo requiere un nuevo adapter
- useCollection paso de 139 a 82 lineas (-41%)
- Cero if/else por modo de almacenamiento en el hook principal
