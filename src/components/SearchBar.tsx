import { Box, IconButton, InputBase } from '@mui/material'
import { ClearIcon, SearchIcon } from './icons'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderBottom: '1px solid',
        borderColor: 'text.primary',
        pb: 1.25,
      }}
    >
      <SearchIcon width={19} style={{ opacity: 0.45, flexShrink: 0 }} />
      <InputBase
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Girassóis, retrato, porcelana…'}
        type="search"
        aria-label="Buscar no acervo"
        sx={{
          flex: 1,
          fontSize: { xs: '22px', sm: '32px' },
          lineHeight: 1.1,
          '& input': { fontFamily: '"Instrument Serif","Times New Roman",Times,serif', padding: 0 },
        }}
      />
      {value && (
        <IconButton onClick={() => onChange('')} aria-label="Limpar busca" size="small" sx={{ opacity: 0.5 }}>
          <ClearIcon width={15} />
        </IconButton>
      )}
    </Box>
  )
}
