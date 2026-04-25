# CLAUDE.md

Guidance for Claude Code (and other AI assistants) working in this repo.

## What this is

A personal Chrome extension boilerplate (Manifest V3) maintained by Mike Lembo. It is a **pnpm + Turbo monorepo** designed to be cloned and pruned for new extensions.

When the user starts a new extension from this template, the first thing to do is run `pnpm module-manager` and let them disable any of the pages they don't need (popup / options / new-tab / side-panel / content / content-runtime / content-ui / devtools / devtools-panel).

## Stack pins

- Node.js 24 LTS (matches `.nvmrc`)
- pnpm 10.33+ (managed via corepack — `packageManager` field in root `package.json`)
- React 19.2, react-dom 19.2
- Vite 8 with **Rolldown** bundler (NOT Rollup — watcher options use `buildDelay`, not `chokidar`)
- TypeScript 6 (deprecates `baseUrl` and `downlevelIteration`; path mappings need explicit `./` prefix)
- ESLint 10 flat config (`eslint.config.ts`)
- Tailwind CSS v4 with **CSS-first config** — there are NO `tailwind.config.ts` files anywhere; theme + source paths live in `packages/ui/global.css` via `@theme` and `@source` directives
- `@tailwindcss/vite` plugin handles all CSS compilation, including for content scripts that import via `?inline`

## Layout cheat sheet

- `chrome-extension/` — the MV3 background service worker + `manifest.ts` (manifest is generated)
- `packages/*` — internal libraries (`@extension/<name>`); all are `private: true`
- `pages/*` — extension UI surfaces (each maps to a manifest entry)
- `tests/e2e/` — WebdriverIO suite that runs against the built `.zip`

## Build pipeline behaviors

- `pnpm build` runs `set-global-env` (env vars) → clean → `turbo build`
- Each page builds with Vite to `<repo>/dist/<page-name>/`
- Content scripts (`pages/content-ui`, `pages/content-runtime`) run their own `tsx build.mts` script that calls `vite.build()` per `matches/` subfolder. They import `./index.css?inline` so the Tailwind-compiled CSS gets inlined into the JS bundle (needed for shadow DOM injection).
- `chrome-extension/utils/plugins/make-manifest-plugin.ts` watches `manifest.ts` and regenerates `dist/manifest.json` after each build.

## Common pitfalls when editing

- **Tailwind class scans:** if you add new pages or component dirs that aren't already covered by `@source` paths in `packages/ui/global.css`, classes will be silently stripped. Add the path explicitly.
- **Path aliases:** TS 6 requires `paths` values to start with `./` — e.g. `"@src/*": ["./src/*"]`, not `["src/*"]`.
- **Side-effect CSS imports** (`import './foo.css'`): require `vite/client` in the tsconfig `types` array. Already wired in base; remember if you create a new tsconfig.
- **Storage API types:** `@types/chrome` 0.1+ types `chrome.storage[area].get(...)` values as `unknown`. Cast explicitly or update the deserializer's signature.
- **react-hooks plugin v7** flags any `ref.current` access during render as an error. The `useStorage` hook in `packages/shared/lib/hooks/use-storage.tsx` uses an intentional Suspense-style lazy-init ref — disable comments are already there.
- **Rolldown vs Rollup:** if you see options like `chokidar` in build watch config, that's Rollup syntax. Vite 8 uses Rolldown — its watcher options are `buildDelay`, `skipWrite`, `watcher`, `clearScreen`, etc.

## Working preferences

- Edit existing files; don't rewrite whole files unless necessary.
- Test changes with `pnpm build && pnpm type-check && pnpm lint` before declaring done.
- For UI changes, also load the unpacked extension in Chrome and verify visually — type-checks and tests don't catch visual regressions.
- Don't add backwards-compat shims unless asked; this is a personal boilerplate, breaking changes between commits are fine.
- Conventional Commits enforced via commitlint (`commit-msg` husky hook). `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`, `build:`, `perf:`, `style:`.
- Pre-commit runs `lint-staged` (prettier + eslint --fix on staged files).

## Commands you'll run frequently

```bash
pnpm install                # install (postinstall copies .example.env → .env)
pnpm dev                    # watch-build Chrome
pnpm build                  # production Chrome build
pnpm zip                    # build + zip for upload
pnpm type-check             # tsc --noEmit per workspace
pnpm lint / lint:fix        # ESLint flat config
pnpm format                 # Prettier
pnpm test                   # Vitest
pnpm e2e                    # WebdriverIO against built zip (Chrome)
pnpm module-manager         # toggle which pages are included
```
