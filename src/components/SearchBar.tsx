import { Box, IconButton, InputBase } from '@mui/material'
import { ClearIcon, SearchIcon } from './icons'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  ariaLabel?: string
  /** 'large' (default) is the /busca treatment; 'compact' is for smaller
   * contexts (e.g. the atrium masthead) — same serif type family as
   * 'large', just smaller, and never below the 44px touch target. */
  size?: 'compact' | 'large'
}

export function SearchBar({ value, onChange, placeholder, ariaLabel, size = 'large' }: SearchBarProps) {
  const compact = size === 'compact'

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 1.25 : 1.5,
        borderBottom: '1px solid',
        borderColor: 'text.primary',
        minHeight: 44,
        pb: compact ? 0.5 : 1.25,
      }}
    >
      <SearchIcon width={compact ? 18 : 19} style={{ opacity: 0.45, flexShrink: 0 }} />
      <InputBase
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Girassóis, retrato, porcelana…'}
        type="text"
        aria-label={ariaLabel ?? 'Buscar no acervo'}
        sx={{
          flex: 1,
          fontSize: compact ? 'clamp(18px, 2.6vw, 22px)' : { xs: '22px', sm: '32px' },
          lineHeight: 1.1,
          '& input': { fontFamily: '"Instrument Serif","Times New Roman",Times,serif', padding: 0 },
        }}
      />
      {value && (
        <IconButton
          onClick={() => onChange('')}
          aria-label="Limpar busca"
          size="small"
          sx={{ opacity: 0.5, minWidth: 44, minHeight: 44 }}
        >
          <ClearIcon width={15} />
        </IconButton>
      )}
    </Box>
  )
}
