import type { ArtworkSummary, ProviderSearchStatus } from '../api/types'

export interface StreamAccumulatorState {
  results: ArtworkSummary[]
  providerStatus: ProviderSearchStatus[]
}

export const EMPTY_STREAM_STATE: StreamAccumulatorState = { results: [], providerStatus: [] }

/**
 * Pure reducer for the fan-out SSE stream: appends one provider's outcome
 * onto the running accumulation. Each provider's results arrive as one
 * complete batch (a provider's own results are never split across multiple
 * events), so appending in arrival order preserves the per-provider
 * contiguous runs that `withGroupLabels` (masonry.ts) relies on to place a
 * museum label before each run.
 */
export function accumulateProviderEvent(
  prev: StreamAccumulatorState,
  status: ProviderSearchStatus,
  results: ArtworkSummary[],
): StreamAccumulatorState {
  return {
    results: [...prev.results, ...results],
    providerStatus: [...prev.providerStatus, status],
  }
}
