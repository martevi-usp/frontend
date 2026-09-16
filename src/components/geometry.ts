/**
 * Jigsaw geometry — grid solving and piece outlines.
 *
 * Shape only: how the picture is cut and what each piece looks like. The
 * rules of play — what locks, where loose pieces land — live in `rules.ts`.
 * Both are pure, with no React and no DOM, so both are unit-tested directly.
 */

/** -1 socket, 0 flat (board edge), +1 tab. Outward-positive. */
export type Tab = -1 | 0 | 1

export interface PieceSpec {
  id: number
  col: number
  row: number
  /** Outward-positive tab value per side. */
  top: Tab
  right: Tab
  bottom: Tab
  left: Tab
}

/**
 * How far a tab reaches, as a fraction of the edge it sits on. Also the
 * padding each piece box needs beyond its cell so the tab isn't clipped.
 */
export const TAB_REACH = 0.27

// Deterministic RNG — a given seed always produces the same cut, so a
// puzzle can be reproduced (and screenshotted) exactly.
export function makeRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Pick a column/row split whose cells are as square as possible for a given
 * image aspect ratio, landing near `target` pieces.
 *
 * The result is rarely exactly `target` — 24 pieces over a 4:3 image is
 * 6x4, but over a 16:9 image it's 7x3 (21). Callers should display
 * `cols * rows`, not the number the user asked for.
 */
export function solveGrid(target: number, aspect: number): { cols: number; rows: number } {
  const cols = Math.max(2, Math.round(Math.sqrt(target * aspect)))
  const rows = Math.max(2, Math.round(target / cols))
  return { cols, rows }
}

/**
 * Build the cut. Every interior edge gets one random orientation, and the
 * two pieces that share it read it with opposite sign — which is what makes
 * a tab on one side always meet a socket on the other.
 */
export function buildPieces(cols: number, rows: number, rng: () => number): PieceSpec[] {
  // vert[r][c] is the edge to the LEFT of piece (c, r), for c in 1..cols-1.
  // horz[r][c] is the edge ABOVE piece (c, r), for r in 1..rows-1.
  const vert: number[][] = []
  const horz: number[][] = []
  for (let r = 0; r < rows; r++) {
    vert[r] = []
    horz[r] = []
    for (let c = 0; c < cols; c++) {
      vert[r][c] = rng() < 0.5 ? -1 : 1
      horz[r][c] = rng() < 0.5 ? -1 : 1
    }
  }

  const pieces: PieceSpec[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      pieces.push({
        id: r * cols + c,
        col: c,
        row: r,
        // The lower/right piece of a shared edge negates it, so the two
        // outlines trace the identical curve in board space.
        top: (r === 0 ? 0 : -horz[r][c]) as Tab,
        bottom: (r === rows - 1 ? 0 : horz[r + 1][c]) as Tab,
        left: (c === 0 ? 0 : -vert[r][c]) as Tab,
        right: (c === cols - 1 ? 0 : vert[r][c + 1]) as Tab,
      })
    }
  }
  return pieces
}

/**
 * One edge of the outline, in normalised (u, v): u runs 0→1 along the edge,
 * v is the perpendicular deviation as a fraction of edge length.
 *
 * Deliberately symmetric about u = 0.5 — that's what lets two pieces trace
 * the same edge from opposite directions and still match exactly.
 */
const EDGE: ReadonlyArray<readonly [number, number, number, number, number, number]> = [
  [0.38, 0.06, 0.3, 0.09, 0.3, 0.14],
  [0.3, 0.22, 0.4, 0.26, 0.5, 0.26],
  [0.6, 0.26, 0.7, 0.22, 0.7, 0.14],
  [0.7, 0.09, 0.62, 0.06, 0.64, 0.0],
]
const EDGE_START = 0.36

/**
 * The piece outline as an SVG path string, in the piece box's own
 * coordinates (origin at the box's top-left, cell core inset by padX/padY).
 *
 * Sized for `clip-path: path(...)`, which takes raw CSS pixels relative to
 * the element's border box.
 */
export function piecePath(
  p: PieceSpec,
  cellW: number,
  cellH: number,
  padX: number,
  padY: number,
): string {
  const x0 = padX
  const y0 = padY
  const x1 = padX + cellW
  const y1 = padY + cellH

  const out: string[] = [`M ${x0} ${y0}`]

  // Each side: where it starts, the unit vector along it, the unit vector
  // pointing out of the piece, and how long it is. Traversed clockwise.
  const sides: Array<{
    sx: number; sy: number
    ax: number; ay: number
    nx: number; ny: number
    len: number
    tab: Tab
  }> = [
    { sx: x0, sy: y0, ax: 1, ay: 0, nx: 0, ny: -1, len: cellW, tab: p.top },
    { sx: x1, sy: y0, ax: 0, ay: 1, nx: 1, ny: 0, len: cellH, tab: p.right },
    { sx: x1, sy: y1, ax: -1, ay: 0, nx: 0, ny: 1, len: cellW, tab: p.bottom },
    { sx: x0, sy: y1, ax: 0, ay: -1, nx: -1, ny: 0, len: cellH, tab: p.left },
  ]

  for (const s of sides) {
    const at = (u: number, v: number): string => {
      const d = v * s.tab * s.len
      const x = s.sx + s.ax * u * s.len + s.nx * d
      const y = s.sy + s.ay * u * s.len + s.ny * d
      return `${x.toFixed(2)} ${y.toFixed(2)}`
    }

    if (s.tab === 0) {
      out.push(`L ${at(1, 0)}`)
      continue
    }

    out.push(`L ${at(EDGE_START, 0)}`)
    for (const [c1u, c1v, c2u, c2v, pu, pv] of EDGE) {
      out.push(`C ${at(c1u, c1v)}, ${at(c2u, c2v)}, ${at(pu, pv)}`)
    }
    out.push(`L ${at(1, 0)}`)
  }

  out.push('Z')
  return out.join(' ')
}

/** Padding a piece box needs around its cell so tabs are never clipped. */
export function piecePadding(cellW: number, cellH: number): { padX: number; padY: number } {
  // A tab on a horizontal edge reaches vertically by a fraction of that
  // edge's length (the cell width), and vice versa — so the axes cross.
  return { padX: TAB_REACH * cellH, padY: TAB_REACH * cellW }
}
