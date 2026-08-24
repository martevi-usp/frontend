# martevi — frontend

React + TypeScript, scaffolded with Vite. Basic scaffolding only — no
routing, no screens yet.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Theme

`src/theme.ts` is the global MUI theme: the "paper and ink" design system
(seven colors, Instrument Serif + Inter, one easing curve) ported from the
`salas` prototype into `createTheme()`. It's wired up in `src/main.tsx`
alongside the self-hosted fonts (`@fontsource/instrument-serif`,
`@fontsource/inter`).

See `../STYLE.md` at the repo root for the full design system this theme
implements, and `../STEERING.md` for product rules. If a value in
`theme.ts` and a value in `STYLE.md` disagree, `STYLE.md` is the source of
truth — fix the theme, not the doc.

## Environment

Copy `.env.example` (at the martevi root) to `.env` and adjust as needed.
The only variable this app currently reads is:

```
VITE_API_URL   base URL of the backend, e.g. http://localhost:8000
```

## Docker

Three build targets — `dev` (vite dev server + HMR, meant to run against a
bind-mounted source tree), `build` (intermediate, produces `dist/`), and
`production` (nginx serving the static build, SPA fallback via
`nginx.conf`):

```bash
docker build --target dev        -t martevi-frontend:dev .
docker build --target production -t martevi-frontend:prod .
docker run --rm -p 8080:80 martevi-frontend:prod
```

Day-to-day, use `docker compose up` from the martevi root instead — it
builds this with the `dev` target and bind-mounts the source tree for HMR.

## CI

`.github/workflows/ci.yml` runs `oxlint`, the production build, and a
Docker build on every push/PR to `main`.

## Devops steering

See `../.claude/CLAUDE.md` at the martevi root for the shared devops
conventions (repo layout, ports, CI expectations) across all three martevi
repos, and `../STEERING.md` / `../STYLE.md` for product and design rules.
