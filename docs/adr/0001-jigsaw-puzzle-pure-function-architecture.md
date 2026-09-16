# ADR-0001: Jigsaw Puzzle — Pure Functions and Discriminated Unions Instead of a Class Hierarchy

**Status:** Accepted — documented retroactively; the feature is implemented, tested, and shipped
**Date:** 2026-08-26
**Deciders:** martevi frontend owner(s)

## Context

The jigsaw puzzle ("quebra-cabeça") cuts a chosen artwork photo into an interlocking grid of pieces and lets the visitor reassemble it; solving unlocks a wall note about the piece. Piece count is the primary difficulty dial (12/24/54/96, via `DIFFICULTIES`), and rotation ("Girar") is a second, independent axis: on, every piece deals face-down at a random quarter-turn and must be turned upright as well as moved home before it locks.

Two structural constraints shaped the design before any pattern question came up:

- **No `<canvas>`.** Artwork images come from museum providers (see backend ADR-0001) and Wikimedia, cross-origin, with no CORS headers guaranteed. A `<canvas>` drawn from a cross-origin image without CORS taints, and a tainted canvas can't be read back — ruling out any pixel-slicing approach. Pieces are cut with CSS `clip-path: path(...)` over a shared `background-image` instead.
- **The riskiest logic needs to be provably correct without a browser.** The whole game depends on one geometric invariant — two pieces sharing an edge must trace the *identical* curve from opposite directions, or the assembled picture shows a visible gap — plus several easy-to-get-wrong play rules (locking only on the right condition, a rotation counter that must never wrap, a scatter that doesn't bury pieces in a narrow margin). All of this is cheap to verify with a unit test and expensive to verify by driving a browser, provided none of it depends on React or the DOM.

The feature is four files, laid out like the rest of the app rather than
grouped under a feature folder: `src/components/geometry.ts`,
`src/components/rules.ts`, `src/components/artworks.ts`, and
`src/pages/JigsawPuzzle.tsx`.

## Decision

The first question this feature answers isn't "which GoF pattern" — it's **whether the game's model is a class hierarchy at all.** It isn't. `geometry.ts` and `rules.ts` are pure functions over plain data (`PieceSpec`, `Placement`, `Rect`); there is not one `class` in the feature. All mutable state lives in exactly one place — React state (`useState`/`useRef`) inside `JigsawPuzzle.tsx` — and every transformation of that state is a call to a pure function that takes the current data and returns new data.

**Why not classes.** Every piece of core logic — `solveGrid`, `buildPieces`, `piecePath`, `locks`, `settle`, `scatterPositions` — is a deterministic transformation: same input, same output, no identity to track. A class wrapping this (`Piece.lock()`, `Board.scatter()`) would carry the same data plus an object identity and a mutation surface the problem doesn't need — and mutable object identity is exactly what fights React's re-render model, which already expects state to be described as new immutable values each render. The seeded RNG (`makeRng`) is deterministic *because* nothing holds hidden mutable state beyond the one closed-over counter the function itself owns; a class version would have the same property for no added clarity.

**The hierarchy that does exist is a module and type hierarchy, not a class hierarchy:**

```
components/artworks.ts   (content — no dependencies)
components/geometry.ts   (shape — no dependencies)
     ↑
components/rules.ts      (play — depends on geometry.ts's PieceSpec type only)
     ↑
pages/JigsawPuzzle.tsx   (screen — depends on all three; the only file
                           touching React, the DOM, or a pointer event)
```

The dependency graph is a one-directional DAG. `geometry.ts` and `rules.ts` know nothing about React and nothing about each other's callers; `JigsawPuzzle.tsx` is the only file that imports both and the only place they're wired together. That boundary is what the feature's own README already states as a rule ("keep new game logic out of the component"), and it's what makes the invariant tests possible: `piecePath`'s interlock test calls `buildPieces` and `piecePath` directly and compares the outline strings — no component, no render, no browser.

## Where GoF patterns show up anyway

GoF patterns describe relationships between collaborators, not syntax — several are visible here in a functional idiom instead of a class one:

1. **State (behavioral).** `ImageState = {kind:'loading'} | {kind:'ready', aspect} | {kind:'error'}` is a State machine expressed as a TypeScript discriminated union and switched on in JSX, in place of a `State` interface with `Loading`/`Ready`/`Error` subclasses. `Placement.turns` plus `orientationOf(turns)` is a second, smaller State machine: what matters for the game is the piece's current orientation (0–3), derived on demand from an ever-accumulating counter — the accumulation itself is what fixed the "fourth click spins the piece three-quarters backward" bug documented in the README, playing the same role a State object's refusal to silently reset its internal count would.
2. **Strategy (behavioral).** `makeRng(seed): () => number` is a Strategy for randomness: `buildPieces` and `scatterPositions` depend only on the `() => number` shape, never on which generator produced the numbers. Swapping the algorithm (a different PRNG, a fixed test sequence) means passing a different function — the same effect as injecting a different Strategy object, with a function type standing in for the single-method interface.
3. **Builder (creational), loosely.** `buildPieces(cols, rows, rng)` assembles the `PieceSpec[]` in two ordered stages — random edge orientations first, then per-piece tab signs derived from the shared edges — the same directed, multi-step construction a Builder performs. It returns the finished array in one call rather than exposing incremental builder methods, because nothing here needs construction to pause partway.
4. **Facade (structural).** `JigsawPuzzle.tsx` is a Facade over `geometry` + `rules` + `artworks`: it is the only place that knows how to combine "solve the grid," "cut the pieces," "test a lock," and "scatter the pile" into a working screen. Nothing outside the component imports `geometry.ts` or `rules.ts` directly, and neither of those imports the component.
5. **Deliberately absent: Visitor, Composite, class-based Template Method.** Each presupposes a class hierarchy to visit, compose, or subclass. This feature has exactly one kind of puzzle and one kind of piece; building a hierarchy to support variation that doesn't exist would be the speculative generality the pure-function approach was chosen to avoid.

## Options Considered

### Option A: Pure functions + plain data (chosen)

| Dimension | Assessment |
|---|---|
| Complexity | Low — four small modules, no inheritance to reason about |
| Testability | High — `geometry.ts`/`rules.ts` are unit-tested directly, no DOM |
| Fit with React | High — matches hooks + derived state, the idiom the rest of the app uses |
| Team familiarity | High — no new dependency, no OOP ceremony |

**Pros:** the interlock invariant, the rotation-accumulation rule, and the scatter distribution are all provable with `npm test` in about a second; adding a rule means adding a function, not touching a hierarchy.
**Cons:** none specific to this feature's current scope — see Consequences for where this stops being free.

### Option B: Class-based game engine (`Puzzle`, `Board`, `Piece` classes; `Piece.lock()`, `Board.scatter()`)

| Dimension | Assessment |
|---|---|
| Complexity | Medium — instantiation, identity, and lifecycle on top of the same logic |
| Testability | Medium — still testable without a browser, but every test instantiates objects instead of calling functions on data |
| Fit with React | Low — object identity across renders needs explicit reconciliation (keys, refs, memoized instances) that plain data doesn't |
| Team familiarity | Medium — OOP-familiar to developers from other stacks, but not this codebase's established idiom (backend ADR-0001 *does* use classes, in Python, for the provider layer — a different runtime with different idiomatic defaults) |

**Pros:** would read as familiar to someone arriving from a class-based background.
**Cons:** adds a mutation and identity surface this problem doesn't need, and works against React's rendering model rather than with it.

### Option C: A finite-state-machine library (e.g. XState) modeling piece and puzzle state

**Pros:** powerful, visualizable state charts; would formalize the State pattern from the section above.
**Cons:** the actual state machine here is one condition (`locks`) checked at two call sites (drop, turn) — a real dependency to model something this small is premature; revisit only if the rule set grows meaningfully more complex (see Consequences).

## Trade-off Analysis

The two choices this ADR actually makes — no `<canvas>`, and functions over classes — reinforce each other more than they compete: CSS `clip-path` needs only a path string and a background position, both plain data a pure function can produce and a test can compare textually. A class-based `Piece` would still need to serialize down to the same string for rendering; the object layer would sit between the data and the DOM without changing what actually reaches it. The real trade-off is the one in Option B/C above — familiarity and formal state-machine tooling versus the cost of introducing either where the current rule set doesn't yet justify it.

## Consequences

- New game mechanics belong in `rules.ts` or `geometry.ts` as new pure functions operating on the existing types, not as new classes or methods.
- A second, differently-shaped minigame (a sliding-tile puzzle, say) should get its own `geometry.ts`/`rules.ts` pair rather than a shared `Puzzle` base class — until a second concrete variant exists, extracting a shared abstraction would be guessing at its shape.
- If the rule set grows enough that `locks`/`settle` stop being the only two transition points, revisit whether a small state-machine library (Option C) earns its cost — the discriminated-union approach scales exactly as far as "a handful of conditions checked in a couple of places," not further.
- Per the puzzle's own README, once a real backend exists (backend ADR-0001), `Artwork` in `artworks.ts` stops being a hand-written type and becomes a projection of the API's artwork model — a schema change, not an architecture change; nothing in this ADR's decision needs to move.
- `artworks.ts` does have one `class` (`ArtworkCatalog`), and that isn't a reversal of this ADR's decision. The "why not classes" argument above is specifically about `geometry.ts`/`rules.ts`: deterministic transformations over plain data, with all mutable state living in React. `artworks.ts` is different in kind — a static collection with real lookup behavior (`get`, a documented default) and no mutation at all — exactly the shape a class expresses plainly and a bag of exported functions wouldn't improve on. `geometry.ts`/`rules.ts` stay class-free; that boundary is what this bullet exists to keep clear.

## Action Items

1. [x] None blocking — this ADR documents an already-shipped feature.
2. [ ] Revisit Option C (state-machine library) only if/when a second rotation-like independent axis is added and the transition rules stop fitting in `locks`/`settle`.
3. [ ] If a second minigame is proposed, review this ADR before deciding whether any of `geometry.ts`/`rules.ts` should be shared — do not share preemptively.
