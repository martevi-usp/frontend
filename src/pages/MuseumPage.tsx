import { Box, Container, Typography } from '@mui/material'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MuseumBuilding } from '../components/MuseumBuilding'
import { ResultsGrid } from '../components/ResultsGrid'
import { SearchBar } from '../components/SearchBar'
import { getMuseum } from '../museums/catalog'

export default function MuseumPage() {
  const { providerId } = useParams<{ providerId: string }>()
  const museum = getMuseum(providerId)
  const [query, setQuery] = useState('')

  if (!museum) {
    return (
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4 }, pt: 9 }}>
        <Typography variant="h3">Museu não encontrado.</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          <Box component={Link} to="/" sx={{ color: 'primary.main' }}>
            ← voltar ao átrio
          </Box>
        </Typography>
      </Container>
    )
  }

  return (
    <Box component="main">
      <Container
        maxWidth={false}
        sx={{
          px: { xs: 2, sm: 4 },
          pt: { xs: 6, sm: 9 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr minmax(240px, 340px)' },
          gap: { xs: 3, md: 6 },
          alignItems: 'end',
        }}
      >
        <Box>
          <Typography
            component={Link}
            to="/"
            variant="overline"
            sx={{ display: 'inline-block', textDecoration: 'none', color: 'text.disabled', mb: 2 }}
          >
            ← átrio
          </Typography>
          <Typography variant="h2" sx={{ fontSize: 'clamp(32px, 6vw, 72px)' }}>
            {museum.name}
          </Typography>
          <Typography variant="overline" component="div" sx={{ mt: 1 }}>
            {museum.location}
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, maxWidth: '60ch' }}>
            {museum.blurb}
          </Typography>
        </Box>
        <Box
          component={MuseumBuilding}
          providerId={museum.id}
          sx={{
            display: { xs: 'none', md: 'block' },
            width: '100%',
            height: 200,
            color: 'text.disabled',
          }}
        />
      </Container>

      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4 }, pb: 8, pt: 4, mt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
        <SearchBar value={query} onChange={setQuery} />
        <Box sx={{ mt: 2 }}>
          <ResultsGrid query={query} onQueryChange={setQuery} providerId={museum.id} allowBrowse />
        </Box>
      </Container>
    </Box>
  )
}
