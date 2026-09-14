import type { HTMLAttributes } from 'react'
import type { ProviderId } from '../api/types'
import { BUILDINGS } from './buildings'

interface MuseumBuildingProps extends HTMLAttributes<SVGSVGElement> {
  providerId: ProviderId
}

const FILTER_ID = 'predioMao'

// Shared hand-drawn wobble, matching salas.html's own `#maoF` filter — applied
// once here rather than duplicated into every building's markup.
export function MuseumBuilding({ providerId, ...rest }: MuseumBuildingProps) {
  const Building = BUILDINGS[providerId]
  return (
    <svg
      viewBox="0 0 340 260"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <defs>
        <filter id={FILTER_ID} x="-12%" y="-8%" width="124%" height="118%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves={2} seed={5} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={3.4} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter={`url(#${FILTER_ID})`}>
        <Building />
      </g>
    </svg>
  )
}
