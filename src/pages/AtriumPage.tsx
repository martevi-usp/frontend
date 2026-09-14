import { Box, Container, Typography } from '@mui/material'
import { useState } from 'react'
import { MuseumRail } from '../components/MuseumRail'
import { ResultsGrid } from '../components/ResultsGrid'
import { SearchBar } from '../components/SearchBar'

export default function AtriumPage() {
  const [query, setQuery] = useState('')

  return (
    <Box component="main">
      <Box sx={{ pt: { xs: 6, sm: 9 } }}>
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4 } }}>
          <Typography variant="overline">martevi</Typography>
          <Typography variant="h1" sx={{ fontSize: 'clamp(40px, 8vw, 96px)', mt: 1 }}>
            Sete museus, um <Box component="em" sx={{ fontStyle: 'italic', color: 'primary.main' }}>átrio</Box>.
          </Typography>
        </Container>
      </Box>

      <MuseumRail />

      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4 }, pb: 8, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="overline">Buscar em todos os museus</Typography>
        <Box sx={{ mt: 2 }}>
          <SearchBar value={query} onChange={setQuery} placeholder="Girassóis, retrato, porcelana…" />
        </Box>
        <Box sx={{ mt: 2 }}>
          <ResultsGrid query={query} onQueryChange={setQuery} showProvider />
        </Box>
      </Container>
    </Box>
  )
}
