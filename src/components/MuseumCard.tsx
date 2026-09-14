import { Box, Typography } from '@mui/material'
import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import type { MuseumMeta } from '../museums/catalog'
import { MuseumBuilding } from './MuseumBuilding'

interface MuseumCardProps {
  museum: MuseumMeta
  index: number
  focused: boolean
}

const EASE = 'cubic-bezier(.66,0,.25,1)'

// Each card gets a real building drawing (see components/buildings.tsx),
// traced from an actual photo of that museum — not a generic illustration.
export const MuseumCard = forwardRef<HTMLAnchorElement, MuseumCardProps>(function MuseumCard(
  { museum, index, focused },
  ref,
) {
  return (
    <Box
      ref={ref}
      component={Link}
      to={`/museu/${museum.id}`}
      sx={{
        flex: '0 0 min(78vw, 380px)',
        scrollSnapAlign: 'center',
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        opacity: focused ? 1 : 0.3,
        transform: focused ? 'none' : 'scale(.94)',
        transition: `opacity .7s ${EASE}, transform .7s ${EASE}`,
      }}
    >
      <Typography
        variant="overline"
        component="div"
        sx={{ fontFamily: '"Instrument Serif","Times New Roman",Times,serif', fontSize: 13, color: 'text.disabled' }}
      >
        {String(index + 1).padStart(2, '0')}
      </Typography>
      <Box
        component={MuseumBuilding}
        providerId={museum.id}
        sx={{
          display: 'block',
          width: '100%',
          height: 'min(34vh, 260px)',
          mt: 1,
          color: 'text.primary',
          filter: 'drop-shadow(0 12px 16px rgba(23,19,14,.1))',
        }}
      />
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 2, pt: 2 }}>
        <Typography variant="h5">{museum.name}</Typography>
        <Typography variant="overline" component="div" sx={{ mt: 0.5 }}>
          {museum.location}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1.5 }}>
          {museum.blurb}
        </Typography>
        <Typography
          variant="button"
          component="span"
          sx={{ display: 'inline-block', mt: 2, pb: 0.5, borderBottom: '1px solid', color: 'text.primary' }}
        >
          entrar →
        </Typography>
      </Box>
    </Box>
  )
})
