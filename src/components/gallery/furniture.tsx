// The room's fixed pieces, all drawn in real centimetres: the framed work,
// a tufted leather gallery bench, and brass stanchions with a velvet rope.

import { useRef, type KeyboardEvent } from 'react'
import { SideFigure } from './figures'
import { BRASS, GILT, LABEL, LEATHER, LINEN, MAT, mix, TOKENS, VELVET, WOOD } from './palette'
import { frameBorder, type Frame } from './scene'

type Quad = [string, string, string, string] // top, right, bottom, left

/** A mitred ring — four trapezoids, each lit as a face turned toward the light. */
function Ring({ x, y, w, h, t, fills }: { x: number; y: number; w: number; h: number; t: number; fills: Quad }) {
  const [top, right, bottom, left] = fills
  const X = x + w
  const Y = y + h
  return (
    <>
      <polygon points={`${x},${y} ${X},${y} ${X - t},${y + t} ${x + t},${y + t}`} fill={top} />
      <polygon points={`${X},${y} ${X},${Y} ${X - t},${Y - t} ${X - t},${y + t}`} fill={right} />
      <polygon points={`${x},${Y} ${X},${Y} ${X - t},${Y - t} ${x + t},${Y - t}`} fill={bottom} />
      <polygon points={`${x},${y} ${x},${Y} ${x + t},${Y - t} ${x + t},${y + t}`} fill={left} />
    </>
  )
}

interface FramedWorkProps {
  cx: number
  cy: number
  widthCm: number
  heightCm: number
  frame: Frame
  src: string | null
  title: string
  ids: { shadow: string; sheen: string; glint?: string }
}

/**
 * The framed work. With `onActivate`, it is a button: click, tap or
 * Enter/Space hands back the canvas's on-screen rectangle, so a zoom can grow
 * out of exactly where the picture hangs.
 */
export function FramedWork({
  onActivate,
  glint,
  ...art
}: FramedWorkProps & { onActivate?: (from: DOMRect) => void; glint?: boolean }) {
  const canvas = useRef<SVGRectElement>(null)
  const activate = () => {
    if (onActivate && canvas.current) onActivate(canvas.current.getBoundingClientRect())
  }
  const onKeyDown = (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      activate()
    }
  }
  return (
    <g
      {...(onActivate && {
        role: 'button',
        tabIndex: 0,
        'aria-label': `Ampliar “${art.title}”`,
        onClick: activate,
        onKeyDown,
        style: { cursor: 'zoom-in', outline: 'none' },
      })}
    >
      <FrameArt {...art} />
      {glint && art.ids.glint && <Glint {...art} id={art.ids.glint} />}
      <rect
        ref={canvas}
        x={art.cx - art.widthCm / 2}
        y={art.cy - art.heightCm / 2}
        width={art.widthCm}
        height={art.heightCm}
        fill="transparent"
      />
    </g>
  )
}

/**
 * Every so often a streak of light runs across the gilt (or, on a glazed
 * work on paper, across the glass) — the way a frame catches the eye as you
 * shift your weight in front of it.
 */
function Glint({ cx, cy, widthCm, heightCm, frame, id }: FramedWorkProps & { id: string }) {
  const border = frameBorder(frame)
  const ow = widthCm + 2 * border
  const oh = heightCm + 2 * border
  const x = cx - ow / 2
  const y = cy - oh / 2
  const band = Math.max(10, ow * 0.12)
  const slant = oh * 0.35
  const travel = ow + band + slant
  return (
    <g pointerEvents="none">
      <defs>
        <mask id={`${id}-mask`}>
          <rect x={x} y={y} width={ow} height={oh} fill="#fff" />
          {/* on gilt, only the moulding shines; on a glazed mat, the whole glass */}
          {frame.kind === 'gilt' && (
            <rect
              x={x + frame.moulding}
              y={y + frame.moulding}
              width={ow - 2 * frame.moulding}
              height={oh - 2 * frame.moulding}
              fill="#000"
            />
          )}
        </mask>
        <linearGradient id={`${id}-band`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity={frame.kind === 'gilt' ? 0.6 : 0.16} />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </linearGradient>
      </defs>
      <g mask={`url(#${id}-mask)`}>
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values={`0 0;${travel} 0;${travel} 0`}
            keyTimes="0;0.16;1"
            dur="11s"
            begin="2s"
            repeatCount="indefinite"
          />
          <polygon
            points={`${x - band},${y} ${x},${y} ${x - slant},${y + oh} ${x - band - slant},${y + oh}`}
            fill={`url(#${id}-band)`}
          />
        </g>
      </g>
    </g>
  )
}

function FrameArt({ cx, cy, widthCm, heightCm, frame, src, title, ids }: FramedWorkProps) {
  const inner = frame.kind === 'gilt' ? frame.liner : frame.mat
  const border = frame.moulding + inner
  const ow = widthCm + 2 * border
  const oh = heightCm + 2 * border
  const x = cx - ow / 2
  const y = cy - oh / 2
  const m = frame.moulding
  const ix = x + border
  const iy = y + border

  const canvas = src ? (
    <image
      href={src}
      x={ix}
      y={iy}
      width={widthCm}
      height={heightCm}
      preserveAspectRatio="xMidYMid slice"
      aria-label={title}
    />
  ) : (
    <rect x={ix} y={iy} width={widthCm} height={heightCm} fill={LINEN.edge} />
  )

  if (frame.kind === 'mat') {
    return (
      <g>
        <rect x={x} y={y} width={ow} height={oh} fill={MAT.moulding} filter={`url(#${ids.shadow})`} />
        <Ring
          x={x}
          y={y}
          w={ow}
          h={oh}
          t={m}
          fills={[MAT.mouldingEdge, MAT.moulding, MAT.moulding, MAT.mouldingEdge]}
        />
        <rect x={x + m} y={y + m} width={ow - 2 * m} height={oh - 2 * m} fill={MAT.face} />
        {/* bevelled window cut into the mat */}
        <Ring
          x={ix - 0.5}
          y={iy - 0.5}
          w={widthCm + 1}
          h={heightCm + 1}
          t={0.5}
          fills={[MAT.edge, MAT.face, MAT.face, MAT.edge]}
        />
        {canvas}
        {/* glazing */}
        <rect x={x + m} y={y + m} width={ow - 2 * m} height={oh - 2 * m} fill={`url(#${ids.sheen})`} />
      </g>
    )
  }

  const lip = m * 0.36
  const beadInset = m * 0.42
  const beadR = Math.max(0.35, m * 0.05)
  const ornamentR = m * 0.2
  return (
    <g>
      <rect x={x} y={y} width={ow} height={oh} fill={GILT.deep} filter={`url(#${ids.shadow})`} />
      {/* outer cove — lit from above */}
      <Ring x={x} y={y} w={ow} h={oh} t={m} fills={[GILT.light, GILT.deep, GILT.shadow, GILT.mid]} />
      {/* inner sight edge — a reversed profile reads as a carved channel */}
      <Ring
        x={x + m - lip}
        y={y + m - lip}
        w={ow - 2 * (m - lip)}
        h={oh - 2 * (m - lip)}
        t={lip}
        fills={[GILT.shadow, GILT.mid, GILT.light, GILT.deep]}
      />
      {/* beading along the moulding */}
      <rect
        x={x + beadInset}
        y={y + beadInset}
        width={ow - 2 * beadInset}
        height={oh - 2 * beadInset}
        fill="none"
        stroke={GILT.bead}
        strokeWidth={beadR * 2}
        strokeDasharray={`0.01 ${beadR * 3.2}`}
        strokeLinecap="round"
        opacity={0.85}
      />
      {/* corner rosettes */}
      {[
        [x + beadInset, y + beadInset],
        [x + ow - beadInset, y + beadInset],
        [x + ow - beadInset, y + oh - beadInset],
        [x + beadInset, y + oh - beadInset],
      ].map(([px, py], i) => (
        <g key={i}>
          <circle cx={px} cy={py} r={ornamentR * 1.35} fill={GILT.deep} />
          <circle cx={px} cy={py} r={ornamentR} fill={GILT.light} />
          <circle cx={px - ornamentR * 0.25} cy={py - ornamentR * 0.25} r={ornamentR * 0.4} fill={GILT.bead} />
        </g>
      ))}
      <rect x={x} y={y} width={ow} height={oh} fill="none" stroke={GILT.shadow} strokeWidth={0.4} />
      {/* linen liner */}
      <rect x={x + m} y={y + m} width={ow - 2 * m} height={oh - 2 * m} fill={LINEN.face} />
      <Ring
        x={x + m}
        y={y + m}
        w={ow - 2 * m}
        h={oh - 2 * m}
        t={Math.min(0.8, inner * 0.3)}
        fills={[LINEN.edge, LINEN.face, LINEN.face, LINEN.edge]}
      />
      {canvas}
      {/* varnish */}
      <rect x={ix} y={iy} width={widthCm} height={heightCm} fill={`url(#${ids.sheen})`} />
      <rect x={ix} y={iy} width={widthCm} height={Math.min(1.2, heightCm * 0.02)} fill="#17130E" opacity={0.28} />
    </g>
  )
}

interface WallLabelProps {
  x: number
  y: number
  /** Screen pixels per cm — the label is tiny at true scale, its target isn't. */
  px: number
  hint: boolean
  hintColor: string
  onActivate: () => void
}

/**
 * The small wall label beside a work — illegible at true scale, as in life,
 * so it is a button that opens the catalogue entry instead.
 */
export function WallLabel({ x, y, px, hint, hintColor, onActivate }: WallLabelProps) {
  const pad = Math.max(3, (44 / px - 13) / 2) // ≥ 44px touch target
  const onKeyDown = (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onActivate()
    }
  }
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label="Ler a ficha da obra"
      onClick={onActivate}
      onKeyDown={onKeyDown}
      style={{ cursor: 'pointer', outline: 'none' }}
    >
      <rect
        x={x - pad}
        y={y + 4.75 - (13 + 2 * pad) / 2}
        width={13 + 2 * pad}
        height={13 + 2 * pad}
        fill="transparent"
      />
      {hint && (
        <rect
          x={x - 4 / px}
          y={y - 4 / px}
          width={13 + 8 / px}
          height={9.5 + 8 / px}
          rx={2 / px}
          fill="none"
          stroke={hintColor}
          strokeWidth={1.5 / px}
        >
          <animate attributeName="opacity" values="0;0.9;0" dur="2.4s" repeatCount="indefinite" />
        </rect>
      )}
      <rect x={x + 0.3} y={y + 0.5} width={13} height={9.5} fill="#17130E" opacity={0.25} />
      <rect x={x} y={y} width={13} height={9.5} fill={LABEL.face} />
      <g stroke={LABEL.line} strokeWidth={0.45}>
        <line x1={x + 1.6} y1={y + 2.3} x2={x + 10} y2={y + 2.3} strokeWidth={0.8} />
        <line x1={x + 1.6} y1={y + 4.4} x2={x + 8} y2={y + 4.4} />
        <line x1={x + 1.6} y1={y + 5.9} x2={x + 11} y2={y + 5.9} />
        <line x1={x + 1.6} y1={y + 7.4} x2={x + 9.4} y2={y + 7.4} />
      </g>
    </g>
  )
}

export const BENCH_LENGTH = 168
export const BENCH_SEAT = 47

/** A long, backless, button-tufted leather bench. Origin = floor, centre. */
export function Bench({ shadow }: { shadow: string }) {
  const L = BENCH_LENGTH
  const half = L / 2
  const buttons = Array.from({ length: 7 }, (_, i) => -half + 12 + (i * (L - 24)) / 6)
  return (
    <g>
      <ellipse cx={0} cy={0} rx={half + 10} ry={5} fill={shadow} opacity={0.26} />
      {/* back legs, set in and a touch higher (further away) */}
      <rect x={-half + 13} y={-30} width={4.6} height={27} fill={WOOD.edge} />
      <rect x={half - 17.6} y={-30} width={4.6} height={27} fill={WOOD.edge} />
      <rect x={-half + 10} y={-13} width={L - 20} height={2.6} fill={WOOD.edge} />
      {/* front legs, slightly turned */}
      {[-half + 5, half - 10.5].map((lx) => (
        <g key={lx} fill={WOOD.face}>
          <rect x={lx} y={-31} width={5.5} height={28.5} rx={1} />
          <rect x={lx - 0.6} y={-3} width={6.7} height={3} rx={1} fill={WOOD.edge} />
        </g>
      ))}
      {/* apron */}
      <rect x={-half + 1} y={-36} width={L - 2} height={6.5} fill={WOOD.face} />
      <line x1={-half + 1} y1={-30} x2={half - 1} y2={-30} stroke={WOOD.edge} strokeWidth={0.8} />
      {/* cushion */}
      <rect x={-half - 1} y={-50} width={L + 2} height={6} rx={2.5} fill={LEATHER.top} />
      <rect x={-half - 1} y={-46} width={L + 2} height={11} rx={2.6} fill={LEATHER.face} />
      {buttons.map((bx) => (
        <g key={bx}>
          <path d={`M${bx - 4} -44 Q${bx} -40 ${bx + 4} -44`} stroke={LEATHER.button} strokeWidth={0.5} fill="none" />
          <circle cx={bx} cy={-40.5} r={0.95} fill={LEATHER.button} />
        </g>
      ))}
    </g>
  )
}

/** Brass posts with a sagging velvet rope. Origin = floor; xs = post positions. */
export function Stanchions({ xs, shadow }: { xs: number[]; shadow: string }) {
  return (
    <g>
      {xs.slice(1).map((x2, i) => {
        const x1 = xs[i]
        return (
          <path
            key={`rope${i}`}
            d={`M${x1} -90 Q${(x1 + x2) / 2} ${-90 + Math.min(26, Math.abs(x2 - x1) * 0.12)} ${x2} -90`}
            stroke={VELVET}
            strokeWidth={3.4}
            fill="none"
            strokeLinecap="round"
          />
        )
      })}
      {xs.map((x) => (
        <g key={x} transform={`translate(${x} 0)`}>
          <ellipse cx={0} cy={0} rx={17} ry={3} fill={shadow} opacity={0.26} />
          <ellipse cx={0} cy={-1.6} rx={13} ry={2.6} fill={BRASS.face} />
          <rect x={-2.1} y={-95} width={4.2} height={93} fill={BRASS.face} />
          <rect x={-1.2} y={-95} width={0.9} height={93} fill={BRASS.light} opacity={0.8} />
          <circle cx={0} cy={-97} r={4.2} fill={BRASS.face} />
          <circle cx={-1.3} cy={-98.3} r={1.4} fill={BRASS.light} />
        </g>
      ))}
    </g>
  )
}

interface DoorwayProps {
  x: number
  width: number
  height: number
  /** The next gallery's wall, seen through the opening. */
  beyond: string
  floor: string
  trim: string
  trimEdge: string
  sign: string
  signColor: string
  px: number
  gid: string
  animate: boolean
  /** Visitors in the next room, hazed by the distance. */
  passerColor: string
  glow: string
}

/** An opening into the next gallery: moulded architrave, a glimpse beyond, a room sign. */
const PASSERS = [
  { key: 'p1', dir: 1, begin: -3, height: 174, outfit: 'coat', accessory: 'none' },
  { key: 'p2', dir: -1, begin: -15, height: 161, outfit: 'dress', accessory: 'bun' },
  { key: 'p3', dir: 1, begin: -24, height: 168, outfit: 'trousers', accessory: 'backpack' },
] as const
/** People in the next room are this much smaller: they're further away. */
const DISTANCE_SCALE = 0.62

export function Doorway({
  x,
  width,
  height,
  beyond,
  floor,
  trim,
  trimEdge,
  sign,
  signColor,
  px,
  gid,
  animate,
  passerColor,
  glow,
}: DoorwayProps) {
  const l = x - width / 2
  const t = -height
  const trimW = 11
  return (
    <g>
      {/* architrave with a cornice cap */}
      <rect x={l - trimW} y={t - trimW} width={width + 2 * trimW} height={height + trimW} fill={trim} />
      <rect x={l - trimW - 5} y={t - trimW - 7} width={width + 2 * trimW + 10} height={7} fill={trim} />
      <line
        x1={l - trimW - 5}
        y1={t - trimW}
        x2={l + width + trimW + 5}
        y2={t - trimW}
        stroke={trimEdge}
        strokeWidth={0.8}
      />
      <rect
        x={l - trimW + 3}
        y={t - trimW + 3}
        width={width + 2 * trimW - 6}
        height={height + trimW - 3}
        fill="none"
        stroke={trimEdge}
        strokeWidth={0.7}
      />
      <defs>
        <linearGradient id={`${gid}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={TOKENS.INK} />
          <stop offset="0.55" stopColor={beyond} />
          <stop offset="1" stopColor={beyond} />
        </linearGradient>
        <radialGradient id={`${gid}-glow`} cx="0.5" cy="0.45" r="0.5">
          <stop offset="0" stopColor={TOKENS.PAPER} stopOpacity={0.16} />
          <stop offset="1" stopColor={TOKENS.PAPER} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* the next room, further back and dimmer: far wall, floor, a work in its own light */}
      <rect x={l} y={t} width={width} height={height} fill={`url(#${gid}-wall)`} />
      <rect x={l} y={t} width={width} height={height} fill={`url(#${gid}-glow)`} />
      <polygon points={`${l},0 ${l + width},0 ${l + width - 16},-26 ${l + 16},-26`} fill={floor} />
      <line x1={l + 16} y1={-26} x2={l + width - 16} y2={-26} stroke={TOKENS.INK} strokeWidth={0.8} opacity={0.5} />
      <rect x={x - 15} y={-150} width={30} height={23} fill={GILT.shadow} />
      <rect x={x - 12.5} y={-147.5} width={25} height={18} fill={mix(TOKENS.ACCENT2, TOKENS.INK, 0.45)} />
      {/* now and then someone crosses the next room */}
      {animate && (
        <>
          <clipPath id={`${gid}-clip`}>
            <rect x={l} y={t} width={width} height={height} />
          </clipPath>
          <g clipPath={`url(#${gid}-clip)`} opacity={0.8}>
            {PASSERS.map((p) => {
              const from = p.dir === 1 ? l - 40 : l + width + 40
              const to = p.dir === 1 ? l + width + 40 : l - 40
              return (
                <g key={p.key} transform={`translate(${from} -9)`}>
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values={`${from} -9;${to} -9;${to} -9`}
                    keyTimes="0;0.3;1"
                    dur="33s"
                    begin={`${p.begin}s`}
                    repeatCount="indefinite"
                  />
                  <g transform={`scale(${p.dir * DISTANCE_SCALE} ${DISTANCE_SCALE})`}>
                    <SideFigure
                      heightCm={p.height}
                      outfit={p.outfit}
                      accessory={p.accessory}
                      color={passerColor}
                      glow={glow}
                      mode="walk"
                      activity="look"
                      speed={45}
                      animate
                    />
                  </g>
                </g>
              )
            })}
          </g>
        </>
      )}
      {/* the jambs: the wall's thickness, catching less light the deeper they go */}
      <polygon points={`${l},${t} ${l + 16},${t + 12} ${l + 16},-26 ${l},0`} fill={TOKENS.INK} opacity={0.5} />
      <polygon
        points={`${l + width},${t} ${l + width - 16},${t + 12} ${l + width - 16},-26 ${l + width},0`}
        fill={TOKENS.INK}
        opacity={0.32}
      />
      <polygon
        points={`${l},${t} ${l + width},${t} ${l + width - 16},${t + 12} ${l + 16},${t + 12}`}
        fill={TOKENS.INK}
        opacity={0.6}
      />
      <text
        x={x}
        y={t - trimW - 16}
        textAnchor="middle"
        fill={signColor}
        fontSize={10 / px}
        letterSpacing={`${2.2 / px}`}
        fontFamily='"Inter",sans-serif'
        opacity={0.8}
      >
        {sign}
      </text>
    </g>
  )
}

interface NeighborWorkProps {
  x: number
  cy: number
  w: number
  h: number
  kind: 'landscape' | 'portrait' | 'still'
  gid: string
}

/**
 * Another work further along the wall: shown plainly, but given less pull
 * than the work on show — smaller, in a plain wooden frame, and lit only by
 * the room, without a spotlight of its own.
 */
export function NeighborWork({ x, cy, w, h, kind, gid }: NeighborWorkProps) {
  const { PAPER, INK, ACCENT, ACCENT2 } = TOKENS
  const m = Math.max(3, Math.min(6, Math.max(w, h) * 0.055))
  const ow = w + 2 * m
  const oh = h + 2 * m
  const ox = x - ow / 2
  const oy = cy - oh / 2
  const ix = x - w / 2
  const iy = cy - h / 2
  return (
    <g>
      <defs>
        {/* no spotlight of its own: just the room's ambient light, fading off at the edges */}
        <radialGradient id={`${gid}-shade`} cx="0.5" cy="0.4" r="0.75">
          <stop offset="0.35" stopColor={INK} stopOpacity={0} />
          <stop offset="1" stopColor={INK} stopOpacity={0.32} />
        </radialGradient>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mix(PAPER, ACCENT2, 0.3)} />
          <stop offset="1" stopColor={mix(ACCENT2, INK, 0.25)} />
        </linearGradient>
      </defs>
      <rect x={ox + 0.8} y={oy + 2} width={ow} height={oh} fill={INK} opacity={0.35} />
      {/* a plain dark-wood moulding — the gilt is saved for the work on show */}
      <Ring x={ox} y={oy} w={ow} h={oh} t={m} fills={[WOOD.edge, WOOD.face, mix(WOOD.face, INK, 0.3), WOOD.face]} />
      <g>
        <svg x={ix} y={iy} width={w} height={h} viewBox="0 0 100 100" preserveAspectRatio="none">
          {kind === 'landscape' && (
            <>
              <rect width={100} height={100} fill={`url(#${gid})`} />
              <path d="M0 62 C18 54 30 58 46 52 C62 46 78 56 100 50 L100 100 L0 100 Z" fill={mix(INK, ACCENT2, 0.35)} />
              <path d="M0 78 C30 70 60 82 100 72 L100 100 L0 100 Z" fill={mix(INK, ACCENT2, 0.18)} />
            </>
          )}
          {kind === 'portrait' && (
            <>
              <rect width={100} height={100} fill={mix(INK, ACCENT, 0.18)} />
              <path d="M14 100 C18 74 34 66 50 66 C66 66 82 74 86 100 Z" fill={mix(INK, ACCENT, 0.42)} />
              <ellipse cx={50} cy={44} rx={15} ry={19} fill={mix(ACCENT2, PAPER, 0.25)} opacity={0.8} />
            </>
          )}
          {kind === 'still' && (
            <>
              <rect width={100} height={100} fill={mix(INK, ACCENT2, 0.14)} />
              <rect y={70} width={100} height={30} fill={mix(ACCENT2, INK, 0.55)} />
              <circle cx={36} cy={62} r={11} fill={ACCENT} opacity={0.85} />
              <circle cx={56} cy={64} r={9} fill={ACCENT2} opacity={0.85} />
              <path d="M64 70 C64 44 72 34 74 24 C76 34 84 44 84 70 Z" fill={mix(PAPER, ACCENT2, 0.35)} opacity={0.7} />
            </>
          )}
        </svg>
      </g>
      <rect x={ox} y={oy} width={ow} height={oh} fill={`url(#${gid}-shade)`} />
    </g>
  )
}
