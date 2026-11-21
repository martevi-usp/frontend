import { describe, expect, it } from 'vitest'
import { armPoint, reach, TIP } from '../../src/components/gallery/kinematics'

describe('reach (the drawing arm)', () => {
  it('puts the pencil tip exactly on the target', () => {
    for (const target of [
      { x: 25, y: -125 },
      { x: 34, y: -118 },
      { x: 18, y: -110 },
      { x: 30, y: -100 },
    ]) {
      const { upper, lower } = reach(target)
      const tip = armPoint(upper, lower, TIP)
      expect(tip.x).toBeCloseTo(target.x, 6)
      expect(tip.y).toBeCloseTo(target.y, 6)
    }
  })

  it('keeps the elbow hanging below the shoulder', () => {
    const { upper } = reach({ x: 30, y: -120 })
    expect(Math.cos((upper * Math.PI) / 180)).toBeGreaterThan(0) // upper arm points downward
  })

  it('returns angles in (-180, 180] so keyframes interpolate the short way', () => {
    const { upper, lower } = reach({ x: 28, y: -115 })
    for (const a of [upper, lower]) {
      expect(a).toBeGreaterThan(-180)
      expect(a).toBeLessThanOrEqual(180)
    }
  })
})
