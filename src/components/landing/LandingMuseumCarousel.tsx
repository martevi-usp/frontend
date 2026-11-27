import { Box, Button, IconButton, Typography, useMediaQuery } from '@mui/material'
import { useEffect, useState } from 'react'
import { ArrowIcon } from '../icons'
import { MUSEUMS } from '../museums/catalog'
import { MuseumBuilding } from '../museums/MuseumBuilding'

const ROTATION_INTERVAL_MS = 5000

export function LandingMuseumCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const canRotate = !prefersReducedMotion && !paused
  const isRotating = canRotate && !hovered && !focused
  const museum = MUSEUMS[index]

  useEffect(() => {
    if (!isRotating) return

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % MUSEUMS.length)
    }, ROTATION_INTERVAL_MS)

    return () => window.clearInterval(timer)
  }, [isRotating])

  function move(step: number) {
    setIndex((current) => (current + step + MUSEUMS.length) % MUSEUMS.length)
  }

  return (
    <Box
      component="section"
      aria-labelledby="landing-museums-title"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minWidth: 0,
        gap: 2,
        py: { xs: 3, md: 4 },
        px: { md: 4 },
        borderLeft: { xs: 0, md: '1px solid' },
        borderTop: { xs: '1px solid', md: 0 },
        borderColor: 'divider',
      }}
    >
      <Typography id="landing-museums-title" variant="overline" sx={{ color: 'text.primary' }}>
        um átrio · sete acervos
      </Typography>

      <Box component="figure" aria-live={isRotating ? 'off' : 'polite'} sx={{ m: 0, textAlign: 'center' }}>
        <MuseumBuilding providerId={museum.id} style={{ display: 'block', width: '100%', height: 'auto' }} />
        <Typography
          component="figcaption"
          variant="h4"
          sx={{
            minHeight: '2.2em',
            display: 'grid',
            placeItems: 'center',
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
            px: 1,
          }}
        >
          {museum.name}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={() => move(-1)} aria-label="Museu anterior" sx={{ width: 44, height: 44 }}>
          <ArrowIcon direction="left" width={18} />
        </IconButton>
        {!prefersReducedMotion && (
          <Button onClick={() => setPaused((current) => !current)} variant="outlined" size="small">
            {paused ? 'Retomar rotação' : 'Pausar rotação'}
          </Button>
        )}
        <IconButton onClick={() => move(1)} aria-label="Próximo museu" sx={{ width: 44, height: 44 }}>
          <ArrowIcon direction="right" width={18} />
        </IconButton>
      </Box>
    </Box>
  )
}
