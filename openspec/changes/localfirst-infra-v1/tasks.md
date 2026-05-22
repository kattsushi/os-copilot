# Tasks — localfirst-infra-v1

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1800–3200 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 → PR 5 |
| Delivery strategy | auto-chain |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

---

## PR breakdown proposal (5 PRs)

### PR 1 — Spikes: bundling/Worker/OPFS + `effect-qb` viability + migration DX decision
Goal: de-risk sqlite wasm + Worker + OPFS bundling in this repo, and decide migration authoring DX (Nx generator vs effect-qb CLI vs hybrid) without committing the architecture.

Includes tasks:
- T1–T6

### PR 2 — `localfirst-db` core: `LocalDb` contract + in-memory adapter + migration runner (tested)
Goal: land stable contracts + deterministic migrations (apply + checksum drift) with tests, without OPFS/Worker yet.

Includes tasks:
- T7–T14

### PR 3 — `localfirst-db` browser adapter: Worker protocol + OPFS sqlite + BroadcastChannel invalidation
Goal: make `LocalDbLive` real in browser (Worker + OPFS) and produce `changes` stream (same-tab + cross-tab).

Includes tasks:
- T15–T22

### PR 4 — Notes bounded context: domain/application/infra + repository adapter + tests (+ optional effect-qb)
Goal: validate layering with a real bounded context behind repositories; keep presentation infra-agnostic.

Includes tasks:
- T23–T33

### PR 5 — Notes presentation + app wiring + boundary enforcement + verification doc
Goal: end-to-end offline CRUD + invalidate/refetch + cross-tab manual verification; add boundary enforcement test/lint.

Includes tasks:
- T34–T43

---

## Tasks

### T1. Create a minimal spike app route that can load a Worker module
- Discovery targets:
  - Identify web app entry points under `apps/web/src/**`.
  - Identify bundler/runtime (likely Vite) and Worker import conventions.
- Changes:
  - Add a temporary spike route/component under `apps/web/src/app/routes/**` that imports a Worker entry via `new Worker(new URL("./worker.ts", import.meta.url), { type: "module" })` (or repo convention).
- Verification:
  - Run the web app and confirm the Worker starts and can post a “ready” message.
- Rollback:
  - Remove spike route/component if Worker import path is reworked.

### T2. Spike `@effect/sql-sqlite-wasm` in a Worker with OPFS open + simple query
- Changes (spike-only location):
  - Create `packages/localfirst-db/src/infra/worker/spike-opfs.ts` (or similar) used only by the spike route.
  - Implement: open/create sqlite db in OPFS, run `SELECT 1 as ok`, close cleanly.
  - Add notes in code about bundler/asset requirements discovered.
- Verification:
  - Manual: open app, trigger spike, observe “ok=1” in UI (no console-only success).
- Rollback:
  - Keep spike isolated to allow switching to `@sqlite.org/sqlite-wasm` or `wa-sqlite`.

### T3. Spike migration loading mechanism (bundler-friendly raw SQL)
- Changes:
  - Prototype `import.meta.glob("./sql/*.sql", { as: "raw", eager: true })` in a scratch module under `packages/localfirst-db/src/infra/migrations/loader.spike.ts`.
  - Validate it works in the web build.
- Verification:
  - Manual: list loaded migration filenames and first line in UI.

### T4. Spike `effect-qb` rendering for SQLite compatibility (reversible)
- Changes:
  - Add `effect-qb` to catalog (if not present) and depend on it only from a spike module under `packages/notes/src/infra/sql/spike-qb.ts`.
  - Render SQL for: create table, insert, select with limit/order, update by id.
- Verification:
  - Confirm generated SQL executes on sqlite engine used in the spike (or verify SQL text is SQLite-valid).
- Decision output:
  - Record decision in `openspec/changes/localfirst-infra-v1/decision-effect-qb.md`:
    - adopt for v1 notes infra SQL builder OR
    - reject and use raw SQL strings.

### T5. Spike/decision: migration authoring DX (Nx generator vs effect-qb CLI vs hybrid)
- Inputs:
  - Findings from T3 (loader constraints) and T4 (effect-qb viability).
- Changes:
  - Create a short decision note `openspec/changes/localfirst-infra-v1/decision-migration-dx.md` choosing one:
    1) Nx generator in `tools/generators/localfirst-migration`
    2) effect-qb CLI
    3) hybrid
- Acceptance criteria for decision:
  - Keeps migrations as explicit SQL in `packages/localfirst-db/src/infra/migrations/sql`.
  - Does not introduce runtime coupling to effect-qb.
  - Is testable and does not touch a DB.

### T6. Remove/disable spikes or gate behind `DEV_ONLY` flag
- Changes:
  - Ensure spike routes/modules are clearly labeled and can be removed after PR 3 lands.
- Verification:
  - `pnpm run check` passes.

---

### T7. Create `packages/localfirst-db` package skeleton and export surface
- Changes:
  - Add `packages/localfirst-db/package.json`, `project.json` (Nx), tsconfig, and `src/index.ts`.
  - Add folder structure per design under `packages/localfirst-db/src/{infra,infra/migrations,infra/realtime,infra/crosstab,infra/worker}`.
- Verification:
  - Typecheck/build for the package.

### T8. Implement `LocalDb` Tag + types (stable contract)
- Files:
  - `packages/localfirst-db/src/infra/LocalDb.ts`
- Include:
  - `SqlValue`, `SqlParams`, `DbChangeEvent`, `LocalDb` interface, `Context.Tag`.
- Verification:
  - Basic compile usage from a tiny sample in a test.

### T9. Implement checksum algorithm (stable normalization + sha256)
- Files:
  - `packages/localfirst-db/src/infra/migrations/checksum.ts`
- Verification:
  - Unit tests for CRLF/LF normalization and deterministic hash.

### T10. Implement migration loader (non-spike) and ordering
- Files:
  - `packages/localfirst-db/src/infra/migrations/loader.ts`
  - `packages/localfirst-db/src/infra/migrations/types.ts`
- Notes:
  - Use `import.meta.glob` raw SQL loading as primary (per design).
- Verification:
  - Unit test ensures filenames parse to `{id,name}` and sorting is stable.

### T11. Implement migration runner (apply + record + drift detection)
- Files:
  - `packages/localfirst-db/src/infra/migrations/schema.ts`
  - `packages/localfirst-db/src/infra/migrations/runner.ts`
- Behavior:
  - Ensure `migrations` table exists.
  - Apply missing migrations in order (single migration per transaction is OK in v1).
  - On already-applied migration: verify checksum or fail.
- Verification:
  - Tests against an in-memory sqlite engine (see T12).

### T12. Implement `LocalDbInMemory` adapter for unit/integration tests
- Files:
  - `packages/localfirst-db/src/infra/LocalDbInMemory.ts`
- Notes:
  - May use a lightweight sqlite in-memory runtime (non-OPFS) suitable for vitest.
  - Must implement `query/execute/transaction/changes/tabId/close`.
- Verification:
  - Vitest: migration runner applies migrations and records rows.

### T13. Add migration runner integration tests (apply + drift)
- Files:
  - `packages/localfirst-db/src/infra/migrations/runner.test.ts`
- Cases:
  - Fresh DB: applies all migrations.
  - Drift: applied checksum differs → fails.
- Verification:
  - `pnpm test` (or repo test command) passes.

### T14. (Conditional, based on T5) Implement migration authoring DX
Choose one path based on `decision-migration-dx.md`:

- Path A — Nx generator
  - Files:
    - `tools/generators/localfirst-migration/**`
    - `tools/generators/localfirst-migration/schema.json`
    - `tools/generators/localfirst-migration/generator.ts`
  - Behavior:
    - Creates `packages/localfirst-db/src/infra/migrations/sql/<nextId>_<name>.sql`.
    - No DB access.
  - Tests:
    - Generator unit test (file created, naming correct).

- Path B — effect-qb CLI
  - Tasks:
    - Document how to generate SQL migration files into the correct folder.
    - Add a wrapper script/target if needed.
  - Tests:
    - Minimal: ensure script outputs correct filename (no DB).

- Path C — Hybrid
  - Implement Nx scaffolding + optional effect-qb CLI docs.

---

### T15. Implement worker message protocol types + codec
- Files:
  - `packages/localfirst-db/src/infra/worker/protocol.ts`
- Include:
  - `WorkerRequest/WorkerResponse/WorkerEvent` types.
- Verification:
  - Type-level compile and a small serialization test.

### T16. Implement worker entry + worker-side db engine wrapper
- Files:
  - `packages/localfirst-db/src/infra/worker/entry.ts`
  - `packages/localfirst-db/src/infra/worker/WorkerDb.ts`
- Behavior:
  - On `db/init`: open sqlite OPFS db, run migrations, mark ready.
  - On `db/query`: run query and return rows.
  - On `db/execute`: run write, emit `db/change` event.
  - On `db/close`: close db resources.
- Verification:
  - Minimal integration test that can run worker module in test environment if feasible; otherwise rely on manual verification in PR 5.

### T17. Implement `BroadcastInvalidation` bridge + stable tab id
- Files:
  - `packages/localfirst-db/src/infra/crosstab/tabId.ts`
  - `packages/localfirst-db/src/infra/crosstab/BroadcastInvalidation.ts`
- Behavior:
  - Channel name `os-copilot:localfirst-db:invalidate:v1`.
  - Ignore own-origin messages.
- Verification:
  - Unit test for loop prevention (pure function or mocked BroadcastChannel).

### T18. Implement `LocalDbLive` main-thread client layer (scoped)
- Files:
  - `packages/localfirst-db/src/infra/LocalDbLive.ts`
- Behavior:
  - Create worker, send init with migrations loaded.
  - Provide `LocalDb` implementation that RPCs to worker.
  - Merge same-tab change events (from worker) + cross-tab invalidations (BroadcastChannel) into `changes`.
  - Ensure `close` terminates worker and closes channel.
- Verification:
  - Manual smoke: app boots, initializes db once, can query.

### T19. Implement `ChangeBus` helper (in-process stream)
- Files:
  - `packages/localfirst-db/src/infra/realtime/ChangeBus.ts`
- Notes:
  - Small helper to publish and subscribe to `DbChangeEvent`.
- Verification:
  - Unit test: publish/subscribe order.

### T20. Wire `LocalDbLive` changes: write → local emit → broadcast → other tab receive
- Verification:
  - Manual: with two tabs open, verify Tab B receives changes (can log in UI temporarily).

### T21. Remove spike code replaced by real `LocalDbLive`
- Remove/cleanup:
  - `spike-*` modules/routes introduced in PR 1.
- Verification:
  - `pnpm run check` passes.

### T22. Add minimal docs: how LocalDbLive works (worker + OPFS)
- Files:
  - `packages/localfirst-db/README.md` (or `docs/` page)

---

### T23. Create `packages/notes` package skeleton with strict layering folders
- Files:
  - `packages/notes/src/{domain,application,infra,presentation}/**`
  - `packages/notes/src/index.ts`

### T24. Implement Notes domain model (ids + invariants)
- Files:
  - `packages/notes/src/domain/NoteId.ts`
  - `packages/notes/src/domain/Note.ts`
- Verification:
  - Unit tests for constructors/invariants.

### T25. Define Notes repository port (no LocalDb)
- Files:
  - `packages/notes/src/application/NotesRepository.ts`
- Include:
  - methods: `list`, `getById`, `create`, `update`, `remove`.

### T26. Implement NotesService use-cases (application layer)
- Files:
  - `packages/notes/src/application/NotesService.ts`
  - `packages/notes/src/application/NotesLive.ts`
- Verification:
  - Unit tests using a fake repository.

### T27. Implement Notes SQL schema migration(s)
- Files:
  - `packages/localfirst-db/src/infra/migrations/sql/0001_create_notes.sql` (or next id)
- Include:
  - `notes` table with columns needed for CRUD.
- Verification:
  - Migration runner tests include this migration.

### T28. Implement NotesRepositoryLocal adapter using `LocalDb`
- Files:
  - `packages/notes/src/infra/NotesRepositoryLocal.ts`
  - `packages/notes/src/infra/sql/notes.sql.ts` (raw SQL or qb-generated)
  - `packages/notes/src/infra/mapping.ts`
- Notes:
  - `execute` calls must declare `tablesTouched: ["notes"]`.
- Verification:
  - Integration tests using `LocalDbInMemory` + migrations.

### T29. (Conditional, based on `decision-effect-qb.md`) Adopt or remove `effect-qb`
- If adopted:
  - Keep usage strictly in `packages/notes/src/infra/sql/**`.
- If rejected:
  - Remove dependency and use explicit SQL strings.

### T30. Add NotesLive layer wiring (Local repo + LocalDb)
- Verification:
  - Compile-time: `NotesLive` depends on `LocalDb` but only from infra.

### T31. Add infra-level integration tests for repository SQL correctness
- Files:
  - `packages/notes/src/infra/NotesRepositoryLocal.test.ts`
- Cases:
  - CRUD roundtrip.
  - `tablesTouched` triggers change events (same-tab) when using `LocalDbInMemory`.

### T32. Ensure no unintended exports that leak infra
- Verification:
  - `packages/notes/src/index.ts` exports only app-needed surface (e.g., `NotesRoute`, `NotesLive`), not `NotesRepositoryLocal`.

### T33. Add README docs for Notes placeholder and layering rules
- Files:
  - `packages/notes/README.md`

---

### T34. Implement Notes presentation atoms (Effect Atom + Solid integration)
- Files:
  - `packages/notes/src/presentation/state/notesAtoms.ts`
  - `packages/notes/src/presentation/state/notesKeys.ts`
- Behavior:
  - list atom loads via `NotesService.list`.
  - command atoms for create/update/remove call `NotesService`.
- Verification:
  - Unit tests for atoms if feasible; otherwise component tests.

### T35. Implement Notes invalidation bridge (tablesTouched → atom refresh)
- Files:
  - `packages/notes/src/presentation/state/notesInvalidationBridge.ts`
- Behavior:
  - Subscribe to `LocalDb.changes` and refresh notes atoms when `tablesTouched` includes `notes`.

### T36. Build minimal Solid UI for Notes CRUD
- Files:
  - `packages/notes/src/presentation/ui/NotesRoute.tsx`
  - `packages/notes/src/presentation/ui/NotesList.tsx`
  - `packages/notes/src/presentation/ui/NoteEditor.tsx`
- Verification:
  - Manual: can create/list/edit/delete notes offline.

### T37. Wire composition root in `apps/web` (runtime + layers + routes)
- Files:
  - `apps/web/src/app/runtime/makeRuntime.ts`
  - `apps/web/src/app/runtime/AtomRuntimeProvider.tsx`
  - `apps/web/src/app/routes/NotesPage.tsx`
- Behavior:
  - Provide runtime with `LocalDbLive` + `NotesLive`.
  - Start invalidation bridge once.

### T38. Add boundary enforcement test/lint (no infra imports)
- Files (suggested):
  - `tools/tests/boundaries/localfirst-boundaries.test.ts` (vitest)
- Rules:
  - any file under `packages/**/domain/**`, `packages/**/application/**`, `packages/**/presentation/**` must not import:
    - `packages/localfirst-db/src/infra/**`
    - `@effect/sql-sqlite-wasm`
    - `effect-qb`
    - browser globals like `BroadcastChannel` or `Worker` (via explicit string match)
- Verification:
  - Intentionally add a bad import locally to see test fail; then remove.

### T39. Add manual verification doc (cross-tab + offline) and link from spec/proposal
- Files:
  - `openspec/changes/localfirst-infra-v1/verify.md`
- Include steps:
  - Offline mode (DevTools) CRUD.
  - Cross-tab: Tab A create/update/delete, Tab B auto-refresh.
  - Drift detection demo (optional): modify applied migration and observe boot fail.

### T40. Add basic e2e-ish smoke test (optional if infra allows)
- If test framework exists:
  - Add Playwright test for Notes CRUD offline.
- If not:
  - Document why manual verification is used.

### T41. Ensure `pnpm run check` and tests pass in CI
- Tasks:
  - Fix lint/format.
  - Ensure package graph builds.

### T42. Cleanup and “reversibility” audit
- Checklist:
  - `@effect/sql-sqlite-wasm` imports only under `packages/localfirst-db/src/infra/worker/**`.
  - `effect-qb` (if kept) imports only under `packages/notes/src/infra/sql/**`.
  - No `LocalDb` usage outside infra adapters.

### T43. Post-merge follow-up checklist (non-blocking)
- Consider adding a doc section describing future sync extension points (outbox/oplog) without implementing.
