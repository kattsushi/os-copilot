---
name: repo-architecture-explorer
description: "Trigger: repos architecture exploration, reference repos, cloned repos. Extract reusable architecture patterns from repos/."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Activation Contract

Use this skill when exploring one or more reference repositories cloned under `repos/` to learn architecture, app structure, package boundaries, tooling, conventions, or reusable implementation patterns for `os-copilot`.

Do not use it for normal dependency lookup, broad web research, or editing cloned repositories.

## Hard Rules

- Treat `repos/` as read-only reference material.
- Never copy code blindly; extract patterns, tradeoffs, and constraints.
- Prefer concrete evidence: file paths, package names, config names, scripts, and dependency edges.
- Ignore generated, vendored, build, cache, and lockfile-heavy evidence unless it explains architecture.
- Keep findings applicable to this repo's `apps/` and `packages/` monorepo direction.

## Decision Gates

| Situation                       | Action                                                             |
| ------------------------------- | ------------------------------------------------------------------ |
| No repos exist under `repos/`   | Ask which repositories to clone or inspect.                        |
| Many repos exist                | Pick the smallest representative set and state selection criteria. |
| Pattern conflicts between repos | Report both, explain context, and recommend one for `os-copilot`.  |
| Security/license-sensitive code | Summarize architecture only; do not reproduce implementation.      |

## Execution Steps

1. List `repos/` and identify candidate repositories.
2. For each selected repo, inspect top-level docs, package manager files, workspace config, app/package layout, routing, testing, build, and deployment files.
3. Map architecture using concise bullets: boundaries, data flow, module ownership, extension points, and tooling.
4. Compare patterns against this repo's intended Nx + pnpm + `apps/` + `packages/` structure.
5. Recommend adopt/adapt/avoid decisions with file-path evidence.

## Output Contract

Return:

- Repositories inspected and why.
- Architecture patterns found, with evidence paths.
- Adopt/adapt/avoid recommendations for `os-copilot`.
- Risks, unknowns, and follow-up files to inspect.

## References

- `repos/` — local cloned reference repositories, ignored by git.
