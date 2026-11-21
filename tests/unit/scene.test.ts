import { describe, expect, it } from 'vitest'
import {
  ACTOR_LANES,
  actorPose,
  castActors,
  followerPose,
  furnishRoom,
  LABEL_SIDE,
  DOOR_WIDTH_CM,
  ESTIMATED_LONG_SIDE_CM,
  EYE_LEVEL_CM,
  formatCm,
  frameFor,
  gaitPeriod,
  hangCenterCm,
  LEG_RATIO,
  MIN_FLOOR_CLEARANCE_CM,
  outerSize,
  resolvePaintingSize,
  sceneView,
  seedFromId,
  STRIDE_DEG,
  stageFor,
  stationX,
} from '../../src/components/gallery/scene'

describe('resolvePaintingSize', () => {
  it('uses the museum measurements when they agree with the image', () => {
    expect(resolvePaintingSize({ widthCm: 92, heightCm: 73 }, 92 / 73)).toEqual({
      widthCm: 92,
      heightCm: 73,
      source: 'api',
    })
  })

  it('trusts the measurements when there is no image to check against', () => {
    expect(resolvePaintingSize({ widthCm: 50, heightCm: 200 }, null).source).toBe('api')
  })

  it('swaps width and height when they are reversed relative to the image', () => {
    expect(resolvePaintingSize({ widthCm: 73, heightCm: 92 }, 92 / 73)).toEqual({
      widthCm: 92,
      heightCm: 73,
      source: 'swapped',
    })
  })

  it('keeps the measured area but follows the image proportions when they disagree', () => {
    const size = resolvePaintingSize({ widthCm: 100, heightCm: 100 }, 2)
    expect(size.source).toBe('adjusted')
    expect(size.widthCm / size.heightCm).toBeCloseTo(2, 1)
    expect(size.widthCm * size.heightCm).toBeCloseTo(10000, -2)
  })

  it('derives the missing side from the image', () => {
    expect(resolvePaintingSize({ widthCm: null, heightCm: 50 }, 1.5)).toEqual({
      widthCm: 75,
      heightCm: 50,
      source: 'partial',
    })
    expect(resolvePaintingSize({ widthCm: 60, heightCm: null }, 1.5)).toEqual({
      widthCm: 60,
      heightCm: 40,
      source: 'partial',
    })
  })

  it('estimates an easel-picture size when nothing is measured', () => {
    const landscape = resolvePaintingSize({ widthCm: null, heightCm: null }, 2)
    expect(landscape).toEqual({
      widthCm: ESTIMATED_LONG_SIDE_CM,
      heightCm: ESTIMATED_LONG_SIDE_CM / 2,
      source: 'estimated',
    })
    const portrait = resolvePaintingSize({ widthCm: null, heightCm: null }, 0.5)
    expect(portrait.heightCm).toBe(ESTIMATED_LONG_SIDE_CM)
  })

  it('treats zero or negative measurements as missing', () => {
    expect(resolvePaintingSize({ widthCm: 0, heightCm: -3 }, null).source).toBe('estimated')
  })
})

describe('frameFor', () => {
  it('mats small works on paper', () => {
    expect(frameFor({ widthCm: 20, heightCm: 28, source: 'api' }).kind).toBe('mat')
  })

  it('gilds easel paintings, with a moulding that grows with the work', () => {
    const small = frameFor({ widthCm: 60, heightCm: 50, source: 'api' })
    const huge = frameFor({ widthCm: 437, heightCm: 363, source: 'api' })
    expect(small.kind).toBe('gilt')
    expect(huge.moulding).toBeGreaterThan(small.moulding)
    expect(huge.moulding).toBeLessThanOrEqual(18)
  })

  it('adds the border on every side', () => {
    const size = { widthCm: 100, heightCm: 80, source: 'api' as const }
    const frame = frameFor(size)
    const outer = outerSize(size, frame)
    expect(outer.w - size.widthCm).toBeCloseTo(outer.h - size.heightCm)
    expect(outer.w).toBeGreaterThan(size.widthCm)
  })
})

describe('hangCenterCm', () => {
  it('hangs ordinary works at eye level', () => {
    expect(hangCenterCm(90)).toBe(EYE_LEVEL_CM)
  })

  it('raises tall works so they clear the floor', () => {
    const outerH = 380
    const center = hangCenterCm(outerH)
    expect(center - outerH / 2).toBe(MIN_FLOOR_CLEARANCE_CM)
  })
})

describe('sceneView', () => {
  it('fills the viewport exactly', () => {
    const v = sceneView({ w: 1200, h: 600 }, { w: 100, h: 80 }, 150)
    expect(v.w / v.h).toBeCloseTo(2)
    expect(v.pxPerCm).toBeCloseTo(1200 / v.w)
  })

  it('keeps the floor anchored at the bottom', () => {
    const v = sceneView({ w: 800, h: 600 }, { w: 100, h: 80 }, 150)
    expect(v.y + v.h).toBeCloseTo(72)
  })

  it('always fits the framed work with room to spare, even on a narrow phone', () => {
    const outer = { w: 470, h: 400 }
    const v = sceneView({ w: 360, h: 480 }, outer, hangCenterCm(outer.h))
    expect(v.w).toBeGreaterThan(outer.w)
    expect(-v.y).toBeGreaterThan(hangCenterCm(outer.h) + outer.h / 2)
  })

  it('shows a full storey of wall even for a tiny work', () => {
    const v = sceneView({ w: 1600, h: 400 }, { w: 20, h: 25 }, 150)
    expect(-v.y).toBeGreaterThanOrEqual(300)
  })
})

describe('castActors', () => {
  it('is deterministic per seed', () => {
    expect(castActors(42)).toEqual(castActors(42))
    expect(castActors(42)).not.toEqual(castActors(43))
  })

  it('puts the adults in distinct lanes, at realistic heights, on both sides of the room', () => {
    const adults = castActors(7).filter((a) => !a.follows)
    expect(new Set(adults.map((a) => a.depth)).size).toBe(adults.length)
    expect(new Set(adults.map((a) => a.side)).size).toBe(2)
    for (const a of adults) {
      expect(ACTOR_LANES).toContain(a.depth)
      expect(a.heightCm).toBeGreaterThanOrEqual(158)
      expect(a.heightCm).toBeLessThanOrEqual(184)
    }
  })

  it('gives the child an adult to follow', () => {
    const cast = castActors(3)
    const child = cast.find((a) => a.isChild)!
    expect(cast.find((a) => a.key === child.follows)).toBeDefined()
    expect(child.heightCm).toBeLessThan(130)
  })
})

describe('companions and the wall label', () => {
  it('sends whoever reads the label to the label side, right by the frame', () => {
    for (let seed = 1; seed < 40; seed++) {
      for (const a of castActors(seed)) {
        if (!a.activities.includes('read')) continue
        expect(a.side).toBe(LABEL_SIDE)
        expect(a.spot).toBe(0)
        expect(a.follows).toBeUndefined()
      }
    }
  })

  it('lets a companion do its own thing on each visit', () => {
    const cast = castActors(5)
    const child = cast.find((a) => a.isChild)!
    const pose = (visit: number) =>
      followerPose(child, { x: 300, facing: -1, mode: 'idle', activity: 'photo', visit }).activity
    expect(pose(0)).toBe(child.activities[0])
    expect(pose(1)).toBe(child.activities[1])
  })
})

describe('furnishRoom', () => {
  it('keeps the doorway and other works well clear of the work', () => {
    for (let seed = 1; seed < 60; seed++) {
      for (const [viewW, outerW] of [
        [900, 110],
        [1400, 110],
        [1800, 470],
        [380, 60],
      ]) {
        const f = furnishRoom(viewW, outerW, seed)
        const clear = outerW / 2 + 100
        if (f.doorway) expect(Math.abs(f.doorway.x) - DOOR_WIDTH_CM / 2).toBeGreaterThan(clear)
        for (const n of f.neighbors) {
          expect(Math.abs(n.x) - n.w / 2).toBeGreaterThan(clear)
          if (f.doorway && Math.sign(n.x) === f.doorway.side) {
            expect(Math.abs(n.x) + n.w / 2).toBeLessThan(Math.abs(f.doorway.x) - DOOR_WIDTH_CM / 2)
          }
        }
      }
    }
  })

  it('leaves a narrow wall bare', () => {
    const f = furnishRoom(380, 60, 1)
    expect(f.doorway).toBeNull()
  })
})

describe('visitor choreography', () => {
  const view = { w: 900 }
  const outerW = 120
  const stage = stageFor(view, outerW)
  const cast = castActors(11)

  it('never puts anyone in front of the work, at any moment', () => {
    for (const spec of cast) {
      const leader = spec.follows ? cast.find((a) => a.key === spec.follows)! : undefined
      const station = stationX(leader ?? spec, stage)!
      for (let t = 0; t < 240; t += 0.25) {
        const adult = actorPose(leader ?? spec, station, stage, t)
        const pose = leader ? followerPose(spec, adult) : adult
        expect(Math.abs(pose.x)).toBeGreaterThanOrEqual(stage.keepOut - 1e-9)
      }
    }
  })

  it('walks in facing the work, stops, then walks out the way they came', () => {
    const spec = { ...cast[0], phase: 0 }
    const station = stationX(spec, stage)!
    const walk = (stage.wings - Math.abs(station)) / spec.speed
    const arriving = actorPose(spec, station, stage, walk / 2)
    const there = actorPose(spec, station, stage, walk + spec.dwell / 2)
    const leaving = actorPose(spec, station, stage, walk + spec.dwell + walk / 2)
    expect(arriving).toMatchObject({ mode: 'walk', facing: -spec.side })
    expect(there).toMatchObject({ mode: 'idle', x: station, facing: -spec.side })
    expect(leaving).toMatchObject({ mode: 'walk', facing: spec.side })
    expect(Math.sign(leaving.x)).toBe(spec.side)
    expect(actorPose(spec, station, stage, 2 * walk + spec.dwell + 0.1).mode).toBe('off')
  })

  it('does something different on each visit', () => {
    const spec = { ...cast[0], phase: 0 }
    const station = stationX(spec, stage)!
    const walk = (stage.wings - Math.abs(station)) / spec.speed
    const cycle = 2 * walk + spec.dwell + spec.rest
    const at = (visit: number) => actorPose(spec, station, stage, visit * cycle + walk + 1).activity
    expect(at(0)).not.toBe(at(1))
  })

  it('leaves a side empty rather than squeeze someone in front of a huge work', () => {
    const tight = stageFor({ w: 500 }, 470)
    expect(stationX(cast[0], tight)).toBeNull()
  })
})

describe('gaitPeriod', () => {
  it('plants the feet: distance per cycle equals two strides', () => {
    const h = 170
    const speed = 60
    const step = 2 * h * LEG_RATIO * Math.sin((STRIDE_DEG * Math.PI) / 180)
    expect(gaitPeriod(h, speed) * speed).toBeCloseTo(2 * step)
  })

  it('takes quicker steps for shorter legs at the same speed', () => {
    expect(gaitPeriod(120, 60)).toBeLessThan(gaitPeriod(180, 60))
  })
})

describe('seedFromId / formatCm', () => {
  it('gives each artwork its own stable seed', () => {
    expect(seedFromId('met:436535')).toBe(seedFromId('met:436535'))
    expect(seedFromId('met:436535')).not.toBe(seedFromId('met:436536'))
  })

  it('formats with a decimal comma, switching to metres past 1 m', () => {
    expect(formatCm(73)).toBe('73 cm')
    expect(formatCm(21.5)).toBe('21,5 cm')
    expect(formatCm(170)).toBe('1,70 m')
  })
})
