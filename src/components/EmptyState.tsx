import { Box, Chip, Typography } from '@mui/material'

const SUGGESTIONS = ['girassóis', 'retrato', 'paisagem', 'porcelana', 'natureza-morta', 'máscara', 'tecelagem']

interface EmptyStateProps {
  kind: 'cold-start' | 'no-results' | 'error' | 'filtered-out'
  query?: string
  message?: string
  onSuggestion: (term: string) => void
}

export function EmptyState({ kind, query, message, onSuggestion }: EmptyStateProps) {
  const heading =
    kind === 'cold-start'
      ? 'Busque no acervo'
      : kind === 'no-results'
        ? `Nada encontrado para “${query}”.`
        : kind === 'filtered-out'
          ? 'Nenhum museu selecionado.'
          : 'A busca não respondeu.'

  const body =
    kind === 'cold-start'
      ? 'Digite um termo, ou experimente uma das sugestões abaixo.'
      : kind === 'no-results'
        ? 'Tente outro termo, ou uma das sugestões abaixo.'
        : kind === 'filtered-out'
          ? 'Ative pelo menos um museu para ver os resultados.'
          : (message ?? 'Não foi possível completar a busca.')

  return (
    <Box sx={{ py: 6, maxWidth: '56ch' }}>
      <Typography variant="h4" sx={{ color: kind === 'error' ? 'primary.main' : 'text.primary' }}>
        {heading}
      </Typography>
      <Typography variant="body1" sx={{ mt: 1.5 }}>
        {body}
      </Typography>
      {kind !== 'error' && kind !== 'filtered-out' && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2.5 }}>
          {SUGGESTIONS.map((term) => (
            <Chip
              key={term}
              label={term}
              onClick={() => onSuggestion(term)}
              variant="outlined"
              sx={{ borderRadius: 0, borderColor: 'divider', textTransform: 'none' }}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}
