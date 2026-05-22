# PRD: Mobile-first Solid UI package

Create `packages/ui` as a Solid + TypeScript component library for the Nx monorepo. The package must be mobile-first, Storybook-driven, Nx-cacheable, and strict ESM/tree-shakeable so apps and future slice libraries can reuse UI without pulling unnecessary components.

## Decision summary

| Topic            | Decision                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| Package path     | `packages/ui`                                                                                          |
| Runtime          | Solid + TypeScript                                                                                     |
| Build            | Vite library mode through Nx targets                                                                   |
| Component source | Zaidan via `shadcn` CLI when available; custom implementation only when unavailable                    |
| Reference repo   | `repos/arkitect-ui/packages/solid` for setup patterns and component inventory only; do not copy source |
| Stories location | `packages/ui/src/stories/ui/*`                                                                         |
| Styling baseline | Zaidan Vega style, neutral theme, Inter font, Tailwind CSS v4                                          |
| Export model     | Strict ESM, root barrel plus per-component subpath exports                                             |
| Performance bar  | Tree-shakeable component imports, externalized peers, cacheable Nx build/typecheck/storybook targets   |

## Goals

- Provide a reusable Solid UI library consumed from monorepo apps and future package slices.
- Install Zaidan-provided components with the `shadcn` CLI instead of hand-copying reference code.
- Match the current Arkitect Solid UI component inventory where practical.
- Keep every public component documented in Storybook under `src/stories/ui/*`.
- Guarantee strict ESM outputs with granular imports for tree-shaking.
- Make build, typecheck, lint, test, and Storybook targets cacheable through Nx.

## Non-goals

- Do not copy component source from `repos/arkitect-ui`.
- Do not create React components.
- Do not publish to npm in the first milestone.
- Do not build a docs site beyond Storybook.
- Do not implement custom versions of components already available from Zaidan unless a design/product gap is documented.

## Reference findings

`repos/arkitect-ui/packages/solid` is a useful reference for package shape:

- `project.json` defines Nx targets for Vite build, Vitest, lint, Storybook serve, and Storybook build.
- `vite.config.ts` uses Solid, declaration generation, library entry, and externalized runtime packages.
- `package.json` uses `type: "module"` and an `exports` map.
- `.storybook/main.ts` uses Storybook Solid + Vite integration.
- Components are flat in `src/components/ui`, with colocated stories in the reference. For this package, stories must move to `src/stories/ui/*`.

## Zaidan setup

Zaidan is a shadcn-compatible Solid registry, not a runtime npm UI package. The implementation must configure `components.json` for the Zaidan Kobalte registry and then install registry items with `pnpm dlx shadcn@latest add`.

Baseline design-system command:

```bash
pnpm dlx shadcn@latest add @zaidan/font-inter @zaidan/neutral @zaidan/style-vega
```

Expected registry config shape:

```json
{
  "style": "kobalte",
  "tsx": true,
  "tailwind": {
    "baseColor": "neutral"
  },
  "iconLibrary": "lucide",
  "registries": {
    "@zaidan": "https://zaidan.carere.dev/r/{style}/{name}.json"
  }
}
```

## shadcn monorepo routing

shadcn has explicit monorepo support: each workspace that runs the CLI needs its own `components.json`, and aliases decide where generated files land and how imports are rewritten. For this project, the app should keep a shadcn setup, but UI components installed from the app must route to `packages/ui`.

### App workspace contract

`apps/web/components.json` should point UI and shared utilities at the UI workspace package while keeping app-owned components local:

```json
{
  "style": "kobalte",
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "../../packages/ui/src/styles.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "#components",
    "ui": "@os-copilot/ui/components/ui",
    "lib": "#lib",
    "hooks": "#hooks",
    "utils": "@os-copilot/ui/lib/utils"
  },
  "registries": {
    "@zaidan": "https://zaidan.carere.dev/r/{style}/{name}.json"
  }
}
```

With this routing, running from the app should install UI primitives into `packages/ui` and rewrite app imports to the workspace package:

```bash
cd apps/web
pnpm dlx shadcn@latest add @zaidan/button
```

Expected app import:

```ts
import { Button } from "@os-copilot/ui/components/ui/button"
```

App-local blocks or non-UI components can still live under the app's `#components` alias.

### UI workspace contract

`packages/ui/components.json` should use package-local aliases so CLI commands run inside `packages/ui` generate files inside the package:

```json
{
  "style": "kobalte",
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "#components",
    "ui": "#components/ui",
    "lib": "#lib",
    "hooks": "#hooks",
    "utils": "#lib/utils"
  },
  "registries": {
    "@zaidan": "https://zaidan.carere.dev/r/{style}/{name}.json"
  }
}
```

The UI package must expose every path that an app-level `components.json` can reference. This means `package.json` needs source-level exports for CLI-time routing, plus build output exports for library consumption if those differ.

```json
{
  "name": "@os-copilot/ui",
  "type": "module",
  "imports": {
    "#components/*": "./src/components/*.tsx",
    "#lib/*": "./src/lib/*.ts",
    "#hooks/*": "./src/hooks/*.ts"
  },
  "exports": {
    "./styles.css": "./src/styles.css",
    "./components/*": "./src/components/*.tsx",
    "./lib/*": "./src/lib/*.ts",
    "./hooks/*": "./src/hooks/*.ts"
  }
}
```

Implementation must reconcile this shadcn source-export routing with the stricter build output export contract below. If publishing later becomes a goal, source exports should be replaced or complemented with `dist` exports without breaking app-level CLI installs.

## Component inventory and source plan

Components below are taken from `repos/arkitect-ui/packages/solid/src/components/ui/*` and classified against confirmed Zaidan Kobalte availability.

### Install from Zaidan

These must be installed through the shadcn CLI, then adapted only for local package boundaries, exports, stories, and mobile-first QA.

```bash
pnpm dlx shadcn@latest add \
  @zaidan/alert-dialog \
  @zaidan/avatar \
  @zaidan/badge \
  @zaidan/button \
  @zaidan/card \
  @zaidan/chart \
  @zaidan/checkbox \
  @zaidan/collapsible \
  @zaidan/combobox \
  @zaidan/dialog \
  @zaidan/dropdown-menu \
  @zaidan/empty \
  @zaidan/input \
  @zaidan/input-group \
  @zaidan/label \
  @zaidan/pagination \
  @zaidan/select \
  @zaidan/separator \
  @zaidan/sheet \
  @zaidan/sidebar \
  @zaidan/skeleton \
  @zaidan/table \
  @zaidan/textarea \
  @zaidan/tooltip
```

| Arkitect component | Zaidan CLI item         | Notes                                                  |
| ------------------ | ----------------------- | ------------------------------------------------------ |
| `alert-dialog`     | `@zaidan/alert-dialog`  | Install                                                |
| `avatar`           | `@zaidan/avatar`        | Install                                                |
| `badge`            | `@zaidan/badge`         | Install                                                |
| `button`           | `@zaidan/button`        | Install                                                |
| `card`             | `@zaidan/card`          | Install                                                |
| `chart`            | `@zaidan/chart`         | Install; validate chart peer dependencies              |
| `checkbox`         | `@zaidan/checkbox`      | Install                                                |
| `collapsible`      | `@zaidan/collapsible`   | Install                                                |
| `combobox`         | `@zaidan/combobox`      | Install                                                |
| `dialog`           | `@zaidan/dialog`        | Install                                                |
| `dropdown-menu`    | `@zaidan/dropdown-menu` | Install                                                |
| `empty`            | `@zaidan/empty`         | Install                                                |
| `input`            | `@zaidan/input`         | Install                                                |
| `input-group`      | `@zaidan/input-group`   | Install                                                |
| `label`            | `@zaidan/label`         | Install                                                |
| `pagination`       | `@zaidan/pagination`    | Install                                                |
| `select`           | `@zaidan/select`        | Install                                                |
| `separator`        | `@zaidan/separator`     | Install                                                |
| `sheet`            | `@zaidan/sheet`         | Install; mobile drawer behavior is critical            |
| `sidebar`          | `@zaidan/sidebar`       | Install; validate mobile collapsed/off-canvas behavior |
| `skeleton`         | `@zaidan/skeleton`      | Install                                                |
| `table`            | `@zaidan/table`         | Install; data-table remains custom                     |
| `textarea`         | `@zaidan/textarea`      | Install                                                |
| `tooltip`          | `@zaidan/tooltip`       | Install                                                |

### Implement custom in `packages/ui`

These were present in Arkitect but were not confirmed as Zaidan Kobalte components. Implement them from scratch for this project, with different structure and behavior where useful.

| Arkitect component   | PRD source        | Requirement                                                                                                                |
| -------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `center`             | Custom            | Layout primitive for centering content with responsive sizing props.                                                       |
| `copy-id-button`     | Custom            | Mobile-safe copy affordance with accessible feedback and no hard dependency on Arkitect behavior.                          |
| `data-table`         | Custom            | Composition over `@zaidan/table`; mobile-first stacked/card fallback for narrow screens.                                   |
| `data-table-filters` | Custom            | Filter primitives optimized for touch targets and collapsible mobile controls.                                             |
| `float`              | Custom            | Positioning/layout primitive; avoid hidden desktop assumptions.                                                            |
| `grid`               | Custom            | Responsive grid primitive with mobile-first defaults.                                                                      |
| `grid-pattern`       | Custom            | Decorative background primitive; ensure SSR-safe and low render cost.                                                      |
| `marquee`            | Custom            | Optional motion component respecting reduced-motion preferences.                                                           |
| `stack`              | Custom            | Layout primitive for vertical/horizontal spacing with responsive variants.                                                 |
| `toast`              | Custom or adapter | Zaidan has `@zaidan/sonner`, not `toast`; decide whether to expose a `toast` adapter over Sonner or implement a local API. |

## Package architecture

Proposed file shape:

```text
apps/web/
  components.json
packages/ui/
  components.json
  package.json
  project.json
  tsconfig.json
  tsconfig.lib.json
  vite.config.ts
  src/
    index.ts
    styles.css
    lib/
      cn.ts
    components/
      ui/
        button.tsx
        dialog.tsx
        ...
    stories/
      ui/
        button.stories.tsx
        dialog.stories.tsx
        ...
    testing/
      smoke-imports.test.ts
  .storybook/
    main.ts
    preview.ts
```

### Export contract

`packages/ui` must support both ergonomic and granular imports. The package name below is provisional until the workspace naming convention is confirmed.

```ts
import { Button } from "@os-copilot/ui"
import { Button } from "@os-copilot/ui/button"
import "@os-copilot/ui/styles.css"
```

Acceptance requirements:

- Package is `type: "module"`.
- Build output is ESM-only unless a later consumer requires CJS.
- `solid-js`, `solid-js/web`, Kobalte, Lucide, and other runtime framework libraries are externalized and modeled as peer dependencies where appropriate.
- Root barrel re-exports public components only; no Storybook/test/internal exports.
- Per-component subpath exports exist in `package.json`.
- shadcn monorepo exports also expose `./components/*`, `./lib/*`, `./hooks/*`, and `./styles.css` for CLI routing from the app workspace.
- Generated `.d.ts` files preserve root and subpath imports.
- `sideEffects` is restricted to CSS files, for example `["**/*.css"]`.

Example `exports` intent:

```json
{
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.js"
  },
  "./button": {
    "types": "./dist/components/ui/button.d.ts",
    "import": "./dist/components/ui/button.js"
  },
  "./styles.css": "./dist/styles.css"
}
```

## Storybook and Nx compatibility

- Use Storybook Solid + Vite through `storybook-solidjs-vite` unless Nx adds first-party Solid Storybook support before implementation.
- Install `@nx/storybook` at the same major/minor version as `nx` to avoid version mismatch issues.
- Add `@nx/storybook/plugin` to `nx.json` so Storybook tasks are inferred from project-level `.storybook` config files.
- Treat Nx's Storybook generator as partially compatible: current documented `uiFramework` choices do not include Solid, so `packages/ui/.storybook/*` may need manual setup or a generated baseline followed by Solid-specific replacement.
- Use project-level Storybook config for `packages/ui`; do not start with a root shared Storybook unless multiple packages later need composition.
- Use Storybook Vite `viteFinal` to merge Solid/Vite aliases, Nx path resolution, Tailwind v4 CSS processing, and package workspace exports.
- Stories live outside component source: `src/stories/ui/<component>.stories.tsx`.
- Every public component has at least one default mobile viewport story.
- Interactive components include keyboard and touch-oriented examples where relevant.
- Storybook must load `src/styles.css` and Zaidan theme tokens.
- Required Storybook targets:
  - `storybook`
  - `build-storybook`
  - `test-storybook` if interaction tests are enabled
- Prefer addons for docs and accessibility if dependency cost is acceptable.

## SSR and SPA compatibility

The UI package must work in both SSR and SPA consumers. Solid components should render deterministically on the server and hydrate cleanly in the browser.

Requirements:

- Components must not read `window`, `document`, `localStorage`, layout measurements, media queries, or element refs during initial render.
- Browser-only behavior must be isolated in `onMount`, event handlers, lazy imports, or explicit client-only wrappers in the consuming app.
- Initial signal values must not branch on `isServer` in a way that changes server HTML vs hydrated client HTML.
- Components that cannot be SSR-safe must be explicitly marked as client-only and excluded from the default SSR acceptance path.
- Random IDs, generated IDs, timestamps, and measurements must be stable between SSR and hydration or delegated to Solid/Kobalte primitives that guarantee stability.
- Overlay/portal components must document SSR expectations and avoid assuming `document.body` exists during server render.
- Custom components need SPA and SSR smoke stories/tests where practical: render-to-string or SSR fixture plus client mount/hydration fixture.

## CSS, shadcn, Zaidan, and tweakcn compatibility

The CSS layer must remain compatible with shadcn's Tailwind v4 theming model and with tweakcn-style theme editing.

Findings:

- shadcn Tailwind v4 themes are CSS-variable first: semantic variables live in `:root` and `.dark`, then `@theme inline` maps them to Tailwind utilities such as `bg-background`, `text-foreground`, `border-border`, and `ring-ring`.
- Zaidan uses the shadcn registry model: `registry:theme`, `registry:style`, `registry:font`, `cssVars`, `tailwind`, `css`, and registry dependencies. The selected Zaidan setup installs `@zaidan/font-inter`, `@zaidan/neutral`, and `@zaidan/style-vega` into the configured Tailwind CSS file.
- Vega is a shadcn visual style; Zaidan adapts that registry/style model for Solid/Kobalte.
- tweakcn targets shadcn-compatible theme variables and supports Tailwind v4, so this package should preserve standard variable names instead of inventing a parallel token system.

Requirements:

- `src/styles.css` is the single source of truth for shadcn/Zaidan/tweakcn theme variables.
- Keep `tailwind.cssVariables: true` in both app and UI `components.json` files.
- Keep Tailwind v4 `tailwind.config` empty in `components.json` unless the project later proves a config file is required.
- Preserve standard shadcn variable names: `--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--chart-*`, `--sidebar-*`, and `--radius`.
- Preserve `@theme inline` mappings for Tailwind utilities and radius derivations.
- Custom component CSS must consume semantic utilities or variables; do not hardcode one-off OKLCH values inside components unless the value is a documented design token.
- tweakcn-exported Tailwind v4 CSS should be pasteable into `src/styles.css` without changing component source.
- Zaidan CLI CSS changes must be reviewed after install because registry items may append CSS, imports, animations, or variables.

## Mobile-first requirements

- Default examples and component variants must assume narrow screens first.
- Touch targets should be at least 44px where the component is interactive.
- Overlays (`dialog`, `sheet`, `dropdown-menu`, `combobox`, `select`, `sidebar`) must be usable on mobile viewport sizes.
- Tables must not require horizontal scrolling as the only mobile strategy; `data-table` must provide a stacked/card alternative or explicit responsive mode.
- Motion components must respect `prefers-reduced-motion`.
- Components must support dark mode through tokens, not one-off component overrides.

## Nx targets and cache

`project.json` should expose cacheable targets compatible with root `nx.json` defaults:

- `build`: Vite library build.
- `typecheck`: TypeScript/tsgo typecheck for the library.
- `lint`: Ultracite-compatible lint/formatting path (Oxlint + Oxfmt).
- `test`: Vitest smoke/unit tests where applicable.
- `storybook`: local Storybook, using Nx's default inferred task name where possible.
- `build-storybook`: CI/cacheable static Storybook build.
- `test-storybook`: optional interaction/a11y checks if enabled.

Build inputs should include source, package config, Storybook config, Vite config, Tailwind/Zaidan config, and dependency lockfiles as appropriate.

## Acceptance criteria

### Package setup

- [ ] `packages/ui` exists and is included by `pnpm-workspace.yaml`.
- [ ] Nx recognizes `ui` as a project with build/typecheck/lint/test/storybook targets.
- [ ] `@nx/storybook` is installed at a version matching `nx` and `@nx/storybook/plugin` is configured if inferred tasks are used.
- [ ] `pnpm nx build ui` produces ESM JS and `.d.ts` output.
- [ ] `pnpm nx typecheck ui` passes.
- [ ] `pnpm nx build-storybook ui` passes.

### Zaidan and shadcn monorepo install path

- [ ] `apps/web/components.json` and `packages/ui/components.json` point to the Zaidan Kobalte registry.
- [ ] Both workspaces keep the same `style`, `iconLibrary`, and `baseColor`.
- [ ] App `components.json` routes `ui` to `@os-copilot/ui/components/ui` and `utils` to `@os-copilot/ui/lib/utils`.
- [ ] UI `components.json` uses package-local `#components`, `#lib`, and `#hooks` aliases.
- [ ] `packages/ui/package.json` exports the paths referenced by the app workspace aliases.
- [ ] Running `pnpm dlx shadcn@latest add @zaidan/button` from `apps/web` installs the UI component into `packages/ui` and rewrites imports to `@os-copilot/ui/components/ui/button`.
- [ ] Baseline design packages are installed with `pnpm dlx shadcn@latest add @zaidan/font-inter @zaidan/neutral @zaidan/style-vega`.
- [ ] Confirmed Zaidan components are installed through the CLI, not manually copied from Arkitect.
- [ ] CLI-generated files are normalized to the package's structure and export policy.

### Tree-shaking

- [ ] Root barrel import works.
- [ ] Per-component subpath imports work.
- [ ] A smoke test or fixture verifies importing one component does not require importing all components.
- [ ] Package metadata uses `sideEffects` narrowly for CSS only.
- [ ] Peer dependencies are externalized in Vite build.

### SSR and SPA

- [ ] Components render in a Solid SSR fixture without `window`/`document` errors.
- [ ] Components mount in a SPA fixture without hydration-only assumptions.
- [ ] Hydration smoke test covers at least one interactive component, one overlay component, and one custom layout component.
- [ ] Any client-only component is documented and not exported as SSR-safe by default.

### CSS and theming

- [ ] `src/styles.css` contains shadcn/Zaidan Tailwind v4 variables and `@theme inline` mappings.
- [ ] tweakcn Tailwind v4 theme output can replace or override the variables without component source changes.
- [ ] Custom components use semantic utilities/variables instead of hardcoded colors.
- [ ] Zaidan registry CSS changes are reviewed after CLI install.

### Storybook

- [ ] Stories live in `src/stories/ui/*`.
- [ ] Every public component has a story.
- [ ] Mobile viewport is the default review path.
- [ ] Storybook renders with Zaidan theme/style/font tokens.
- [ ] Storybook config uses `storybook-solidjs-vite` or a documented compatible Solid+Vite adapter.
- [ ] Storybook Vite config resolves workspace package exports and app/UI aliases.

### Custom components

- [ ] Custom components are implemented from scratch.
- [ ] Custom components have a clear reason for existing because Zaidan does not provide them.
- [ ] Custom components expose mobile-first stories and accessibility notes.
- [ ] `toast` decision is documented: Sonner adapter vs local toast implementation.

## Open questions

1. Should the package name be `@os-copilot/ui`, `@repo/ui`, or another workspace convention?
   R: @os-copilot/ui
2. Should `toast` become an adapter around `@zaidan/sonner`, or remain a custom component API?
   R: adapter from @zaidan/sonner
3. Should layout primitives (`center`, `stack`, `grid`, `float`) live in `components/ui` or a separate `src/layout/*` namespace with exported aliases?
   R: is ok live in components/ui
4. Should data-table depend on a table utility such as TanStack Table, or stay as a lightweight composition layer initially?
   R: yup Tanstack Table
5. Should Storybook include visual regression tooling in the first milestone or only static build verification?
   R: Yes
6. Should client-only exceptions be allowed in the core package, or should all exported components be SSR-safe by default?
   R: we need to take a look in this one because i dont understand well the quesion.
7. Should tweakcn be a documented workflow only, or should we add a fixture/theme import test for tweakcn-generated Tailwind v4 CSS?
   R: should add fixuter theme import test for.

## Suggested implementation milestones

1. **Scaffold package**: create `packages/ui`, Vite/Solid build, Nx targets, TypeScript config, package exports, styles entry.
2. **Configure Zaidan**: add `components.json`, Tailwind v4 styling path, baseline theme/font/style packages.
3. **Install Zaidan components**: add confirmed components with shadcn CLI and normalize exports.
4. **Storybook foundation**: configure `@nx/storybook` plus `storybook-solidjs-vite`, global styles, mobile viewport defaults, stories folder convention.
5. **CSS compatibility**: verify shadcn/Zaidan Tailwind v4 variables, `@theme inline`, dark mode, and tweakcn replacement workflow.
6. **Custom component batch**: implement missing Arkitect-equivalent components from scratch, prioritizing layout primitives and data-table.
7. **SSR/SPA verification**: add render/hydration smoke fixtures and mark any client-only exceptions.
8. **Tree-shaking verification**: add smoke fixture/tests for root and subpath imports, externalized peers, and CSS side effects.
