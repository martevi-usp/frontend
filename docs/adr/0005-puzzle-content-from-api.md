# ADR-0005: Puzzle Catalog and Wall Notes Come from the Backend

**Status:** Proposed
**Date:** 2026-09-20
**Deciders:** martevi frontend owner(s)
**Amends:** ADR-0001 (adds one seam to `JigsawPuzzle.tsx`; the pure-function core is untouched)

## Context

The jigsaw's catalog — artwork, image URL, rights, movement, and the wall note (`story.lede` / `story.body`) — is hardcoded in `src/components/artworks.ts`. Backend ADR-0004 introduces read-only persistence for exactly this editorial content (`puzzle`, `puzzle_story`), and the course brief asks for persistence to be visible in the product. Keeping two sources of truth would defeat that.

ADR-0001 says game logic stays out of the component and records the puzzle as finished. The screen currently derives `solved` internally (`JigsawPuzzle.tsx`) and renders the note itself; there is no outward seam.

## Decision

- Replace the `artworks.ts` constants with a typed API client (`src/api/puzzles.ts`). `artworks.ts` keeps the `Artwork` and `Story` types and the `ArtworkCatalog` class, now built from what the API returns; the data itself lives in the backend seed, with the `verified`/`rights` provenance notes.
- `JigsawPuzzle.tsx` becomes a component that takes a `catalog` prop; a new `PuzzlePage.tsx` loads the catalog and shows loading, cold-start ("the server may be waking up") and retry states.
- The wall note is **fetched when the puzzle is solved**, from `GET /puzzles/{id}?progress_pct=100`, not shipped in the catalog. This is the only new behaviour inside the puzzle screen; `geometry.ts` and `rules.ts` are untouched.
- **Unlock scope: completion-only.** The note appears when the puzzle is solved, as today. Progressive unlock (`unlock_pct`) is supported by the backend schema but needs a progress hook and is deferred.

## Options Considered

- **Keep the catalog in the frontend** — no risk to the finished feature, but persistence stays invisible and content edits need a frontend deploy. Rejected by the team.
- **Ship the note with the catalog** — one fewer request, but the note would sit in the initial payload. Rejected in favour of fetching on solve: it still hides nothing meaningful without auth (the client reports its own progress), but it keeps the reward out of the catalog response.

## Consequences

- The puzzle now needs the backend to be up, and on a Render free tier, awake (backend ADR-0006): the page must show a loading state and tolerate a ~1 minute cold start. Previously only Wikimedia was required.
- Anyone can request the note early by passing `progress_pct=100` themselves; accepted, since it is editorial text, not a secret.
- A slow or failed note request shows a placeholder under the solved board rather than blocking the screen.
- Tests: unit tests of `geometry`/`rules` are unaffected; `ArtworkCatalog` and the API client are unit-tested with fixtures. The Playwright suite stubs the API with the same fixtures, but it is not currently run (it did not work in the local setup), so that stub is unverified.
- ADR-0001's "no modification" stance is relaxed for the data source only.
