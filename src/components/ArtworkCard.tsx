import { Box, Typography } from '@mui/material'
import type { ArtworkSummary } from '../api/types'
import { getMuseum } from '../museums/catalog'

interface ArtworkCardProps {
  item: ArtworkSummary
  width: number
  aspect: number
  onAspect: (id: string, aspect: number) => void
  /** Shown in fan-out (cross-museum) results so a mixed grid stays legible. */
  showProvider?: boolean
}

export function ArtworkCard({ item, width, aspect, onAspect, showProvider }: ArtworkCardProps) {
  const height = width / aspect
  const title = item.title || 'Sem título' // backend sends "" (not null) when a provider has none
  const dimensionLabel =
    item.height_cm != null && item.width_cm != null
      ? `${item.width_cm} × ${item.height_cm} cm`
      : 'medida não informada pela API'

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'block',
        width,
        height,
        overflow: 'hidden',
        bgcolor: 'paper3',
        color: 'inherit',
        transition: 'transform .5s cubic-bezier(.66,0,.25,1), box-shadow .5s cubic-bezier(.66,0,.25,1)',
        '&:hover': { transform: 'translateY(-3px)' },
        '&:hover .artwork-cap': { opacity: 1, transform: 'none' },
      }}
    >
      {item.thumbnail_url ? (
        <Box
          component="img"
          src={item.thumbnail_url}
          alt={title}
          loading="lazy"
          onLoad={(e) => {
            const img = e.currentTarget
            if (img.naturalWidth && img.naturalHeight) {
              onAspect(item.id, img.naturalWidth / img.naturalHeight)
            }
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
          sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        />
      ) : (
        <Typography
          variant="caption"
          sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', px: 1 }}
        >
          sem imagem
        </Typography>
      )}

      <Box
        className="artwork-cap"
        sx={{
          position: 'absolute',
          inset: 'auto 0 0 0',
          p: '34px 13px 12px',
          color: 'background.default',
          background: 'linear-gradient(rgba(12,10,8,0), rgba(12,10,8,.82) 46%, rgba(12,10,8,.94))',
          opacity: 0,
          transform: 'translateY(8px)',
          transition: 'opacity .42s cubic-bezier(.66,0,.25,1), transform .42s cubic-bezier(.66,0,.25,1)',
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ color: 'inherit', fontSize: 16, lineHeight: 1.14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {title}
        </Typography>
        <Typography variant="caption" component="div" sx={{ color: 'inherit', opacity: 0.76, mt: 0.5 }}>
          {[item.date, showProvider ? getMuseum(item.provider_id)?.name : undefined].filter(Boolean).join(' · ')}
        </Typography>
        <Typography variant="caption" component="div" sx={{ color: 'inherit', opacity: 0.6, mt: 0.25 }}>
          {dimensionLabel}
        </Typography>
      </Box>
    </Box>
  )
}
