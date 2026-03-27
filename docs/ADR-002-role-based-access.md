# ADR-002: Control de acceso por rol

## Estado
Aceptado (2026-03-27)

## Contexto
Todos los usuarios veian todos los modulos del sidebar y podian acceder a cualquier ruta directamente. Con 4 roles definidos (admin, pabellon, hospitalizados, matronas), era necesario restringir visibilidad y acceso.

## Decision
Implementar control de acceso en dos capas:
1. **Sidebar**: filtrar navItems con useMemo segun `ROLE_PERMISSIONS[role].canRead`
2. **Rutas**: componente `RoleRoute` que verifica permisos antes de renderizar, redirige a `/` si no autorizado

Separar `canRead` y `canWrite` en ROLE_PERMISSIONS para permitir granularidad futura.

## Consecuencias
- Cada rol solo ve y accede a sus modulos asignados
- Admin siempre ve todo
- Rutas admin-only (importar, usuarios, configuracion) protegidas con flag `adminOnly`
- Agregar un nuevo rol requiere solo una entrada en ROLE_PERMISSIONS
