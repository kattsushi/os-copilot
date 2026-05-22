# Proposal — localfirst-infra-v1

## Intent

Construir un foundation slice local-first/client-first y Effect-first para persistencia local, realtime local y futura sincronización remota, sin entregar todavía una feature de negocio final. V1 usa Notes CRUD como subdominio placeholder para validar arquitectura, wiring, migraciones, estado de presentación y pruebas.

El target inicial es Chrome/Chromium. Safari/iOS y sync remoto quedan fuera de V1.

## Scope

### In scope

- Infraestructura local-first basada en SQLite OPFS ejecutado en Web Worker.
- Spike reversible con `@effect/sql-sqlite-wasm` para validar bundling, Worker, OPFS, migraciones, queries básicas y lifecycle de recursos.
- Servicio interno `LocalDb` expuesto vía `Context.Tag`/`Layer` de Effect.
- `LocalDbLive` para browser y adapter in-memory para tests unitarios/application/domain.
- Migraciones determinísticas con tabla `migrations`, checksum y ejecución al boot.
- Generator Nx para crear archivos de migración siguiendo la convención `<ordered-id>_<short-name>.sql`.
- Live queries MVP con semántica `invalidate + refetch`.
- Invalidaciones cross-tab mediante `BroadcastChannel` con metadata de origen para evitar loops obvios.
- Spike reversible de `effect-qb` beta 4 instalado únicamente vía `pnpm` catalog; fallback explícito a SQL manual en infra si no encaja con SQLite/local-first.
- Package `packages/localfirst-db` para la infraestructura local.
- Package `packages/notes` como bounded context placeholder con carpetas `domain`, `application`, `infra` y `presentation`.
- UI/state de Notes en `packages/notes/presentation` usando Effect Atom con integración SolidJS (`@effect/atom-solid`).
- Atoms de presentation llamando servicios de application, no SQL ni `LocalDb` directamente.
- Wiring en `apps/web` solo como composition root: providers, routes, runtime/layers.

### Out of scope

- Sync remoto o multi-dispositivo.
- Outbox/oplog implementado.
- CRDT end-to-end.
- Cloudflare Durable Objects u otra infraestructura remota implementada.
- Soporte estricto Safari/iOS.
- Live queries incrementales con diffs/patches.
- Autogeneración de migraciones desde Effect Schema.
- Crear packages `core` o `shared` vacíos; se introducen solo cuando haya uso concreto.
- Exponer `LocalDb` o SQL a presentation/application.

## Affected areas

- `pnpm-workspace.yaml`: catalog entries para spikes (`@effect/sql-sqlite-wasm`, `effect-qb`, `@effect/atom-solid`, según validación/versiones del workspace).
- `packages/localfirst-db`: `LocalDb`, layers, adapter SQLite OPFS Worker, adapter in-memory, migraciones, live query invalidation, bridge `BroadcastChannel`, generator Nx.
- `packages/notes`: placeholder subdomain con domain/application/infra/presentation, repository port/adapters, atoms Solid/Effect y UI mínima CRUD.
- `apps/web`: composición de runtime/layers/providers y montaje de rutas/UI de Notes sin lógica de negocio.
- Tests: unitarios con in-memory adapter, integración de migraciones/SQL cuando aporte valor y verificación manual o automatizada de cross-tab.
- Documentación: convenciones de migración, criterios del spike OPFS Worker y plan de fallback.

## Architectural constraints

- `LocalDb` es una API interna de infraestructura detrás de repositories; presentation/application no importan ni usan SQL, SQLite, OPFS, Worker, Cloudflare ni `LocalDb` directamente.
- Domain/application dependen de ports/services Effect, no de detalles de persistencia.
- Notes es placeholder arquitectónico, no producto final.
- `effect-qb` no se convierte en decisión arquitectónica hasta validar SQL compatible con SQLite y ausencia de filtración hacia capas superiores.
- `core` y `shared` no se crean por anticipado; entran cuando exista ownership real o reutilización concreta.

## Risks

- OPFS + Worker + WASM puede tener fricción de bundling en la app.
- `@effect/sql-sqlite-wasm` puede no cubrir el caso browser esperado o imponer límites de lifecycle/VFS.
- `effect-qb` puede estar orientado a otros dialectos y no aportar para SQLite local.
- Live queries pueden crecer en complejidad si se intenta optimizar antes de tiempo.
- Migraciones y Effect Schema pueden acoplarse prematuramente si no se mantiene SQL explícito.
- Scope creep hacia sync remoto, outbox/oplog o CRDT puede convertir el foundation slice en una plataforma demasiado grande para V1.

## Rollback / fallback

- Si `@effect/sql-sqlite-wasm` falla, registrar trade-offs y evaluar `@sqlite.org/sqlite-wasm` directo, `wa-sqlite`/`@effect/wa-sqlite` o IndexedDB/Dexie como alternativa, manteniendo estable el contrato `LocalDb`/repositories.
- Si `effect-qb` no renderiza SQL SQLite adecuado o filtra dialecto/tipos no deseados, eliminarlo del spike y usar SQL explícito en infra.
- Si cross-tab automatizado queda fuera del presupuesto, mantener prueba manual documentada para V1.
- Si una migración aplicada cambia checksum, fallar boot para evitar DB ambigua y resolver con una nueva migración.
- Si el scope supera el presupuesto de revisión, dividir en PRs encadenados: docs/spikes, localfirst-db, notes, app wiring/verificación.

## Success criteria

- La app levanta en Chrome/Chromium y permite Notes CRUD offline.
- Notes CRUD vive en `packages/notes`; `apps/web` solo monta composition root/rutas/providers.
- `LocalDbLive` corre migraciones al boot y registra filas en `migrations`.
- Tests unitarios relevantes corren contra adapter in-memory sin OPFS.
- Domain/application no importan SQLite, OPFS, Worker, Cloudflare ni `LocalDb`.
- Presentation usa Effect Atom + SolidJS integration para consultar/mutar estado vía application services.
- Cambios en Notes invalidan/refetchean live queries en el mismo tab.
- Cambios en otra tab invalidan/refetchean vía `BroadcastChannel`.
- El generator Nx crea migraciones con naming ordenable y contenido reviewable.
- El resultado deja puntos de extensión claros para sync remoto futuro, outbox/oplog, CRDT y Durable Objects o equivalente sin implementarlos en V1.

## Future direction

- Sync remoto local-first.
- Outbox/oplog para preparar replicación.
- CRDT por entidad/documento cuando un subdominio lo justifique.
- Cloudflare Durable Objects o infraestructura equivalente para coordinación remota.
- Live queries incrementales y validación/generación asistida de migraciones desde Effect Schema.
