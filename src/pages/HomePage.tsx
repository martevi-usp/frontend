import { useReducer } from 'react'
import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { DestinationShowcase } from '../components/landing/DestinationShowcase'
import { LandingMuseumCarousel } from '../components/landing/LandingMuseumCarousel'
import { INITIAL_LANDING_STATE, reduceLandingState } from '../landing/controller'
import { LANDING_DESTINATIONS, MISSION_PILLARS } from '../landing/content'

export default function HomePage() {
  const [state, dispatch] = useReducer(reduceLandingState, INITIAL_LANDING_STATE)

  return (
    <Box component="main" sx={{ minHeight: '100vh', overflow: 'hidden' }}>
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4, lg: 6 } }}>
        <Box
          component="header"
          sx={{
            minHeight: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="h5"
            component={RouterLink}
            to="/"
            sx={{ color: 'text.primary', textDecoration: 'none', fontSize: 25 }}
          >
            martevi
          </Typography>
          <Stack direction="row" spacing={{ xs: 1, sm: 3 }} sx={{ alignItems: 'center' }}>
            <Typography
              component="a"
              href="#experiencias"
              variant="overline"
              sx={{ color: 'text.disabled', textDecoration: 'none', display: { xs: 'none', sm: 'block' } }}
            >
              experiências
            </Typography>
            <Button component={RouterLink} to="/atrio" variant="outlined" size="small">
              Entrar no átrio
            </Button>
          </Stack>
        </Box>

        <Box
          sx={{
            borderBottom: '4px double',
            borderColor: 'text.primary',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.18fr) minmax(340px, .82fr)' },
          }}
        >
          <Box
            sx={{
              py: { xs: 6, sm: 8, md: 10 },
              pr: { md: 6 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: { xs: 3, md: 4 },
            }}
          >
            <Box>
              <Typography variant="overline" component="p" sx={{ color: 'primary.main', mb: 2 }}>
                museus · obras · história
              </Typography>
              <Typography
                variant="h1"
                sx={{
                  maxWidth: '16ch',
                  fontSize: 'clamp(2rem, 9.5vw, 4.75rem)',
                  lineHeight: 1,
                  overflowWrap: 'anywhere',
                  animation: 'landing-title-in 1s cubic-bezier(.66,0,.25,1) both',
                  '@keyframes landing-title-in': {
                    from: { transform: 'translateY(22px)' },
                    to: { transform: 'translateY(0)' },
                  },
                  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
                }}
              >
                <Box component="span" sx={{ display: 'block', mb: 1, fontSize: '1.25em' }}>
                  Martevi:
                </Box>
                <Box component="em" sx={{ color: 'primary.main', fontStyle: 'italic' }}>
                  Democratizando
                </Box>
                {' '}
                <Box component="span" sx={{ display: 'inline-block' }}>o acesso à cultura</Box>
              </Typography>
            </Box>

            <Typography variant="body1" sx={{ maxWidth: 610, fontSize: { xs: 16, sm: 18 }, lineHeight: 1.65 }}>
              O Martevi reúne acervos abertos de grandes museus em uma visita interativa. Para quem
              não pode atravessar o oceano, mas quer experimentar tudo de perto.
            </Typography>
          </Box>
          <LandingMuseumCarousel />
        </Box>

        <Box
          id="proposito"
          component="section"
          aria-labelledby="proposito-titulo"
          sx={{ py: { xs: 8, md: 13 }, scrollMarginTop: 24 }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '.72fr 1.28fr' },
              gap: { xs: 3, md: 8 },
              pb: { xs: 6, md: 9 },
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="overline">por que existe</Typography>
            <Typography id="proposito-titulo" variant="h2" sx={{ fontSize: 'clamp(38px, 6vw, 78px)', maxWidth: '15ch' }}>
              O acesso à cultura não deve conhecer barreiras
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            {MISSION_PILLARS.map((pillar) => (
              <Box
                key={pillar.eyebrow}
                sx={{
                  py: { xs: 4, md: 6 },
                  px: { xs: 0, md: 4 },
                  borderTop: { xs: '1px solid', md: 0 },
                  borderLeft: { xs: 0, md: '1px solid' },
                  borderColor: 'divider',
                  '&:first-of-type': { pl: 0, borderLeft: 0 },
                }}
              >
                <Typography variant="overline">{pillar.eyebrow}</Typography>
                <Typography variant="h4" sx={{ mt: 2, fontSize: 'clamp(27px, 3vw, 40px)' }}>
                  {pillar.title}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2, maxWidth: '43ch', fontSize: 16 }}>
                  {pillar.description}
                  {pillar.highlight && (
                    <>
                      {' '}
                      <Box component="span" sx={{ color: 'primary.main' }}>{pillar.highlight}</Box>
                    </>
                  )}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          id="experiencias"
          component="section"
          aria-labelledby="experiencias-titulo"
          sx={{ pt: { xs: 2, md: 3 }, pb: { xs: 9, md: 14 }, scrollMarginTop: 24 }}
        >
          <Box sx={{ mb: { xs: 5, md: 7 } }}>
            <Typography variant="overline">escolha uma entrada</Typography>
            <Typography
              id="experiencias-titulo"
              variant="h2"
              sx={{ mt: 1.5, fontSize: 'clamp(42px, 7vw, 88px)', textWrap: { xs: 'balance', md: 'wrap' } }}
            >
              Sua experiência começa aqui.
            </Typography>
          </Box>
          <DestinationShowcase
            destinations={LANDING_DESTINATIONS}
            activeId={state.activeDestination}
            onSelect={(destination) => dispatch({ type: 'destination-selected', destination })}
          />
        </Box>

        <Box
          component="footer"
          sx={{
            minHeight: 96,
            borderTop: '4px double',
            borderColor: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            py: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontSize: 24 }}>martevi</Typography>
        </Box>
      </Container>
    </Box>
  )
}
