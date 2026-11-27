import { Button } from '@mui/material'
import { Link } from 'react-router-dom'
import { ArrowIcon } from './icons'

export function HomeLink() {
  return (
    <Button component={Link} to="/" variant="outlined" size="small" startIcon={<ArrowIcon width={16} />}>
      Voltar à página inicial
    </Button>
  )
}
