import { Box, Button, Stack, Typography } from '@mui/material'

import { Link as RouterLink } from 'react-router-dom'

/** Placeholder home. Its real job for now is to be the page a visitor lands
 *  on while the backend wakes up (see api/warmup.ts). */
export default function HomePage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
      <Stack spacing={3} sx={{ maxWidth: '52ch' }}>
        <Typography variant="overline">martevi</Typography>
        <Typography variant="h3">Um museu para montar peça por peça.</Typography>
        <Typography variant="body2" sx={{ lineHeight: 1.85 }}>
          Em breve: o acervo de vários museus reunido num só lugar. Por enquanto, monte um
          quebra-cabeça de uma obra e descubra a história por trás dela.
        </Typography>
        <Box>
          <Button variant="contained" component={RouterLink} to="/quebra-cabeca">
            Montar um quebra-cabeça
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}
