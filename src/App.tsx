import { Box, Button, Stack, Typography } from '@mui/material'

/**
 * Placeholder. This is scaffolding, not a screen — it exists only to prove
 * the theme (fonts, colors, button variants, focus ring) is wired correctly.
 * Replace with real routing/screens when the app itself starts.
 */
function App() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100svh',
        display: 'grid',
        placeItems: 'center',
        px: 3,
      }}
    >
      <Stack spacing={3} sx={{ maxWidth: 560, textAlign: 'center' }}>
        <Typography variant="overline">martevi · scaffold</Typography>
        <Typography variant="h2">
          Papel e{' '}
          <Box component="em" sx={{ fontStyle: 'italic', color: 'primary.main' }}>
            tinta
          </Box>
        </Typography>
        <Typography variant="body1">
          Projeto React + TypeScript + MUI iniciado, com o tema global de{' '}
          <code>theme.ts</code> aplicado. Nenhuma tela real ainda — só a base.
        </Typography>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
          <Button variant="contained" color="primary">
            Botão cheio
          </Button>
          <Button variant="outlined" color="primary">
            Botão vazio
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

export default App
