# Specification — localfirst-infra-v1

## Purpose

Establish a minimal, verifiable **local-first**, **privacy-first**, **Effect-first** infrastructure slice that provides local persistence, deterministic migrations, and realtime local updates, while keeping domain/application/presentation layers decoupled from infrastructure details. Notes CRUD is a placeholder bounded context used to validate the architecture end-to-end.

## Scope

In scope:

- Browser local persistence via SQLite (OPFS) executed in a Web Worker.
- `LocalDb` infrastructure service provided via Effect `Context.Tag` + `Layer`.
- Deterministic migrations executed at boot with drift detection.
- Live queries MVP semantics: `invalidate + refetch` (same-tab + cross-tab).
- Notes placeholder bounded context supporting offline CRUD.
- Presentation state bridge using Effect Atom + SolidJS integration.
- Reversible spikes: `@effect/sql-sqlite-wasm` and `effect-qb` beta 4.

## Non-goals

- Remote sync, multi-device sync, Cloudflare/Durable Objects implementation.
- Outbox/oplog implementation.
- CRDT end-to-end.
- Strict Safari/iOS support.
- Incremental live query diffs/patches.
- Automatic migration generation or inference from schemas.

## Assumptions

- Primary target runtime is Chrome/Chromium.
- Notes is a placeholder bounded context; its product requirements are not a focus beyond validating the infrastructure slice.
- Infrastructure concerns (SQLite/OPFS/Worker/BroadcastChannel) remain replaceable behind stable ports/services.

## Requirements

### Requirement: Layering boundaries (no infra imports in upper layers)

The system MUST enforce that **domain**, **application**, and **presentation** layers do not import or depend on infrastructure technologies or adapters, including: SQLite, OPFS, Web Worker APIs, Cloudflare/remote-sync components, or `LocalDb`.

#### Scenario: Domain layer remains infra-agnostic
- GIVEN a file under `packages/**/domain/**`
- WHEN its imports are inspected
- THEN it MUST NOT import SQLite/OPFS/Worker/Cloudflare/`LocalDb` modules (directly or via re-exported wrappers).

#### Scenario: Application layer remains infra-agnostic
- GIVEN a file under `packages/**/application/**`
- WHEN its imports are inspected
- THEN it MUST NOT import SQLite/OPFS/Worker/Cloudflare/`LocalDb` modules.

#### Scenario: Presentation layer remains infra-agnostic
- GIVEN a file under `packages/**/presentation/**`
- WHEN its imports are inspected
- THEN it MUST NOT import SQLite/OPFS/Worker/Cloudflare/`LocalDb` modules.

### Requirement: `LocalDb` is internal to infrastructure and mediated by repositories/services

The system MUST ensure **presentation** and **application** code does not call `LocalDb` or execute SQL directly. Access to persistence MUST be mediated by repositories and/or application services.

#### Scenario: Presentation updates state via application services
- GIVEN presentation code that performs a Notes mutation (create/update/delete)
- WHEN the mutation is executed
- THEN presentation MUST call an application service (or repository interface exposed by application)
- AND MUST NOT call `LocalDb` or embed SQL.

#### Scenario: Application delegates persistence to repositories/adapters
- GIVEN application code that needs to persist Notes data
- WHEN persistence is required
- THEN application MUST call a repository/port interface
- AND MUST NOT call `LocalDb` or embed SQL.

### Requirement: Notes placeholder supports offline CRUD

The system MUST provide a Notes placeholder bounded context that supports offline CRUD operations.

#### Scenario: Create a note while offline
- GIVEN the app is running without network connectivity
- WHEN the user creates a note
- THEN the note MUST be persisted locally
- AND the note MUST appear in the notes list.

#### Scenario: Read/list notes while offline
- GIVEN the app is running without network connectivity
- WHEN the user navigates to the notes list
- THEN existing notes MUST be loaded from local persistence.

#### Scenario: Update a note while offline
- GIVEN an existing note stored locally
- WHEN the user edits the note
- THEN the updated content MUST be persisted locally
- AND the UI MUST reflect the updated content.

#### Scenario: Delete a note while offline
- GIVEN an existing note stored locally
- WHEN the user deletes the note
- THEN the note MUST be removed from local persistence
- AND the UI MUST no longer show the note.

### Requirement: Migrations run at boot with drift detection

The system MUST execute migrations at boot before serving application reads/writes, and MUST persist applied migration metadata in a `migrations` table that includes a checksum. If an already-applied migration’s checksum differs from the stored value (drift), boot MUST fail.

#### Scenario: Migrations execute at boot
- GIVEN a fresh local database
- WHEN the application bootstraps `LocalDbLive`
- THEN all pending migrations MUST be applied before the database is usable.

#### Scenario: `migrations` table records applied migrations
- GIVEN migrations have been applied
- WHEN the `migrations` table is queried
- THEN it MUST contain one row per applied migration
- AND each row MUST include `id`, `name`, `checksum`, and `applied_at`.

#### Scenario: Drift detection fails boot
- GIVEN a migration has been applied and recorded with checksum `X`
- WHEN the migration file content changes producing checksum `Y` where `Y != X`
- THEN application boot MUST fail
- AND the database MUST NOT be used in an ambiguous state.

### Requirement: Nx migration generator creates ordered migration files (no inference)

The system MUST provide an Nx generator that creates a migration file with an ordered id and a human name in the correct migrations folder. The generator MUST NOT apply migrations, compute diffs, or infer schema changes.

#### Scenario: Generator creates a correctly named file in the correct folder
- GIVEN a workspace with `packages/localfirst-db` migrations directory
- WHEN the migration generator is run with a name like `create_notes`
- THEN it MUST create exactly one new migration file
- AND the filename MUST follow `<ordered-id>_<short-name>.sql`
- AND the file MUST be created in the configured migrations folder.

#### Scenario: Generator does not apply or infer migrations
- GIVEN an existing database state
- WHEN the migration generator is run
- THEN it MUST NOT connect to, modify, or apply changes to any database
- AND it MUST NOT attempt schema diffing or inference.

### Requirement: Realtime same-tab semantics are invalidate + refetch

The system MUST ensure that, within the same browser tab, a successful write causes relevant live queries to invalidate and refetch.

#### Scenario: Same-tab write invalidates and refetches list query
- GIVEN a notes list query is subscribed in the UI
- WHEN a note is created/updated/deleted in the same tab
- THEN the list query MUST be invalidated
- AND the list query MUST refetch
- AND the UI MUST render the updated list.

### Requirement: Cross-tab invalidation via `BroadcastChannel` with loop prevention

The system MUST broadcast invalidations to other tabs using `BroadcastChannel`. Each invalidation message MUST include an origin identifier, and receivers MUST prevent re-broadcast loops.

#### Scenario: Cross-tab write triggers refetch in a different tab
- GIVEN Tab A and Tab B are open
- AND Tab B has a notes list query subscribed
- WHEN a note is created/updated/deleted in Tab A
- THEN Tab B MUST receive an invalidation via `BroadcastChannel`
- AND Tab B MUST refetch affected queries
- AND Tab B MUST render the updated result.

#### Scenario: Loop prevention using origin id
- GIVEN Tab A broadcasts an invalidation with origin id `A`
- WHEN Tab A receives an invalidation message whose origin id is `A`
- THEN Tab A MUST NOT re-broadcast that invalidation.

### Requirement: Presentation state uses Effect Atom + SolidJS integration

The system MUST represent subdomain presentation state using Effect Atom with SolidJS integration. Presentation atoms MUST call application services, and atoms MUST refresh their read models upon relevant invalidations.

#### Scenario: Atoms call application services
- GIVEN a presentation atom that triggers a Notes mutation
- WHEN the atom runs
- THEN it MUST call an application service
- AND MUST NOT access `LocalDb` or execute SQL.

#### Scenario: Atoms refresh on invalidation
- GIVEN a presentation atom provides a notes list snapshot
- WHEN an invalidation relevant to the notes list occurs (same-tab or cross-tab)
- THEN the atom MUST refresh (refetch) its underlying read model
- AND consumers MUST observe the updated snapshot.

### Requirement: Spikes are reversible (`@effect/sql-sqlite-wasm`, `effect-qb` beta 4)

The system MUST treat `@effect/sql-sqlite-wasm` and `effect-qb` beta 4 as reversible spikes: their usage MUST be isolated behind infrastructure boundaries so they can be removed or replaced without changing domain/application/presentation contracts.

#### Scenario: Replacing the SQLite adapter does not change upper-layer contracts
- GIVEN domain/application/presentation code consumes repositories/services and not SQLite libraries
- WHEN the SQLite implementation layer is replaced with an alternative adapter
- THEN domain/application/presentation code MUST NOT require changes to accommodate that swap.

## Acceptance criteria checklist

- [ ] Domain/application/presentation do not import SQLite/OPFS/Worker/Cloudflare/`LocalDb`.
- [ ] Presentation/application do not call `LocalDb` or write SQL; repositories/services mediate.
- [ ] Notes placeholder supports offline CRUD (create/list/update/delete) end-to-end.
- [ ] Migrations run at boot.
- [ ] `migrations` table exists and records `id`, `name`, `checksum`, `applied_at`.
- [ ] Migration drift (checksum mismatch) fails boot.
- [ ] Nx generator creates `<ordered-id>_<short-name>.sql` in the correct folder and does not apply/infer/diff.
- [ ] Same-tab write invalidates and refetches relevant read models.
- [ ] Cross-tab invalidation uses `BroadcastChannel` and prevents loops via origin id.
- [ ] Presentation state uses Effect Atom + SolidJS integration; atoms call application services and refresh on invalidations.
- [ ] Spikes `@effect/sql-sqlite-wasm` and `effect-qb` beta 4 are reversible and isolated.

## Explicit out-of-scope future items

- Remote sync layer (including Cloudflare Durable Objects or equivalent), outbox/oplog, and conflict resolution.
- CRDT-based storage or merging.
- Incremental live query updates (diff/patch streams).
- Schema diff tooling and auto-generated migrations from schemas.
- Full cross-browser support guarantees beyond Chrome/Chromium.
