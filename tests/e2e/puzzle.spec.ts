import { expect, test, type Page } from '@playwright/test'

/**
 * What a real pointer and a real layout can prove, and unit tests can't.
 *
 * The pure layers — how the picture is cut, what locks, where loose pieces
 * land — are covered by Vitest against `geometry.ts` and `rules.ts`. Here we
 * only check that the component actually wires them to the screen: that
 * pieces render as clipped shapes, that dragging and clicking reach the
 * right handlers, and that finishing opens the wall note.
 *
 * Every snippet below is written as a plain JS *expression*, because
 * `page.evaluate` given a string evaluates rather than calls it — hand it an
 * arrow function and you get the function object back, not its result.
 */

/** A piece is any div the component has clipped to an outline. DOM order is
 *  the pieces array order, which is row-major: index i is column i % cols,
 *  row floor(i / cols). */
const PIECES = `[...document.querySelectorAll('div')]
  .filter(d => getComputedStyle(d).clipPath.startsWith('path'))`

/** The board is the only wide absolutely-positioned box with a hairline. */
const BOARD_EL = `[...document.querySelectorAll('div')].find(d => {
  const s = getComputedStyle(d)
  return s.position === 'absolute' && s.borderTopWidth === '1px' && parseFloat(s.width) > 200
})`

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/** Placed pieces are the ones that dropped their drag shadow. */
const placedFlags = (page: Page) =>
  page.evaluate<boolean[]>(`(${PIECES}).map(el => getComputedStyle(el).filter === 'none')`)

/** Quarter turns, read off the composited matrix, normalised to 0–359. */
const angles = (page: Page) =>
  page.evaluate<number[]>(`(${PIECES}).map(el => {
    const m = new DOMMatrixReadOnly(getComputedStyle(el).transform)
    return ((Math.round(Math.atan2(m.b, m.a) * 180 / Math.PI / 90) * 90) % 360 + 360) % 360
  })`)

const boardRect = (page: Page) =>
  page.evaluate<Rect>(`(() => {
    const r = (${BOARD_EL}).getBoundingClientRect()
    return { x: r.x, y: r.y, w: r.width, h: r.height }
  })()`)

const boardBackground = (page: Page) =>
  page.evaluate<string>(`getComputedStyle(${BOARD_EL}).backgroundImage`)

/**
 * A point where this piece is the topmost element, so the press lands on it
 * rather than on whatever is stacked over it — pieces are dealt in a pile
 * and a centre can be covered.
 */
const grabPoint = (page: Page, i: number) =>
  page.evaluate<{ x: number; y: number }>(`(() => {
    const el = (${PIECES})[${i}]
    const b = el.getBoundingClientRect()
    const spots = [[.5,.5],[.35,.35],[.65,.65],[.5,.3],[.3,.5],[.7,.5]]
    for (const [fx, fy] of spots) {
      const x = b.x + b.width * fx, y = b.y + b.height * fy
      if (document.elementFromPoint(x, y) === el) return { x, y }
    }
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
  })()`)

/**
 * Let every running transition finish.
 *
 * Pieces ease into place and turn over a fraction of a second, so anything
 * read mid-flight is a partial value — a piece caught halfway through a
 * quarter turn measures about 45°, which rounds to whichever neighbour is
 * closer and makes the reading a coin toss.
 */
async function waitForAnimations(page: Page) {
  // Two frames first: a transition triggered by the click this call follows
  // has not been registered yet in the same tick, so asking immediately
  // whether anything is animating answers "no".
  await page.evaluate(`new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))`)
  await page.evaluate(
    `Promise.all(document.getAnimations().map(a => a.finished.catch(() => {}))).then(() => undefined)`,
  )
}

/**
 * Wait until the board has stopped moving.
 *
 * It animates over 700ms whenever the layout changes, so a rect read right
 * after a difficulty change is a mid-flight value — aim a drag at it and the
 * piece lands where the board *was*, and won't lock.
 */
async function waitForBoardSettled(page: Page) {
  await waitForAnimations(page)
  let prev = await boardRect(page)
  await expect
    .poll(async () => {
      const now = await boardRect(page)
      const still = Math.abs(now.w - prev.w) < 0.5 && Math.abs(now.x - prev.x) < 0.5
      prev = now
      return still
    })
    .toBe(true)
}

async function dragToCell(page: Page, i: number, grid: Grid) {
  const { cols, rows } = grid
  const board = await boardRect(page)
  const cw = board.w / cols
  const ch = board.h / rows
  const from = await grabPoint(page, i)
  await page.mouse.move(from.x, from.y)
  await page.mouse.down()
  await page.mouse.move(
    board.x + (i % cols) * cw + cw / 2,
    board.y + Math.floor(i / cols) * ch + ch / 2,
    { steps: 10 },
  )
  await page.mouse.up()
  await waitForAnimations(page)
}

/** Press and release without travelling, which turns a piece clockwise. */
async function clickPiece(page: Page, i: number) {
  const p = await grabPoint(page, i)
  await page.mouse.click(p.x, p.y)
  await waitForAnimations(page)
}

interface Grid {
  cols: number
  rows: number
  total: number
}

async function readGrid(page: Page): Promise<Grid> {
  const status = await page.getByText(/×.*peças/i).innerText()
  const m = status.match(/(\d+)\s*×\s*(\d+)\s*—\s*(\d+)/)!
  return { cols: Number(m[1]), rows: Number(m[2]), total: Number(m[3]) }
}

/**
 * Open a level and hand back the grid it actually produced.
 *
 * Tests take the grid from here rather than hard-coding one: the split is
 * fitted to the image's proportions, so "12 pieces" is 4×3 for this artwork
 * and something else for another. Hard-coding it silently mis-aimed every
 * drag when a click didn't land.
 *
 * Rotation is no longer a separate toggle — it's implied by the level
 * (off only on Fácil), so `opts.spin` just says whether to wait for turned
 * pieces to actually show up once the deal lands.
 */
async function openPuzzle(page: Page, level: string, opts: { spin?: boolean } = {}): Promise<Grid> {
  await page.goto('/')
  await expect(page.getByText(/no lugar/i)).toBeVisible()
  await page.getByRole('button', { name: new RegExp(`^${level}$`, 'i') }).click()

  await waitForBoardSettled(page)
  const grid = await readGrid(page)
  // The deal is complete when there is exactly one piece per cell.
  await expect.poll(async () => (await placedFlags(page)).length).toBe(grid.total)
  if (opts.spin) {
    await expect.poll(async () => (await angles(page)).some((a) => a !== 0)).toBe(true)
  }
  return grid
}

test.describe('the board', () => {
  test('renders one clipped piece per cell', async ({ page }) => {
    const { cols, rows, total } = await openPuzzle(page, 'FÁCIL')
    expect(cols * rows).toBe(total)
    expect((await placedFlags(page)).length).toBe(total)
  })

  test('reports the real grid, not the number the level asked for', async ({ page }) => {
    // 96 over a 4:3 image is 11 × 9 = 99. Showing "96" would be a lie.
    const { cols, rows, total } = await openPuzzle(page, 'PUNITIVO')
    expect(total).toBe(cols * rows)
    expect(total).toBeGreaterThan(90)
    expect((await placedFlags(page)).length).toBe(total)
  })

  /** The board grows with the piece count so hard levels stay legible. */
  test('grows the board for hard levels instead of shrinking the pieces', async ({ page }) => {
    const easyGrid = await openPuzzle(page, 'FÁCIL')
    const easy = await boardRect(page)

    await page.getByRole('button', { name: /^PUNITIVO$/i }).click()
    await waitForBoardSettled(page)
    const hardGrid = await readGrid(page)
    const hard = await boardRect(page)
    expect(hardGrid.total).toBeGreaterThan(easyGrid.total * 4)

    expect(hard.w).toBeGreaterThan(easy.w)
    // Cells must beat what they'd have been on a board that never grew.
    expect(hard.w / hardGrid.cols).toBeGreaterThan((easy.w / hardGrid.cols) * 1.2)
  })

  test('starts with no loose piece sitting on the board', async ({ page }) => {
    await openPuzzle(page, 'MÉDIO')
    const board = await boardRect(page)
    const onBoard = await page.evaluate<number>(`(() => {
      const b = ${JSON.stringify(board)}
      return (${PIECES}).filter(el => {
        const r = el.getBoundingClientRect()
        const cx = r.x + r.width / 2, cy = r.y + r.height / 2
        return cx > b.x && cx < b.x + b.w && cy > b.y && cy < b.y + b.h
      }).length
    })()`)
    expect(onBoard).toBe(0)
  })
})

test.describe('placing', () => {
  test('a piece dragged onto its slot locks there', async ({ page }) => {
    const grid = await openPuzzle(page, 'FÁCIL')
    expect((await placedFlags(page))[5]).toBe(false)
    await dragToCell(page, 5, grid)
    await expect.poll(async () => (await placedFlags(page))[5]).toBe(true)
    await expect(page.getByText(/1 de \d+ no lugar/i)).toBeVisible()
  })

  test('a piece dragged onto the wrong slot does not lock', async ({ page }) => {
    const grid = await openPuzzle(page, 'FÁCIL')
    const board = await boardRect(page)
    const cw = board.w / grid.cols
    const ch = board.h / grid.rows
    const from = await grabPoint(page, 0)
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    // Piece 0 belongs top-left; drop it bottom-right instead.
    await page.mouse.move(
      board.x + (grid.cols - 1) * cw + cw / 2,
      board.y + (grid.rows - 1) * ch + ch / 2,
      { steps: 10 },
    )
    await page.mouse.up()
    await waitForAnimations(page)
    expect((await placedFlags(page))[0]).toBe(false)
  })

  test('finishing the puzzle unlocks the wall note', async ({ page }) => {
    const grid = await openPuzzle(page, 'FÁCIL')
    await expect(page.getByText(/nota de parede/i)).toHaveCount(0)

    for (let round = 0; round < 6; round++) {
      const placed = await placedFlags(page)
      const todo = placed.flatMap((ok, i) => (ok ? [] : [i]))
      if (!todo.length) break
      for (const i of todo) await dragToCell(page, i, grid)
    }

    expect((await placedFlags(page)).every(Boolean)).toBe(true)
    await expect(page.getByText(/completo/i)).toBeVisible()
    await expect(page.getByText(/nota de parede/i)).toBeVisible()
    // The note is this artwork's own, not a generic congratulation.
    await expect(page.getByText(/praticamente esquecido/i).first()).toBeVisible()
  })
})

test.describe('rotation', () => {
  test('is off on Fácil, and deals turned pieces from Médio up', async ({ page }) => {
    await openPuzzle(page, 'FÁCIL')
    expect(new Set(await angles(page))).toEqual(new Set([0]))

    await page.getByRole('button', { name: /^MÉDIO$/i }).click()
    await waitForBoardSettled(page)
    await expect.poll(async () => new Set(await angles(page)).size).toBeGreaterThan(1)
    for (const a of await angles(page)) expect([0, 90, 180, 270]).toContain(a)
  })

  test('click turns clockwise, right-click turns back', async ({ page }) => {
    await openPuzzle(page, 'MÉDIO', { spin: true })
    const before = (await angles(page))[0]

    await clickPiece(page, 0)
    await expect.poll(async () => (await angles(page))[0]).toBe((before + 90) % 360)

    const p = await grabPoint(page, 0)
    await page.mouse.click(p.x, p.y, { button: 'right' })
    // Regression: pointerdown fires for secondary buttons too, so this used
    // to turn and immediately un-turn, leaving the piece where it started.
    await expect.poll(async () => (await angles(page))[0]).toBe(before)
  })

  test('a turned piece will not lock, even in exactly the right slot', async ({ page }) => {
    const grid = await openPuzzle(page, 'MÉDIO', { spin: true })
    const i = (await angles(page)).findIndex((a) => a !== 0)
    expect(i).toBeGreaterThanOrEqual(0)

    await dragToCell(page, i, grid)
    expect((await placedFlags(page))[i]).toBe(false)
  })

  /**
   * The turn must always sweep the same way round.
   *
   * `turns` accumulates rather than wrapping precisely so this holds: CSS
   * interpolates between the two angles it is handed, so a counter that
   * reset 3 → 0 animated 270deg → 0deg — three quarters *backwards*, on
   * every fourth click.
   */
  test('turning past the last quarter carries on forward instead of unwinding', async ({
    page,
  }) => {
    await openPuzzle(page, 'MÉDIO', { spin: true })

    // Walk a piece round to 270deg, so the next click is the one that wrapped.
    for (let t = 0; t < 4; t++) {
      if ((await angles(page))[0] === 270) break
      await clickPiece(page, 0)
    }
    expect((await angles(page))[0]).toBe(270)

    // Record the signed rotation every frame across the next click. atan2
    // reads 270deg as -90: a forward quarter sweeps -90 -> 0 and never leaves
    // that quadrant, while unwinding backwards passes through ±180.
    await page.evaluate(`(() => {
      const el = (${PIECES})[0]
      window.__spin = []
      const t0 = performance.now()
      const tick = () => {
        const m = new DOMMatrixReadOnly(getComputedStyle(el).transform)
        window.__spin.push(Math.atan2(m.b, m.a) * 180 / Math.PI)
        if (performance.now() - t0 < 900) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })()`)

    await clickPiece(page, 0)

    const path = await page.evaluate<number[]>('window.__spin')
    expect(path.length).toBeGreaterThan(4)
    expect(Math.max(...path.map(Math.abs))).toBeLessThanOrEqual(91)
    // Settled, 360deg is indistinguishable from 0 — which is the point.
    expect((await angles(page))[0]).toBe(0)
  })

  /**
   * The regression worth keeping. A piece can reach "in place AND upright"
   * by either order, and turning was the path that used to strand it:
   * visibly correct in its slot, refusing to take, fixable only by dragging
   * it out and back.
   */
  test('turning a piece upright while it sits in its slot locks it', async ({ page }) => {
    const grid = await openPuzzle(page, 'MÉDIO', { spin: true })
    const i = (await angles(page)).findIndex((a) => a !== 0)

    await dragToCell(page, i, grid)
    expect((await placedFlags(page))[i]).toBe(false)

    // Turn it upright without touching its position.
    for (let t = 0; t < 4; t++) {
      if ((await angles(page))[i] === 0) break
      await clickPiece(page, i)
    }

    expect((await angles(page))[i]).toBe(0)
    await expect.poll(async () => (await placedFlags(page))[i]).toBe(true)
  })
})

test.describe('peek', () => {
  test('shows the picture under the board only while it is on', async ({ page }) => {
    await openPuzzle(page, 'FÁCIL')
    expect(await boardBackground(page)).toBe('none')

    await page.getByRole('button', { name: /^ESPIAR$/i }).click()
    await expect.poll(() => boardBackground(page)).not.toBe('none')

    await page.getByRole('button', { name: /^ESCONDER$/i }).click()
    await expect.poll(() => boardBackground(page)).toBe('none')
  })
})
