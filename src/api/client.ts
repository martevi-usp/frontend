import type { Artwork, ArtworkSummary, FanOutSearchResult, ProviderSearchStatus } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function getJson<T>(
  path: string,
  params: Record<string, string | number | undefined>,
  signal?: AbortSignal,
): Promise<T> {
  const url = new URL(path, API_URL)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }
  const res = await fetch(url, { signal })
  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText)
    throw new ApiError(res.status, message || res.statusText)
  }
  return res.json() as Promise<T>
}

export function searchArtworks(
  params: { q: string; providerId?: string; department?: string; limit: number },
  signal?: AbortSignal,
): Promise<FanOutSearchResult> {
  return getJson<FanOutSearchResult>(
    '/artworks',
    { q: params.q, provider_id: params.providerId, department: params.department, limit: params.limit },
    signal,
  )
}

/** Query-less "page of the collection" — requires providerId (no fan-out browse). */
export function browseArtworks(
  params: { providerId: string; limit: number; offset: number },
  signal?: AbortSignal,
): Promise<FanOutSearchResult> {
  return getJson<FanOutSearchResult>(
    '/artworks',
    { provider_id: params.providerId, limit: params.limit, offset: params.offset },
    signal,
  )
}

interface ProviderEventPayload extends ProviderSearchStatus {
  results: ArtworkSummary[]
}

/**
 * Cross-museum search over SSE (see GET /artworks/stream): calls onProvider
 * once per provider as it finishes (completion order, not registry order),
 * then onDone once the backend's "done" event arrives. Returns a close
 * function — callers must call it to stop the connection (e.g. on unmount
 * or when a newer search supersedes this one), since EventSource does not
 * close itself when the caller loses interest.
 */
export function streamFanOutSearch(
  params: { q: string; limit: number },
  onProvider: (status: ProviderSearchStatus, results: ArtworkSummary[]) => void,
  onDone: () => void,
  onError: () => void,
): () => void {
  const url = new URL('/artworks/stream', API_URL)
  url.searchParams.set('q', params.q)
  url.searchParams.set('limit', String(params.limit))

  const source = new EventSource(url)

  source.addEventListener('provider', (event) => {
    const payload = JSON.parse((event as MessageEvent<string>).data) as ProviderEventPayload
    const { results, ...status } = payload
    onProvider(status, results)
  })

  source.addEventListener('done', () => {
    source.close()
    onDone()
  })

  source.onerror = () => {
    source.close()
    onError()
  }

  return () => source.close()
}

export function getArtwork(id: string, signal?: AbortSignal): Promise<Artwork> {
  // `id` is "{provider_id}:{external_id}" and the external part may itself
  // contain colons (e.g. Smithsonian's "edanmdm:saam_..."); the backend only
  // splits on the first ":" (`artwork_id.partition(":")`), so the whole
  // string must travel as one encoded path segment.
  return getJson<Artwork>(`/artworks/${encodeURIComponent(id)}`, {}, signal)
}
