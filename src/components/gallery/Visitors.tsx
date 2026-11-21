import { useEffect, useRef, useState } from 'react'
import { SideFigure } from './figures'
import { actorPose, followerPose, type ActorPose, type ActorSpec, type Stage } from './scene'

interface VisitorProps {
  spec: ActorSpec
  /** For a child: the adult it walks with (shares their timeline). */
  leader?: ActorSpec
  /** Where this visitor — or, for a child, its adult — stops. */
  station: number
  stage: Stage
  /** performance.now() when the room opened — shared, so pairs stay in step. */
  epoch: number
  color: string
  glow: string
  shadow: string
  animate: boolean
}

type Shape = Pick<ActorPose, 'x' | 'mode' | 'facing' | 'activity'>

function poseFor(spec: ActorSpec, leader: ActorSpec | undefined, station: number, stage: Stage, t: number): ActorPose {
  if (leader) return followerPose(spec, actorPose(leader, station, stage, t))
  return actorPose(spec, station, stage, t)
}

/** Without motion, everyone stands at the work doing their first activity. */
function stillPose(spec: ActorSpec, leader: ActorSpec | undefined, station: number): ActorPose {
  return {
    x: station + (leader ? spec.side * (spec.trail ?? 0) : 0),
    facing: -spec.side as 1 | -1,
    mode: 'idle',
    activity: spec.activities[0],
    visit: 0,
  }
}

/**
 * One visitor following their loop (see `actorPose`). Position updates every
 * frame straight on the DOM node; React only re-renders when the visitor
 * starts or stops walking, turns, or changes activity — a few times a minute.
 */
export function Visitor({ spec, leader, station, stage, epoch, color, glow, shadow, animate }: VisitorProps) {
  const node = useRef<SVGGElement>(null)
  const [moving, setMoving] = useState<Shape>(() =>
    poseFor(spec, leader, station, stage, (performance.now() - epoch) / 1000),
  )

  // The stage is rebuilt on every parent render; key the loop on its numbers.
  const { keepOut, half, wings } = stage
  useEffect(() => {
    if (!animate) return
    const room = { keepOut, half, wings }
    let frame = 0
    const tick = (now: number) => {
      const p = poseFor(spec, leader, station, room, (now - epoch) / 1000)
      node.current?.setAttribute('transform', `translate(${p.x} ${spec.depth})`)
      // Re-render only on a change of gait, direction or activity.
      setMoving((prev) => (prev.mode === p.mode && prev.facing === p.facing && prev.activity === p.activity ? prev : p))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [animate, spec, leader, station, keepOut, half, wings, epoch])

  const shape = animate ? moving : stillPose(spec, leader, station)

  const s = spec.heightCm / 170
  // A selfie is taken with your back to the work.
  const facing = shape.mode === 'idle' && shape.activity === 'selfie' ? -shape.facing : shape.facing
  return (
    <g
      ref={node}
      transform={`translate(${shape.x} ${spec.depth})`}
      data-activity={shape.mode === 'idle' ? shape.activity : shape.mode}
    >
      {shape.mode !== 'off' && (
        <>
          <ellipse cx={0} cy={0} rx={spec.heightCm * 0.17} ry={3} fill={shadow} opacity={0.22} />
          <g transform={`scale(${facing * s * spec.build} ${s})`}>
            <SideFigure
              heightCm={spec.heightCm}
              outfit={spec.outfit}
              accessory={spec.accessory}
              isChild={spec.isChild}
              color={color}
              glow={glow}
              mode={shape.mode}
              activity={shape.activity}
              speed={spec.speed}
              animate={animate}
            />
          </g>
        </>
      )}
    </g>
  )
}
