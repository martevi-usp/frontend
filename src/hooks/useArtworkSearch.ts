import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, browseArtworks, searchArtworks, streamFanOutSearch } from '../api/client'
import type { ArtworkSummary, ProviderSearchStatus } from '../api/types'
import { isMuseumEnabled } from '../components/museums/catalog'
import { accumulateProviderEvent, EMPTY_STREAM_STATE } from './streamAccumulator'

const DEBOUNCE_MS = 350
const PAGE_SIZE = 24
const MAX_LIMIT = 100 // backend's hard cap on `limit` (Query(..., le=100)) — search mode's ceiling
const MAX_BROWSE_ITEMS = 500 // browse mode has no backend cap (it accumulates pages); a frontend-only ceiling

// A disabled museum's data never reaches component state at all — this is
// the one place raw provider data enters the hook, so filtering here keeps
// every consumer (grid, filter chips, provider-status footer) from ever
// seeing it, rather than relying on each one to remember to exclude it.
function filterEnabled(results: ArtworkSummary[], providerStatus: ProviderSearchStatus[]) {
  return {
    results: results.filter((r) => isMuseumEnabled(r.provider_id)),
    providerStatus: providerStatus.filter((s) => isMuseumEnabled(s.provider_id)),
  }
}

type SearchState =
  | { status: 'idle' }
  // Carries the previous page's results/providerStatus forward (empty on a
  // genuinely first load) so a "load more" fetch — automatic during infinite
  // scroll, not just a deliberate button click — doesn't blank the whole grid
  // back to skeletons while it's in flight.
  | { status: 'loading'; results: ArtworkSummary[]; providerStatus: ProviderSearchStatus[] }
  | { status: 'success'; results: ArtworkSummary[]; providerStatus: ProviderSearchStatus[] }
  | { status: 'error'; message: string }

/**
 * Powers both the atrium's fan-out search (`providerId` omitted, `allowBrowse`
 * left off) and a single museum's search (`providerId` set). When
 * `allowBrowse` is on (the museum page) and the box is empty, it browses a
 * query-less page of that provider's collection instead of sitting idle —
 * paginated via real offset, accumulating into an infinite-scroll list.
 * Once the user types something, it switches to debounced search the same
 * way it always has (paginated by re-querying with a bigger `limit`, since
 * search itself has no offset).
 */
export function useArtworkSearch(query: string, providerId?: string, allowBrowse = false) {
  const trimmed = query.trim()
  const browsing = allowBrowse && !trimmed && !!providerId

  const [searchLimit, setSearchLimit] = useState(PAGE_SIZE)
  const [browseOffset, setBrowseOffset] = useState(0)
  const [state, setState] = useState<SearchState>({ status: 'idle' })
  // Accumulated browse pages. A ref, not state: it's written from inside the
  // fetch effect below and must never itself be a dependency of that effect
  // (that would either re-fetch on every accumulation or need an exhaustive-
  // deps suppression) — the displayed list is `state.results`, this is just
  // the running total the next page appends onto.
  const browsedRef = useRef<ArtworkSummary[]>([])

  // A new query, museum, or mode switch starts paging over.
  useEffect(() => {
    setSearchLimit(PAGE_SIZE)
    setBrowseOffset(0)
    browsedRef.current = []
  }, [trimmed, providerId, browsing])

  useEffect(() => {
    if (!browsing && !trimmed) {
      setState({ status: 'idle' })
      return
    }

    const controller = new AbortController()
    let closeStream: (() => void) | null = null
    setState((prev) => ({
      status: 'loading',
      results: prev.status === 'success' || prev.status === 'loading' ? prev.results : [],
      providerStatus: prev.status === 'success' || prev.status === 'loading' ? prev.providerStatus : [],
    }))

    // Cross-museum fan-out (no providerId, not browsing) streams over SSE so
    // results from faster museums appear before slower/failing ones finish.
    // Museum-scoped search (providerId set) stays on the plain REST endpoint
    // — it's already a single fast request, streaming would add nothing.
    const isFanOut = !browsing && !providerId

    const fetchIt = async () => {
      if (browsing) {
        const data = await browseArtworks(
          { providerId: providerId!, limit: PAGE_SIZE, offset: browseOffset },
          controller.signal,
        )
        const combined = browseOffset === 0 ? data.results : [...browsedRef.current, ...data.results]
        browsedRef.current = combined
        setState({ status: 'success', ...filterEnabled(combined, data.provider_status) })
        return
      }

      if (isFanOut) {
        await new Promise<void>((resolve, reject) => {
          let acc = EMPTY_STREAM_STATE
          closeStream = streamFanOutSearch(
            { q: trimmed, limit: searchLimit },
            (status, results) => {
              acc = accumulateProviderEvent(acc, status, results)
              // Stays 'loading' (not 'success') until every provider has
              // reported: the first museum to respond might have 0 results
              // or error out (Harvard/Smithsonian often do) while others are
              // still streaming in, and flipping to 'success' right then
              // would flash "nada encontrado" before the rest arrive.
              setState({ status: 'loading', ...filterEnabled(acc.results, acc.providerStatus) })
            },
            () => {
              setState({ status: 'success', ...filterEnabled(acc.results, acc.providerStatus) })
              resolve()
            },
            () => reject(new Error('A busca não respondeu.')),
          )
        })
        return
      }

      const data = await searchArtworks({ q: trimmed, providerId, limit: searchLimit }, controller.signal)
      setState({ status: 'success', ...filterEnabled(data.results, data.provider_status) })
    }

    const timer = setTimeout(
      () => {
        fetchIt().catch((err) => {
          if (controller.signal.aborted) return
          const message = err instanceof ApiError ? err.message : 'A busca não respondeu.'
          setState({ status: 'error', message })
        })
      },
      browsing ? 0 : DEBOUNCE_MS,
    )

    return () => {
      clearTimeout(timer)
      controller.abort()
      closeStream?.()
    }
  }, [trimmed, providerId, browsing, searchLimit, browseOffset])

  // `fan_out_search` applies `limit` PER PROVIDER (each of the up-to-7
  // providers is searched with the same `limit` and results concatenated),
  // so a fan-out response can hold up to 7×limit items — checking total
  // result count against `limit` would under-detect "more available" once
  // provider_id is omitted. Instead: any provider that succeeded and
  // returned exactly `limit`/`PAGE_SIZE` items might have more to give.
  const canLoadMore =
    state.status === 'success' &&
    (browsing ? browseOffset + PAGE_SIZE < MAX_BROWSE_ITEMS : searchLimit < MAX_LIMIT) &&
    state.providerStatus.some((s) => s.ok && s.count >= PAGE_SIZE)

  // Stable identity — ResultsGrid's IntersectionObserver effect depends on
  // this, and would tear down/recreate the observer on every render (e.g.
  // every image-load-triggered re-render) if this were a fresh closure each
  // time instead.
  const loadMore = useCallback(() => {
    if (browsing) setBrowseOffset((o) => o + PAGE_SIZE)
    else setSearchLimit((l) => Math.min(MAX_LIMIT, l + PAGE_SIZE))
  }, [browsing])

  return { ...state, canLoadMore, loadMore }
}
