import { Box, Container, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MuseumRail } from '../components/museums/MuseumRail'
import { SearchBar } from '../components/SearchBar'

export default function AtriumPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const goSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) navigate(`/busca?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <Box
      component="main"
      sx={{
        height: '100vh',
        '@supports (height: 100dvh)': { height: '100dvh' },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ flexShrink: 0, pt: { xs: 2.5, sm: 4 }, pb: { xs: 2, sm: 3 } }}>
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 4 } }}>
          <Typography variant="overline">martevi</Typography>
          <Typography variant="h1" sx={{ fontSize: 'clamp(28px, 6.5vw, 60px)', mt: 1 }}>
            Sete museus, um <Box component="em" sx={{ fontStyle: 'italic', color: 'primary.main' }}>átrio</Box>.
          </Typography>

          <Box component="form" onSubmit={goSearch} sx={{ mt: { xs: 2, sm: 2.5 }, maxWidth: 520 }}>
            <SearchBar
              value={query}
              onChange={setQuery}
              size="compact"
              placeholder="Buscar em todos os museus…"
              ariaLabel="Buscar em todos os museus"
            />
          </Box>
        </Container>
      </Box>

      <MuseumRail />
    </Box>
  )
}
