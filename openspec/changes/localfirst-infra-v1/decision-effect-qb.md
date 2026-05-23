# Decision — effect-qb in V1 (SQLite)

## Status

Decided.

## Context

We planned to spike `effect-qb` beta 4 as a possible typed SQL builder for the
SQLite local-first stack.

Key constraints from the SDD:

- `effect-qb` must remain **reversible**.
- If adopted, it must stay confined to infra (`packages/**/infra/sql/**`).
- Tooling must not break the repo’s TypeScript toolchain (`tsgo`) or CI.

## Spike results

### SQLite rendering

Running the spike script:

- `tools/spikes/effect-qb-sqlite.mjs`

Produces SQLite-compatible SQL, e.g.:

```json
{
  "sql": "select \"notes\".\"id\" as \"id\", \"notes\".\"title\" as \"title\", \"notes\".\"body\" as \"body\" from \"notes\" order by \"notes\".\"id\" asc",
  "params": []
}
```

So: **dialect output looks OK for SQLite**.

### Toolchain compatibility

`effect-qb` publishes **TypeScript source files** as its `types` entrypoints
(e.g. `exports["./sqlite"].types = ./src/sqlite.ts`). Under `tsgo`, that means
those `.ts` files are typechecked as part of the consuming project.

We observed a `tsgo` typecheck failure coming from inside `effect-qb` sources
(`TS7030: Not all code paths return a value`), which blocks using `effect-qb`
from application TypeScript code.

### Migration CLI

We did not find a `bin` entry in `effect-qb`’s `package.json`; no migration CLI
is shipped by the package.

## Decision

**Do NOT adopt `effect-qb` as a runtime/TypeScript dependency in V1.**

- V1 will use **explicit SQL strings** inside infra adapters.
- We will use **Effect Schema/Model for types only** (decoding/validation), not
  for generating DDL or migrations in V1.
- `effect-qb` may be revisited later once its published types are consumable by
  `tsgo` (e.g. `.d.ts` output or fixed sources), or if we use it as a build-time
  codegen tool that does not participate in TS typecheck.

## Consequences

- Keep SQL in `packages/notes/src/infra/sql/*.ts` as strings.
- Keep `effect-qb` out of production package dependencies.
- If we want to keep experimenting, keep it under `tools/spikes/` only.

## Revisit triggers

- `effect-qb` releases generated `.d.ts` types (or fixes TS source issues) and
  can be imported without failing `tsgo`.
- We need query complexity where typed query planning clearly pays off.
