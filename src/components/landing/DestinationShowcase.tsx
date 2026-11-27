import { Box, ButtonBase, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import type { LandingDestination, LandingDestinationId } from '../../landing/content'
import { MuseumBuilding } from '../museums/MuseumBuilding'

interface DestinationShowcaseProps {
  destinations: readonly LandingDestination[]
  activeId: LandingDestinationId
  onSelect: (id: LandingDestinationId) => void
}

function AtriumPreview() {
  return (
    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <MuseumBuilding
        providerId="met"
        style={{ position: 'absolute', width: '72%', height: '72%', left: '-9%', bottom: '-4%', opacity: 0.32 }}
      />
      <MuseumBuilding
        providerId="vam"
        style={{ position: 'absolute', width: '86%', height: '86%', right: '-16%', bottom: '-2%' }}
      />
      <Typography variant="overline" sx={{ position: 'absolute', top: 24, left: 24, color: 'text.primary' }}>
        sete entradas · uma visita
      </Typography>
    </Box>
  )
}

function PuzzlePreview() {
  return (
    <Box sx={{ position: 'absolute', inset: { xs: 4, sm: 7 }, display: 'grid', placeItems: 'center' }}>
      <Box
        sx={{
          width: 'min(82%, 430px)',
          aspectRatio: '4 / 3',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '3px',
          transform: 'rotate(-2deg)',
        }}
      >
        {Array.from({ length: 12 }, (_, index) => (
          <Box
            key={index}
            sx={{
              border: '1px solid',
              borderColor: index === 7 ? 'primary.main' : 'text.primary',
              bgcolor: index === 7 ? 'primary.main' : index % 3 === 0 ? 'background.default' : 'paper2',
              transform: index === 7 ? 'translate(22px, 18px) rotate(7deg)' : 'none',
              transition: 'transform .7s cubic-bezier(.66,0,.25,1)',
              '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            }}
          />
        ))}
      </Box>
      <Typography variant="overline" sx={{ position: 'absolute', left: 0, bottom: 0 }}>
        a história aparece quando a imagem se completa
      </Typography>
    </Box>
  )
}

function DaikiPreview() {
  return (
    <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', p: 4 }}>
      <Box sx={{ position: 'absolute', inset: '11%', border: '1px dashed', borderColor: 'divider' }} />
      <Typography variant="h2" sx={{ fontSize: 'clamp(42px, 7vw, 88px)', textAlign: 'center', maxWidth: '7ch' }}>
        tarefa do{' '}
        <Box component="em" sx={{ color: 'primary.main', fontStyle: 'italic' }}>
          daiki
        </Box>
      </Typography>
      <Typography variant="overline" sx={{ position: 'absolute', bottom: '7%' }}>
        espaço em construção
      </Typography>
    </Box>
  )
}

function DestinationPreview({ activeId }: { activeId: LandingDestinationId }) {
  return (
    <Box
      aria-live="polite"
      aria-label={`Prévia de ${activeId}`}
      sx={{
        position: 'relative',
        minHeight: { xs: 360, md: 570 },
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      {activeId === 'atrium' && <AtriumPreview />}
      {activeId === 'puzzle' && <PuzzlePreview />}
      {activeId === 'daiki' && <DaikiPreview />}
    </Box>
  )
}

export function DestinationShowcase({ destinations, activeId, onSelect }: DestinationShowcaseProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(310px, .72fr) minmax(0, 1.28fr)' },
        gap: { xs: 4, md: 7 },
        alignItems: 'stretch',
      }}
    >
      <Box role="list" sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
        {destinations.map((destination) => {
          const active = destination.id === activeId
          return (
            <Box key={destination.id} role="listitem">
              <ButtonBase
                component={RouterLink}
                to={destination.path}
                onMouseEnter={() => onSelect(destination.id)}
                onFocus={() => onSelect(destination.id)}
                sx={{
                  width: '100%',
                  minHeight: 0,
                  display: 'block',
                  textAlign: 'left',
                  color: 'inherit',
                  textDecoration: 'none',
                  py: { xs: 3, md: 4 },
                  pr: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  opacity: active ? 1 : 0.55,
                  transition: 'opacity .5s cubic-bezier(.66,0,.25,1), padding-left .5s cubic-bezier(.66,0,.25,1)',
                  pl: active ? 2 : 0,
                  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                  '&:hover': { opacity: 1 },
                }}
              >
                <Typography variant="overline" sx={{ color: active ? 'primary.main' : 'text.disabled' }}>
                  {destination.eyebrow}
                </Typography>
                <Typography variant="h4" sx={{ mt: 1, fontSize: 'clamp(25px, 3vw, 38px)' }}>
                  {destination.title}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1.5, maxWidth: '47ch', fontSize: 15 }}>
                  {destination.description}
                </Typography>
                <Typography
                  variant="button"
                  component="span"
                  sx={{ display: 'inline-block', mt: 2, pb: 0.5, borderBottom: '1px solid' }}
                >
                  {destination.action}
                </Typography>
              </ButtonBase>
            </Box>
          )
        })}
      </Box>
      <DestinationPreview activeId={activeId} />
    </Box>
  )
}

