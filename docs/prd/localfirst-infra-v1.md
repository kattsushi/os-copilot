# PRD — Local-first Infra v1 (Effect-first)

## 1. Contexto
Queremos establecer la infraestructura y arquitectura base de la app, optimizada para:
- **Privacy First**: los datos viven localmente por defecto.
- **Local First**: offline por defecto, sincronización opcional (futuro).
- **Effect First**: composición por **Context/Layer** y efectos tipados.
- **Mobile First**: UX/arquitectura pensadas para dispositivos y constraints móviles (sin exigir Safari en v1).

V1 NO busca construir negocio: usamos **Notes CRUD** como placeholder para validar la arquitectura.

## 2. Objetivo
Entregar un “foundation slice” en el monorepo que permita a futuros subdominios (notes/workout/fit/nutrition/auth/…) montarse con el mismo patrón, con:
- DB local **SQLite OPFS en Web Worker**.
- API de DB expuesta como **Effect Layer**.
- **Migraciones** controladas por una tabla `migrations`.
- **Live queries MVP** (invalidate + refetch) y **cross-tab** (BroadcastChannel).
- Adapter de **in-memory** para tests.

## 3. Alcance (V1)
### 3.1 Entregables técnicos
- Package de infraestructura DB local-first (propuesto): `packages/localfirst-db`
  - `LocalDb` (Tag) + `LocalDbLive` (Layer)
  - SQLite OPFS en Worker
  - runner de migraciones
  - mecanismo de change notifications para live queries
  - puente cross-tab
- Packages base:
  - `packages/core` (core domain “mínimo”/shared kernel pragmático)
  - `packages/shared` (utilidades shared, types, helpers)
- Placeholder feature: `packages/notes` con CRUD mínimo para validar wiring.

### 3.2 Live queries (MVP)
- Semántica: **invalidate + refetch**
  - escrituras emiten “change events”
  - subscripciones invalidan y re-ejecutan queries

### 3.3 Cross-tab
- Propagación de invalidaciones/changes entre tabs con **BroadcastChannel**.

## 4. No-Objetivos (V1)
- Sync remoto / multi-dispositivo.
- Definir dominio “real” (eventos, agregados, invariantes) más allá de Notes placeholder.
- Compatibilidad estricta con Safari/iOS (Chrome/Chromium first).
- CRDT completo end-to-end (solo pre-wire: outbox/oplog futuro si se decide).

## 5. Principios de diseño
- **Pragmatismo sobre pureza DDD**: capas claras, pero sin “religión”.
- Domain packages no dependen de SQLite/Cloudflare.
- Infra se inyecta por Layer (Live vs InMemory).
- Realtime local: consistencia eventual entre tabs aceptable; prioridad a DX + determinismo.

## 6. Arquitectura propuesta (alto nivel)
### 6.1 Layout de packages (target)
- `packages/core`
  - puertos base (interfaces) y tipos compartidos del núcleo
- `packages/shared`
  - helpers, codecs/schemas reutilizables, logging, etc.
- `packages/localfirst-db`
  - adapters de persistencia + migraciones + live query infra
- `packages/notes`
  - application/presentation/infra (infra implementa puertos usando `LocalDb`)

### 6.2 Ports/Adapters (mínimo)
En V1 definimos lo mínimo para componer:
- `LocalDb` como servicio infra.
- `NotesRepository` como ejemplo de puerto de un subdominio.
- Un bus interno de cambios para live queries (no “domain events” definitivos aún).

## 7. Persistencia local
### 7.1 Motor
- SQLite en browser con **OPFS + Web Worker** (p.ej. `@effect/sql-sqlite-wasm`).

### 7.2 Migraciones
- Tabla `migrations` como fuente de verdad de “aplicadas” (id/name/checksum/applied_at).
- Los cambios en schemas Effect requieren generar/registrar una migración.

### 7.3 Source of truth del schema
- **Separado** inicialmente: “persisted schema” en `localfirst-db`.
- Se prioriza que Effect Schema sea parte del lenguaje del proyecto, no solo infra.

## 8. Realtime local
### 8.1 Live queries MVP
- Invalidate/refetch: cambios emiten evento con (al menos) `tablesTouched`.
- Suscripciones por query registran “interés” (simple) y re-ejecutan.

### 8.2 Cross-tab
- BroadcastChannel publica eventos de invalidación.
- Cada tab re-emite localmente para disparar invalidación/refetch.

## 9. Testing
- `LocalDbInMemory` para tests unitarios de application/domain.
- Tests de integración con SQLite real (cuando aporte valor), pero V1 prioriza base determinista.

## 10. Evolución (futuro)
- Sync remoto (probable Cloudflare Durable Objects como coordinador).
- CRDT por entidad/documento (a definir por subdominio).
- Live queries avanzadas (differences/patches, incremental, etc.).

## 11. Criterios de aceptación (V1)
- Se puede levantar la app y ejecutar Notes CRUD offline.
- Cambios a Notes disparan live query invalidation/refetch en el mismo tab.
- Cambios en un tab invalidan/refetchean en otro tab (cross-tab) sin refresh manual.
- Existe runner de migraciones basado en tabla `migrations` y se ejecuta al boot.
- Tests pueden correr contra InMemory adapter sin necesidad de OPFS.
