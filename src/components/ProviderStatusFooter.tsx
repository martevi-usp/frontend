import { Box, Typography } from '@mui/material'
import type { ProviderSearchStatus } from '../api/types'
import { getMuseum } from './museums/catalog'

interface ProviderStatusFooterProps {
  providerStatus: ProviderSearchStatus[]
  /** true when browsing a museum with no query — pagination is open-ended
   * there, so a result count would read as a misleading total. Errors still
   * show; only the success count is suppressed. */
  hideCount?: boolean
}

// Tells "no matches for this query" apart from "that museum's API failed" —
// per backend/README.md's own warning that provider errors are silent
// per-item unless surfaced explicitly.
export function ProviderStatusFooter({ providerStatus, hideCount }: ProviderStatusFooterProps) {
  if (providerStatus.length === 0) return null

  const failed = providerStatus.filter((s) => !s.ok)

  if (providerStatus.length === 1) {
    const [status] = providerStatus
    if (status.ok && hideCount) return null
    return (
      <Box sx={{ mt: 2, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="overline">
          {status.ok ? `${status.count} obra(s) encontrada(s)` : `Este museu não respondeu: ${status.error ?? 'erro desconhecido'}`}
        </Typography>
      </Box>
    )
  }

  const total = providerStatus.length
  const ok = providerStatus.length - failed.length
  return (
    <Box sx={{ mt: 2, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant="overline" component="div">
        {ok} de {total} museus responderam
      </Typography>
      {failed.length > 0 && (
        <Typography variant="overline" component="div" sx={{ mt: 0.5 }}>
          sem resposta de: {failed.map((s) => getMuseum(s.provider_id)?.name ?? s.provider_id).join(', ')}
        </Typography>
      )}
    </Box>
  )
}
