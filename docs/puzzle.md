# Quebra-cabeça

A jigsaw over an artwork photo, with piece count as the difficulty dial.

```
src/components/geometry.ts    how the picture is cut: grid fitting, piece outlines
src/components/rules.ts       the rules of play: what locks, where loose pieces land
src/components/artworks.ts    the built-in collection (ArtworkCatalog) and the difficulty presets
src/pages/JigsawPuzzle.tsx    the screen — measurement, pointers, and wiring the above
```

`geometry.ts` and `rules.ts` are pure: no React, no DOM, no browser. That
split is what makes the parts most likely to be subtly wrong — a piece that
locks when it shouldn't, a scatter that buries half the pile — testable
without driving a browser. Keep new game logic out of the component.
`artworks.ts` is the one exception to "no classes" in this feature — see
ADR-0001's Consequences section for why a static collection with lookup
behavior is a different case from the game engine.

## How the cut works

Every interior edge gets one random orientation. The two pieces sharing it
read it with **opposite sign**, so a tab on one side is always a socket on
the other. The edge profile is deliberately symmetric about its midpoint —
that's what lets two pieces trace the same edge from opposite directions and
still produce the identical curve, with no gap and no overlap.

Outlines are applied with CSS `clip-path: path(...)` over a shared
`background-image`. No `<canvas>` anywhere, which means **cross-origin
artwork images work without CORS headers** — a canvas would taint and a
tainted canvas can't be read back. Keep it that way.

Two things that look like details but aren't:

- **The grid is fitted to the image's own aspect ratio**, so cells come out
  roughly square. 24 pieces over a 4:3 image is 6×4; over 16:9 it's 7×3 = 21.
  The header always shows `cols × rows` and the real total, never the number
  the user clicked.
- **A piece only snaps to its own home.** Dropping it in the right-looking
  but wrong slot does nothing. That's the game.

## Rotation

Rotation is bundled into the difficulty level rather than exposed as its own
control: off on Fácil, on from Médio up (`spin = target > DIFFICULTIES[0].pieces`
in `JigsawPuzzle.tsx`) — a beginner level stays simple, and every harder one
adds the extra axis automatically. On, each piece is dealt at a random
quarter turn, and `settle()` gains one condition: a piece must be upright as
well as in place.

Drag to move, **click to turn clockwise, right-click to turn back**. Both
gestures share one pointer: a press that travels less than `CLICK_SLOP` is
read as a click. That's what gives touch rotation without a second control.

`Placement.turns` **accumulates and never wraps** — a piece turned four
times reads 4, not 0. That is not an oversight to tidy up. The count is
rendered straight into `rotate(turns * 90deg)`, and CSS interpolates between
the two angles it is handed: a counter that reset 3 → 0 animated
270deg → 0deg, spinning the piece three quarters *backwards* on every fourth
click. Accumulating keeps every clockwise turn a forward quarter. Use
`orientationOf()` wherever the 0–3 orientation is what you actually need —
the locking rule does.

Three things this arrangement got wrong at first, all worth not
re-introducing:

- **Locking was tested only on drop.** So a piece already sitting in its
  slot, turned upright by clicking, stayed loose — visibly correct and
  refusing to take, fixable only by dragging it out and back. `settle()` now
  runs on turn as well as on drop; whichever condition is satisfied last is
  the one that locks it.
- **Right-click turned and un-turned.** `pointerdown` fires for secondary
  buttons too, so the context menu's counter-turn was immediately cancelled
  by the `pointerup` click-to-turn. `onPointerDown` now ignores
  `e.button !== 0`.
- **The fourth click unwound the piece.** The wrapping counter above. Both
  the unit suite and the browser suite guard it now — the browser test
  samples the rotation every frame through the wrap and asserts the sweep
  never leaves the quadrant it started in, which is what separates a forward
  quarter from the long way round.

Rotation also changes a piece's footprint — a quarter-turned piece is
`boxH` wide — so the scatter reserves `max(boxW, boxH)` in both axes while
it's on, or turned pieces near an edge get clipped by the surface.

## Board size vs. scatter room

These two pull against each other, and both are tuned in tandem.

`boardFillFor()` grows the board with the piece count — a fixed fraction
left the hard levels with ~45px cells you couldn't tell apart. But every
pixel the board takes is scatter room the loose pieces lose, so at 99 pieces
the free area is two side strips and two thin bands.

That is why the scatter **deals from a shuffled tiling** of the free area
rather than sampling positions at random: uniform sampling in a narrow strip
clumps, and clumped pieces bury each other. It's also why the board's
keep-out margin is deliberately small — a generous one pushes every centre
out of the top and bottom bands, which are only a few pixels shorter than a
piece, and all 99 pieces collapse into the sides.

Measured at 1440×900, 99 pieces: 86 of them sit directly grabbable (topmost
element at their own centre), against 59 before the tiling went in. If you
change the fill curve, re-measure — that number is the one that matters.

## Finishing

Solving swaps the layout: with no loose pieces left, the board takes back
the space it was sharing and the **wall note** opens beside it — the same
split the site's Detail screen uses, artwork holding still while you read.
Placed pieces carry a transition, so the whole picture glides across as the
note comes in. Narrow screens stack instead, board over note.

The note is the reward and is never shown before the puzzle is done. Its
text is served by the backend and fetched once the puzzle is solved
(`src/api/puzzles.ts`, frontend ADR-0005).

## Tests

```bash
npm test           # unit — geometry, rules, catalog, API client
```

**Unit (Vitest, `*.test.ts`).** Everything pure. The one that matters most
is `piecePath`'s interlock: it generates both neighbours' outlines, parses
the points back out, and asserts they trace the identical curve along the
edge they share. That invariant is the whole puzzle — break it and the
assembled picture shows gaps — and it holds only because the edge profile
is symmetric about its midpoint. Also covered: the cut's tab/socket
pairing, flat borders, deterministic seeding, and every rule in `rules.ts`
including the two rotation regressions below.

## Verified by hand, too

Geometry was checked by rendering all pieces at their home positions and
looking at the result. The wall-note unlock was checked on both the wide
and stacked layouts, at 390px as well as desktop width, and by solving a
puzzle end to end with rotation on.

## Before shipping: the collection

The catalog is served by the backend (`GET /puzzles`, backend ADR-0004);
`artworks.ts` holds only the types and the `ArtworkCatalog` wrapper. Each
entry carries a `verified` flag: whether the image URL has actually been
confirmed to resolve, checked against the Wikimedia Commons API (existence,
license, dimensions). The flag covers the whole entry, image and wall note
alike: the notes are checkable claims (dates, names, events) rather than
invented ones, but they still want a pass against each museum's own record.
An unverified entry says so in its own credit line.

Every entry points at Wikimedia via `Special:FilePath`, which resolves a
bare filename to the right thumbnail without reproducing their md5 path
layout — there is no local fallback image, so the puzzle needs network
access. The UI shows an explicit error state when an image fails to load
rather than a blank board.
