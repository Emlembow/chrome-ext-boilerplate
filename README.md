# chrome-ext-boilerplate

Mike Lembo's personal Chrome extension boilerplate. A pnpm + Turbo monorepo with everything wired for fast iteration on a Manifest V3 extension that targets both Chrome and Firefox.

> Forked from [`Jonghakseo/chrome-extension-boilerplate-react-vite`](https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite) (MIT). Brought current to 2026 — see [What's different from upstream](#whats-different-from-upstream).

## Stack

| Layer            | Pinned to                                                                |
| ---------------- | ------------------------------------------------------------------------ |
| Runtime          | Node.js **24 LTS**, pnpm **10.x**                                        |
| Framework        | React **19.2** + react-dom 19.2                                          |
| Build            | Vite **8** (Rolldown bundler) with `@vitejs/plugin-react-swc`            |
| Styling          | Tailwind **v4** (CSS-first config) via `@tailwindcss/vite`               |
| Language         | TypeScript **6**                                                         |
| Lint / format    | ESLint **10** flat config + Prettier 3 + `prettier-plugin-tailwindcss`   |
| Monorepo runner  | Turbo **2.9** with watch + dependsOn                                     |
| Manifest         | Manifest V3, generated from `chrome-extension/manifest.ts`               |
| HMR              | Custom WebSocket-based reload server (`@extension/hmr`) for content + bg |
| E2E              | WebdriverIO 9 against an installed `.zip`                                |
| Storage helpers  | Reactive `chrome.storage` wrapper with `useSyncExternalStore`            |
| i18n             | `chrome.i18n` wrapper with build-time locale switching                   |

## Quick start

```bash
# 1. Clone
gh repo clone Emlembow/chrome-ext-boilerplate my-extension
cd my-extension

# 2. Use Node 24
nvm use            # reads .nvmrc

# 3. Install (pnpm 10 corepack-managed)
corepack enable
pnpm install

# 4. Develop with HMR
pnpm dev           # Chrome MV3 build, watching
pnpm dev:firefox   # Firefox MV3 build, watching

# 5. Production build + zip for store upload
pnpm zip
pnpm zip:firefox
```

Then load the unpacked extension from `dist/`:

- **Chrome**: `chrome://extensions` → Developer mode → Load unpacked → pick `dist/`.
- **Firefox**: `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → pick `dist/manifest.json`.

## Repo layout

```
chrome-extension/         MV3 background service worker, manifest generator
packages/
  dev-utils/              Shared dev helpers
  env/                    .env loader (uses @dotenvx/dotenvx)
  hmr/                    WebSocket HMR server + Vite plugins
  i18n/                   chrome.i18n wrapper, locale build step
  module-manager/         Interactive CLI for enabling/disabling features
  shared/                 Shared hooks (useStorage), error boundary, types
  storage/                Reactive chrome.storage facade
  tsconfig/               Shared tsconfig presets (base, app, module)
  ui/                     Component library + global.css (Tailwind entry)
  vite-config/            Shared Vite config + content-script entry helpers
  zipper/                 Builds the production .zip
pages/
  content/                Static content scripts
  content-runtime/        On-demand content scripts (programmatic injection)
  content-ui/             Shadow-DOM React UI injected into pages
  devtools/               DevTools page registration
  devtools-panel/         DevTools panel React app
  new-tab/                New-tab page React app
  options/                Options page React app
  popup/                  Browser-action popup React app
  side-panel/             chrome.sidePanel React app
tests/e2e/                WebdriverIO config + specs
.github/                  Actions, dependabot, PR + issue templates
```

## Common scripts

| Script                      | What it does                                                             |
| --------------------------- | ------------------------------------------------------------------------ |
| `pnpm dev`                  | Watch-build Chrome target, HMR via WebSocket                             |
| `pnpm dev:firefox`          | Watch-build Firefox target                                               |
| `pnpm build`                | One-shot production build to `dist/`                                     |
| `pnpm build:firefox`        | One-shot Firefox production build                                        |
| `pnpm zip` / `zip:firefox`  | Build + package `dist/` into a store-uploadable zip                      |
| `pnpm test`                 | Vitest unit tests across the workspace                                   |
| `pnpm e2e` / `e2e:firefox`  | Install zip → run WebdriverIO specs                                      |
| `pnpm lint` / `lint:fix`    | ESLint flat config across the workspace                                  |
| `pnpm format`               | Prettier with cached run                                                 |
| `pnpm type-check`           | `tsc --noEmit` per workspace                                             |
| `pnpm module-manager`       | Interactive feature toggler (turn off pages you don't need)              |
| `pnpm clean`                | Wipe `dist`, turbo cache, and node_modules                               |

## Adding a feature

The `module-manager` exists for exactly this — it lets you enable/disable any of the pages above with one command rather than ripping files out by hand:

```bash
pnpm module-manager
```

When you're starting from this boilerplate, run it first and disable everything you don't need. The selection is persisted to disk and the build pipeline obeys it.

## Environment variables

`.env` is auto-created from `.example.env` on `pnpm install`. Names must start with `CEB_` to be exposed to extension code; CLI/script-only vars use `CLI_CEB_`. To add one:

1. Add `CEB_FOO=` to `.example.env`.
2. Re-run `pnpm install` (or copy manually to `.env`).
3. Reference as `process.env.CEB_FOO` from anywhere in extension code (Vite injects it at build time via `define`).

To temporarily override on a single run:

```bash
CEB_FOO=bar pnpm dev
```

## Tailwind v4 notes

This boilerplate uses Tailwind v4's CSS-first config. There are no `tailwind.config.ts` files — configuration lives in `packages/ui/global.css` via `@theme` and `@source` directives. Adding more scan paths only requires editing that one CSS file.

## E2E tests — known limitation

`pnpm e2e` invokes WebdriverIO 9 against a freshly-built `dist-zip`. The harness works (browser launches, extension installs, smoke spec passes), but most extension-UI assertions are **flaky in headless Chrome** because MV3 extension UIs and `chrome://extensions/` shadow DOM access differ between headless and headed mode. Run with a desktop session for full coverage:

```bash
pnpm zip
pnpm e2e        # leave CEB_CI unset → uses headed Chrome
```

Setting `CEB_CI=true` switches Chrome to `--headless=new`; the smoke spec still passes there but content-UI assertions may not.

## What's different from upstream

This fork is brought current to April 2026 with breaking-version migrations:

- **Tailwind v3 → v4** (CSS-first config, `@tailwindcss/vite` plugin, no separate CLI step for content scripts)
- **Vite 6 → 8** (Rolldown bundler — `watch.chokidar` → `watch.buildDelay`)
- **TypeScript 5 → 6** (deprecated `baseUrl` + `downlevelIteration` removed; path mappings made explicit-relative)
- **ESLint 9 → 10** with flat config; `eslint-plugin-react-hooks` 5 → 7 (stricter ref rules)
- **Node 22 → 24 LTS**, pnpm pinned to 10.33+
- **React 19.1 → 19.2**, `@types/chrome` 0.0 → 0.1 (typed storage as `unknown`)
- Removed the `@extension/tailwindcss-config` package (made obsolete by CSS-first config)
- Wired up: husky + commitlint, lint-staged, Vitest, EditorConfig, VS Code workspace settings, CLAUDE.md

## Credits

Original boilerplate © Seo Jong Hak ([Jonghakseo](https://github.com/Jonghakseo)) — MIT.
This personal fork © Mike Lembo — MIT.
