import { Box, Typography } from '@mui/material'
import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import type { MuseumMeta } from './catalog'
import { MuseumBuilding } from './MuseumBuilding'

interface MuseumCardProps {
  museum: MuseumMeta
  index: number
  focused: boolean
}

const EASE = 'cubic-bezier(.66,0,.25,1)'

// Each card gets a real building drawing (see components/buildings.tsx),
// traced from an actual photo of that museum — not a generic illustration.
export const MuseumCard = forwardRef<HTMLElement, MuseumCardProps>(function MuseumCard(
  { museum, index, focused },
  ref,
) {
  const enabled = museum.enabled

  return (
    <Box
      ref={ref}
      // A disabled museum isn't just visually marked closed — it's not a
      // link at all, so it can't be entered by click, tap, or keyboard.
      {...(enabled ? { component: Link, to: `/museu/${museum.id}` } : { component: 'div', 'aria-disabled': true })}
      sx={{
        flex: '0 0 min(78vw, 380px)',
        scrollSnapAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        textDecoration: 'none',
        color: 'inherit',
        cursor: enabled ? 'pointer' : 'default',
        opacity: focused ? 1 : 0.3,
        transform: focused ? 'none' : 'scale(.94)',
        transition: `opacity .7s ${EASE}, transform .7s ${EASE}`,
      }}
    >
      <Typography
        variant="overline"
        component="div"
        sx={{
          flexShrink: 0,
          fontFamily: '"Instrument Serif","Times New Roman",Times,serif',
          fontSize: 13,
          color: 'text.disabled',
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </Typography>
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <Box
          component={MuseumBuilding}
          providerId={museum.id}
          sx={{
            display: 'block',
            width: '100%',
            height: 'clamp(90px, 22vh, 190px)',
            mt: 1,
            color: 'text.primary',
            filter: enabled
              ? 'drop-shadow(0 12px 16px rgba(23,19,14,.1))'
              : 'drop-shadow(0 12px 16px rgba(23,19,14,.1)) grayscale(1)',
          }}
        />
        {!enabled && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              borderTop: '1px solid',
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.default',
              py: 0.75,
              textAlign: 'center',
            }}
          >
            <Typography variant="overline">fechado por enquanto</Typography>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          mt: { xs: 1, sm: 1.5 },
          pt: { xs: 1, sm: 1.5 },
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Typography variant="h5" sx={{ fontSize: 'clamp(18px, 2.4vh, 26px)' }}>
          {museum.name}
        </Typography>
        <Typography variant="overline" component="div" sx={{ mt: 0.25 }}>
          {museum.location}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            mt: 1,
            fontSize: 12.5,
            lineHeight: 1.4,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {museum.blurb}
        </Typography>
        {enabled && (
          <Typography
            variant="button"
            component="span"
            sx={{ display: 'inline-block', mt: 1, pb: 0.5, borderBottom: '1px solid', color: 'text.primary' }}
          >
            entrar →
          </Typography>
        )}
      </Box>
    </Box>
  )
})
