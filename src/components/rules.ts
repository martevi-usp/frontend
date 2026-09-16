/**
 * The rules of the game, as pure functions.
 *
 * These used to live inside the component, which meant the only way to check
 * any of them was to drive a browser. They are the parts most likely to be
 * got subtly wrong — a piece that locks when it shouldn't, a scatter that
 * buries half the pieces — so they belong somewhere a test can reach them
 * directly. No React, no DOM.
 */

import type { PieceSpec } from './geometry'

/** A piece's live position on the play surface. */
export interface Placement {
  x: number
  y: number
  /**
   * Quarter turns clockwise, **accumulated, not wrapped**. A piece turned
   * four times reads 4, not 0.
   *
   * This is rendered straight into `rotate(turns * 90deg)`, and that is the
   * whole reason it doesn't wrap: CSS interpolates between the two angles it
   * is given, so a counter that reset 3 → 0 sent the piece spinning three
   * quarters *backwards* on every fourth click. Accumulating keeps each
   * clockwise turn a forward quarter, forever. Use `orientationOf` when you
   * need the 0–3 orientation.
   */
  turns: number
  placed: boolean
  /** Bumped on pick-up so the dragged piece rides above the pile. */
  z: number
}

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/** Pointer travel under which a press counts as a click, not a drag. */
export const CLICK_SLOP = 5

/**
 * How close a piece must be dropped to its slot to take. Proportional to the
 * cell, with a floor so the hardest levels stay playable rather than
 * demanding pixel accuracy.
 */
export function snapDistance(cellW: number, cellH: number): number {
  return Math.max(16, Math.min(cellW, cellH) * 0.38)
}

/** Where a piece's box sits when correctly placed, in surface coordinates. */
export function homeOf(
  p: PieceSpec,
  board: { x: number; y: number },
  cellW: number,
  cellH: number,
  padX: number,
  padY: number,
): { x: number; y: number } {
  return {
    x: board.x + p.col * cellW - padX,
    y: board.y + p.row * cellH - padY,
  }
}

/**
 * Whether a piece should lock.
 *
 * Right place is not enough — it has to be the right way up too. That single
 * extra condition is the whole of what rotation adds to the game.
 */
export function locks(
  p: Pick<Placement, 'x' | 'y' | 'turns' | 'placed'>,
  home: { x: number; y: number },
  snap: number,
): boolean {
  if (p.placed || orientationOf(p.turns) !== 0) return false
  return Math.abs(p.x - home.x) < snap && Math.abs(p.y - home.y) < snap
}

/**
 * Lock a piece if it now qualifies, otherwise hand it back untouched.
 *
 * Called on drop *and* on turn, deliberately: whichever of the two
 * conditions is satisfied last is the one that completes the placement.
 * Testing only on drop stranded pieces that sat in the right slot, upright,
 * and refused to take.
 */
export function settle(
  p: Placement,
  home: { x: number; y: number },
  snap: number,
): Placement {
  return locks(p, home, snap) ? { ...p, ...home, placed: true, z: 0 } : p
}

/**
 * Which way up a piece is, 0–3, from its accumulated turn count.
 *
 * Only the game logic needs this. Rendering wants the raw count, so the
 * animation always sweeps the short way round in the direction turned.
 */
export function orientationOf(turns: number): number {
  return ((turns % 4) + 4) % 4
}

/**
 * How much of the available area the board should occupy, by piece count.
 *
 * A fixed fraction makes hard levels unreadable: at 99 pieces the cells come
 * out around 45px and you can't tell two of them apart. So the board grows
 * with the count — but slowly, and it stops well short of filling the
 * surface, because every piece it doesn't cover is scatter room the loose
 * pieces still need.
 */
export function boardFillFor(count: number): number {
  const t = Math.min(1, Math.max(0, (count - 12) / 88))
  return 0.52 + t * 0.26
}

export interface ScatterOptions {
  count: number
  surfaceW: number
  surfaceH: number
  board: Rect
  boxW: number
  boxH: number
  /** Rotation on: deal each piece at a random quarter turn. */
  spin: boolean
  rng: () => number
}

/**
 * Deal loose pieces around the board.
 *
 * Positions come from a shuffled tiling of the free margin rather than from
 * uniform random sampling. Uniform sampling looks fine when the board is
 * small, but the hard levels leave only two narrow side strips — and uniform
 * sampling in a narrow strip clumps badly, burying pieces under each other.
 *
 * The keep-out margin around the board is deliberately slim. At the hard
 * levels the bands above and below the board are a few pixels shorter than
 * one piece; a generous margin pushes every centre out of them, the bands go
 * unused, and every piece collapses into the sides.
 */
export function scatterPositions(o: ScatterOptions): Placement[] {
  // A quarter-turned piece swaps its width and height, so with rotation on
  // the footprint to reserve is the larger of the two either way. Without
  // this a turned piece near an edge gets clipped by the surface.
  const footW = o.spin ? Math.max(o.boxW, o.boxH) : o.boxW
  const footH = o.spin ? Math.max(o.boxW, o.boxH) : o.boxH

  const kx0 = o.board.x - footW * 0.15
  const ky0 = o.board.y - footH * 0.15
  const kx1 = o.board.x + o.board.w + footW * 0.15
  const ky1 = o.board.y + o.board.h + footH * 0.15

  const stepX = footW * 0.78
  const stepY = footH * 0.78
  const slots: Array<{ x: number; y: number }> = []
  for (let y = 0; y + footH <= o.surfaceH; y += stepY) {
    for (let x = 0; x + footW <= o.surfaceW; x += stepX) {
      const cx = x + footW / 2
      const cy = y + footH / 2
      if (cx > kx0 && cx < kx1 && cy > ky0 && cy < ky1) continue
      slots.push({ x, y })
    }
  }
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(o.rng() * (i + 1))
    ;[slots[i], slots[j]] = [slots[j], slots[i]]
  }

  // Slots are laid out on the footprint, but a piece is positioned by its own
  // box — offset it so a rotated piece sits centred in its slot.
  const insetX = (footW - o.boxW) / 2
  const insetY = (footH - o.boxH) / 2

  // Bounds are on the FOOTPRINT, not the box. Clamping the box to the
  // surface lets a turned piece overhang by the inset — invisible at nearly
  // square cells, but a wide strip of a piece once cells are oblong.
  const clamp = (v: number, inset: number, span: number, box: number) =>
    Math.max(inset, Math.min(span - box - inset, v))

  return Array.from({ length: o.count }, (_, i) => {
    const turns = o.spin ? Math.floor(o.rng() * 4) : 0
    if (!slots.length) return { x: 0, y: 0, turns, placed: false, z: 1 }
    // More pieces than slots (the punishing levels) means reusing some, with
    // a wider jitter so the doubled-up ones don't sit dead flush.
    const reused = i >= slots.length
    const slot = slots[i % slots.length]
    const spread = reused ? 0.42 : 0.18
    return {
      x: clamp(slot.x + insetX + (o.rng() - 0.5) * stepX * 2 * spread, insetX, o.surfaceW, o.boxW),
      y: clamp(slot.y + insetY + (o.rng() - 0.5) * stepY * 2 * spread, insetY, o.surfaceH, o.boxH),
      turns,
      placed: false,
      z: 1,
    }
  })
}
