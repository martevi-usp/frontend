import { Box, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { getMuseum } from '../museums/catalog'

interface MuseumLabelTileProps {
  providerId: string
  width: number
  height: number
}

// Marks where a new museum's results start in the cross-museum search grid —
// a filled dark tile "dealt into the same flow" as the artwork thumbnails,
// the same move salas.html's masonry makes for its own unit tiles, just
// keyed to a whole museum here instead of a collection sub-unit.
export function MuseumLabelTile({ providerId, width, height }: MuseumLabelTileProps) {
  const museum = getMuseum(providerId)
  return (
    <Box
      component={Link}
      to={`/museu/${providerId}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        width,
        height,
        p: 2,
        bgcolor: 'text.primary',
        color: 'background.default',
        textDecoration: 'none',
        transition: 'background-color .4s cubic-bezier(.66,0,.25,1)',
        '&:hover': { bgcolor: 'primary.main' },
      }}
    >
      <Typography variant="overline" sx={{ color: 'inherit', opacity: 0.7 }}>
        {museum?.location ?? providerId}
      </Typography>
      <Typography variant="h5" sx={{ color: 'inherit', mt: 0.5, lineHeight: 1.05 }}>
        {museum?.name ?? providerId}
      </Typography>
    </Box>
  )
}
