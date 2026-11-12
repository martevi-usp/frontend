import { Box, Container, Typography } from '@mui/material'
import { Link, useSearchParams } from 'react-router-dom'
import { ResultsGrid } from '../components/ResultsGrid'
import { SearchBar } from '../components/SearchBar'

// A dedicated route (not inline on the atrium) so a cross-museum search has
// its own URL (shareable, back-button-able) and doesn't compete for space
// with the museum rail on "/".
export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''

  const setQuery = (value: string) => {
    if (value) setParams({ q: value }, { replace: true })
    else setParams({}, { replace: true })
  }

  return (
    <Box component="main">
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4 }, pt: { xs: 6, sm: 9 } }}>
        <Typography
          component={Link}
          to="/atrio"
          variant="overline"
          sx={{ display: 'inline-block', textDecoration: 'none', color: 'text.disabled', mb: 2 }}
        >
          ← átrio
        </Typography>
        <Typography variant="h2" sx={{ fontSize: 'clamp(32px, 6vw, 72px)' }}>
          Buscar em <Box component="em" sx={{ fontStyle: 'italic', color: 'primary.main' }}>todos os museus</Box>
        </Typography>
      </Container>

      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4 }, pb: 8, pt: 4, mt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
        <SearchBar value={query} onChange={setQuery} placeholder="Girassóis, retrato, porcelana…" />
        <Box sx={{ mt: 2 }}>
          <ResultsGrid query={query} onQueryChange={setQuery} showProvider />
        </Box>
      </Container>
    </Box>
  )
}
