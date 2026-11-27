# Software test report — landing page

## Strategy

The landing work uses two automated test levels plus static/build checks:

| Level | Tool | Covered behavior |
|---|---|---|
| Unit | Vitest in Node | Initial controller state, immutable destination transition, and referential stability for a repeated selection. |
| Integration | Vitest + React server renderer + `MemoryRouter` + MUI `ThemeProvider` | Landing narrative and first museum caption render at `/`, carousel controls are present, all three destinations appear as links, and `/tarefa-do-daiki` renders its placeholder. |
| Static | TypeScript (`npm run typecheck`) | Production source, test source, and configuration types. |
| Build | Vite (`npm run build`) | The complete application compiles and emits a production bundle. |
| Lint | Oxlint (`npm run lint`) | Source lint rules; current output contains only warnings that predate this landing change in other modules. |

## Test locations and traceability

| Requirement | Evidence |
|---|---|
| The initial preview is the atrium | `landingController.test.ts`: “starts with the atrium preview selected” |
| Selecting another destination updates the preview state without mutation | `landingController.test.ts`: “selects a destination without mutating the previous state” |
| Re-selecting the active item avoids a needless state object | `landingController.test.ts`: “keeps the same state object...” |
| The old placeholder is replaced by the complete narrative | `landingRoutes.test.tsx`: “renders the complete landing narrative...” |
| Links reach the atrium, puzzle, and Daiki page | `landingRoutes.test.tsx`: “integrates the three requested destinations...” |
| The provisional page has its own route and content | `landingRoutes.test.tsx`: “renders the Daiki placeholder...” |
| The carousel uses the first museum from the atrium catalog and exposes its controls | `landingRoutes.test.tsx`: “renders the first museum from the atrium catalog and carousel controls” |

## Execution evidence

Execution date: 2026-11-27.

Command:

```text
npm test
```

Observed log:

```text
RUN  v4.1.11 frontend

Test Files  13 passed (13)
Tests       123 passed (123)
```

The totals include the complete frontend suite. The landing contribution is
two files and seven tests, with three unit tests and four integration tests.

A local Chromium check verified automatic rotation at about three seconds,
pause while a control has focus, previous and next navigation across the end
of the catalog, reduced-motion controls, and the heading layout at 390 px and
320 px.

Additional successful commands:

```text
npm run typecheck
npm run build
npm run lint
```

No percentage coverage report was generated; the required execution evidence
is the test log above. The report therefore does not claim a line or branch
coverage percentage.

## Out of scope

- real network calls and backend warm-up behavior, because the landing page
  contains no new data-fetching logic;
- the puzzle's own behavior, already covered by its existing tests;
- browser-level hover animation, CSS breakpoint layout, and screenshot
  comparison;
- cross-browser and assistive-technology acceptance testing;
- performance and load testing.

Those exclusions are deliberate. The unit tests target the only new decision
logic, while the integration tests target the new route/component boundary.
The local Chromium check is separate from the committed Vitest suite.

