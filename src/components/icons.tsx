// Small hand-drawn-style inline SVGs, matching salas.html's own icon
// treatment (thin stroke, no fill) rather than pulling in @mui/icons-material
// for three glyphs.

import type { SVGProps } from 'react'

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true" {...props}>
      <circle cx="10.5" cy="10.5" r="7" />
      <path d="M15.6 15.6L21 21" />
    </svg>
  )
}

export function ClearIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden="true" {...props}>
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  )
}

export function ArrowIcon({ direction = 'left', ...props }: SVGProps<SVGSVGElement> & { direction?: 'left' | 'right' }) {
  const d = direction === 'left' ? 'M15 4l-8 8 8 8' : 'M9 4l8 8-8 8'
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} aria-hidden="true" {...props}>
      <path d={d} />
    </svg>
  )
}
