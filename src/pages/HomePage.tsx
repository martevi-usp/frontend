import { useReducer } from 'react'
import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { DestinationShowcase } from '../components/landing/DestinationShowcase'
import { LandingMuseumIllustration } from '../components/landing/LandingMuseumIllustration'
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
              minHeight: { xs: 490, md: 650 },
              py: { xs: 7, sm: 9, md: 11 },
              pr: { md: 6 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 6,
            }}
          >
            <Box>
              <Typography variant="overline" component="p" sx={{ color: 'primary.main', mb: 2 }}>
                museus · obras · história
              </Typography>
              <Typography
                variant="h1"
                sx={{
                  maxWidth: '8.4ch',
                  fontSize: 'clamp(58px, 9.6vw, 148px)',
                  animation: 'landing-title-in 1s cubic-bezier(.66,0,.25,1) both',
                  '@keyframes landing-title-in': {
                    from: { transform: 'translateY(22px)' },
                    to: { transform: 'translateY(0)' },
                  },
                  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
                }}
              >
                A arte não cabe num só{' '}
                <Box component="em" sx={{ color: 'primary.main', fontStyle: 'italic' }}>
                  lugar.
                </Box>
              </Typography>
            </Box>

            <Box sx={{ maxWidth: 610 }}>
              <Typography variant="body1" sx={{ fontSize: { xs: 16, sm: 18 }, lineHeight: 1.65 }}>
                O martevi reúne acervos abertos de grandes museus em uma visita interativa. Para quem
                não pode atravessar o oceano — e para quem quer entender uma obra além da miniatura.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3, alignItems: { sm: 'center' } }}>
                <Button component={RouterLink} to="/atrio" variant="contained">
                  Explorar os museus
                </Button>
                <Button component={RouterLink} to="/quebra-cabeca" variant="outlined">
                  Montar uma obra
                </Button>
              </Stack>
            </Box>
          </Box>
          <LandingMuseumIllustration />
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
              Distância não deveria decidir quem pode ver de perto.
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
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { md: 'end' },
              gap: 3,
              mb: { xs: 5, md: 7 },
            }}
          >
            <Box>
              <Typography variant="overline">escolha uma entrada</Typography>
              <Typography id="experiencias-titulo" variant="h2" sx={{ mt: 1.5, fontSize: 'clamp(42px, 7vw, 88px)' }}>
                A visita começa aqui.
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ maxWidth: '42ch', fontSize: 16 }}>
              Passe o cursor ou navegue pelo teclado para conhecer cada caminho. Um clique leva direto à experiência.
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
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1,
            py: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontSize: 24 }}>martevi</Typography>
          <Typography variant="overline">museus abertos para olhar devagar</Typography>
        </Box>
      </Container>
    </Box>
  )
}
