import { Box, Container, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MuseumRail } from '../components/MuseumRail'
import { SearchIcon } from '../components/icons'

export default function AtriumPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const goSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) navigate(`/busca?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <Box component="main">
      <Box sx={{ pt: { xs: 6, sm: 9 } }}>
        <Container
          maxWidth={false}
          sx={{
            px: { xs: 2, sm: 4 },
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="overline">martevi</Typography>
            <Typography variant="h1" sx={{ fontSize: 'clamp(40px, 8vw, 96px)', mt: 1 }}>
              Sete museus, um <Box component="em" sx={{ fontStyle: 'italic', color: 'primary.main' }}>átrio</Box>.
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={goSearch}
            sx={{
              flex: '0 0 auto',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              borderBottom: '1px solid',
              borderColor: 'divider',
              pb: 0.75,
              minWidth: { xs: '100%', sm: 220 },
              mt: { xs: 0, sm: 1 },
            }}
          >
            <SearchIcon width={15} style={{ opacity: 0.5, flexShrink: 0 }} />
            <Box
              component="input"
              type="search"
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              placeholder="Buscar em todos os museus…"
              aria-label="Buscar em todos os museus"
              sx={{
                flex: 1,
                minWidth: 0,
                border: 0,
                outline: 0,
                bgcolor: 'transparent',
                font: 'inherit',
                fontSize: 13,
                color: 'text.primary',
                '&::placeholder': { color: 'text.disabled', opacity: 1 },
              }}
            />
          </Box>
        </Container>
      </Box>

      <MuseumRail />
    </Box>
  )
}
