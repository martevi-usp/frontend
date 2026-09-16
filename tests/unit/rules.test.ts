import { describe, expect, it } from 'vitest'

import { buildPieces, makeRng, piecePadding } from '../../src/components/geometry'
import {
  boardFillFor,
  homeOf,
  locks,
  orientationOf,
  scatterPositions,
  settle,
  snapDistance,
  type Placement,
} from '../../src/components/rules'

const loose = (over: Partial<Placement> = {}): Placement => ({
  x: 0,
  y: 0,
  turns: 0,
  placed: false,
  z: 1,
  ...over,
})

describe('snapDistance', () => {
  it('scales with the smaller cell dimension', () => {
    expect(snapDistance(200, 100)).toBeCloseTo(38)
  })

  it('keeps a floor so tiny cells do not demand pixel accuracy', () => {
    expect(snapDistance(10, 10)).toBe(16)
  })
})

describe('homeOf', () => {
  const { padX, padY } = piecePadding(100, 80)
  const pieces = buildPieces(4, 3, makeRng(1))
  const board = { x: 500, y: 200 }

  it('offsets by the padding so the CELL, not the box, lands on the grid', () => {
    const p = pieces[6] // col 2, row 1
    const h = homeOf(p, board, 100, 80, padX, padY)
    expect(h.x).toBeCloseTo(500 + 2 * 100 - padX)
    expect(h.y).toBeCloseTo(200 + 1 * 80 - padY)
  })

  it('places the piece box centre at the centre of its cell', () => {
    const p = pieces[6]
    const h = homeOf(p, board, 100, 80, padX, padY)
    const boxW = 100 + padX * 2
    const boxH = 80 + padY * 2
    expect(h.x + boxW / 2).toBeCloseTo(500 + 2 * 100 + 50)
    expect(h.y + boxH / 2).toBeCloseTo(200 + 1 * 80 + 40)
  })
})

describe('locks', () => {
  const home = { x: 300, y: 400 }
  const snap = 40

  it('locks a piece dropped near its slot', () => {
    expect(locks(loose({ x: 320, y: 380 }), home, snap)).toBe(true)
  })

  it('refuses a piece dropped short of the threshold', () => {
    expect(locks(loose({ x: 300 + snap, y: 400 }), home, snap)).toBe(false)
    expect(locks(loose({ x: 300, y: 400 + snap }), home, snap)).toBe(false)
  })

  /* The whole of what rotation adds to the game. */
  it('refuses a turned piece even in exactly the right place', () => {
    for (const turns of [1, 2, 3]) {
      expect(locks(loose({ ...home, turns }), home, snap)).toBe(false)
    }
    expect(locks(loose({ ...home, turns: 0 }), home, snap)).toBe(true)
  })

  it('reads orientation from the accumulated count, not the raw number', () => {
    // A piece turned the whole way round is upright again, however high the
    // counter has climbed.
    for (const turns of [4, 8, -4, 400]) {
      expect(locks(loose({ ...home, turns }), home, snap)).toBe(true)
    }
    for (const turns of [5, 6, 7, -1]) {
      expect(locks(loose({ ...home, turns }), home, snap)).toBe(false)
    }
  })

  it('leaves an already-placed piece alone', () => {
    expect(locks(loose({ ...home, placed: true }), home, snap)).toBe(false)
  })
})

describe('settle', () => {
  const home = { x: 300, y: 400 }
  const snap = 40

  it('snaps a locking piece flush to its slot', () => {
    const out = settle(loose({ x: 315, y: 390 }), home, snap)
    expect(out.placed).toBe(true)
    expect(out.x).toBe(home.x)
    expect(out.y).toBe(home.y)
    // Placed pieces drop under the loose pile.
    expect(out.z).toBe(0)
  })

  it('hands back a non-locking piece untouched', () => {
    const p = loose({ x: 1000, y: 20 })
    expect(settle(p, home, snap)).toBe(p)
  })

  /**
   * The regression that matters. A piece can arrive at "in place AND
   * upright" by either order of operations, and turning was the path that
   * used to leave it stranded: visibly correct in its slot and refusing to
   * take, fixable only by dragging it out and back.
   */
  it('locks a piece turned upright while already sitting in its slot', () => {
    const misturned = loose({ ...home, turns: 3 })
    expect(settle(misturned, home, snap).placed).toBe(false)

    const turned = { ...misturned, turns: misturned.turns + 1 }
    expect(orientationOf(turned.turns)).toBe(0)
    expect(settle(turned, home, snap).placed).toBe(true)
  })
})

describe('orientationOf', () => {
  it('wraps the accumulated count into 0–3', () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7].map(orientationOf)).toEqual([0, 1, 2, 3, 0, 1, 2, 3])
  })

  it('handles counting backwards without going negative', () => {
    expect([-1, -2, -3, -4, -5].map(orientationOf)).toEqual([3, 2, 1, 0, 3])
  })

  /**
   * The regression this whole representation exists for.
   *
   * `turns` is rendered straight into `rotate(turns * 90deg)`, and CSS
   * interpolates between the two angles it is handed. A counter that wrapped
   * 3 → 0 therefore animated 270deg → 0deg: three quarters *backwards*, on
   * every fourth click. Accumulating means the angle only ever moves one
   * quarter, in the direction turned.
   */
  it('keeps the rendered angle moving one quarter per turn, never unwinding', () => {
    let turns = 0
    const angles = [turns * 90]
    for (let i = 0; i < 8; i++) {
      turns += 1
      angles.push(turns * 90)
    }
    // Every step forward by exactly 90 — including across the wrap at 360.
    for (let i = 1; i < angles.length; i++) {
      expect(angles[i] - angles[i - 1]).toBe(90)
    }
    expect(angles).toContain(360)
    // And the orientation still cycles, so the game logic is unaffected.
    expect(angles.map((a) => orientationOf(a / 90))).toEqual([0, 1, 2, 3, 0, 1, 2, 3, 0])
  })
})

describe('boardFillFor', () => {
  it('grows the board with the piece count', () => {
    expect(boardFillFor(96)).toBeGreaterThan(boardFillFor(12))
  })

  it('is monotonic', () => {
    let prev = 0
    for (const n of [12, 24, 48, 60, 96, 150]) {
      const f = boardFillFor(n)
      expect(f).toBeGreaterThanOrEqual(prev)
      prev = f
    }
  })

  it('always leaves room for the loose pieces', () => {
    for (const n of [2, 12, 99, 500, 5000]) {
      expect(boardFillFor(n)).toBeGreaterThan(0.4)
      expect(boardFillFor(n)).toBeLessThan(0.8)
    }
  })
})

describe('scatterPositions', () => {
  const surfaceW = 1440
  const surfaceH = 770
  const board = { x: 333, y: 95, w: 774, h: 580 }
  const boxW = 105
  const boxH = 102

  const deal = (over: Partial<Parameters<typeof scatterPositions>[0]> = {}) =>
    scatterPositions({
      count: 99,
      surfaceW,
      surfaceH,
      board,
      boxW,
      boxH,
      spin: false,
      rng: makeRng(5),
      ...over,
    })

  it('deals one position per piece', () => {
    expect(deal({ count: 24 })).toHaveLength(24)
  })

  it('starts every piece loose and upright when rotation is off', () => {
    for (const p of deal()) {
      expect(p.placed).toBe(false)
      expect(p.turns).toBe(0)
    }
  })

  it('keeps every piece fully inside the surface', () => {
    for (const p of deal()) {
      expect(p.x).toBeGreaterThanOrEqual(0)
      expect(p.y).toBeGreaterThanOrEqual(0)
      expect(p.x + boxW).toBeLessThanOrEqual(surfaceW + 0.01)
      expect(p.y + boxH).toBeLessThanOrEqual(surfaceH + 0.01)
    }
  })

  /* An empty board is the thing to fill; a loose piece sitting on it reads
   * as already placed. */
  it('never centres a loose piece on the board', () => {
    for (const p of deal()) {
      const cx = p.x + boxW / 2
      const cy = p.y + boxH / 2
      const onBoard =
        cx > board.x && cx < board.x + board.w && cy > board.y && cy < board.y + board.h
      expect(onBoard).toBe(false)
    }
  })

  /**
   * The reason positions come from a shuffled tiling instead of uniform
   * random sampling: at the hard levels the free area is a couple of narrow
   * strips, and uniform sampling in a narrow strip clumps, burying pieces.
   * Measured as how many pieces have a near-duplicate position.
   */
  it('spreads pieces out instead of clumping them', () => {
    const ps = deal()
    let crowded = 0
    for (let i = 0; i < ps.length; i++) {
      for (let j = i + 1; j < ps.length; j++) {
        if (Math.abs(ps[i].x - ps[j].x) < boxW * 0.3 && Math.abs(ps[i].y - ps[j].y) < boxH * 0.3) {
          crowded++
          break
        }
      }
    }
    expect(crowded).toBeLessThan(ps.length * 0.35)
  })

  it('uses the bands above and below the board, not just the sides', () => {
    const ps = deal()
    const above = ps.filter((p) => p.y + boxH / 2 < board.y).length
    const below = ps.filter((p) => p.y + boxH / 2 > board.y + board.h).length
    expect(above).toBeGreaterThan(0)
    expect(below).toBeGreaterThan(0)
  })

  it('turns pieces only when rotation is on, and uses all four angles', () => {
    const spun = deal({ spin: true })
    expect(new Set(spun.map((p) => orientationOf(p.turns)))).toEqual(new Set([0, 1, 2, 3]))
  })

  it('deals within the first revolution, so nothing starts mid-spin', () => {
    for (const p of deal({ spin: true })) {
      expect(p.turns).toBeGreaterThanOrEqual(0)
      expect(p.turns).toBeLessThan(4)
    }
  })

  it('reserves the larger footprint when rotation is on, so a turned piece is not clipped', () => {
    const foot = Math.max(boxW, boxH)
    for (const p of deal({ spin: true })) {
      // A quarter-turned piece is centred on the same point but spans `foot`
      // in both axes.
      const cx = p.x + boxW / 2
      const cy = p.y + boxH / 2
      expect(cx - foot / 2).toBeGreaterThanOrEqual(-0.01)
      expect(cy - foot / 2).toBeGreaterThanOrEqual(-0.01)
      expect(cx + foot / 2).toBeLessThanOrEqual(surfaceW + 0.01)
      expect(cy + foot / 2).toBeLessThanOrEqual(surfaceH + 0.01)
    }
  })

  it('is deterministic for a given seed', () => {
    expect(deal()).toEqual(deal())
  })

  it('survives a surface too small to hold any slot', () => {
    const ps = scatterPositions({
      count: 12,
      surfaceW: 40,
      surfaceH: 40,
      board: { x: 0, y: 0, w: 40, h: 40 },
      boxW,
      boxH,
      spin: false,
      rng: makeRng(2),
    })
    expect(ps).toHaveLength(12)
    for (const p of ps) {
      expect(Number.isFinite(p.x)).toBe(true)
      expect(Number.isFinite(p.y)).toBe(true)
    }
  })
})
