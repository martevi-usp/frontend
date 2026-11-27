import { Box, Typography } from '@mui/material'

export default function DaikiPage() {
  return (
    <Box component="main" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
      <Typography variant="h1" sx={{ fontSize: 'clamp(54px, 11vw, 150px)', textAlign: 'center' }}>
        tarefa do daiki
      </Typography>
    </Box>
  )
}

