import { Box, Typography } from '@mui/material'
import { useEffect, useId, useMemo, useState } from 'react'
import { makeRng } from '../jigsaw/geometry'
import { BackFigure, StandingViewer } from './figures'
import { Bench, BENCH_SEAT, Doorway, FramedWork, NeighborWork, Stanchions, WallLabel } from './furniture'
import { mix, ROOMS, TOKENS, type WallKey } from './palette'
import { Visitor } from './Visitors'
import {
  castActors,
  DOOR_HEIGHT_CM,
  DOOR_WIDTH_CM,
  furnishRoom,
  FLOOR_DEPTH_CM,
  formatCm,
  frameFor,
  hangCenterCm,
  outerSize,
  sceneView,
  stageFor,
  stationX,
  type PaintingSize,
} from './scene'

interface GalleryRoomProps {
  size: PaintingSize
  src: string | null
  title: string
  seed: number
  wall: WallKey
  showMeasures: boolean
  /** The wall label was clicked: show the catalogue entry. */
  onOpenInfo: () => void
  /** The work was clicked: zoom in from where it sits on screen. */
  onZoom: (from: DOMRect) => void
  /** Pulse the wall label until the visitor has found it once. */
  hintLabel: boolean
}

const VIEWER_HEIGHT = 170
/** Depths (cm in front of the wall) of the room's fixed occupants. */
const ROPE_DEPTH = 12
const VIEWER_DEPTH = 22
const BENCH_DEPTH = 34

function usePrefersReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

/**
 * The artwork hung in a museum room at true scale, with visitors, a bench and
 * (for large works) a rope line — so "92 × 73 cm" becomes something you can
 * see. 1 SVG user unit = 1 cm throughout; see scene.ts for the coordinates.
 */
export function GalleryRoom({
  size,
  src,
  title,
  seed,
  wall,
  showMeasures,
  onOpenInfo,
  onZoom,
  hintLabel,
}: GalleryRoomProps) {
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  const [viewport, setViewport] = useState({ w: 0, h: 0 })
  const reducedMotion = usePrefersReducedMotion()
  const animate = !reducedMotion
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const id = (name: string) => `${uid}-${name}`

  useEffect(() => {
    if (!host) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setViewport({ w: width, h: height })
    })
    ro.observe(host)
    return () => ro.disconnect()
  }, [host])

  const frame = useMemo(() => frameFor(size), [size])
  const outer = outerSize(size, frame)
  const center = hangCenterCm(outer.h)
  const view = sceneView(viewport, outer, center)
  const px = view.pxPerCm
  const room = ROOMS[wall]
  const cy = -center
  const top = cy - outer.h / 2
  const wallTop = view.y
  const left = view.x
  const right = view.x + view.w

  const cast = useMemo(() => castActors(seed), [seed])
  const [epoch] = useState(() => performance.now())
  const stage = stageFor(view, outer.w)

  // A phone-width room only has floor for a couple of visitors.
  const actors = (view.w < 450 ? cast.filter((a) => !a.key.startsWith('a2')) : cast)
    .map((spec) => {
      const leader = spec.follows ? cast.find((a) => a.key === spec.follows) : undefined
      return { spec, leader, station: stationX(leader ?? spec, stage) }
    })
    .filter((a): a is typeof a & { station: number } => a.station !== null)
    .sort((a, b) => a.spec.depth - b.spec.depth)

  // The rest of the room: a doorway into the next gallery, other works.
  const furnishing = furnishRoom(view.w, outer.w, seed)
  const roomNumber = 3 + (seed % 28)

  // Track lights: two fixtures on the ceiling track, each turned to face the
  // work, with its beam leaving the lens along that same axis.
  const trackY = wallTop + 30
  const lampSpread = Math.max(55, outer.w * 0.38)
  const lamps = [-lampSpread, lampSpread].map((lx) => {
    const pivot = { x: lx, y: trackY + 8 }
    // Each lamp lights its own half of the work, so the beams never cross.
    const target = { x: lx * 0.4, y: cy }
    const dx = target.x - pivot.x
    const dy = target.y - pivot.y
    const len = Math.hypot(dx, dy)
    const u = { x: dx / len, y: dy / len } // beam axis
    const n = { x: -u.y, y: u.x } // across the beam
    const lens = { x: pivot.x + u.x * 13, y: pivot.y + u.y * 13 }
    const reach = len - 13 + outer.h * 0.3
    const end = { x: lens.x + u.x * reach, y: lens.y + u.y * reach }
    const spreadHalf = Math.max(outer.w, outer.h) * 0.4 + 18
    const at = (p: { x: number; y: number }, k: number) => `${p.x + n.x * k},${p.y + n.y * k}`
    return {
      x: lx,
      deg: (Math.atan2(-dx, dy) * 180) / Math.PI,
      lens,
      end,
      beam: [at(lens, -3.6), at(lens, 3.6), at(end, spreadHalf), at(end, -spreadHalf)].join(' '),
    }
  })

  // Dust drifting in the light: a few motes inside each beam.
  const motes = lamps.flatMap((l, i) => {
    const rand = makeRng(seed + i * 7919)
    const dir = { x: l.end.x - l.lens.x, y: l.end.y - l.lens.y }
    const across = { x: -dir.y, y: dir.x }
    const acrossLen = Math.hypot(across.x, across.y)
    const spreadHalf = Math.max(outer.w, outer.h) * 0.4 + 18
    return Array.from({ length: 16 }, (_, k) => {
      const t = 0.25 + rand() * 0.6
      const off = (rand() - 0.5) * 1.4 * spreadHalf * t
      return {
        key: `${i}-${k}`,
        x: l.lens.x + dir.x * t + (across.x / acrossLen) * off,
        y: l.lens.y + dir.y * t + (across.y / acrossLen) * off,
        r: Math.max(0.6, (0.9 + rand() * 0.9) / px),
        drift: 5 + rand() * 12,
        dur: 10 + rand() * 12,
        begin: -rand() * 22,
        // a few catch the light and glint as they turn
        twinkle: rand() < 0.3 ? 3 + rand() * 4 : 0,
      }
    })
  })

  // The rope line comes out for big, important-looking pictures.
  const roped = outer.w >= 140 || outer.h >= 160
  const ropeHalf = outer.w / 2 + 26
  const ropeXs = roped ? (outer.w > 420 ? [-ropeHalf, 0, ropeHalf] : [-ropeHalf, ropeHalf]) : []

  // Nobody stands in front of the work: the standing visitor waits just past
  // the left edge of the frame, and the bench is set so its sitter is just
  // past the right edge.
  // Nobody stands in front of the work: the standing visitor waits just past
  // the left edge of the frame, and the bench is set so its sitter is just
  // past the right edge.
  const viewerX = -(outer.w / 2 + 30)
  const SITTER_ON_BENCH = 54
  const benchX = outer.w / 2 + 26 - SITTER_ON_BENCH

  // Floorboards radiate from a vanishing point at eye level, so the floor
  // reads as receding depth while the figures stay at true scale.
  const vpY = -150
  const boardSpacing = 16
  const boards: number[] = []
  for (let bx = Math.floor(left / boardSpacing) * boardSpacing; bx <= right; bx += boardSpacing) boards.push(bx)
  const spread = (bx: number) => bx + (bx * FLOOR_DEPTH_CM) / -vpY
  const seams = [6, 14, 25, 39, 56].filter((s) => s < FLOOR_DEPTH_CM)

  const k = room.shadeStrength
  const ann = room.annotation
  const approx = size.source === 'estimated' ? '≈ ' : ''
  const fs = 11 / px
  const sw = 1 / px
  const tick = 5 / px

  const label = `${title} — ${formatCm(size.widthCm)} × ${formatCm(size.heightCm)}, numa sala de museu em escala real, ao lado de visitantes de cerca de 1,70 m.`

  return (
    <Box ref={setHost} sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {viewport.w > 0 && (
        <svg
          width="100%"
          height="100%"
          viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
          preserveAspectRatio="xMidYMax slice"
          role="img"
          aria-label={label}
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id={id('wallShade')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={room.wallShade} stopOpacity={0.42 * k} />
              <stop offset="0.35" stopColor={room.wallShade} stopOpacity={0.06 * k} />
              <stop offset="0.85" stopColor={room.wallShade} stopOpacity={0} />
              <stop offset="1" stopColor={room.wallShade} stopOpacity={0.18 * k} />
            </linearGradient>
            <linearGradient id={id('wallSides')} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={room.wallShade} stopOpacity={0.3 * k} />
              <stop offset="0.22" stopColor={room.wallShade} stopOpacity={0} />
              <stop offset="0.78" stopColor={room.wallShade} stopOpacity={0} />
              <stop offset="1" stopColor={room.wallShade} stopOpacity={0.3 * k} />
            </linearGradient>
            <radialGradient id={id('pool')}>
              <stop offset="0" stopColor={room.lightPool} stopOpacity={room.lightPoolOpacity} />
              <stop offset="0.55" stopColor={room.lightPool} stopOpacity={room.lightPoolOpacity * 0.4} />
              <stop offset="1" stopColor={room.lightPool} stopOpacity={0} />
            </radialGradient>
            {lamps.map((l, i) => (
              <linearGradient
                key={l.x}
                id={id(`beam${i}`)}
                gradientUnits="userSpaceOnUse"
                x1={l.lens.x}
                y1={l.lens.y}
                x2={l.end.x}
                y2={l.end.y}
              >
                <stop offset="0" stopColor={room.lightPool} stopOpacity={0.24} />
                <stop offset="0.55" stopColor={room.lightPool} stopOpacity={0.08} />
                <stop offset="1" stopColor={room.lightPool} stopOpacity={0} />
              </linearGradient>
            ))}
            <linearGradient id={id('floor')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={room.floorFar} />
              <stop offset="1" stopColor={room.floor} />
            </linearGradient>
            <radialGradient id={id('sheen')} cx="0.5" cy="0.2" r="0.6">
              <stop offset="0" stopColor={room.floorSheen} stopOpacity={0.32} />
              <stop offset="1" stopColor={room.floorSheen} stopOpacity={0} />
            </radialGradient>
            <linearGradient id={id('floorFade')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#17130E" stopOpacity={0} />
              <stop offset="1" stopColor="#17130E" stopOpacity={0.32} />
            </linearGradient>
            <linearGradient id={id('varnish')} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.1} />
              <stop offset="0.4" stopColor="#FFFFFF" stopOpacity={0.02} />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
            </linearGradient>
            <filter id={id('drop')} x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow
                dx={0}
                dy={Math.max(1.6, outer.h * 0.012)}
                stdDeviation={Math.max(2, outer.h * 0.018)}
                floodColor="#17130E"
                floodOpacity={0.55}
              />
            </filter>
            <pattern id={id('damask')} width={36} height={52} patternUnits="userSpaceOnUse" x={0} y={-96}>
              <g fill="none" stroke={room.lightPool} strokeWidth={0.7} strokeLinecap="round">
                {[
                  [18, 0],
                  [0, 26],
                  [36, 26],
                ].map(([mx, my]) => (
                  <g key={`${mx}-${my}`} transform={`translate(${mx} ${my})`}>
                    <path d="M0 4 C6 11 6 17 0 21 C-6 17 -6 11 0 4 Z" />
                    <path d="M0 21 C7 22.5 10.5 27 8 32.5 C6.5 35.5 3 34.5 3.5 31.5 M0 21 C-7 22.5 -10.5 27 -8 32.5 C-6.5 35.5 -3 34.5 -3.5 31.5" />
                    <path d="M0 9.5 L0 16" />
                    <circle cx={0} cy={26} r={1.5} />
                    <path d="M-2.5 38 L0 42 L2.5 38" />
                  </g>
                ))}
              </g>
            </pattern>
            <clipPath id={id('floorClip')}>
              <rect x={left} y={0} width={view.w} height={FLOOR_DEPTH_CM} />
            </clipPath>
          </defs>

          {/* ── wall ─────────────────────────────────────────────── */}
          <rect
            x={left}
            y={wallTop}
            width={view.w}
            height={-wallTop}
            style={{ fill: room.wall, transition: 'fill .8s' }}
          />
          {room.damask && (
            <rect
              x={left}
              y={wallTop}
              width={view.w}
              height={-96 - wallTop}
              fill={`url(#${id('damask')})`}
              opacity={0.09}
            />
          )}
          {room.dado && (
            <g>
              <rect x={left} y={-92} width={view.w} height={92} fill={room.wallLow} />
              {Array.from({ length: Math.ceil(view.w / 130) + 2 }, (_, i) => {
                const px0 = Math.floor(left / 130) * 130 + i * 130 + 12
                return (
                  <rect
                    key={i}
                    x={px0}
                    y={-80}
                    width={106}
                    height={56}
                    fill="none"
                    stroke={room.baseboardEdge}
                    strokeWidth={0.9}
                    opacity={0.55}
                  />
                )
              })}
              <rect x={left} y={-96} width={view.w} height={5.5} fill={room.baseboard} />
              <line x1={left} y1={-96} x2={right} y2={-96} stroke={room.baseboardEdge} strokeWidth={0.8} />
            </g>
          )}
          <ellipse
            cx={0}
            cy={cy - outer.h * 0.05}
            rx={outer.w / 2 + 150}
            ry={outer.h / 2 + 130}
            fill={`url(#${id('pool')})`}
          />
          {lamps.map((l, i) => (
            <polygon key={l.x} points={l.beam} fill={`url(#${id(`beam${i}`)})`} />
          ))}
          {furnishing.neighbors.map((n, i) => (
            <NeighborWork key={i} x={n.x} cy={-hangCenterCm(n.h)} w={n.w} h={n.h} kind={n.kind} gid={id(`nb${i}`)} />
          ))}
          <rect x={left} y={wallTop} width={view.w} height={-wallTop} fill={`url(#${id('wallShade')})`} />
          <rect x={left} y={wallTop} width={view.w} height={-wallTop} fill={`url(#${id('wallSides')})`} />

          {/* ── ceiling cornice & track lights ───────────────────── */}
          <rect x={left} y={wallTop} width={view.w} height={16} fill={room.cornice} />
          <rect x={left} y={wallTop + 16} width={view.w} height={3} fill={room.corniceEdge} />
          {room.dado &&
            Array.from({ length: Math.ceil(view.w / 7) }, (_, i) => (
              <rect key={i} x={left + i * 7} y={wallTop + 19} width={3.6} height={3.6} fill={room.cornice} />
            ))}
          <rect x={left} y={trackY - 1} width={view.w} height={2} fill="#17130E" opacity={0.75} />
          {lamps.map((l) => (
            <g key={l.x} transform={`translate(${l.x} ${trackY})`} fill="#17130E">
              <rect x={-0.8} y={0} width={1.6} height={7} />
              <g transform={`translate(0 8) rotate(${l.deg})`}>
                <rect x={-4} y={-2} width={8} height={15} rx={1.5} />
                <ellipse cx={0} cy={13} rx={4} ry={1.3} fill={room.lightPool} opacity={0.9} />
              </g>
            </g>
          ))}

          <SecurityCamera
            x={(furnishing.doorway ? -furnishing.doorway.side : -1) * (view.w / 2 - 34)}
            y={wallTop + 19}
            px={px}
            animate={animate}
          />

          {/* ── baseboard & floor ────────────────────────────────── */}
          <rect x={left} y={-14} width={view.w} height={14} fill={room.baseboard} />
          <line x1={left} y1={-14} x2={right} y2={-14} stroke={room.baseboardEdge} strokeWidth={1} />
          {furnishing.doorway && (
            <Doorway
              x={furnishing.doorway.x}
              width={DOOR_WIDTH_CM}
              height={DOOR_HEIGHT_CM}
              beyond={mix(room.wall, TOKENS.INK, 0.35)}
              floor={mix(room.floor, TOKENS.INK, 0.35)}
              trim={room.baseboard}
              trimEdge={room.baseboardEdge}
              sign={`SALA ${roomNumber}`}
              signColor={ann}
              px={px}
              gid={id('door')}
              animate={animate}
              passerColor={mix(room.figures[0], mix(room.wall, TOKENS.INK, 0.35), 0.3)}
              glow={room.lightPool}
            />
          )}
          <rect x={left} y={0} width={view.w} height={FLOOR_DEPTH_CM} fill={`url(#${id('floor')})`} />
          <g clipPath={`url(#${id('floorClip')})`} stroke={room.floorLine} strokeWidth={0.5} opacity={0.32}>
            {boards.map((bx) => (
              <line key={bx} x1={bx} y1={0} x2={spread(bx)} y2={FLOOR_DEPTH_CM} />
            ))}
            {seams.map((sy) => (
              <line key={sy} x1={left} y1={sy} x2={right} y2={sy} opacity={0.5} />
            ))}
          </g>
          <ellipse
            cx={0}
            cy={6}
            rx={outer.w / 2 + 140}
            ry={FLOOR_DEPTH_CM * 0.7}
            fill={`url(#${id('sheen')})`}
            clipPath={`url(#${id('floorClip')})`}
          />

          {/* ── the work ─────────────────────────────────────────── */}
          <WallLabel
            x={outer.w / 2 + Math.max(26, 34 / px)}
            y={-152}
            px={px}
            hint={hintLabel && animate}
            hintColor={ann}
            onActivate={onOpenInfo}
          />
          <FramedWork
            onActivate={src ? onZoom : undefined}
            cx={0}
            cy={cy}
            widthCm={size.widthCm}
            heightCm={size.heightCm}
            frame={frame}
            src={src}
            title={title}
            ids={{ shadow: id('drop'), sheen: id('varnish'), glint: id('glint') }}
            glint={animate}
          />

          {showMeasures && (
            <g stroke={ann} strokeWidth={sw} fill="none" fontFamily='"Inter",sans-serif'>
              {/* width, above the frame */}
              <g transform={`translate(0 ${top - 14 / px})`}>
                <line x1={-size.widthCm / 2} y1={0} x2={size.widthCm / 2} y2={0} />
                <line x1={-size.widthCm / 2} y1={-tick} x2={-size.widthCm / 2} y2={tick} />
                <line x1={size.widthCm / 2} y1={-tick} x2={size.widthCm / 2} y2={tick} />
                <text
                  y={-6 / px}
                  textAnchor="middle"
                  fill={ann}
                  stroke="none"
                  fontSize={fs}
                  letterSpacing={`${1.2 / px}`}
                >
                  {approx}
                  {formatCm(size.widthCm)}
                </text>
              </g>
              {/* height, right of the frame */}
              <g transform={`translate(${outer.w / 2 + 14 / px} ${cy})`}>
                <line x1={0} y1={-size.heightCm / 2} x2={0} y2={size.heightCm / 2} />
                <line x1={-tick} y1={-size.heightCm / 2} x2={tick} y2={-size.heightCm / 2} />
                <line x1={-tick} y1={size.heightCm / 2} x2={tick} y2={size.heightCm / 2} />
                <text
                  transform="rotate(90)"
                  y={-6 / px}
                  textAnchor="middle"
                  fill={ann}
                  stroke="none"
                  fontSize={fs}
                  letterSpacing={`${1.2 / px}`}
                >
                  {approx}
                  {formatCm(size.heightCm)}
                </text>
              </g>
              {/* centre height above the floor, beyond the wall label */}
              {outer.w / 2 + Math.max(58, 40 / px) + 165 / px < view.w / 2 && (
                <g transform={`translate(${outer.w / 2 + Math.max(58, 40 / px)} 0)`} opacity={0.75}>
                  <line x1={0} y1={-14} x2={0} y2={cy} strokeDasharray={`${3 / px} ${3 / px}`} />
                  <line x1={-tick} y1={cy} x2={tick} y2={cy} />
                  <text
                    x={6 / px}
                    y={cy}
                    dominantBaseline="middle"
                    fill={ann}
                    stroke="none"
                    fontSize={fs * 0.92}
                    letterSpacing={`${1.2 / px}`}
                  >
                    centro a {formatCm(center)} do chão
                  </text>
                </g>
              )}
            </g>
          )}

          {animate && (
            <g fill={room.lightPool} pointerEvents="none">
              {motes.map((m) => (
                <circle key={m.key} cx={m.x} cy={m.y} r={m.r} opacity={0}>
                  <animate
                    attributeName="opacity"
                    values={m.twinkle ? '0;0.5;1;0.3;0.9;0' : '0;0.7;0.5;0.8;0'}
                    dur={`${m.twinkle || m.dur}s`}
                    begin={`${m.begin}s`}
                    repeatCount="indefinite"
                  />
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values={`0 0;${m.drift * 0.4} ${m.drift};${-m.drift * 0.3} ${m.drift * 1.6}`}
                    dur={`${m.dur}s`}
                    begin={`${m.begin}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ))}
            </g>
          )}

          {/* ── people & furniture, back to front ────────────────── */}
          {/* clicks pass through people to the work and its label */}
          <g pointerEvents="none">
            {roped && (
              <g transform={`translate(0 ${ROPE_DEPTH})`}>
                <Stanchions xs={ropeXs} shadow={room.figureShadow} />
              </g>
            )}
            <StandingViewer
              x={viewerX}
              depth={VIEWER_DEPTH}
              heightCm={VIEWER_HEIGHT}
              outfit={seed % 2 === 0 ? 'coat' : 'trousers'}
              hair={(['bun', 'long', 'short', 'hat'] as const)[seed % 4]}
              color={room.figures[1]}
              shadow={room.figureShadow}
              animate={animate}
              annotate={showMeasures ? { color: ann, px, label: formatCm(VIEWER_HEIGHT) } : undefined}
            />
            <g transform={`translate(${benchX} ${BENCH_DEPTH})`}>
              <Bench shadow={room.figureShadow} />
              <g transform={`translate(${SITTER_ON_BENCH} ${-BENCH_SEAT})`}>
                <BackFigure
                  heightCm={164}
                  pose="sit"
                  outfit="trousers"
                  hair={(['long', 'short', 'bun', 'long'] as const)[(seed >> 3) % 4]}
                  color={room.figures[0]}
                  animate={animate}
                />
              </g>
            </g>
            {actors.map(({ spec, leader, station }) => (
              <Visitor
                key={spec.key}
                spec={spec}
                leader={leader}
                station={station}
                stage={stage}
                epoch={epoch}
                color={room.figures[spec.tone % room.figures.length]}
                glow={room.lightPool}
                shadow={room.figureShadow}
                animate={animate}
              />
            ))}
          </g>
          <rect
            x={left}
            y={FLOOR_DEPTH_CM * 0.45}
            width={view.w}
            height={FLOOR_DEPTH_CM * 0.55}
            fill={`url(#${id('floorFade')})`}
          />
        </svg>
      )}

      {viewport.w > 0 && <ScaleBar px={px} />}
    </Box>
  )
}

/** "0 ─── 1 m" in the corner, sized to the drawing's current scale. */
function ScaleBar({ px }: { px: number }) {
  const meter = 100 * px
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'absolute',
        left: { xs: 12, sm: 20 },
        bottom: { xs: 10, sm: 16 },
        px: 1.25,
        py: 0.75,
        bgcolor: 'rgba(244,241,234,.88)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: meter,
          height: 6,
          borderLeft: '1px solid',
          borderRight: '1px solid',
          borderColor: 'text.primary',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            borderTop: '1px solid',
            borderColor: 'text.primary',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            width: '50%',
            top: '50%',
            height: 3,
            mt: '-1px',
            bgcolor: 'text.primary',
          }}
        />
      </Box>
      <Typography variant="caption" sx={{ color: 'text.primary', lineHeight: 1, letterSpacing: '.12em' }}>
        1 m
      </Typography>
    </Box>
  )
}

/** A ceiling-corner camera, aimed into the room, its LED blinking. */
function SecurityCamera({ x, y, px, animate }: { x: number; y: number; px: number; animate: boolean }) {
  const { INK, INK2, PAPER2, ACCENT } = TOKENS
  // Point toward the middle of the room.
  const flip = x > 0 ? -1 : 1
  return (
    <g transform={`translate(${x} ${y}) scale(${flip} 1)`} pointerEvents="none">
      <rect x={-1.4} y={0} width={2.8} height={7} fill={INK} />
      <g transform="translate(0 8) rotate(22)">
        <rect x={-6} y={-3.4} width={17} height={7.6} rx={2.6} fill={PAPER2} />
        <rect x={9.5} y={-4} width={4.5} height={8.8} rx={1} fill={INK2} />
        <circle cx={13.6} cy={0.4} r={1.9} fill={INK} />
        <circle cx={-2.6} cy={2.2} r={Math.max(0.7, 1.5 / px)} fill={ACCENT}>
          {animate && (
            <animate
              attributeName="opacity"
              values="1;1;0.15;1"
              keyTimes="0;0.55;0.6;1"
              dur="2.2s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      </g>
    </g>
  )
}
