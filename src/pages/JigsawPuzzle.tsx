import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Button,
  Divider,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'

import { artworkCatalog, DIFFICULTIES } from '../components/artworks'
import { buildPieces, makeRng, piecePadding, piecePath, solveGrid, type PieceSpec } from '../components/geometry'
import {
  boardFillFor,
  CLICK_SLOP,
  homeOf as homeFor,
  scatterPositions,
  settle as settlePiece,
  snapDistance,
  type Placement,
} from '../components/rules'

type ImageState =
  | { kind: 'loading' }
  | { kind: 'ready'; aspect: number }
  | { kind: 'error' }

/** Below this width the solved layout stacks instead of splitting. */
const SPLIT_AT = 900

export default function JigsawPuzzle() {
  const [artworkId, setArtworkId] = useState(artworkCatalog.defaultArtwork.id)
  const [target, setTarget] = useState(DIFFICULTIES[1].pieces)
  // Rotation is no longer a separate choice — it's on from Médio up, off only
  // on Fácil, so a beginner level stays simple and every harder one adds it.
  const spin = target > DIFFICULTIES[0].pieces
  const [seed, setSeed] = useState(1)
  const [peek, setPeek] = useState(false)
  const [image, setImage] = useState<ImageState>({ kind: 'loading' })
  const [surface, setSurface] = useState({ w: 0, h: 0 })
  const [placements, setPlacements] = useState<Placement[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const artwork = artworkCatalog.get(artworkId)

  // Measure the play surface — everything downstream is derived from this,
  // so the puzzle re-lays-out on resize rather than overflowing.
  const surfaceRef = useRef<HTMLDivElement | null>(null)
  useLayoutEffect(() => {
    const el = surfaceRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSurface({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /* Load the picture just to learn its real proportions — the grid is fitted
   * to the image so pieces come out roughly square rather than stretched. */
  useEffect(() => {
    setImage({ kind: 'loading' })
    const img = new Image()
    let live = true
    img.onload = () => {
      if (!live) return
      setImage({ kind: 'ready', aspect: img.naturalWidth / img.naturalHeight || 4 / 3 })
    }
    img.onerror = () => {
      if (live) setImage({ kind: 'error' })
    }
    img.src = artwork.src
    return () => {
      live = false
    }
  }, [artwork.src])

  const aspect = image.kind === 'ready' ? image.aspect : 4 / 3

  // Settled before anything else — "is it solved?" needs the piece count.
  const grid = useMemo(() => solveGrid(target, aspect), [target, aspect])
  const pieceCount = grid.cols * grid.rows

  const placedCount = placements.reduce((n, p) => n + (p.placed ? 1 : 0), 0)
  // Comparing against pieceCount rather than placements.length matters: on a
  // difficulty change the old placements linger for a frame, and without this
  // the finished layout would flash before the new scatter lands.
  const solved = pieceCount > 0 && placements.length === pieceCount && placedCount === pieceCount

  const wide = surface.w >= SPLIT_AT

  const layout = useMemo(() => {
    const { cols, rows } = grid

    // Unsolved, the board shares the surface with a pile of loose pieces.
    // Solved, there are no loose pieces left, so the picture takes the space
    // back — and yields the other half to the wall note.
    const area = solved
      ? wide
        ? { x: 0, y: 0, w: surface.w * 0.55, h: surface.h }
        : { x: 0, y: 0, w: surface.w, h: surface.h * 0.48 }
      : { x: 0, y: 0, w: surface.w, h: surface.h }

    const fill = solved ? 0.88 : boardFillFor(cols * rows)
    const boardW = Math.max(120, Math.min(area.w * fill, area.h * fill * aspect))
    const boardH = boardW / aspect

    const cellW = boardW / cols
    const cellH = boardH / rows
    const { padX, padY } = piecePadding(cellW, cellH)

    return {
      cols,
      rows,
      boardW,
      boardH,
      cellW,
      cellH,
      padX,
      padY,
      boardX: area.x + (area.w - boardW) / 2,
      boardY: area.y + (area.h - boardH) / 2,
      story: solved
        ? wide
          ? { x: surface.w * 0.55, y: 0, w: surface.w * 0.45, h: surface.h }
          : { x: 0, y: surface.h * 0.48, w: surface.w, h: surface.h * 0.52 }
        : null,
    }
  }, [grid, aspect, surface.w, surface.h, solved, wide])

  const pieces: PieceSpec[] = useMemo(
    () => buildPieces(grid.cols, grid.rows, makeRng(seed * 7919 + grid.cols * 31 + grid.rows)),
    [grid.cols, grid.rows, seed],
  )

  /* Outlines depend on cell size, so they're recomputed on resize but not
   * on every drag frame. */
  const paths = useMemo(
    () => pieces.map((p) => piecePath(p, layout.cellW, layout.cellH, layout.padX, layout.padY)),
    [pieces, layout.cellW, layout.cellH, layout.padX, layout.padY],
  )

  const homeOf = useCallback(
    (p: PieceSpec) =>
      homeFor(
        p,
        { x: layout.boardX, y: layout.boardY },
        layout.cellW,
        layout.cellH,
        layout.padX,
        layout.padY,
      ),
    [layout],
  )

  // Scatter: pieces start strewn around the board, never on top of it.
  const topZ = useRef(1)

  const scatter = useCallback(() => {
    if (!surface.w || !surface.h) return
    topZ.current = 1
    setPlacements(
      scatterPositions({
        count: pieces.length,
        surfaceW: surface.w,
        surfaceH: surface.h,
        board: { x: layout.boardX, y: layout.boardY, w: layout.boardW, h: layout.boardH },
        boxW: layout.cellW + layout.padX * 2,
        boxH: layout.cellH + layout.padY * 2,
        spin,
        rng: makeRng(seed * 104729 + 17),
      }),
    )
  }, [pieces.length, layout, surface.w, surface.h, seed, spin])

  /**
   * Scatter once per puzzle, and only once the surface has actually been
   * measured — on first paint it is still 0×0, and a scatter then would
   * pile every piece into the corner.
   *
   * Keyed on the puzzle's identity rather than on the layout object, so a
   * window resize repositions pieces (below) instead of dealing a new game
   * out from under whoever is playing.
   */
  const puzzleKey = `${artworkId}|${target}|${seed}|${spin}|${grid.cols}x${grid.rows}`
  const scatteredKey = useRef<string | null>(null)

  useEffect(() => {
    if (!surface.w || !surface.h) return
    if (scatteredKey.current === puzzleKey && placements.length === pieces.length) return
    scatteredKey.current = puzzleKey
    scatter()
  }, [puzzleKey, surface.w, surface.h, scatter, placements.length, pieces.length])

  /**
   * Placed pieces follow the board. This carries them through a window
   * resize, and it is also what animates the whole picture across the
   * surface at the moment the last piece lands and the note opens.
   *
   * Bails out when nothing actually moved, so it can't feed itself.
   */
  useEffect(() => {
    setPlacements((prev) => {
      if (prev.length !== pieces.length) return prev
      let moved = false
      const next = prev.map((pl, i) => {
        if (!pl.placed) return pl
        const home = homeOf(pieces[i])
        if (Math.abs(home.x - pl.x) < 0.5 && Math.abs(home.y - pl.y) < 0.5) return pl
        moved = true
        return { ...pl, ...home }
      })
      return moved ? next : prev
    })
  }, [homeOf, pieces])

  // Locking: see `settle()` in rules.ts for why it runs on both drop and turn.
  const snapDist = snapDistance(layout.cellW, layout.cellH)

  const settle = useCallback(
    (p: Placement, i: number): Placement => settlePiece(p, homeOf(pieces[i]), snapDist),
    [homeOf, pieces, snapDist],
  )

  const turn = useCallback(
    (index: number, dir: 1 | -1) => {
      setPlacements((prev) =>
        prev.map((p, i) =>
          i === index && !p.placed ? settle({ ...p, turns: p.turns + dir }, i) : p,
        ),
      )
    },
    [settle],
  )

  // Dragging: a press that never really moves is a turn, not a drag — see
  // CLICK_SLOP below.
  const drag = useRef<{ index: number; dx: number; dy: number; sx: number; sy: number } | null>(null)

  const onPointerDown = (index: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    const pl = placements[index]
    if (!pl || pl.placed) return
    // Primary button only. A right-click otherwise opened a drag that the
    // pointerup then read as a click-to-turn, undoing the counter-turn the
    // context menu had just applied — the piece never moved.
    if (e.button !== 0) return
    e.preventDefault()
    const rect = surfaceRef.current?.getBoundingClientRect()
    if (!rect) return
    drag.current = {
      index,
      dx: e.clientX - rect.left - pl.x,
      dy: e.clientY - rect.top - pl.y,
      sx: e.clientX,
      sy: e.clientY,
    }
    topZ.current += 1
    const z = topZ.current
    setDragIndex(index)
    setPlacements((prev) => prev.map((p, i) => (i === index ? { ...p, z } : p)))
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const rect = surfaceRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left - d.dx
    const y = e.clientY - rect.top - d.dy
    setPlacements((prev) => prev.map((p, i) => (i === d.index ? { ...p, x, y } : p)))
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    drag.current = null
    setDragIndex(null)

    const travelled = Math.hypot(e.clientX - d.sx, e.clientY - d.sy)
    if (spin && travelled < CLICK_SLOP) {
      turn(d.index, 1)
      return
    }

    setPlacements((prev) => prev.map((p, i) => (i === d.index ? settle(p, i) : p)))
  }

  // Render.
  const boxW = layout.cellW + layout.padX * 2
  const boxH = layout.cellH + layout.padY * 2
  const titleWords = artwork.title.split(' ')

  const toggleSx = {
    px: 1.75,
    fontSize: 9.5,
    letterSpacing: '.16em',
    borderColor: 'divider',
    '&.Mui-selected': {
      bgcolor: 'text.primary',
      color: 'background.default',
      '&:hover': { bgcolor: 'text.primary' },
    },
  } as const

  return (
    <Box
      sx={{ height: '100svh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}
    >
      {/* ── masthead ─────────────────────────────────────────────── */}
      <Box
        sx={{
          px: { xs: 2, md: 5 },
          pt: { xs: 2.5, md: 3.5 },
          pb: 1.75,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { md: 'flex-end' }, justifyContent: 'space-between' }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline">quebra-cabeça</Typography>
            <Typography variant="h3" sx={{ fontSize: 'clamp(26px, 4vw, 48px)', mt: 0.5 }}>
              {titleWords.slice(0, -1).join(' ')}{' '}
              <Box component="em" sx={{ fontStyle: 'italic', color: 'primary.main' }}>
                {titleWords.at(-1)}
              </Box>
            </Typography>
          </Box>

          <Stack direction="row" spacing={2.5} sx={{ flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Select
              size="small"
              value={artworkId}
              onChange={(e) => setArtworkId(e.target.value)}
              sx={{
                minWidth: 190,
                fontSize: 12,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
              }}
            >
              {artworkCatalog.list().map((a) => (
                <MenuItem key={a.id} value={a.id} sx={{ fontSize: 13 }}>
                  {a.title}
                </MenuItem>
              ))}
            </Select>

            <Box>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={target}
                onChange={(_, v) => v !== null && setTarget(v)}
              >
                {DIFFICULTIES.map((d) => (
                  <ToggleButton key={d.pieces} value={d.pieces} sx={toggleSx}>
                    {d.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ borderColor: 'divider', my: 0.5 }} />

            <Stack direction="row" spacing={1.25}>
              <Button variant="outlined" color="primary" onClick={() => setPeek((v) => !v)}>
                {peek ? 'Esconder' : 'Espiar'}
              </Button>
              <Button variant="contained" color="primary" onClick={() => setSeed((s) => s + 1)}>
                Embaralhar
              </Button>
            </Stack>
          </Stack>
        </Stack>

        {/* status line — the count is the REAL grid, not what was asked for */}
        <Stack direction="row" sx={{ mt: 1.5, justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="overline">
            {layout.cols} × {layout.rows} — {pieceCount} peças
            {spin && ' · arraste para mover, clique para girar'}
          </Typography>
          <Typography variant="overline" sx={{ color: solved ? 'primary.main' : undefined }}>
            {solved ? 'completo' : `${placedCount} de ${pieceCount} no lugar`}
          </Typography>
        </Stack>
      </Box>

      {/* ── play surface ─────────────────────────────────────────── */}
      <Box
        ref={surfaceRef}
        sx={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden', touchAction: 'none' }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {image.kind === 'error' && (
          <Stack sx={{ position: 'absolute', inset: 0, placeItems: 'center', justifyContent: 'center', px: 4 }}>
            <Typography variant="h5" sx={{ color: 'primary.main', textAlign: 'center' }}>
              A imagem não carregou
            </Typography>
            <Typography variant="body2" sx={{ mt: 1.5, maxWidth: '48ch', textAlign: 'center' }}>
              A URL desta obra não respondeu agora. Tente outra obra na lista ou verifique sua
              conexão — todas as entradas do acervo apontam para o Wikimedia Commons, sem
              alternativa local.
            </Typography>
          </Stack>
        )}

        {image.kind === 'loading' && (
          <Stack sx={{ position: 'absolute', inset: 0, placeItems: 'center', justifyContent: 'center' }}>
            <Typography variant="overline">carregando a obra…</Typography>
          </Stack>
        )}

        {image.kind === 'ready' && (
          <>
            {/* the board: a hairline rectangle, and the picture ghosted
                underneath only while "Espiar" is on */}
            <Box
              sx={{
                position: 'absolute',
                left: layout.boardX,
                top: layout.boardY,
                width: layout.boardW,
                height: layout.boardH,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'paper3',
                backgroundImage: peek ? `url("${artwork.src}")` : 'none',
                backgroundSize: '100% 100%',
                transition: (t) =>
                  t.transitions.create(['left', 'top', 'width', 'height'], { duration: 700 }),
                '&::after': peek
                  ? {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'background.default',
                      opacity: 0.82,
                    }
                  : undefined,
              }}
            />

            {pieces.map((p, i) => {
              const pl = placements[i]
              if (!pl) return null
              const held = dragIndex === i
              return (
                <Box
                  key={p.id}
                  onPointerDown={onPointerDown(i)}
                  onContextMenu={(e) => {
                    if (!spin || pl.placed) return
                    e.preventDefault()
                    turn(i, -1)
                  }}
                  sx={{
                    position: 'absolute',
                    width: boxW,
                    height: boxH,
                    left: 0,
                    top: 0,
                    transform: `translate3d(${pl.x}px, ${pl.y}px, 0) rotate(${pl.turns * 90}deg)`,
                    // The piece under the pointer must track it exactly, with
                    // no easing lag. Everything else eases — which is what
                    // gives a turn its quarter-circle swing, and carries the
                    // finished picture across when the wall note opens.
                    transition: held
                      ? 'none'
                      : `transform ${pl.placed ? 700 : 420}ms cubic-bezier(.66,0,.25,1)`,
                    zIndex: pl.placed ? 1 : 10 + pl.z,
                    cursor: pl.placed ? 'default' : 'grab',
                    touchAction: 'none',
                    backgroundImage: `url("${artwork.src}")`,
                    backgroundSize: `${layout.boardW}px ${layout.boardH}px`,
                    backgroundPosition: `${-p.col * layout.cellW + layout.padX}px ${
                      -p.row * layout.cellH + layout.padY
                    }px`,
                    backgroundRepeat: 'no-repeat',
                    clipPath: `path('${paths[i]}')`,
                    filter: pl.placed ? 'none' : 'drop-shadow(0 6px 10px rgba(23,19,14,.30))',
                    willChange: 'transform',
                    '&:active': { cursor: pl.placed ? 'default' : 'grabbing' },
                    '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                  }}
                />
              )
            })}

            {/* ── the reward: the wall note, unlocked by finishing ── */}
            {layout.story && (
              <Box
                sx={{
                  position: 'absolute',
                  left: layout.story.x,
                  top: layout.story.y,
                  width: layout.story.w,
                  height: layout.story.h,
                  zIndex: 30,
                  overflowY: 'auto',
                  px: { xs: 2.5, md: 4 },
                  py: { xs: 2.5, md: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  // Centring only where the note actually fits. Stacked, it
                  // is taller than its half of the surface, and centring
                  // overflowing content pushes the top of it out of the
                  // scrollable area — the eyebrow and lede become
                  // unreachable rather than merely off-screen.
                  justifyContent: wide ? 'center' : 'flex-start',
                  borderLeft: wide ? '1px solid' : 0,
                  borderTop: wide ? 0 : '1px solid',
                  borderColor: 'divider',
                  animation: 'notaEntra .9s cubic-bezier(.66,0,.25,1) both',
                  '@keyframes notaEntra': {
                    from: { opacity: 0, transform: wide ? 'translateX(14px)' : 'translateY(14px)' },
                    to: { opacity: 1, transform: 'none' },
                  },
                  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
                }}
              >
                <Box sx={{ maxWidth: '46ch' }}>
                  <Typography variant="overline" sx={{ color: 'primary.main' }}>
                    montado — nota de parede
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      mt: 1.5,
                      pb: 2.5,
                      mb: 2.5,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      fontSize: 'clamp(19px, 1.9vw, 26px)',
                      lineHeight: 1.24,
                    }}
                  >
                    {artwork.story.lede}
                  </Typography>

                  <Typography variant="body2" sx={{ lineHeight: 1.85 }}>
                    {artwork.story.body}
                  </Typography>

                  <Typography variant="caption" sx={{ display: 'block', mt: 3 }}>
                    {artwork.credit} · {artwork.movement}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.75 }}>
                    {artwork.rights}
                    {!artwork.verified && ' · registro não verificado'}
                  </Typography>
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  )
}
