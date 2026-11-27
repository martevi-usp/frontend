import { Box, Typography } from '@mui/material'
import { MuseumBuilding } from '../museums/MuseumBuilding'

/** A paper-and-ink composition made from the same facade drawings as the atrium. */
export function LandingMuseumIllustration() {
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'relative',
        minHeight: { xs: 300, md: 520 },
        borderLeft: { xs: 0, md: '1px solid' },
        borderTop: { xs: '1px solid', md: 0 },
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <Typography
        variant="overline"
        sx={{ position: 'absolute', top: { xs: 20, md: 24 }, left: { xs: 0, md: 28 } }}
      >
        um átrio · sete acervos
      </Typography>

      <Box
        sx={{
          position: 'absolute',
          inset: { xs: '52px -18% auto 10%', md: '58px -18% auto 5%' },
          height: '72%',
          color: 'text.disabled',
          opacity: 0.22,
          transform: 'translateY(7%) scale(.88)',
          transformOrigin: 'bottom center',
        }}
      >
        <MuseumBuilding providerId="smithsonian" style={{ width: '100%', height: '100%' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          inset: { xs: '66px -10% 0 4%', md: '72px -8% 0 1%' },
          color: 'text.primary',
          animation: 'landing-facade-in 1.25s cubic-bezier(.66,0,.25,1) both',
          '@keyframes landing-facade-in': {
            from: { transform: 'translateY(26px)' },
            to: { transform: 'translateY(0)' },
          },
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      >
        <MuseumBuilding providerId="rijksmuseum" style={{ width: '100%', height: '100%' }} />
      </Box>

      <Box
        sx={{
          position: 'absolute',
          right: { xs: 12, sm: 24 },
          bottom: { xs: 12, sm: 24 },
          borderTop: '1px solid',
          borderColor: 'text.primary',
          width: 92,
          pt: 0.75,
          textAlign: 'right',
        }}
      >
        <Typography variant="overline" component="span" sx={{ color: 'text.primary' }}>
          portas abertas
        </Typography>
      </Box>
    </Box>
  )
}

