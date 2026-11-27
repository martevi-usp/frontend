import { Box, Typography } from '@mui/material'
import { HomeLink } from '../components/HomeLink'

export default function DaikiPage() {
  return (
    <Box component="main" sx={{ minHeight: '100vh', display: 'grid', gridTemplateRows: '1fr auto 1fr', p: 3 }}>
      <Box component="header" sx={{ justifySelf: 'start', alignSelf: 'start' }}>
        <HomeLink />
      </Box>
      <Typography variant="h1" sx={{ fontSize: 'clamp(54px, 11vw, 150px)', textAlign: 'center' }}>
        tarefa do daiki
      </Typography>
    </Box>
  )
}

