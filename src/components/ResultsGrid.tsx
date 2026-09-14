import { Box, Skeleton } from '@mui/material'
import { useEffect, useState } from 'react'
import { useArtworkSearch } from '../hooks/useArtworkSearch'
import { columnsFor, packColumns, withGroupLabels } from './masonry'
import { ArtworkCard } from './ArtworkCard'
import { EmptyState } from './EmptyState'
import { MuseumLabelTile } from './MuseumLabelTile'
import { ProviderStatusFooter } from './ProviderStatusFooter'

const GAP = 16

interface ResultsGridProps {
  query: string
  onQueryChange: (value: string) => void
  providerId?: string
  /** true for the atrium's fan-out search, where results span museums. */
  showProvider?: boolean
  /** true on the museum page: browse a query-less page when the box is empty
   * instead of showing the cold-start "search first" prompt. */
  allowBrowse?: boolean
}

export function ResultsGrid({ query, onQueryChange, providerId, showProvider, allowBrowse }: ResultsGridProps) {
  // Callback refs (state, not plain useRefs) — the cold-start/error/no-results
  // branches below don't render these elements at all, so a plain useRef +
  // effect-with-empty-deps would attach to nothing on first mount and never
  // observe once a grid/sentinel actually appears. Storing the node in state
  // re-runs the effect exactly when it's attached.
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(0)
  const [aspectById, setAspectById] = useState<Record<string, number>>({})

  const search = useArtworkSearch(query, providerId, allowBrowse)

  useEffect(() => {
    if (!container) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(container)
    return () => ro.disconnect()
  }, [container])

  const isLoading = search.status === 'loading'
  const { canLoadMore, loadMore } = search

  // Infinite scroll: load the next page automatically once the sentinel at
  // the bottom of the grid enters the viewport, instead of a "carregar mais"
  // button. Re-created (not just re-triggered) whenever loading/canLoadMore
  // change so the callback always sees the current values, not a stale
  // closure from whenever the observer was first attached.
  useEffect(() => {
    if (!sentinel || isLoading || !canLoadMore) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore()
      },
      { rootMargin: '600px' }, // start fetching well before the sentinel is actually visible
    )
    io.observe(sentinel)
    return () => io.disconnect()
  }, [sentinel, isLoading, canLoadMore, loadMore])

  if (search.status === 'idle') {
    return <EmptyState kind="cold-start" onSuggestion={onQueryChange} />
  }

  if (search.status === 'error') {
    return <EmptyState kind="error" message={search.message} onSuggestion={onQueryChange} />
  }

  // Items with no image are dropped from the visual grid entirely (an empty
  // gray box tells a browsing user nothing) — still real, honest results,
  // just not ones a masonry-of-thumbnails can show anything useful for.
  // `loading` carries the previous page's results forward (see
  // useArtworkSearch) so this stays populated while a "load more" fetch is
  // in flight, instead of blanking the grid back to skeletons.
  const results =
    search.status === 'success' || search.status === 'loading'
      ? search.results.filter((item) => item.thumbnail_url)
      : []

  if (!isLoading && results.length === 0) {
    return <EmptyState kind="no-results" query={query} onSuggestion={onQueryChange} />
  }

  const columnCount = width > 0 ? columnsFor(width) : 2
  const columnWidth = width > 0 ? (width - GAP * (columnCount - 1)) / columnCount : 0
  // Cross-museum search groups results with a "[MET]"-style label tile before
  // each museum's run (fan_out_search already returns them contiguous, one
  // provider's block at a time — see withGroupLabels); a single-museum grid
  // has nothing to label.
  const entries = showProvider
    ? withGroupLabels(results)
    : results.map((item) => ({ kind: 'item' as const, key: item.id, item }))
  const LABEL_HEIGHT_RATIO = 0.6 // shorter than a typical card — a divider, not another artwork
  const columns = packColumns(entries, columnCount, (entry) =>
    entry.kind === 'label' ? columnWidth * LABEL_HEIGHT_RATIO : columnWidth / (aspectById[entry.item.id] ?? 1),
  )

  return (
    <Box ref={setContainer}>
      {(search.status === 'success' || search.status === 'loading') && (
        <ProviderStatusFooter providerStatus={search.providerStatus} />
      )}

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: `${GAP}px`, mt: 2 }}>
        {columns.map((col, i) => (
          <Box key={i} sx={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: `${GAP}px` }}>
            {col.map((entry) =>
              entry.kind === 'label' ? (
                <MuseumLabelTile
                  key={entry.key}
                  providerId={entry.providerId}
                  width={columnWidth}
                  height={columnWidth * LABEL_HEIGHT_RATIO}
                />
              ) : (
                <ArtworkCard
                  key={entry.key}
                  item={entry.item}
                  width={columnWidth}
                  aspect={aspectById[entry.item.id] ?? 1}
                  showProvider={showProvider}
                  onAspect={(id, aspect) => setAspectById((prev) => (prev[id] ? prev : { ...prev, [id]: aspect }))}
                />
              ),
            )}
            {isLoading &&
              [1, 1.3, 0.8].map((ratio, j) => (
                <Skeleton key={j} variant="rectangular" sx={{ bgcolor: 'paper3', width: '100%', aspectRatio: ratio }} />
              ))}
          </Box>
        ))}
      </Box>

      {/* No "end of results" message by design — it just quietly stops loading. */}
      <Box ref={setSentinel} sx={{ height: 1 }} aria-hidden="true" />
    </Box>
  )
}
