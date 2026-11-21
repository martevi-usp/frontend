import {
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ApiError, getArtwork, resolveImageUrl } from '../api/client'
import type { Artwork, ArtworkSummary } from '../api/types'
import { GalleryRoom } from '../components/gallery/GalleryRoom'
import { ZoomViewer } from '../components/gallery/ZoomViewer'
import { ClearIcon } from '../components/icons'
import { ROOMS, type WallKey } from '../components/gallery/palette'
import { formatCm, resolvePaintingSize, seedFromId, type PaintingSize } from '../components/gallery/scene'
import { getMuseum } from '../components/museums/catalog'
import { useProgressiveImage } from '../hooks/useProgressiveImage'

type Fetch = { kind: 'loading' } | { kind: 'ready'; artwork: Artwork } | { kind: 'error'; notFound: boolean }

/** What a card hands over when it links here, so the room opens instantly. */
export interface ArtworkLinkState {
  summary?: ArtworkSummary
}

const WALL_STORAGE_KEY = 'martevi:sala:parede'

function readWall(): WallKey {
  // `?parede=galeria` picks a wall for a shared link; otherwise the visitor's last choice.
  const fromUrl = new URLSearchParams(window.location.search).get('parede')
  if (fromUrl === 'galeria' || fromUrl === 'salao') return fromUrl
  try {
    const v = localStorage.getItem(WALL_STORAGE_KEY)
    return v === 'galeria' || v === 'salao' ? v : 'salao'
  } catch {
    return 'salao'
  }
}

const SIZE_NOTES: Record<PaintingSize['source'], string | null> = {
  api: null,
  swapped:
    'Largura e altura informadas pelo museu pareciam invertidas em relação à imagem — exibidas na orientação da imagem.',
  adjusted:
    'As medidas do museu não batem com a proporção da imagem (podem incluir moldura ou suporte). A área foi mantida e a proporção segue a imagem.',
  partial: 'O museu informou só uma das medidas; a outra foi deduzida da proporção da imagem.',
  estimated: 'O museu não informou as medidas desta obra — o tamanho na sala é uma estimativa.',
}

const toggleSx = {
  px: 1.75,
  fontSize: 9.5,
  letterSpacing: '.16em',
  borderColor: 'divider',
  '&.Mui-selected': {
    bgcolor: 'text.primary',
    color: 'background.default',
    '&:hover': { bgcolor: 'text.primary' },
  },
} as const

export default function ArtworkPage() {
  const { artworkId = '' } = useParams<{ artworkId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const preview = (location.state as ArtworkLinkState | null)?.summary
  const summary = preview?.id === artworkId ? preview : undefined

  const [fetched, setFetched] = useState<{ id: string; state: Fetch }>({ id: '', state: { kind: 'loading' } })
  const [attempt, setAttempt] = useState(0)
  const [wall, setWall] = useState<WallKey>(readWall)
  const [showMeasures, setShowMeasures] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  // The wall label pulses gently until the visitor has opened it once.
  const [labelFound, setLabelFound] = useState(false)
  const [zoomFrom, setZoomFrom] = useState<DOMRect | null>(null)

  useEffect(() => {
    const ctl = new AbortController()
    getArtwork(artworkId, ctl.signal)
      .then((artwork) => setFetched({ id: artworkId, state: { kind: 'ready', artwork } }))
      .catch((err: unknown) => {
        if (ctl.signal.aborted) return
        setFetched({ id: artworkId, state: { kind: 'error', notFound: err instanceof ApiError && err.status === 404 } })
      })
    return () => ctl.abort()
  }, [artworkId, attempt])

  const state: Fetch = fetched.id === artworkId ? fetched.state : { kind: 'loading' }
  const artwork: ArtworkSummary | undefined = state.kind === 'ready' ? state.artwork : summary
  const detail = state.kind === 'ready' ? state.artwork : undefined

  const thumb = artwork?.thumbnail_url ? resolveImageUrl(artwork.thumbnail_url) : null
  const full = detail?.image_url ? resolveImageUrl(detail.image_url) : null
  const image = useProgressiveImage(thumb, full)

  const imageAspect = image.kind === 'ready' ? image.aspect : null
  const size = useMemo(
    () =>
      artwork ? resolvePaintingSize({ heightCm: artwork.height_cm, widthCm: artwork.width_cm }, imageAspect) : null,
    [artwork, imageAspect],
  )

  const museum = getMuseum(artwork?.provider_id ?? artworkId.split(':')[0])
  const title = artwork?.title || 'Sem título'

  const goBack = () => {
    // A direct visit (shared link, reload) has no in-app history to return to.
    if (location.key !== 'default') navigate(-1)
    else navigate(museum ? `/museu/${museum.id}` : '/atrio')
  }

  const changeWall = (next: WallKey) => {
    setWall(next)
    try {
      localStorage.setItem(WALL_STORAGE_KEY, next)
    } catch {
      // private mode / storage blocked — the choice just won't be remembered
    }
  }

  if (state.kind === 'error' && !artwork) {
    return (
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4 }, pt: 9 }}>
        <Typography variant="h3">{state.notFound ? 'Obra não encontrada.' : 'A obra não respondeu.'}</Typography>
        <Typography variant="body1" sx={{ mt: 2, maxWidth: '52ch' }}>
          {state.notFound
            ? 'Este endereço não corresponde a nenhuma obra do acervo.'
            : 'Não foi possível buscar os dados desta obra agora.'}
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
          {!state.notFound && (
            <Button variant="contained" onClick={() => setAttempt((n) => n + 1)}>
              Tentar de novo
            </Button>
          )}
          <Button variant="outlined" onClick={goBack}>
            Voltar
          </Button>
        </Stack>
      </Container>
    )
  }

  const sizeLabel = size ? `${formatCm(size.widthCm)} × ${formatCm(size.heightCm)}` : null
  const sizeNote = size ? SIZE_NOTES[size.source] : null

  return (
    <Box component="main" sx={{ pb: 6 }}>
      {/* ── masthead ───────────────────────────────────────────────── */}
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4 }, pt: { xs: 3, sm: 5 }, pb: { xs: 2.5, sm: 3.5 } }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 2 }}>
          <Typography
            component="button"
            type="button"
            onClick={goBack}
            variant="overline"
            sx={{
              border: 0,
              bgcolor: 'transparent',
              p: 0,
              cursor: 'pointer',
              color: 'text.disabled',
              '&:hover': { color: 'text.primary' },
            }}
          >
            ← voltar
          </Typography>
          {museum && (
            <Typography
              component={Link}
              to={`/museu/${museum.id}`}
              variant="overline"
              sx={{ textDecoration: 'none', textAlign: 'right', '&:hover': { color: 'text.primary' } }}
            >
              {museum.name}
            </Typography>
          )}
        </Stack>
        {artwork ? (
          <Typography
            variant="h2"
            component="h1"
            sx={{ fontSize: 'clamp(30px, 5.2vw, 64px)', mt: 2, maxWidth: '22ch' }}
          >
            {title}
            {artwork.date && (
              <Box
                component="span"
                sx={{
                  fontStyle: 'italic',
                  color: 'text.disabled',
                  fontSize: '0.5em',
                  ml: '.5em',
                  whiteSpace: 'nowrap',
                }}
              >
                {artwork.date}
              </Box>
            )}
          </Typography>
        ) : (
          <Skeleton
            variant="text"
            sx={{ bgcolor: 'paper3', fontSize: 'clamp(30px, 5.2vw, 64px)', mt: 2, maxWidth: 520 }}
          />
        )}
      </Container>

      {/* ── the room ───────────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 'clamp(420px, 70svh, 680px)', md: 'clamp(520px, 78svh, 980px)' },
          bgcolor: ROOMS[wall].wall,
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: 'background-color .8s',
        }}
      >
        {size && artwork && image.kind !== 'loading' ? (
          <GalleryRoom
            size={size}
            src={image.kind === 'ready' ? image.src : null}
            title={title}
            seed={seedFromId(artwork.id)}
            wall={wall}
            showMeasures={showMeasures}
            hintLabel={!labelFound}
            onOpenInfo={() => {
              setLabelFound(true)
              setInfoOpen(true)
            }}
            onZoom={setZoomFrom}
          />
        ) : (
          <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <Typography variant="overline" sx={{ color: ROOMS[wall].annotation }}>
              abrindo a sala…
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── room controls ──────────────────────────────────────────── */}
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4 }, pt: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 1.5 }}
        >
          <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="overline">parede</Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={wall}
              onChange={(_, v: WallKey | null) => v && changeWall(v)}
            >
              {(Object.keys(ROOMS) as WallKey[]).map((key) => (
                <ToggleButton key={key} value={key} sx={toggleSx}>
                  {ROOMS[key].label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <ToggleButton
              value="medidas"
              size="small"
              selected={showMeasures}
              onChange={() => setShowMeasures((v) => !v)}
              sx={toggleSx}
            >
              Medidas
            </ToggleButton>
          </Stack>
          <Typography variant="overline" component="p" sx={{ m: 0, textAlign: { sm: 'right' } }}>
            escala real{sizeLabel ? ` · obra de ${sizeLabel}` : ''}
            {size?.source === 'estimated' ? ' (tamanho estimado)' : ''}
            <Box component="span" sx={{ display: 'block', color: 'text.secondary' }}>
              clique no quadro para ampliar · na etiqueta ao lado para ler a ficha
            </Box>
          </Typography>
        </Stack>
      </Container>

      {/* ── catalogue entry: opens from the wall label ──────────────── */}
      <Drawer
        anchor="right"
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: 480 },
              bgcolor: 'background.default',
              border: 0,
              borderLeft: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        <Box sx={{ px: { xs: 2.5, sm: 4.5 }, pt: { xs: 2, sm: 3 }, pb: 6 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="overline">ficha da obra</Typography>
            <IconButton
              aria-label="Fechar a ficha"
              onClick={() => setInfoOpen(false)}
              sx={{ width: 44, height: 44, mr: -1.5 }}
            >
              <ClearIcon width={20} height={20} />
            </IconButton>
          </Stack>

          <Typography variant="h3" component="h2" sx={{ fontSize: 'clamp(28px, 4vw, 40px)', mt: 2 }}>
            {title}
          </Typography>
          {artwork?.date && (
            <Typography variant="h5" component="p" sx={{ fontStyle: 'italic', color: 'text.disabled', mt: 0.5 }}>
              {artwork.date}
            </Typography>
          )}

          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 3, pt: 3 }}>
            {state.kind === 'loading' ? (
              [100, 96, 88, 60].map((w) => (
                <Skeleton key={w} variant="text" sx={{ bgcolor: 'paper3', width: `${w}%` }} />
              ))
            ) : (
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', fontSize: 15.5 }}>
                {detail?.description || 'O museu não publicou um texto sobre esta obra.'}
              </Typography>
            )}
          </Box>

          <Box component="dl" sx={{ mt: 4, mb: 0 }}>
            <Fact term="Dimensões">
              {artwork?.width_cm != null && artwork.height_cm != null
                ? `${formatCm(artwork.width_cm)} × ${formatCm(artwork.height_cm)}`
                : 'não informadas pelo museu'}
            </Fact>
            {detail?.medium && <Fact term="Técnica">{detail.medium}</Fact>}
            {detail?.culture && <Fact term="Cultura">{detail.culture}</Fact>}
            {detail?.department && <Fact term="Departamento">{detail.department}</Fact>}
            {museum && (
              <Fact term="Acervo">
                {museum.name}
                <Box component="span" sx={{ display: 'block', color: 'text.disabled', fontSize: 12 }}>
                  {museum.location}
                </Box>
              </Fact>
            )}
          </Box>
          {sizeNote && (
            <Typography variant="body2" sx={{ mt: 2, fontSize: 12.5, color: 'text.disabled' }}>
              {sizeNote}
            </Typography>
          )}

          <Stack direction="row" sx={{ gap: 1.5, mt: 4, flexWrap: 'wrap' }}>
            {detail?.source_url && (
              <Button variant="contained" href={detail.source_url} target="_blank" rel="noreferrer">
                Ver no site do museu ↗
              </Button>
            )}
            {image.kind === 'ready' && (
              <Button
                variant="outlined"
                onClick={() => {
                  setInfoOpen(false)
                  setZoomFrom(
                    new DOMRect(window.innerWidth / 2 - 40, window.innerHeight / 2 - 40, 80, 80 / image.aspect),
                  )
                }}
              >
                Ampliar obra
              </Button>
            )}
          </Stack>
        </Box>
      </Drawer>

      {zoomFrom && image.kind === 'ready' && (
        <ZoomViewer
          from={zoomFrom}
          getOrigin={() => zoomFrom}
          thumb={image.src}
          full={full}
          aspect={image.aspect}
          title={title}
          onClose={() => setZoomFrom(null)}
        />
      )}
    </Box>
  )
}

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr',
        gap: 2,
        py: 1.25,
        borderBottom: '1px solid',
        borderColor: 'lineSoft',
      }}
    >
      <Typography component="dt" variant="caption" sx={{ textTransform: 'uppercase', pt: '3px' }}>
        {term}
      </Typography>
      <Typography component="dd" variant="body2" sx={{ m: 0, color: 'text.primary' }}>
        {children}
      </Typography>
    </Box>
  )
}
