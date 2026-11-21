// Scale figures for the gallery room — flat ink silhouettes, like the people
// in an architect's elevation drawing, but drawn with real anatomy (a profile
// with brow, nose, lips and chin; a back that curves; hands and heeled shoes)
// so they read as people first and shapes second.
//
// Every figure is authored once for a 170 cm adult (1 unit = 1 cm, origin at
// the feet, up is negative y) and scaled to its own height. Motion uses SMIL
// (<animateTransform>) rather than CSS: SMIL rotates about the element's own
// local origin, which is exactly the joint each limb hangs from, whereas CSS
// transform-origin on SVG resolves against the viewport.

import { useId, type ReactNode } from 'react'
import { mix } from './palette'
import { add, armPoint, reach, rotV, TIP, type V } from './kinematics'
import { gaitPeriod, STRIDE_DEG, type Accessory, type Activity, type Outfit } from './scene'

const EASE = '0.42 0 0.58 1'
const LINEAR = '0 0 1 1'
const FAR_TINT = '#F4F1EA'
const HIP: [number, number] = [0, -90]
const SHOULDER: [number, number] = [1, -140]
const NECK: [number, number] = [1, -148]

// ── side view: shapes ───────────────────────────────────────────────────

/** Profile facing +x: crown, brow, nose, lips, chin, jaw, nape, neck. */
const HEAD =
  'M4.6 -141 L4.4 -147.6 C6.6 -147.6 9.8 -148.4 10.6 -151.2 L11.5 -153 L10.9 -154.2 L13.2 -156.5 L11.2 -160.2 C11.7 -166.5 7.6 -171.6 1.5 -171.6 C-5.6 -171.6 -10.1 -166.5 -9.7 -159.5 C-9.5 -155.4 -7.3 -152.6 -4.5 -151 L-4.9 -141 Z'
/** Upper back, lumbar curve, seat; belly, chest, collar. */
const TORSO =
  'M-4.8 -143.2 C-9.6 -142.2 -11.7 -138.6 -11.8 -132 C-12 -124 -10.3 -112 -9.7 -104 C-9.3 -98 -12.9 -93 -12.9 -87 C-12.9 -82 -9.6 -79 -5 -79 L7.4 -80 C9.6 -84 10.3 -91 9.7 -98 C9.1 -104 9.9 -110 11.3 -116 C12.7 -122 13.3 -129 12.3 -135 C11.1 -140.2 8.1 -142.7 4.6 -143.2 Z'
const COAT =
  'M-12 -135.5 C-12.6 -120 -14.2 -100 -16.6 -60 L-17.2 -51 Q0 -47.6 17.2 -51 L14.6 -96 C13.1 -110 13.7 -126 12.5 -136 C10.4 -142.6 -9.2 -143.2 -12 -135.5 Z'
const DRESS = 'M-9.9 -108 L10.3 -108 C13.2 -92 17.2 -72 19.6 -55 Q0 -51.4 -19.6 -55 C-16.2 -72 -12.2 -92 -9.9 -108 Z'

const THIGH = 'M-7.4 -3 C-9 8 -7.6 26 -5.2 44 L5 44 C6.8 30 8.8 12 7.6 -3 Z'
const SHIN = 'M-5.2 0 C-7.6 10 -6.1 24 -3.4 40 L3 40 C3.8 26 5.2 12 5 0 Z'
const SHOE = 'M-5 37.5 L3.2 37.5 C8 38.6 14 40.2 16.2 42.6 C17.2 44 16.6 46 14.6 46 L-5.4 46 C-6.6 46 -7 44.4 -6.6 42 Z'
const UPPER_ARM = 'M-4.7 -2 C-5.3 8 -4.3 19 -3.4 29 L3.4 29 C4.1 19 5.2 8 4.7 -2 Z'
const FOREARM = 'M-3.4 0 C-3.6 8 -2.8 17 -2.3 24 L2.3 24 C2.9 17 4 8 3.4 0 Z'
const HAND = 'M-2.5 23 C-3.2 27.5 -2.2 31.8 0 33.6 C2.2 33.8 3.4 31 3 27.5 C2.8 25.6 2.6 24 2.4 23 Z'

function SideHead({ accessory }: { accessory: Accessory }) {
  return (
    <>
      <path d={HEAD} />
      {accessory === 'bun' && <circle cx={-7.4} cy={-167.2} r={5.2} />}
      {accessory === 'ponytail' && <path d="M-8 -166 Q-18.2 -160 -15.6 -146 Q-12 -151 -8.6 -157 Z" />}
      {accessory === 'long' && (
        <path d="M-9.8 -163 C-12.8 -153 -12.6 -143 -10.4 -134 L-3.6 -136.5 C-4.6 -143 -4.4 -150 -2.5 -156 Z" />
      )}
      {accessory === 'hat' && (
        <>
          <path d="M-8.6 -168 C-8.6 -177.6 10 -178 10.6 -168 Z" />
          <rect x={-14} y={-169} width={30} height={2.6} rx={1.3} />
        </>
      )}
    </>
  )
}

// ── side view: motion ───────────────────────────────────────────────────

/** A joint angle in degrees: fixed, or looping. Positive swings a limb backward. */
type Angle = number | Motion
interface Motion {
  values: number[]
  keyTimes: number[]
  splines?: string[]
  dur: number
  begin?: number
}

const loop = (values: number[], dur: number, keyTimes?: number[]): Motion => ({
  values,
  dur,
  keyTimes: keyTimes ?? values.map((_, i) => i / (values.length - 1)),
})

/** A limb segment that rotates about the joint it hangs from. */
function Joint({
  at,
  angle,
  animate,
  children,
}: {
  at: [number, number]
  angle: Angle
  animate: boolean
  children: ReactNode
}) {
  const rest = typeof angle === 'number' ? angle : angle.values[0]
  return (
    <g transform={`translate(${at[0]} ${at[1]})`}>
      <g transform={`rotate(${rest})`}>
        {animate && typeof angle !== 'number' && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values={angle.values.join(';')}
            keyTimes={angle.keyTimes.join(';')}
            calcMode="spline"
            keySplines={(angle.splines ?? angle.values.slice(1).map(() => EASE)).join(';')}
            dur={`${angle.dur}s`}
            begin={`${angle.begin ?? 0}s`}
            repeatCount="indefinite"
          />
        )}
        {children}
      </g>
    </g>
  )
}

interface Limb {
  upper: Angle
  lower: Angle
  /** Drawn in the hand's frame, e.g. a phone or a pencil. */
  holding?: ReactNode
}

interface Pose {
  nearArm: Limb
  farArm: Limb
  nearLeg: Limb
  farLeg: Limb
  head: Angle
  /** Forward bend of the upper body at the hips, degrees. */
  lean?: number
  /** How far the whole body is lowered (sitting), cm at 170 cm scale. */
  drop?: number
  bob?: Motion
  /** Things in the body's own frame, e.g. a sketchbook on the lap. */
  props?: ReactNode
  /** Over-ear headphones (the audio guide). */
  headphones?: boolean
}

const angleAt = (a: Angle) => (typeof a === 'number' ? a : a.values[0])
/** Undo a forearm's rotation so a held object hangs upright in the room. */
const upright = (limb: { upper: Angle; lower: Angle }) => -(angleAt(limb.upper) + angleAt(limb.lower))

const STANDING = { nearLeg: { upper: -4, lower: 3 }, farLeg: { upper: 5, lower: 2 } }

function walkPose(period: number): Pose {
  // One gait cycle, leg A; the far side runs half a cycle later.
  const hip = (half: number): Motion => ({
    values: [-STRIDE_DEG, STRIDE_DEG, -STRIDE_DEG],
    keyTimes: [0, 0.5, 1],
    splines: [LINEAR, EASE],
    dur: period,
    begin: -half * period,
  })
  const knee = (half: number): Motion => ({
    values: [2, 9, 4, 30, 54, 14, 2],
    keyTimes: [0, 0.12, 0.36, 0.5, 0.68, 0.88, 1],
    dur: period,
    begin: -half * period,
  })
  const shoulder = (half: number): Motion => ({ ...loop([15, -15, 15], period), begin: -half * period })
  const elbow = (half: number): Motion => ({ ...loop([-8, -26, -8], period), begin: -half * period })
  return {
    nearLeg: { upper: hip(0), lower: knee(0) },
    farLeg: { upper: hip(0.5), lower: knee(0.5) },
    nearArm: { upper: shoulder(0), lower: elbow(0) },
    farArm: { upper: shoulder(0.5), lower: elbow(0.5) },
    head: 0,
    lean: 2,
    bob: loop([0, -1.5, 0, -1.5, 0], period),
  }
}

// ── drawing: the pencil tip stays on the page ───────────────────────────

/** Fractions along the page the pencil visits: strokes, then a lift and back. */
const STROKES: [number, number][] = [
  [0.18, 0],
  [0.5, 0],
  [0.3, 0],
  [0.62, 0],
  [0.42, 0],
  [0.78, 0],
  [0.55, 0],
  [0.4, -2.5], // lift
  [0.18, 0],
]

interface Page {
  /** Centre of the sketchbook, in the body's frame. */
  center: V
  /** Tilt, degrees (negative raises the far edge). */
  angle: number
  length: number
}

const PAD_THICK = 4.4

/**
 * A sketchbook and the hand drawing on it. The pad is a prop in the body's
 * frame (drawn between the body and the drawing arm), and the drawing arm's
 * keyframes come from `reach`, so the pencil tip travels along the page —
 * never through it.
 */
function drawingOn(page: Page, color: string, glow: string, dur: number): { arm: Limb; pad: ReactNode } {
  const surface = (u: number, lift: number) =>
    add(page.center, rotV({ x: (u - 0.5) * (page.length - 6), y: -PAD_THICK / 2 - 0.5 + lift }, page.angle))
  const poses = STROKES.map(([u, lift]) => reach(surface(u, lift)))
  return {
    arm: {
      upper: loop(
        poses.map((p) => Math.round(p.upper * 10) / 10),
        dur,
      ),
      lower: loop(
        poses.map((p) => Math.round(p.lower * 10) / 10),
        dur,
      ),
      holding: <path d={`M0.6 24 L${TIP.x} ${TIP.y}`} stroke={color} strokeWidth={1.3} strokeLinecap="round" />,
    },
    pad: (
      <g transform={`translate(${page.center.x} ${page.center.y}) rotate(${page.angle})`}>
        <rect x={-page.length / 2} y={-PAD_THICK / 2} width={page.length} height={PAD_THICK} rx={0.8} />
        <rect
          x={-page.length / 2 + 1}
          y={-PAD_THICK / 2 - 1.4}
          width={page.length - 2}
          height={1.6}
          rx={0.4}
          fill={glow}
          opacity={0.9}
        />
      </g>
    ),
  }
}

/** The far hand holding the sketchbook up in front of the chest. */
const HOLDING_ARM = { upper: -20, lower: -80 }
const STANDING_PAGE: Page = (() => {
  const hand = armPoint(HOLDING_ARM.upper, HOLDING_ARM.lower, { x: 0.6, y: 28 })
  return { center: add(hand, { x: -5, y: -1.5 }), angle: -24, length: 24 }
})()
const LAP_PAGE: Page = { center: { x: 24, y: -103 }, angle: -12, length: 24 }

function idlePose(activity: Activity, isChild: boolean, color: string, glow: string, animate: boolean): Pose {
  if (isChild && activity !== 'sitdraw') {
    return { ...STANDING, nearArm: { upper: 6, lower: -10 }, farArm: { upper: -4, lower: -8 }, head: -9 }
  }
  switch (activity) {
    case 'photo': {
      // Phone held up at arm's length, screen lit, a flash now and then.
      const nearArm = { upper: -62, lower: -98 }
      return {
        ...STANDING,
        nearArm: {
          ...nearArm,
          holding: (
            <g transform={`translate(0.6 28) rotate(${upright(nearArm)})`}>
              <rect x={-1.5} y={-9} width={3} height={15} rx={0.8} fill={color} />
              <rect x={-2.4} y={-8} width={0.9} height={13} fill={glow} opacity={0.85} />
              {animate && (
                <circle cx={2.5} cy={-6.5} r={6} fill="#FFFFFF" opacity={0}>
                  <animate
                    attributeName="opacity"
                    values="0;0;0.95;0;0"
                    keyTimes="0;0.8;0.82;0.88;1"
                    dur="3.7s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          ),
        },
        farArm: { upper: -55, lower: -104 },
        head: -3,
      }
    }
    case 'sketch': {
      // Sketchbook held up by the far hand; the near hand draws on it; the
      // head goes down to the page and back up to the work.
      const { arm, pad } = drawingOn(STANDING_PAGE, color, glow, 5.2)
      return {
        ...STANDING,
        farArm: HOLDING_ARM,
        nearArm: arm,
        props: pad,
        head: loop([13, 13, -3, -3, 13], 6.5, [0, 0.42, 0.5, 0.9, 1]),
      }
    }
    case 'selfie': {
      // Back to the work, arm out in front and a little up, phone at head
      // height angled down at the face — the work over the shoulder.
      const nearArm = { upper: -112, lower: -14 }
      return {
        ...STANDING,
        nearArm: {
          ...nearArm,
          holding: (
            <g transform={`translate(0.6 28) rotate(${upright(nearArm)}) rotate(-12)`}>
              <rect x={-1.5} y={-9} width={3} height={15} rx={0.8} fill={color} />
              <rect x={-2.4} y={-8} width={0.9} height={13} fill={glow} opacity={0.9} />
            </g>
          ),
        },
        farArm: { upper: 4, lower: -16 },
        // a little tilt and a smile for the camera, then checking the shot
        head: loop([-4, -4, -9, -9, -4], 4.5, [0, 0.4, 0.5, 0.85, 1]),
      }
    }
    case 'audio': {
      // Audio guide on headphones: the handset held at the chest; now and
      // then a glance down at it to press a number, then back to the work.
      const times = [0, 0.5, 0.57, 0.75, 0.82, 1]
      const nearArm = {
        // elbow at the side, handset close to the chest
        upper: loop([4, 4, -6, -6, 4, 4], 9, times),
        lower: loop([-96, -96, -114, -114, -96, -96], 9, times),
      }
      return {
        ...STANDING,
        headphones: true,
        nearArm: {
          ...nearArm,
          holding: (
            <g transform={`translate(0.6 27) rotate(${upright(nearArm)})`}>
              <rect x={-2.2} y={-6} width={4.4} height={11} rx={1.2} fill={color} />
              <rect x={-1.4} y={-5} width={2.8} height={4} rx={0.4} fill={glow} opacity={0.5}>
                {animate && (
                  <animate
                    attributeName="opacity"
                    values="0.45;0.45;0.95;0.95;0.45;0.45"
                    keyTimes={times.join(';')}
                    dur="9s"
                    repeatCount="indefinite"
                  />
                )}
              </rect>
            </g>
          ),
        },
        farArm: { upper: 5, lower: -12 },
        head: loop([-2, -2, 15, 15, -2, -2], 9, times),
      }
    }
    case 'read':
      // Leaning in to the wall label, hand to chin.
      return {
        ...STANDING,
        lean: 9,
        nearArm: { upper: -35, lower: -160 },
        farArm: { upper: 12, lower: -16 },
        head: loop([8, 10, 8], 4),
      }
    case 'chat':
      // Talking it over: the near hand gestures, the head moves with it.
      return {
        ...STANDING,
        nearArm: {
          upper: loop([-26, -38, -22, -34, -26], 2.6),
          lower: loop([-70, -96, -62, -88, -70], 2.6),
        },
        farArm: { upper: 6, lower: -14 },
        head: loop([0, -4, 3, -2, 0], 3.4),
      }
    case 'sitdraw': {
      // Cross-legged on the floor, sketchbook on the lap.
      const { arm, pad } = drawingOn(LAP_PAGE, color, glow, 4.6)
      return {
        drop: 76,
        nearLeg: { upper: -84, lower: 178 },
        farLeg: { upper: -78, lower: 172 },
        nearArm: arm,
        farArm: { upper: -12, lower: -70 },
        head: 18,
        props: pad,
      }
    }
    case 'look':
    default:
      // Arms folded, taking it in.
      return {
        ...STANDING,
        nearArm: { upper: -6, lower: -118 },
        farArm: { upper: -10, lower: -112 },
        head: loop([0, -5, -5, 0], 10, [0, 0.3, 0.7, 1]),
      }
  }
}

interface SideFigureProps {
  heightCm: number
  outfit: Outfit
  accessory: Accessory
  isChild?: boolean
  color: string
  /** The room's light colour, for a lit phone screen or a white page. */
  glow: string
  mode: 'walk' | 'idle'
  activity: Activity
  speed: number
  animate: boolean
}

/**
 * A person seen side-on, facing +x, in 170 cm units (the caller scales and
 * mirrors it).
 */
export function SideFigure({
  heightCm,
  outfit,
  accessory,
  isChild,
  color,
  glow,
  mode,
  activity,
  speed,
  animate,
}: SideFigureProps) {
  const far = mix(color, FAR_TINT, 0.2)
  const headClip = `head-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const pose =
    mode === 'walk' ? walkPose(gaitPeriod(heightCm, speed)) : idlePose(activity, !!isChild, color, glow, animate)
  const lean = pose.lean ? `rotate(${pose.lean} ${HIP[0]} ${HIP[1]})` : undefined

  const leg = (limb: Limb, fill: string) => (
    <g fill={fill}>
      <Joint at={HIP} angle={limb.upper} animate={animate}>
        <path d={THIGH} />
        <circle cx={0} cy={44} r={5} />
        <Joint at={[0, 44]} angle={limb.lower} animate={animate}>
          <path d={SHIN} />
          <path d={SHOE} />
        </Joint>
      </Joint>
    </g>
  )

  const arm = (limb: Limb, fill: string) => (
    <g fill={fill} transform={lean}>
      <Joint at={SHOULDER} angle={limb.upper} animate={animate}>
        <circle cx={0} cy={1} r={5.2} />
        <path d={UPPER_ARM} />
        <circle cx={0} cy={29} r={3.4} />
        <Joint at={[0, 29]} angle={limb.lower} animate={animate}>
          <path d={FOREARM} />
          <path d={HAND} />
          <ellipse cx={2.9} cy={26.6} rx={1.1} ry={2.5} transform="rotate(-20 2.9 26.6)" />
          {limb.holding}
        </Joint>
      </Joint>
    </g>
  )

  // A coat or skirt hangs over the near leg; trousers don't. Seated, the
  // thighs go forward out from under any hem, so they're drawn on top.
  const seated = !!pose.drop
  const legUnder = outfit !== 'trousers' && !seated
  const headScale = isChild ? `translate(${NECK[0]} ${NECK[1]}) scale(1.18) translate(${-NECK[0]} ${-NECK[1]})` : ''

  return (
    <g transform={pose.drop ? `translate(0 ${pose.drop})` : undefined}>
      <g>
        {animate && pose.bob && (
          <animateTransform
            attributeName="transform"
            type="translate"
            values={pose.bob.values.map((v) => `0 ${v}`).join(';')}
            keyTimes={pose.bob.keyTimes.join(';')}
            calcMode="spline"
            keySplines={pose.bob.values
              .slice(1)
              .map(() => EASE)
              .join(';')}
            dur={`${pose.bob.dur}s`}
            repeatCount="indefinite"
          />
        )}
        {arm(pose.farArm, far)}
        {leg(pose.farLeg, far)}
        {legUnder && leg(pose.nearLeg, color)}
        <g fill={color} transform={lean}>
          <path d={TORSO} />
          {outfit === 'coat' && !seated && <path d={COAT} />}
          {outfit === 'dress' && !seated && <path d={DRESS} />}
        </g>
        {!legUnder && leg(pose.nearLeg, color)}
        <g fill={color} transform={lean}>
          <g transform={headScale || undefined}>
            <Joint at={NECK} angle={pose.head} animate={animate}>
              <g transform={`translate(${-NECK[0]} ${-NECK[1]})`}>
                <SideHead accessory={accessory} />
                {pose.headphones && (
                  // Drawn in a lighter tone *on* the head and clipped to its
                  // outline, so the band and cup can never stick out of it.
                  <>
                    <clipPath id={headClip}>
                      <path d={HEAD} />
                    </clipPath>
                    <g clipPath={`url(#${headClip})`} fill={mix(color, glow, 0.38)}>
                      <path
                        d="M-1.8 -162 C-2.3 -166 -2.1 -170 -1.5 -174"
                        stroke={mix(color, glow, 0.38)}
                        strokeWidth={1.6}
                        fill="none"
                      />
                      <ellipse cx={-1.6} cy={-158.4} rx={3.6} ry={4.6} />
                    </g>
                  </>
                )}
              </g>
            </Joint>
          </g>
          {accessory === 'backpack' && (
            <>
              <rect x={-23} y={-141} width={12.5} height={34} rx={3.6} />
              <path d="M-9 -143 Q5 -140 4 -121" stroke={color} strokeWidth={1.6} fill="none" />
            </>
          )}
          {accessory === 'bag' && (
            <>
              <path d="M-2 -145 L-12 -103" stroke={color} strokeWidth={1.6} fill="none" />
              <rect x={-18} y={-105} width={13} height={17} rx={2.2} />
            </>
          )}
          {pose.props}
        </g>
        {arm(pose.nearArm, color)}
      </g>
    </g>
  )
}

// ── back view: visitors who stay put, looking at the work ───────────────
//
// Same language as the side view — tapered limbs, a real neck and nape,
// trapezius sloping into the shoulder, a waist, hands — at the same 170 cm
// proportions, so the people who stay and the people who come and go read
// as one crowd.

export type BackHair = 'short' | 'bun' | 'long' | 'hat'
export type BackOutfit = 'trousers' | 'coat' | 'dress'

/** Back of the torso: trapezius, shoulders, waist, hips. `hem` = bottom y. */
const backTorso = (hem: number, flare: number) =>
  `M-5.2 -144.5 C-9 -144 -14.5 -142.8 -17.4 -140 C-19.4 -138 -19.6 -134 -18.8 -128 L-16.2 -112 ` +
  `C-15 -104 -14 -100 -14.4 -94 C-15.4 -90 -${flare} -86 -${flare} ${hem} L${flare} ${hem} ` +
  `C${flare} -86 15.4 -90 14.4 -94 C14 -100 15 -104 16.2 -112 L18.8 -128 C19.6 -134 19.4 -138 17.4 -140 ` +
  `C14.5 -142.8 9 -144 5.2 -144.5 Z`
const BACK_COAT =
  'M-5.2 -144.5 C-9 -144 -14.5 -142.8 -17.4 -140 C-19.4 -138 -19.6 -134 -18.8 -128 L-16.6 -108 C-17 -90 -18.6 -72 -19.4 -56 Q0 -53 19.4 -56 C18.6 -72 17 -90 16.6 -108 L18.8 -128 C19.6 -134 19.4 -138 17.4 -140 C14.5 -142.8 9 -144 5.2 -144.5 Z'
const BACK_DRESS = 'M-14.6 -104 L14.6 -104 C16.6 -88 18.6 -72 20 -56 Q0 -52.6 -20 -56 C-18.6 -72 -16.6 -88 -14.6 -104 Z'
const BACK_LEG =
  'M-15.6 -85 L-1.2 -85 L-1.8 -50 C-2 -32 -2.6 -16 -2.9 -6 L-8.6 -6 C-9.6 -18 -11.8 -34 -11.4 -50 C-12.6 -64 -15.2 -76 -15.6 -85 Z'
/** Heel and back of the shoe. */
const BACK_SHOE = 'M-9.2 -7 L-2.4 -7 C-1.8 -4 -2 -1 -3.4 0 L-8.4 0 C-9.8 -1 -10 -4 -9.2 -7 Z'
/**
 * The whole arm as one contour — shoulder, upper arm, forearm turning in to
 * the hands at the small of the back — so there are no seams to show. The
 * inner edge sits inside the torso, where it disappears into the silhouette.
 */
const BACK_ARM =
  'M-12 -142.6 C-17.2 -142 -20.8 -139.6 -21.4 -134 C-21.9 -127 -21.3 -119 -20.6 -112 ' +
  'C-20.1 -106 -18.8 -101 -16 -97.6 L-6 -95.4 L-6 -118 L-12 -130 Z'

function BackHead({ hair }: { hair: BackHair }) {
  return (
    <>
      <path d="M-4.4 -151 L4.4 -151 L5.2 -143.6 L-5.2 -143.6 Z" />
      <ellipse cx={0} cy={-159.6} rx={8.7} ry={11.3} />
      {hair !== 'long' && (
        <>
          <ellipse cx={-8.6} cy={-158.6} rx={1.5} ry={3} />
          <ellipse cx={8.6} cy={-158.6} rx={1.5} ry={3} />
        </>
      )}
      {hair === 'bun' && <circle cx={0} cy={-170.8} r={5} />}
      {hair === 'long' && (
        // from the crown down, framing the whole head and covering the ears
        <path d="M0 -171.8 C-6.8 -171.8 -10 -166.8 -10.2 -159.6 C-10.6 -152 -10.4 -144.4 -8.6 -137 L8.6 -137 C10.4 -144.4 10.6 -152 10.2 -159.6 C10 -166.8 6.8 -171.8 0 -171.8 Z" />
      )}
      {hair === 'hat' && (
        <>
          <path d="M-8.4 -167 C-8.4 -177 8.4 -177 8.4 -167 Z" />
          <rect x={-14.5} y={-168} width={29} height={2.6} rx={1.3} />
        </>
      )}
    </>
  )
}

interface BackFigureProps {
  heightCm: number
  pose: 'stand' | 'sit'
  outfit: BackOutfit
  hair: BackHair
  color: string
  animate: boolean
}

/**
 * A visitor seen from behind, looking at the work. Standing: origin at the
 * feet. Sitting: origin at the seat — the same upper body, lowered onto it.
 */
export function BackFigure({ heightCm, pose, outfit, hair, color, animate }: BackFigureProps) {
  const s = heightCm / 170
  const sitting = pose === 'sit'
  return (
    <g transform={`scale(${s})`} fill={color}>
      <g transform={sitting ? 'translate(0 84)' : undefined}>
        {/* a slow shift of weight from foot to foot (or a breath, seated) */}
        {animate && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            values={sitting ? '0 0 -84;-0.8 0 -84;0 0 -84' : '-0.5;0.5;-0.5'}
            keyTimes="0;0.5;1"
            calcMode="spline"
            keySplines={`${EASE};${EASE}`}
            dur={sitting ? '6s' : '9s'}
            repeatCount="indefinite"
            additive="sum"
          />
        )}
        {!sitting && (
          <>
            <path d={BACK_LEG} />
            <path d={BACK_LEG} transform="scale(-1 1)" />
            <path d={BACK_SHOE} />
            <path d={BACK_SHOE} transform="scale(-1 1)" />
          </>
        )}
        <path d={outfit === 'coat' && !sitting ? BACK_COAT : backTorso(sitting ? -82 : -84, 16.4)} />
        {outfit === 'dress' && !sitting && <path d={BACK_DRESS} />}
        {/* one silhouette: arms in the body's colour, one seamless contour each */}
        <path d={BACK_ARM} />
        <path d={BACK_ARM} transform="scale(-1 1)" />
        <Joint
          at={[0, -150]}
          angle={sitting ? loop([0, 0, -7, -7, 0, 0], 17, [0, 0.35, 0.45, 0.7, 0.8, 1]) : loop([0, -5, -5, 2, 0], 15)}
          animate={animate}
        >
          <g transform="translate(0 150)">
            <BackHead hair={hair} />
          </g>
        </Joint>
      </g>
    </g>
  )
}

interface BackVisitorProps extends Omit<BackFigureProps, 'pose'> {
  x: number
  depth: number
  shadow: string
  annotate?: { color: string; px: number; label: string }
}

/** A standing visitor, back to us, hands clasped — looking at the work. */
export function StandingViewer({ x, depth, shadow, annotate, ...figure }: BackVisitorProps) {
  const s = figure.heightCm / 170
  return (
    <g transform={`translate(${x} ${depth})`}>
      <ellipse cx={0} cy={0} rx={22 * s} ry={3.2} fill={shadow} opacity={0.24} />
      <BackFigure pose="stand" {...figure} />
      {annotate && <HeightCallout x={-28 * s} heightCm={figure.heightCm} {...annotate} />}
    </g>
  )
}

/** A dimension line from the floor to the top of a head. */
export function HeightCallout({
  x,
  heightCm,
  color,
  px,
  label,
}: {
  x: number
  heightCm: number
  color: string
  px: number
  label: string
}) {
  const sw = 1 / px
  const tick = 5 / px
  return (
    <g stroke={color} strokeWidth={sw} fill="none" opacity={0.9}>
      <line x1={x} y1={0} x2={x} y2={-heightCm} />
      <line x1={x - tick} y1={0} x2={x + tick} y2={0} />
      <line x1={x - tick} y1={-heightCm} x2={x + tick} y2={-heightCm} />
      <text
        x={x - 6 / px}
        y={-heightCm / 2}
        textAnchor="end"
        fill={color}
        stroke="none"
        fontSize={11 / px}
        fontFamily='"Inter",sans-serif'
        letterSpacing={`${1.2 / px}`}
        dominantBaseline="middle"
      >
        {label}
      </text>
    </g>
  )
}
