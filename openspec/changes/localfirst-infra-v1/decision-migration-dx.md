# Decision — Migration authoring DX (V1)

## Status

Decided.

## Context

We needed to decide how developers create new SQL migration files under:

- `packages/localfirst-db/src/infra/migrations/sql/<ordered-id>_<name>.sql`

We considered:

1. Nx workspace generator
2. `effect-qb` migration CLI
3. Hybrid

Constraints:

- Migrations remain **explicit SQL**.
- Tooling must not add runtime deps to production packages.
- Tooling must not block CI/typecheck.
- We want deterministic, reviewable output.

## Findings

- `effect-qb` does not ship a `bin` / CLI in its published package.
- Additionally, importing `effect-qb` from TS code currently breaks `tsgo` due to
  typecheck errors inside `effect-qb`’s published TypeScript sources.

## Decision

Use an **Nx workspace generator** as the migration authoring DX for V1.

- Location: `tools/generators/localfirst-migration/`
- Behavior: create a new `.sql` file with next ordered id and normalized name.
- The generator does **not** apply migrations, connect to any DB, or infer schema
  diffs.

## Consequences

- We implement generator tests with `@nx/devkit/testing`.
- Migration runner continues to enforce checksum + drift detection at boot.

## Revisit triggers

- If a dedicated migration CLI appears (effect-qb or other) that is compatible
  with our toolchain and does not compromise reversibility, we can reconsider.
