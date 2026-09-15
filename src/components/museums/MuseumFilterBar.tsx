import { Box, Typography } from '@mui/material'
import type { ProviderSearchStatus } from '../../api/types'
import { getMuseum } from './catalog'

interface MuseumFilterBarProps {
  providerStatus: ProviderSearchStatus[]
  inactive: Set<string>
  onToggle: (providerId: string) => void
}

// One hairline toggle per museum that has reported in — deliberately not
// MUI's `Chip` (a rounded filled pill, off-brand per STEERING.md's "no
// pills, no circles" rule) but a plain button built from the same
// micro-label/overline typography used for filters elsewhere on the site.
export function MuseumFilterBar({ providerStatus, inactive, onToggle }: MuseumFilterBarProps) {
  if (providerStatus.length === 0) return null

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
      {providerStatus.map((status) => {
        const active = !inactive.has(status.provider_id)
        return (
          <Box
            key={status.provider_id}
            component="button"
            type="button"
            onClick={() => onToggle(status.provider_id)}
            aria-pressed={active}
            sx={{
              font: 'inherit',
              background: 'none',
              cursor: 'pointer',
              border: '1px solid',
              borderColor: active ? 'text.primary' : 'divider',
              px: 1.25,
              minHeight: 44,
              display: 'inline-flex',
              alignItems: 'center',
              transition: 'border-color .3s cubic-bezier(.66,0,.25,1), color .3s cubic-bezier(.66,0,.25,1)',
            }}
          >
            <Typography variant="overline" sx={{ color: active ? 'text.primary' : 'text.disabled' }}>
              {getMuseum(status.provider_id)?.name ?? status.provider_id}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}
