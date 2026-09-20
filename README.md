# martevi — frontend

React + TypeScript, scaffolded with Vite. No routing yet — `App.tsx` renders
the one feature that exists.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
npm test           # unit tests (Vitest)
```

## Layout

```text
config/   vite, vitest and tsc config — see below
tests/
  unit/   Vitest — pure logic, no DOM (e.g. tests/unit/geometry.test.ts)
src/      the app itself
```

Config lives in `config/` instead of the project root so the root only
holds what has to be there — `package.json`, `index.html`, the Dockerfile —
and someone opening the repo isn't greeted by nine dotfiles before they find
`src/`. `npm`'s scripts point `vite`/`vitest`/`oxlint` at their
config explicitly (e.g. `vite --config config/vite.config.ts`), so nothing
about running the app day to day changes — `npm run dev`, `npm test`, and
so on all still work exactly as listed above. The root `tsconfig.json` is
the one exception: it stays put (as a thin file that only references
`config/tsconfig.app.json` and `config/tsconfig.node.json`) so editors still
auto-discover it for IntelliSense/project detection.

Tests moved out of `src/` for the same reason: nothing under `src/` is a
test file, and `tsconfig.app.json`'s `include` no longer needs to carve
test files back out (see "Why the configs are split" below) — it just
doesn't see `tests/` at all.

## Why the configs are split

`vite.config.ts` is runtime-only and `vitest.config.ts` holds the test
config, because the dev server loads the Vite config — importing
`vitest/config` there makes `npm run dev` fail outright anywhere the test
packages aren't installed, which is every production image, any
`npm ci --omit=dev`, and any container built before the test tooling landed.

`config/tsconfig.app.json` only sees `src/` for the same reason: `npm run
build` runs `tsc -b`, and type-checking a test file drags in its imports.
Tests (`tests/unit/`) and the config files themselves are
type-checked by `config/tsconfig.test.json` instead — `npm run typecheck`
covers everything, and needs the dev dependencies.

## Theme

`src/theme.ts` is the global MUI theme: the "paper and ink" design system
(seven colors, Instrument Serif + Inter, one easing curve) ported from the
`salas` prototype into `createTheme()`. It's wired up in `src/main.tsx`
alongside the self-hosted fonts (`@fontsource/instrument-serif`,
`@fontsource/inter`).

## Deploy

Served as static assets from Cloudflare Workers (`wrangler.jsonc`). The API
URL is baked in at build time, so set it when you deploy — use the backend's
Cloud Run URL (see the backend's `deploy/cloud-run/README.md`):

```bash
npx wrangler login
VITE_API_URL=https://<your-backend>.run.app npm run deploy
```

`npm run deploy` stops if `VITE_API_URL` is unset, so a bundle can't ship
pointing at `localhost:8000`.

`npx wrangler deploy --dry-run` after a build checks the config without
uploading anything.

### Continuous deployment

`.github/workflows/deploy.yml` builds and deploys after frontend CI passes on
`main` (and on demand from the Actions tab). In this repository's GitHub
settings (Settings > Secrets and variables > Actions), create an environment
named `production` and set:

| Kind | Name | Value |
|---|---|---|
| Variable | `VITE_API_URL` | the backend's Cloud Run URL |
| Secret | `CLOUDFLARE_API_TOKEN` | an API token allowed to edit Workers |
| Secret | `CLOUDFLARE_ACCOUNT_ID` | your Cloudflare account id |

The workflow has not been run: it needs your Cloudflare account and GitHub
settings.
