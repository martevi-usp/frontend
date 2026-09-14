import { Box, IconButton, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { MUSEUMS } from '../museums/catalog'
import { ArrowIcon } from './icons'
import { MuseumCard } from './MuseumCard'

// Reimplements salas.html's `#atrio` rail behavior (scroll-snap + "focused"
// card + progress bar) in React state — not a port of its vanilla JS.
export function MuseumRail() {
  const railRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [focused, setFocused] = useState(0)

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return

    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const mid = rail.scrollLeft + rail.clientWidth / 2
        let closest = 0
        let closestDist = Infinity
        cardRefs.current.forEach((card, i) => {
          if (!card) return
          const cardMid = card.offsetLeft + card.offsetWidth / 2
          const dist = Math.abs(cardMid - mid)
          if (dist < closestDist) {
            closestDist = dist
            closest = i
          }
        })
        setFocused(closest)
      })
    }

    rail.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      rail.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const goTo = (index: number) => {
    const rail = railRef.current
    const card = cardRefs.current[index]
    if (!rail || !card) return
    rail.scrollTo({ left: card.offsetLeft + card.offsetWidth / 2 - rail.clientWidth / 2, behavior: 'smooth' })
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        ref={railRef}
        role="list"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 2, sm: 4 },
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          px: { xs: '11vw', sm: 'max(24px, calc(50vw - 210px))' },
          py: 4,
        }}
      >
        {MUSEUMS.map((museum, i) => (
          <MuseumCard
            key={museum.id}
            museum={museum}
            index={i}
            focused={i === focused}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: { xs: 2, sm: 4 }, pb: 1 }}>
        <Typography variant="overline" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {String(focused + 1).padStart(2, '0')} / {String(MUSEUMS.length).padStart(2, '0')}
        </Typography>
        <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider', position: 'relative' }}>
          <Box
            sx={{
              position: 'absolute',
              inset: '0 auto 0 0',
              bgcolor: 'primary.main',
              width: `${((focused + 1) / MUSEUMS.length) * 100}%`,
              transition: 'width .5s cubic-bezier(.66,0,.25,1)',
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            onClick={() => goTo(Math.max(0, focused - 1))}
            disabled={focused === 0}
            aria-label="Museu anterior"
            size="small"
          >
            <ArrowIcon direction="left" width={15} />
          </IconButton>
          <IconButton
            onClick={() => goTo(Math.min(MUSEUMS.length - 1, focused + 1))}
            disabled={focused === MUSEUMS.length - 1}
            aria-label="Próximo museu"
            size="small"
          >
            <ArrowIcon direction="right" width={15} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}
