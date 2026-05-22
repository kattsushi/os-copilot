# Design — localfirst-infra-v1 (Effect-first local-first infra)

## Status

Design ready for implementation.

## Goals (V1)

- Provide a **replaceable** local persistence foundation (SQLite in browser, OPFS, Worker) behind stable ports.
- Ensure **domain / application / presentation** stay infra-agnostic (no SQLite/OPFS/Worker/BroadcastChannel imports).
- Deterministic **SQL migrations** at boot with drift detection (checksum).
- Realtime MVP: **invalidate + refetch** (same-tab + cross-tab).
- Notes CRUD as an end-to-end placeholder bounded context.

Non-goals: remote sync, outbox/oplog implementation, CRDT, incremental live-query diffs, Safari-first support.

---

## Package/module layout

### `packages/localfirst-db`

A single package with internal layer folders. Only `infra/*` is allowed to touch browser/SQLite/Worker.

```text
packages/localfirst-db
  src/
    domain/
      (empty in v1; reserved for future shared domain concepts like DbName)

    application/
      (empty in v1; reserved for future app-facing services; v1 exposes only infra service tags)

    infra/
      LocalDb.ts                  # Context.Tag + interface (stable contract)
      LocalDbLive.ts              # Layer: main-thread client wiring -> worker
      LocalDbInMemory.ts          # Layer: in-memory adapter for unit tests

      worker/
        entry.ts                  # worker entrypoint
        WorkerDb.ts               # worker-side implementation using sqlite wasm
        protocol.ts               # message types + codec

      migrations/
        index.ts                  # load list + runner
        checksum.ts               # stable checksum algorithm
        schema.ts                 # migrations table schema constants
        loader.ts                 # migration discovery (import.meta.glob or manifest)
        runner.ts                 # apply, record, drift detection

      realtime/
        ChangeBus.ts              # in-process change event hub (Stream)
        LiveQueryRegistry.ts      # invalidate/refetch wiring helpers (optional v1 helper)

      crosstab/
        BroadcastInvalidation.ts  # BroadcastChannel bridge
        tabId.ts                  # stable originTabId per tab

    presentation/
      (empty in v1; localfirst-db has no UI)

    index.ts                      # exports: LocalDb Tag + Layers + types
```

Export surface (v1):
- `LocalDb` tag + types (stable contract)
- `LocalDbLive` layer (browser worker)
- `LocalDbInMemory` layer (tests)
- `DbChangeEvent` / invalidation types

Everything else is internal (not exported) unless required by tests.

---

### `packages/notes`

Notes is a bounded context with strict layering. Only `notes/infra/*` can import from `localfirst-db`.

```text
packages/notes
  src/
    domain/
      Note.ts                # Note entity/value objects + invariants
      NoteId.ts              # branded id
      errors.ts              # domain errors (optional)

    application/
      NotesRepository.ts     # port interface (no LocalDb)
      NotesService.ts        # use-cases: create/list/update/delete
      NotesLive.ts           # Layer assembling NotesService from repository

    infra/
      NotesRepositoryLocal.ts # adapter: implements NotesRepository using LocalDb + SQL
      sql/
        notes.sql.ts          # SQL strings (or builders), centralized
      mapping.ts              # row <-> domain mapping

    presentation/
      state/
        notesAtoms.ts         # Effect Atom read models + commands
        notesKeys.ts          # query keys + invalidation mapping
      ui/
        NotesRoute.tsx        # Solid components (CRUD UI)
        NotesList.tsx
        NoteEditor.tsx

    index.ts                  # exports only what apps need: NotesRoute (UI) + NotesLive
```

Rules:
- `domain` and `application` never import `localfirst-db`.
- `presentation` imports only `packages/notes/application` (services) and UI libs.
- `infra` is the only layer importing `LocalDb`.

---

## `LocalDb` service contract (minimal, stable)

### Why this contract is “infra-only”

`LocalDb` exists to let **infra adapters** (repositories) run SQL and participate in change notification. Upper layers must not see SQL.

### Interface (TypeScript shape)

```ts
export type SqlValue = null | string | number | bigint | Uint8Array;
export type SqlParams = ReadonlyArray<SqlValue> | Readonly<Record<string, SqlValue>>;

export type DbChangeEvent = {
  readonly tablesTouched: ReadonlyArray<string>;
  readonly originTabId: string;
  readonly ts: number; // epoch ms
};

export interface LocalDb {
  /** Unique id for this browser tab/process; used for cross-tab loop prevention. */
  readonly tabId: string;

  /** Run a SELECT-like query returning rows as plain objects. */
  readonly query: <TRow extends Record<string, unknown> = Record<string, unknown>>(
    sql: string,
    params?: SqlParams,
  ) => Effect.Effect<ReadonlyArray<TRow>>;

  /** Run an INSERT/UPDATE/DELETE. Caller declares tables touched for invalidation. */
  readonly execute: (
    sql: string,
    params?: SqlParams,
    options?: { readonly tablesTouched?: ReadonlyArray<string> },
  ) => Effect.Effect<{ readonly rowsAffected: number }>;

  /** Transaction boundary for multi-statement writes with a single invalidation emission. */
  readonly transaction: <A>(
    options: { readonly tablesTouched: ReadonlyArray<string> },
    f: (tx: Omit<LocalDb, "transaction" | "changes" | "tabId">) => Effect.Effect<A>,
  ) => Effect.Effect<A>;

  /** Stream of change events (same-tab + cross-tab). */
  readonly changes: Stream.Stream<DbChangeEvent>;

  /** Close underlying resources; called by Scope finalizers (layer). */
  readonly close: Effect.Effect<void>;
}

export const LocalDb = Context.Tag<LocalDb>("localfirst-db/LocalDb");
```

Stability guarantees (must remain true even if we replace SQLite libs):
- `query/execute/transaction` semantics and return shapes.
- `DbChangeEvent` with `tablesTouched` + `originTabId`.
- `changes` emits both same-tab and cross-tab invalidations.

### What lives where (boundary clarification)

| Concern | Layer | Notes |
|---|---|---|
| SQL strings / query building | `notes/infra` | Can use raw SQL or `effect-qb` spike; never in application/presentation |
| Mapping DB rows ⇄ domain | `notes/infra` | Keep domain pure; conversions at boundary |
| Use-cases (create/list/update/delete) | `notes/application` | Calls repository port only |
| Cross-tab, worker, OPFS, SQLite | `localfirst-db/infra` | Replaceable; hidden behind `LocalDb` tag |
| Live query invalidation policy (what tables invalidate what read models) | `notes/presentation` (keys) + `localfirst-db/infra` (event transport) | Presentation chooses what to refetch; infra only transports events |

---

## Worker boundary (main thread client vs worker implementation)

### Responsibilities

**Main thread (client):**
- owns `originTabId`.
- provides `LocalDb` service that forwards `query/execute/transaction` to worker.
- merges two change sources into `LocalDb.changes`:
  1) same-tab changes echoed back from worker;
  2) cross-tab invalidations via `BroadcastChannel`.

**Worker (db engine):**
- owns SQLite wasm instance and OPFS file handle.
- runs migrations before serving requests.
- executes SQL.
- returns results to main thread.
- emits same-tab change events to main thread for successful writes.

### Message protocol (shape)

All messages are JSON-serializable.

```ts
export type WorkerRequest =
  | { type: "db/init"; requestId: string; payload: { dbName: string; migrations: ReadonlyArray<MigrationDef> } }
  | { type: "db/query"; requestId: string; payload: { sql: string; params?: SqlParams } }
  | { type: "db/execute"; requestId: string; payload: { sql: string; params?: SqlParams; tablesTouched: ReadonlyArray<string> } }
  | { type: "db/transaction"; requestId: string; payload: { tablesTouched: ReadonlyArray<string>; steps: ReadonlyArray<{ sql: string; params?: SqlParams }> } }
  | { type: "db/close"; requestId: string; payload: {} };

export type WorkerResponse =
  | { type: "ok"; requestId: string; payload: unknown }
  | { type: "error"; requestId: string; payload: { name: string; message: string; stack?: string } };

export type WorkerEvent =
  | { type: "db/change"; payload: { tablesTouched: ReadonlyArray<string>; ts: number } };
```

Notes:
- Main thread injects `originTabId` and adds it locally to `DbChangeEvent`.
- `db/transaction` is modeled as “batch steps” to keep the worker boundary simple (no function serialization).
  - If later we need interactive transactions, we can add a “tx session” protocol; not needed in v1.

### Resource lifecycle

- `LocalDbLive` is a `Layer.scoped`:
  - acquire: create worker, send `db/init`, await ready.
  - release: send `db/close`, terminate worker.
- Worker holds:
  - SQLite engine instance
  - OPFS file handle (or equivalent)
  - internal flag `ready` only after migrations complete.
- If `db/init` fails (e.g., migration drift), layer acquisition fails and the app should not mount Notes read models.

---

## Migration system

### Files and discovery

Location:
- `packages/localfirst-db/src/infra/migrations/sql/*.sql` (preferred)
  - kept under `infra` because it is persistence-specific.

Loader design:
- `loader.ts` uses bundler-friendly loading:
  - Vite: `import.meta.glob("./sql/*.sql", { as: "raw", eager: true })`
  - Node (tests): fallback to fs read (only in generator tests), but runtime should not rely on fs.

Migration definition:

```ts
export type MigrationDef = {
  readonly id: string;       // ordered, e.g. "0001"
  readonly name: string;     // e.g. "create_notes"
  readonly filename: string; // e.g. "0001_create_notes.sql"
  readonly sql: string;
  readonly checksum: string; // computed from sql
};
```

### Checksum computation

Algorithm (stable, deterministic):
- Normalize SQL text:
  - convert CRLF → LF
  - trim trailing whitespace per line
  - ensure final newline
- Compute SHA-256 over UTF-8 bytes.
- Store as lowercase hex.

Rationale: avoids accidental drift caused by editor line endings.

### `migrations` table schema

Created by the migration runner (if absent) before applying user migrations:

```sql
CREATE TABLE IF NOT EXISTS migrations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  checksum TEXT NOT NULL,
  applied_at INTEGER NOT NULL
);
```

Notes:
- `applied_at` is epoch ms (INTEGER) for portability.
- `id` is the ordered id (e.g. `0001`). Filename is not needed in table.

### Boot sequence

`LocalDbLive` acquisition:

1. Create worker.
2. Load migration defs (ordered by `id`, then `name`).
3. Send `db/init` with migrations list (sql + checksum).
4. Worker:
   1) open DB (OPFS)
   2) ensure `migrations` table exists
   3) read applied migrations
   4) for each migration in order:
      - if not applied: apply in a transaction; insert row
      - if applied: verify checksum matches; else **fail init** (drift)
5. When ready, accept queries.

Failure mode:
- Drift mismatch, SQL error, or any migration failure aborts init. The worker returns `error`; `LocalDbLive` fails layer acquisition.

---

## Migration authoring DX (generator/CLI) — pending

El PRD había cerrado “generator Nx en V1”, pero tenemos un punto nuevo:
`effect-qb` trae su propio CLI de migraciones. Como `effect-qb` es **spike
reversible**, no podemos acoplar el flujo de migraciones a su tooling hasta
validar el spike.

Decisión actual (V1): **pendiente de spike**.

Mientras tanto, el baseline innegociable es:

- migraciones como **SQL explícito** en `packages/localfirst-db/src/infra/migrations/sql`;
- naming `<ordered-id>_<short-name>.sql`;
- checksum + drift detection al boot.

En el spike de `effect-qb` vamos a decidir una de estas salidas:

1. **Nx workspace generator** en `tools/generators/localfirst-migration` (simple scaffolding),
2. **effect-qb CLI** como flujo principal,
3. **híbrido** (Nx scaffolding + effect-qb CLI opcional).

Criterios de decisión:

- no rompe el principio “spike reversible” (o sea: podemos sacar effect-qb sin
  reescribir migraciones);
- no introduce runtime deps en packages de producción;
- es fácil de testear y no toca DB;
- funciona bien con nuestro loader de migraciones (bundler-friendly).
---

## Realtime model (invalidate + refetch)

### Change event model

`DbChangeEvent` fields:
- `tablesTouched: string[]` — declared by the infra adapter on writes.
- `originTabId: string` — stable per tab; used for cross-tab loop prevention.
- `ts: number` — when the write was committed (epoch ms).

Guideline: use physical table names (e.g. `notes`) not domain concepts.

### Live query invalidation/refetch wiring

V1 wiring pattern (simple, explicit):

- Presentation layer defines **query keys** and a mapping from `tablesTouched` → keys to invalidate.
- A small helper subscribes to `LocalDb.changes` and triggers atom refresh.

Example mapping (notes):

| tablesTouched contains… | invalidate keys |
|---|---|
| `notes` | `notes:list`, `notes:byId:*` |

Implementation approach for atoms:
- `notesListAtom` is a “refetchable atom”:
  - reads by running `NotesService.list`.
  - exposes `refresh()` (or uses Atom’s invalidation APIs if available).
- a `NotesInvalidationBridge` effect runs once per app runtime:
  - listens to `LocalDb.changes`
  - if `tablesTouched` intersects relevant tables, calls `notesAtoms.refresh*`.

This keeps `localfirst-db` generic; it does not know about Notes keys.

---

## Cross-tab invalidation

### Channel name

Stable, versioned:

- `os-copilot:localfirst-db:invalidate:v1`

### Payload schema

```ts
type BroadcastInvalidationV1 = {
  v: 1;
  type: "invalidate";
  originTabId: string;
  ts: number;
  tablesTouched: ReadonlyArray<string>;
};
```

### Loop prevention

Rules:
- When receiving a broadcast message:
  - if `originTabId === LocalDb.tabId`: ignore (it is our own message)
  - else: emit into the local `changes` stream as an external invalidation
- Receivers **must not re-broadcast** what they received.
  - Only the tab that performed the write broadcasts.

---

## Presentation state (Effect Atom + SolidJS)

### Runtime creation and provider placement (`apps/web`)

`apps/web` is the composition root:
- create a single Effect runtime with layers:
  - `LocalDbLive`
  - `NotesLive` (which depends on `NotesRepositoryLocal` + `LocalDb`)
- mount Solid providers:
  - Atom runtime/provider
  - app routes

Placement proposal:

```text
apps/web/src/app/
  runtime/
    makeRuntime.ts        # constructs Effect runtime with Layers
    AtomRuntimeProvider.tsx
  routes/
    NotesPage.tsx         # imports NotesRoute from packages/notes/presentation
```

`apps/web` must not contain Notes business logic.

### Where atoms live

- All Notes atoms live in `packages/notes/src/presentation/state/*`.
- UI components consume atoms; they do not call services directly.

### How atoms call application services

Atoms depend on `NotesService` (application) only.
- Reads: `NotesService.list / getById`
- Writes: `NotesService.create / update / remove`

Atoms do **not** depend on `LocalDb` or repositories.

### How invalidations trigger atom refresh

- A `NotesInvalidationBridge` effect is started once (composition root) and injected with:
  - `LocalDb` (for `changes` stream)
  - an atom “registry” (handles refresh)

Practical placement:
- Bridge implementation can live in `packages/notes/presentation/state/notesInvalidationBridge.ts`.
- The bridge is started by `apps/web` when mounting providers.

---

## Testing strategy

### Unit tests (fast)

Target:
- `notes/domain` invariants
- `notes/application` use-cases using a fake/in-memory repository

Adapter:
- `LocalDbInMemory` is used only when testing infra adapters.

Key enforcement: unit tests must not require OPFS/Worker.

### Integration tests (selective)

Target:
- migration runner correctness (apply, drift detection)
- `NotesRepositoryLocal` SQL correctness against a real sqlite engine in-memory

Approach:
- Run sqlite in-memory (worker not required) using the same SQL layer used by the worker adapter, if possible.
- Keep OPFS/Worker integration tests minimal; they are brittle.

### Manual cross-tab verification (documented)

- Open two tabs to Notes route.
- In Tab A create/update/delete a note.
- Verify Tab B refreshes list without manual reload.
- Document steps under `openspec/changes/localfirst-infra-v1/verify.md` (implementation phase) if automated test is out of budget.

### Boundary testing (no infra imports) pragmatically

- Add lint rule or lightweight test that scans imports by path:
  - any file under `**/domain/**`, `**/application/**`, `**/presentation/**` must not import from:
    - `packages/localfirst-db/src/infra/**`
    - `@effect/sql-sqlite-wasm`, `effect-qb`, `BroadcastChannel`, `Worker`
- Pragmatic implementation in v1:
  - a `vitest` test using `glob` + `es-module-lexer` or simple string includes.

---

## Spikes and explicit fallbacks (contracts that must remain stable)

### Spike A: `@effect/sql-sqlite-wasm`

Allowed usage:
- only inside `packages/localfirst-db/src/infra/worker/*` (and possibly `LocalDbInMemory` if it reuses Effect SQL).

Fallback:
- Replace worker engine implementation with `@sqlite.org/sqlite-wasm` or `wa-sqlite`.

Contracts that must remain stable:
- `LocalDb` interface (query/execute/transaction/changes/tabId/close)
- Migration runner behavior (table schema, checksum algorithm, drift failure)
- Worker protocol types (at least at the semantic level)

### Spike B: `effect-qb` beta 4

Allowed usage:
- only in `notes/infra/sql/*` (or a dedicated spike module) to render SQL strings.

Fallback:
- Replace with raw SQL strings.

Contracts that must remain stable:
- Repositories’ public types in `notes/application` (ports) and `NotesService` API.
- `LocalDb` remains SQL-string based (so both qb and raw SQL can feed it).

---

## Sequence diagram (write → invalidate → refetch, cross-tab)

```text
Tab A (UI)      Tab A (NotesService)  Tab A (RepoLocal)  Tab A (LocalDb client)   Worker (SQLite)   BroadcastChannel   Tab B (LocalDb client)   Tab B (atoms)
   |                    |                    |                    |                    |                 |                    |                    |
   | createNote()       |                    |                    |                    |                 |                    |                    |
   |------------------->|                    |                    |                    |                 |                    |                    |
   |                    | repo.insert()      |                    |                    |                 |                    |                    |
   |                    |------------------->| LocalDb.execute(.. tablesTouched=[notes])             |                    |                    |
   |                    |                    |------------------->| db/execute req      |                 |                    |                    |
   |                    |                    |                    |------------------->| run SQL + commit |                    |                    |
   |                    |                    |                    |<-------------------| ok + change evt  |                    |                    |
   |                    |                    |                    | emit change         |                 | postMessage(invalidate)              |
   |                    |                    |                    |----------------------------------------------->|                    |                    |
   |                    |                    |                    |                 |                 | broadcast invalidate(v1, origin=A)  |
   |                    |                    |                    |                 |                 |----------------------------------->| receive
   |                    |                    |                    |                 |                 |                    | emit change(origin=A)
   |                    |                    |                    |                 |                 |                    |--------------------->| refresh list atom
```

---

## Rollout notes (implementation phase)

- Implement `localfirst-db` first with in-memory adapter + migrations runner tests.
- Add Notes repository + service + unit tests.
- Wire atoms + invalidation bridge.
- Finally integrate Worker + OPFS and manual cross-tab verification.

