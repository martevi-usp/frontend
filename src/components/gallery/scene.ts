// Pure geometry for the gallery room (`/obra/:id`). Everything here is in
// centimetres of the real world — the SVG scene uses 1 user unit = 1 cm, so
// an artwork, a bench and a visitor are drawn at true relative scale.
//
// Coordinates: x = 0 is the artwork's centre line; y = 0 is where the wall
// meets the floor, negative is up the wall, positive is floor in front of it
// (larger y = closer to the viewer).

import { makeRng } from '../jigsaw/geometry'

export interface PaintingSize {
  widthCm: number
  heightCm: number
  /**
   * - `api`       — the museum's own measurements, used as-is
   * - `swapped`   — the museum's numbers, but width/height were reversed
   *                 relative to the image (a common data-entry slip)
   * - `adjusted`  — the measured area is kept, proportions follow the image
   *                 (the measurements likely include a mount or frame)
   * - `partial`   — one side measured, the other derived from the image
   * - `estimated` — no measurements at all; a plausible easel-picture size
   */
  source: 'api' | 'swapped' | 'adjusted' | 'partial' | 'estimated'
}

/** Measured vs. image proportions closer than this count as agreeing. */
const ASPECT_TOLERANCE = 1.12
/** Long side assumed when a museum publishes no measurements at all. */
export const ESTIMATED_LONG_SIDE_CM = 60

const round1 = (n: number) => Math.round(n * 10) / 10
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))
const valid = (n: number | null | undefined): n is number => n != null && Number.isFinite(n) && n > 0
const agrees = (a: number, b: number) => Math.abs(Math.log(a / b)) < Math.log(ASPECT_TOLERANCE)

/**
 * The size to hang, reconciling the museum's measurements with the image's
 * own proportions. The image is ground truth for *shape*; the measurements
 * are ground truth for *scale*.
 */
export function resolvePaintingSize(
  dims: { heightCm: number | null; widthCm: number | null },
  imageAspect: number | null,
): PaintingSize {
  const { heightCm: h, widthCm: w } = dims
  const aspect = valid(imageAspect) ? imageAspect : null

  if (valid(h) && valid(w)) {
    if (aspect === null || agrees(w / h, aspect)) return { widthCm: w, heightCm: h, source: 'api' }
    if (agrees(h / w, aspect)) return { widthCm: h, heightCm: w, source: 'swapped' }
    const area = w * h
    return { widthCm: round1(Math.sqrt(area * aspect)), heightCm: round1(Math.sqrt(area / aspect)), source: 'adjusted' }
  }

  if (aspect !== null && (valid(h) || valid(w))) {
    return valid(h)
      ? { widthCm: round1(h * aspect), heightCm: h, source: 'partial' }
      : { widthCm: w as number, heightCm: round1((w as number) / aspect), source: 'partial' }
  }

  const a = aspect ?? 4 / 5
  return a >= 1
    ? { widthCm: ESTIMATED_LONG_SIDE_CM, heightCm: round1(ESTIMATED_LONG_SIDE_CM / a), source: 'estimated' }
    : { widthCm: round1(ESTIMATED_LONG_SIDE_CM * a), heightCm: ESTIMATED_LONG_SIDE_CM, source: 'estimated' }
}

/**
 * Works on paper and small pictures get a wide mat inside a slim dark
 * moulding; everything else gets a carved gilt frame with a linen liner.
 * Widths scale with the work, the way a framer would choose them.
 */
export type Frame = { kind: 'gilt'; moulding: number; liner: number } | { kind: 'mat'; moulding: number; mat: number }

export const SMALL_WORK_CM = 45

export function frameFor(size: PaintingSize): Frame {
  const long = Math.max(size.widthCm, size.heightCm)
  if (long < SMALL_WORK_CM) {
    return { kind: 'mat', moulding: round1(clamp(long * 0.06, 1.6, 2.6)), mat: round1(clamp(long * 0.26, 3.5, 10)) }
  }
  const moulding = round1(clamp(long * 0.1, 6.5, 18))
  return { kind: 'gilt', moulding, liner: round1(moulding * 0.22) }
}

/** Total border on each side: moulding plus liner or mat. */
export function frameBorder(frame: Frame): number {
  return frame.moulding + (frame.kind === 'gilt' ? frame.liner : frame.mat)
}

export function outerSize(size: PaintingSize, frame: Frame): { w: number; h: number } {
  const b = frameBorder(frame)
  return { w: size.widthCm + 2 * b, h: size.heightCm + 2 * b }
}

/** Museum convention: the centre of a picture sits at standing eye level. */
export const EYE_LEVEL_CM = 150
/** …unless that would put a tall frame's bottom edge too near the floor. */
export const MIN_FLOOR_CLEARANCE_CM = 55

/** Height of the framed work's centre above the floor. */
export function hangCenterCm(outerHeight: number): number {
  return Math.max(EYE_LEVEL_CM, outerHeight / 2 + MIN_FLOOR_CLEARANCE_CM)
}

/** How much floor shows in front of the wall. */
export const FLOOR_DEPTH_CM = 72
/** The room always shows at least this much wall, so people read as people. */
const MIN_WALL_CM = 300
/** Space left above the frame for the ceiling cornice and track lights. */
const HEADROOM_CM = 85

export interface SceneView {
  x: number
  y: number
  w: number
  h: number
  /** Screen pixels per centimetre at the current size. */
  pxPerCm: number
}

/**
 * Fit the room into a viewport of `viewport` pixels. The room fills the
 * viewport exactly (walls extend sideways or upward as needed) and the framed
 * work, the bench and a visitor beside it always fit.
 */
export function sceneView(
  viewport: { w: number; h: number },
  outer: { w: number; h: number },
  centerCm: number,
): SceneView {
  const wallNeeded = Math.max(MIN_WALL_CM, centerCm + outer.h / 2 + HEADROOM_CM)
  const widthNeeded = outer.w + 2 * Math.max(140, outer.w * 0.22)
  const aspect = viewport.w > 0 && viewport.h > 0 ? viewport.w / viewport.h : 16 / 9

  let h = wallNeeded + FLOOR_DEPTH_CM
  let w = h * aspect
  if (w < widthNeeded) {
    w = widthNeeded
    h = w / aspect
  }
  return { x: -w / 2, y: FLOOR_DEPTH_CM - h, w, h, pxPerCm: viewport.w > 0 ? viewport.w / w : 1 }
}

// ── visitors ────────────────────────────────────────────────────────────

export type Outfit = 'trousers' | 'coat' | 'dress'
export type Accessory = 'none' | 'bun' | 'hat' | 'bag' | 'ponytail' | 'long' | 'backpack'

/** What a visitor does once they reach the work. */
export type Activity =
  | 'photo' // phone held up, the odd flash
  | 'sketch' // sketchbook and pencil
  | 'look' // arms folded, taking it in
  | 'audio' // audio guide held to the ear
  | 'read' // leaning in to read the wall label
  | 'chat' // talking with whoever they came with
  | 'sitdraw' // (children) sitting on the floor, drawing
  | 'selfie' // back to the work, phone up — the work over their shoulder

/**
 * A visitor's loop: walk in from their side of the room, stop beside the work
 * for a while doing something, walk back out the same way, rest offstage,
 * repeat — with the next activity on their list each visit.
 *
 * Visitors never cross in front of the work: each one belongs to one side
 * and stops short of the frame (see `stationX`).
 */
export interface ActorSpec {
  key: string
  heightCm: number
  /** Floor depth of the feet (see coordinate note at the top). */
  depth: number
  /** cm per second — an unhurried gallery stroll. */
  speed: number
  side: 1 | -1
  /** 0–1: where along their side's free floor they stop. */
  spot: number
  /** Seconds spent at the work per visit. */
  dwell: number
  /** Seconds offstage between visits. */
  rest: number
  /** 0–1: how far into their loop they are when the page opens. */
  phase: number
  activities: Activity[]
  outfit: Outfit
  accessory: Accessory
  tone: number
  /** Horizontal build, ~0.92 (slight) to ~1.1 (broad). */
  build: number
  isChild?: boolean
  /** A companion shares the adult's timeline, standing this far further out. */
  follows?: string
  trail?: number
}

/** Lanes in front of the bench; deeper lanes are closer to the viewer. */
export const ACTOR_LANES = [44, 56, 66] as const
const ACTIVITIES: readonly Activity[] = ['photo', 'sketch', 'look', 'audio', 'selfie']
/** The wall label hangs on this side of the work (see GalleryRoom). */
export const LABEL_SIDE = 1

/**
 * A small, deterministic cast. Seeded so the same artwork always opens with
 * the same people — it reads as "this room", not random noise — and the unit
 * tests can pin it down.
 */
export function castActors(seed: number): ActorSpec[] {
  const rand = makeRng(seed)
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)]
  const adultHeight = () => Math.round(158 + rand() * 26) // 1,58–1,84 m
  const shuffled = () => [...ACTIVITIES].sort(() => rand() - 0.5)

  const actors: ActorSpec[] = []
  const lanes = [...ACTOR_LANES]
  const firstSide: 1 | -1 = rand() < 0.5 ? 1 : -1
  let reader = false

  for (let i = 0; i < 3; i++) {
    const depth = lanes.splice(Math.floor(rand() * lanes.length), 1)[0]
    // Both sides of the room get someone; the third goes wherever.
    const side: 1 | -1 = i === 0 ? firstSide : i === 1 ? (-firstSide as 1 | -1) : rand() < 0.5 ? 1 : -1
    // The first visitor on the label's side stops right by it and, now and
    // then, leans in to read it.
    const readsLabel: boolean = side === LABEL_SIDE && !reader
    reader ||= readsLabel
    const adult: ActorSpec = {
      key: `a${i}`,
      heightCm: adultHeight(),
      depth,
      speed: Math.round(48 + rand() * 22),
      side,
      spot: readsLabel ? 0 : rand(),
      dwell: Math.round(8 + rand() * 7),
      rest: Math.round(2 + rand() * 5),
      phase: (i / 3 + rand() * 0.25) % 1,
      activities: readsLabel ? ['read', ...shuffled()] : shuffled(),
      outfit: pick(['trousers', 'coat', 'dress', 'trousers'] as const),
      accessory: pick(['none', 'bun', 'hat', 'bag', 'ponytail', 'long', 'backpack'] as const),
      tone: i,
      build: 0.92 + rand() * 0.18,
    }
    actors.push(adult)

    // The last visitor came with someone, and they talk about it.
    if (i === 2) {
      actors.push({
        ...adult,
        key: 'a2-partner',
        heightCm: adultHeight(),
        depth: depth + 3,
        activities: ['chat', 'look', 'chat', 'audio'],
        outfit: pick(['trousers', 'coat', 'dress'] as const),
        accessory: pick(['none', 'bun', 'hat', 'long'] as const),
        tone: 1,
        build: 0.92 + rand() * 0.18,
        follows: adult.key,
        trail: 46,
      })
    }

    // The first visitor brings a child along.
    if (i === 0) {
      actors.push({
        ...adult,
        key: 'a0-child',
        heightCm: Math.round(112 + rand() * 14),
        depth: depth + 4,
        activities: ['look', 'sitdraw'],
        outfit: 'trousers',
        accessory: 'ponytail',
        tone: 3,
        build: 1,
        isChild: true,
        follows: adult.key,
        trail: 42,
      })
    }
  }
  return actors
}

/** Nobody stands closer than this to the frame's edge (an arm may reach in). */
export const FRAME_CLEARANCE_CM = 48
/** How far past the visible wall a visitor goes when they leave. */
const OFFSTAGE_CM = 90

export interface Stage {
  /** |x| below which nobody may stand: the frame plus clearance. */
  keepOut: number
  /** |x| of the visible room's edge. */
  half: number
  /** |x| where visitors enter and leave, out of sight. */
  wings: number
}

export function stageFor(view: { w: number }, outerWidth: number): Stage {
  return { keepOut: outerWidth / 2 + FRAME_CLEARANCE_CM, half: view.w / 2, wings: view.w / 2 + OFFSTAGE_CM }
}

/** Where a visitor stops, or null when their side has no room for them. */
export function stationX(spec: ActorSpec, stage: Stage): number | null {
  const lo = stage.keepOut
  const hi = stage.half - 30
  if (hi < lo) return null
  // People stop within a couple of metres of the frame, not across the room.
  return spec.side * (lo + spec.spot * Math.min(hi - lo, 150))
}

export interface ActorPose {
  x: number
  facing: 1 | -1
  mode: 'walk' | 'idle' | 'off'
  activity: Activity
  /** Which visit this is (0, 1, 2…) — companions pick their activity by it. */
  visit: number
}

/** Where a visitor is and what they are doing `t` seconds after the page opened. */
export function actorPose(spec: ActorSpec, station: number, stage: Stage, t: number): ActorPose {
  const side = spec.side
  const walk = Math.abs(stage.wings - Math.abs(station)) / spec.speed
  const cycle = 2 * walk + spec.dwell + spec.rest
  const elapsed = t + spec.phase * cycle
  const visit = Math.floor(elapsed / cycle)
  const local = elapsed - visit * cycle
  const n = spec.activities.length
  const activity = spec.activities[((visit % n) + n) % n]
  const inward = -side as 1 | -1

  const at = { activity, visit }
  if (local < walk) return { x: side * stage.wings + inward * spec.speed * local, facing: inward, mode: 'walk', ...at }
  if (local < walk + spec.dwell) return { x: station, facing: inward, mode: 'idle', ...at }
  if (local < 2 * walk + spec.dwell) {
    return { x: station + side * spec.speed * (local - walk - spec.dwell), facing: side, mode: 'walk', ...at }
  }
  return { x: side * stage.wings, facing: side, mode: 'off', ...at }
}

/**
 * A companion (child, partner) keeps to its adult, standing `trail` cm
 * further from the work, and does its own thing on each visit.
 */
export function followerPose(companion: ActorSpec, adultPose: ActorPose): ActorPose {
  const n = companion.activities.length
  return {
    ...adultPose,
    x: adultPose.x + companion.side * (companion.trail ?? 0),
    activity: companion.activities[((adultPose.visit % n) + n) % n],
  }
}

// ── the rest of the room ────────────────────────────────────────────────

export type NeighborKind = 'landscape' | 'portrait' | 'still'

/** Another work further along the wall, outside the spotlight. */
export interface Neighbor {
  x: number
  w: number
  h: number
  kind: NeighborKind
}

export interface Furnishing {
  /** An opening into the next gallery, near one end of the wall. */
  doorway: { side: 1 | -1; x: number } | null
  neighbors: Neighbor[]
}

export const DOOR_WIDTH_CM = 120
export const DOOR_HEIGHT_CM = 228
/** Gap kept clear on each side of the work (wall label, breathing room). */
const NEIGHBOR_GAP_CM = 120

/**
 * Dress the rest of the wall: a doorway into the next gallery and other
 * works hung along the wall — only where the visible wall leaves room, and
 * never near the work itself. Seeded, like the visitors.
 */
export function furnishRoom(viewW: number, outerW: number, seed: number): Furnishing {
  const rand = makeRng(seed ^ 0x9e3779b9)
  const half = viewW / 2
  const clear = outerW / 2 + NEIGHBOR_GAP_CM
  const doorSide: 1 | -1 = rand() < 0.5 ? 1 : -1

  const doorAbs = half - DOOR_WIDTH_CM / 2 - 40
  const doorway = doorAbs - DOOR_WIDTH_CM / 2 > clear + 60 ? { side: doorSide, x: doorSide * doorAbs } : null

  const neighbors: Neighbor[] = []
  for (const side of [-1, 1] as const) {
    const hi = doorway && side === doorSide ? doorAbs - DOOR_WIDTH_CM / 2 - 50 : half + 40
    const w = Math.round(50 + rand() * 45)
    const kind = (['landscape', 'portrait', 'still'] as const)[Math.floor(rand() * 3)]
    const h = Math.round(kind === 'landscape' ? w * (0.6 + rand() * 0.2) : w * (1.15 + rand() * 0.25))
    const room = hi - clear - w
    if (room < 0) continue
    const centre = clear + w / 2 + Math.min(room, 60) * rand()
    neighbors.push({ x: side * centre, w, h, kind })
  }
  return { doorway, neighbors }
}

/** Seed from an artwork id, so each work has its own (stable) visitors. */
export function seedFromId(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619)
  return h >>> 0
}

/** Hip swing of a walking stride, in degrees each way. */
export const STRIDE_DEG = 21
/** Leg length (hip to floor) as a share of standing height. */
export const LEG_RATIO = 90 / 170

/**
 * Seconds for one full gait cycle (two steps), matched to the walker's speed
 * so feet plant instead of skating across the floor.
 */
export function gaitPeriod(heightCm: number, speed: number): number {
  const step = 2 * heightCm * LEG_RATIO * Math.sin((STRIDE_DEG * Math.PI) / 180)
  return (2 * step) / speed
}

/** "1,70 m" / "92 cm" — Brazilian decimal comma. */
export function formatCm(cm: number): string {
  if (cm >= 100) return `${(cm / 100).toFixed(2).replace('.', ',')} m`
  const rounded = Math.round(cm * 10) / 10
  return `${String(rounded).replace('.', ',')} cm`
}
