# ADR-003: Bloqueo de pantalla con PIN hasheado

## Estado
Aceptado (2026-03-27)

## Contexto
Se requeria bloqueo de pantalla por inactividad. El PIN debia almacenarse de forma segura en localStorage.

## Decision
- Hashear PIN con SHA-256 via Web Crypto API antes de guardar
- LockScreen se activa tras 5 minutos de inactividad (mousedown, keydown, touchstart, scroll)
- Nunca se bloquea al cargar la app, solo por inactividad real

## Consecuencias
- PIN no recuperable desde localStorage (solo hash)
- Usuarios deben re-configurar PIN si cambian de navegador
- Overhead minimo: SHA-256 toma <1ms
