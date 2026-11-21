// Arm geometry for the side-view figures: forward and inverse kinematics of a
// two-link arm (upper arm + forearm) hanging from the shoulder, in the
// figures' 170 cm frame. Angles follow SVG's rotate(): degrees, clockwise,
// 0 = hanging straight down.

export interface V {
  x: number
  y: number
}
export const rotV = (v: V, deg: number): V => {
  const r = (deg * Math.PI) / 180
  return { x: v.x * Math.cos(r) - v.y * Math.sin(r), y: v.x * Math.sin(r) + v.y * Math.cos(r) }
}
export const add = (a: V, b: V): V => ({ x: a.x + b.x, y: a.y + b.y })
const deg = (rad: number) => (rad * 180) / Math.PI
/** The shoulder joint of a 170 cm side-view figure (see figures.tsx). */
const SHOULDER_V: V = { x: 1, y: -140 }
const UPPER_LEN = 29
/** The pencil tip, in the forearm's frame (elbow at the origin). */
export const TIP: V = { x: 4.6, y: 34 }

/** Where a point given in the forearm's frame ends up, for an arm posed (upper, lower). */
export function armPoint(upper: number, lower: number, local: V): V {
  const elbow = add(SHOULDER_V, rotV({ x: 0, y: UPPER_LEN }, upper))
  return add(elbow, rotV(local, upper + lower))
}

/**
 * Two-link inverse kinematics: the shoulder and elbow angles that put the
 * pencil tip on `target`, with the elbow hanging down as a drawing arm does.
 */
export function reach(target: V): { upper: number; lower: number } {
  const L1 = UPPER_LEN
  const L2 = Math.hypot(TIP.x, TIP.y)
  const tipAngle = deg(Math.atan2(-TIP.x, TIP.y))
  const d = { x: target.x - SHOULDER_V.x, y: target.y - SHOULDER_V.y }
  const dist = Math.min(L1 + L2 - 0.01, Math.max(Math.abs(L1 - L2) + 0.01, Math.hypot(d.x, d.y)))
  const toTarget = deg(Math.atan2(-d.x, d.y))
  const bend = deg(Math.acos((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist)))
  const options = [toTarget + bend, toTarget - bend].map((upper) => {
    const elbow = add(SHOULDER_V, rotV({ x: 0, y: L1 }, upper))
    const forearm = deg(Math.atan2(-(target.x - elbow.x), target.y - elbow.y))
    return { upper, lower: forearm - upper - tipAngle, elbowY: elbow.y }
  })
  const { upper, lower } = options[0].elbowY >= options[1].elbowY ? options[0] : options[1]
  // Keep angles in (-180, 180] so keyframes interpolate the short way round.
  const wrap = (x: number) => ((((x + 180) % 360) + 360) % 360) - 180
  return { upper: wrap(upper), lower: wrap(lower) }
}
