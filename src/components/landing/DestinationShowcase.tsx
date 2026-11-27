import { Box, ButtonBase, Typography, useMediaQuery } from '@mui/material'
import type { Theme } from '@mui/material/styles'
import { Link as RouterLink } from 'react-router-dom'
import type { LandingDestination, LandingDestinationId } from '../../landing/content'

interface DestinationShowcaseProps {
  destinations: readonly LandingDestination[]
  activeId: LandingDestinationId
  onSelect: (id: LandingDestinationId) => void
}

function AtriumPreview({ inline }: { inline: boolean }) {
  return (
    <Box sx={inline ? { position: 'absolute', inset: 0, p: 1.5 } : { p: { xs: 2, sm: 3, lg: 4 } }}>
      <Box
        component="img"
        src={`${import.meta.env.BASE_URL}rijksmuseum-gallery-line-art.webp`}
        alt="Desenho da Galeria de Honra do Rijksmuseum, com arcos, visitantes, quadros e bancos."
        width={1448}
        height={1086}
        loading="lazy"
        decoding="async"
        sx={{
          display: 'block',
          width: '100%',
          maxWidth: 680,
          height: inline ? '100%' : 'auto',
          objectFit: inline ? 'contain' : undefined,
          mx: 'auto',
        }}
      />
    </Box>
  )
}

function PuzzlePreview({ inline }: { inline: boolean }) {
  return (
    <Box sx={{ position: 'absolute', inset: { xs: 4, sm: 7 }, display: 'grid', placeItems: 'center' }}>
      <Box
        sx={{
          width: inline ? 'min(66%, 245px)' : 'min(82%, 430px)',
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
              transform: index === 7
                ? `translate(${inline ? '12px, 10px' : '22px, 18px'}) rotate(7deg)`
                : 'none',
              transition: 'transform .7s cubic-bezier(.66,0,.25,1)',
              '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            }}
          />
        ))}
      </Box>
      {!inline && (
        <Typography variant="overline" sx={{ position: 'absolute', left: 0, bottom: 0 }}>
          a história aparece quando a imagem se completa
        </Typography>
      )}
    </Box>
  )
}

function DaikiPreview({ inline }: { inline: boolean }) {
  return (
    <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', p: 4 }}>
      <Box sx={{ position: 'absolute', inset: '11%', border: '1px dashed', borderColor: 'divider' }} />
      <Typography
        variant="h2"
        sx={{ fontSize: inline ? 'clamp(32px, 7vw, 52px)' : 'clamp(42px, 7vw, 88px)', textAlign: 'center', maxWidth: '7ch' }}
      >
        tarefa do{' '}
        <Box component="em" sx={{ color: 'primary.main', fontStyle: 'italic' }}>
          daiki
        </Box>
      </Typography>
      {!inline && (
        <Typography variant="overline" sx={{ position: 'absolute', bottom: '7%' }}>
          espaço em construção
        </Typography>
      )}
    </Box>
  )
}

const PREVIEWS = {
  atrium: AtriumPreview,
  puzzle: PuzzlePreview,
  daiki: DaikiPreview,
}

function DestinationPreview({ id, inline = false }: { id: LandingDestinationId; inline?: boolean }) {
  const Preview = PREVIEWS[id]
  return (
    <Box
      aria-hidden={inline || undefined}
      aria-live={inline ? undefined : 'polite'}
      aria-label={inline ? undefined : `Prévia de ${id}`}
      sx={{
        position: 'relative',
        display: 'grid',
        alignItems: 'center',
        ...(inline ? { height: 'clamp(10rem, 55vw, 16rem)', mt: 2 } : { minHeight: 570 }),
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Preview inline={inline} />
    </Box>
  )
}

export function DestinationShowcase({ destinations, activeId, onSelect }: DestinationShowcaseProps) {
  const inlinePreviews = useMediaQuery(
    (theme: Theme) => `${theme.breakpoints.down('md')}, (hover: none) and (pointer: coarse)`,
  )

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: inlinePreviews ? 'minmax(0, 1fr)' : 'minmax(310px, .72fr) minmax(0, 1.28fr)',
        gap: 7,
        alignItems: 'stretch',
      }}
    >
      <Box role="list" sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
        {destinations.map((destination) => {
          const active = !inlinePreviews && destination.id === activeId
          return (
            <Box key={destination.id} role="listitem">
              <ButtonBase
                component={RouterLink}
                to={destination.path}
                onMouseEnter={inlinePreviews ? undefined : () => onSelect(destination.id)}
                onFocus={inlinePreviews ? undefined : () => onSelect(destination.id)}
                sx={{
                  width: '100%',
                  minHeight: 0,
                  display: 'block',
                  textAlign: 'left',
                  color: 'inherit',
                  textDecoration: 'none',
                  py: inlinePreviews ? 3 : 4,
                  pr: inlinePreviews ? 0 : 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  opacity: inlinePreviews || active ? 1 : 0.55,
                  transition: inlinePreviews
                    ? 'none'
                    : 'opacity .5s cubic-bezier(.66,0,.25,1), padding-left .5s cubic-bezier(.66,0,.25,1)',
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
                {inlinePreviews && <DestinationPreview id={destination.id} inline />}
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
      {!inlinePreviews && <DestinationPreview id={activeId} />}
    </Box>
  )
}

