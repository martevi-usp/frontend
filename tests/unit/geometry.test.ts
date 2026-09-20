import { describe, expect, it } from 'vitest'

import {
  buildPieces,
  makeRng,
  piecePadding,
  piecePath,
  solveGrid,
  TAB_REACH,
  type PieceSpec,
  type Tab,
} from '../../src/components/jigsaw/geometry'

/* ------------------------------------------------------------------ *
 * Helpers for reading a generated outline back.
 *
 * Every command piecePath emits (M, L, C, Z) carries nothing but point
 * pairs, so the flat number stream *is* the point sequence, in order.
 * ------------------------------------------------------------------ */
type Pt = [number, number]

function pathPoints(d: string): Pt[] {
  const nums = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number)
  const pts: Pt[] = []
  for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]])
  return pts
}

/** How many points a side contributes: one for a flat edge, fourteen for a
 *  tabbed one (the run-in, four cubics, the run-out). */
const sideLen = (tab: Tab) => (tab === 0 ? 1 : 14)

/**
 * The points of one side, including the corner it starts from, translated
 * into board coordinates. Sides are emitted clockwise from the top-left.
 */
function sidePoints(
  p: PieceSpec,
  side: 'top' | 'right' | 'bottom' | 'left',
  cellW: number,
  cellH: number,
  padX: number,
  padY: number,
): Pt[] {
  const pts = pathPoints(piecePath(p, cellW, cellH, padX, padY))
  const order = ['top', 'right', 'bottom', 'left'] as const
  let from = 0
  for (const s of order) {
    if (s === side) break
    from += sideLen(p[s])
  }
  const slice = pts.slice(from, from + sideLen(p[side]) + 1)
  const ox = p.col * cellW - padX
  const oy = p.row * cellH - padY
  return slice.map(([x, y]) => [x + ox, y + oy] as Pt)
}

function expectSameCurve(a: Pt[], b: Pt[]) {
  expect(a.length).toBe(b.length)
  a.forEach(([ax, ay], i) => {
    // piecePath rounds to 2dp, and the two pieces reach each point from
    // different corners, so allow a hair of slack rather than exact equality.
    expect(Math.abs(ax - b[i][0])).toBeLessThan(0.05)
    expect(Math.abs(ay - b[i][1])).toBeLessThan(0.05)
  })
}

/* ------------------------------------------------------------------ */

describe('makeRng', () => {
  it('is deterministic for a given seed', () => {
    const a = Array.from({ length: 20 }, makeRng(42))
    const b = Array.from({ length: 20 }, makeRng(42))
    expect(a).toEqual(b)
  })

  it('differs between seeds', () => {
    expect(makeRng(1)()).not.toBe(makeRng(2)())
  })

  it('stays in [0, 1)', () => {
    const rng = makeRng(7)
    for (let i = 0; i < 500; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('solveGrid', () => {
  it('fits the grid to the image so cells come out roughly square', () => {
    for (const aspect of [4 / 3, 16 / 9, 1, 2 / 3, 3 / 4]) {
      const { cols, rows } = solveGrid(48, aspect)
      // cell aspect = (W/cols) / (H/rows) = aspect * rows / cols
      const cellAspect = (aspect * rows) / cols
      expect(cellAspect).toBeGreaterThan(0.75)
      expect(cellAspect).toBeLessThan(1.35)
    }
  })

  it('lands near the requested count', () => {
    for (const target of [12, 24, 54, 96]) {
      const { cols, rows } = solveGrid(target, 4 / 3)
      expect(cols * rows).toBeGreaterThan(target * 0.7)
      expect(cols * rows).toBeLessThan(target * 1.3)
    }
  })

  it('never degenerates below a 2x2 grid', () => {
    for (const target of [0, 1, 2, 3, 4]) {
      const { cols, rows } = solveGrid(target, 4 / 3)
      expect(cols).toBeGreaterThanOrEqual(2)
      expect(rows).toBeGreaterThanOrEqual(2)
    }
  })

  it('is not thrown by an extreme aspect ratio', () => {
    const { cols, rows } = solveGrid(24, 8)
    expect(Number.isFinite(cols)).toBe(true)
    expect(Number.isFinite(rows)).toBe(true)
    expect(cols * rows).toBeGreaterThan(0)
  })
})

describe('buildPieces', () => {
  const cols = 6
  const rows = 4
  const pieces = buildPieces(cols, rows, makeRng(3))
  const at = (c: number, r: number) => pieces[r * cols + c]

  it('returns one piece per cell, in row-major order', () => {
    expect(pieces).toHaveLength(cols * rows)
    pieces.forEach((p, i) => {
      expect(p.id).toBe(i)
      expect(p.col).toBe(i % cols)
      expect(p.row).toBe(Math.floor(i / cols))
    })
  })

  it('leaves the outside of the picture flat', () => {
    for (let c = 0; c < cols; c++) {
      expect(at(c, 0).top).toBe(0)
      expect(at(c, rows - 1).bottom).toBe(0)
    }
    for (let r = 0; r < rows; r++) {
      expect(at(0, r).left).toBe(0)
      expect(at(cols - 1, r).right).toBe(0)
    }
  })

  it('gives every interior edge a tab on one side and a socket on the other', () => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (c < cols - 1) {
          expect(at(c, r).right).not.toBe(0)
          expect(at(c + 1, r).left).toBe(-at(c, r).right)
        }
        if (r < rows - 1) {
          expect(at(c, r).bottom).not.toBe(0)
          expect(at(c, r + 1).top).toBe(-at(c, r).bottom)
        }
      }
    }
  })

  it('is deterministic for a given seed', () => {
    expect(buildPieces(cols, rows, makeRng(3))).toEqual(pieces)
  })
})

describe('piecePath', () => {
  // Non-square cells on purpose: tab reach is a fraction of the edge it sits
  // on, so square cells would hide an axis mix-up.
  const cellW = 130
  const cellH = 96
  const { padX, padY } = piecePadding(cellW, cellH)
  const cols = 5
  const rows = 4
  const pieces = buildPieces(cols, rows, makeRng(11))
  const at = (c: number, r: number) => pieces[r * cols + c]

  it('closes the outline and starts from the box corner', () => {
    const d = piecePath(at(2, 2), cellW, cellH, padX, padY)
    expect(d.startsWith(`M ${padX} ${padY}`)).toBe(true)
    expect(d.trimEnd().endsWith('Z')).toBe(true)
    expect(d).not.toMatch(/NaN|Infinity/)
  })

  it('draws a flat border edge as a single straight line', () => {
    const topLeft = at(0, 0)
    const pts = pathPoints(piecePath(topLeft, cellW, cellH, padX, padY))
    // M + one point for the flat top + one for the flat left, plus the
    // tabbed right and bottom at fourteen each.
    expect(pts).toHaveLength(1 + 1 + 14 + 14 + 1)
  })

  /* The invariant the whole puzzle rests on. Two neighbours must trace the
   * identical curve along the edge they share — otherwise the assembled
   * picture shows gaps or overlaps. It holds because the edge profile is
   * symmetric about its midpoint, so traversing it backwards yields the
   * same points. */
  it('makes horizontal neighbours trace the same shared edge', () => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const right = sidePoints(at(c, r), 'right', cellW, cellH, padX, padY)
        const left = sidePoints(at(c + 1, r), 'left', cellW, cellH, padX, padY)
        expectSameCurve(right, [...left].reverse())
      }
    }
  })

  it('makes vertical neighbours trace the same shared edge', () => {
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols; c++) {
        const bottom = sidePoints(at(c, r), 'bottom', cellW, cellH, padX, padY)
        const top = sidePoints(at(c, r + 1), 'top', cellW, cellH, padX, padY)
        expectSameCurve([...bottom].reverse(), top)
      }
    }
  })

  it('keeps every point inside the padded box, so nothing is clipped', () => {
    const boxW = cellW + padX * 2
    const boxH = cellH + padY * 2
    for (const p of pieces) {
      for (const [x, y] of pathPoints(piecePath(p, cellW, cellH, padX, padY))) {
        expect(x).toBeGreaterThanOrEqual(-0.01)
        expect(y).toBeGreaterThanOrEqual(-0.01)
        expect(x).toBeLessThanOrEqual(boxW + 0.01)
        expect(y).toBeLessThanOrEqual(boxH + 0.01)
      }
    }
  })

  it('pushes a tab beyond the cell, not merely to its edge', () => {
    const tabbed = pieces.find((p) => p.right === 1)!
    const xs = pathPoints(piecePath(tabbed, cellW, cellH, padX, padY)).map(([x]) => x)
    // The right tab must stick out past the cell's right side.
    expect(Math.max(...xs)).toBeGreaterThan(padX + cellW + 1)
  })
})

describe('piecePadding', () => {
  it('crosses the axes: a horizontal tab reaches by the cell WIDTH', () => {
    const { padX, padY } = piecePadding(130, 96)
    expect(padY).toBeCloseTo(TAB_REACH * 130)
    expect(padX).toBeCloseTo(TAB_REACH * 96)
  })
})
