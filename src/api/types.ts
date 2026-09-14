// Mirrors backend/src/martevi/schema/{artwork,search}.py field-for-field.

export type ProviderId = 'met' | 'aic' | 'cleveland' | 'harvard' | 'rijksmuseum' | 'smithsonian' | 'vam'

export interface ArtworkSummary {
  id: string // "{provider_id}:{external_id}"
  provider_id: string
  title: string
  date: string | null
  thumbnail_url: string | null
  height_cm: number | null
  width_cm: number | null
}

export interface Artwork extends ArtworkSummary {
  description: string | null
  medium: string | null
  culture: string | null
  department: string | null
  image_url: string | null
  image_zoom_url: string | null
  source_url: string | null
}

export interface ProviderSearchStatus {
  provider_id: string
  ok: boolean
  count: number
  error: string | null
}

export interface FanOutSearchResult {
  results: ArtworkSummary[]
  provider_status: ProviderSearchStatus[]
}
