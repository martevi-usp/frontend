import { Button } from '@mui/material'
import { Link } from 'react-router-dom'
import { ArrowIcon } from './icons'

export function HomeLink() {
  return (
    <Button
      component={Link}
      to="/"
      aria-label="Voltar à página inicial"
      variant="text"
      size="small"
      startIcon={<ArrowIcon width={14} />}
      sx={{
        minWidth: 0,
        px: 1.25,
        color: 'text.primary',
        '& .MuiButton-startIcon': { ml: 0, mr: 0.5 },
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '7px 0',
          border: '1px solid currentColor',
          borderRadius: 1,
          pointerEvents: 'none',
        },
        '&:hover': { bgcolor: 'transparent', color: 'primary.main' },
      }}
    >
      Voltar
    </Button>
  )
}
