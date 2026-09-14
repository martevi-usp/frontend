import { describe, expect, it } from 'vitest'
import { accumulateProviderEvent, EMPTY_STREAM_STATE } from '../../src/hooks/streamAccumulator'
import type { ArtworkSummary, ProviderSearchStatus } from '../../src/api/types'

function summary(providerId: string, n: number): ArtworkSummary {
  return {
    id: `${providerId}:${n}`,
    provider_id: providerId,
    title: `Work ${n}`,
    date: null,
    thumbnail_url: null,
    height_cm: null,
    width_cm: null,
  }
}

function status(providerId: string, count: number, ok = true): ProviderSearchStatus {
  return { provider_id: providerId, ok, count, error: ok ? null : 'boom' }
}

describe('accumulateProviderEvent', () => {
  it('starts from empty and appends the first provider event', () => {
    const next = accumulateProviderEvent(
      EMPTY_STREAM_STATE,
      status('met', 2),
      [summary('met', 1), summary('met', 2)],
    )

    expect(next.results.map((r) => r.id)).toEqual(['met:1', 'met:2'])
    expect(next.providerStatus).toEqual([status('met', 2)])
  })

  it('appends later provider events after earlier ones, preserving contiguous per-provider runs', () => {
    const afterMet = accumulateProviderEvent(EMPTY_STREAM_STATE, status('met', 1), [summary('met', 1)])
    const afterAic = accumulateProviderEvent(afterMet, status('aic', 2), [
      summary('aic', 1),
      summary('aic', 2),
    ])

    expect(afterAic.results.map((r) => r.id)).toEqual(['met:1', 'aic:1', 'aic:2'])
    expect(afterAic.providerStatus.map((s) => s.provider_id)).toEqual(['met', 'aic'])
  })

  it('records a failing provider status without adding any results', () => {
    const next = accumulateProviderEvent(EMPTY_STREAM_STATE, status('harvard', 0, false), [])

    expect(next.results).toEqual([])
    expect(next.providerStatus).toEqual([status('harvard', 0, false)])
  })

  it('does not mutate the previous state object', () => {
    const prev = accumulateProviderEvent(EMPTY_STREAM_STATE, status('met', 1), [summary('met', 1)])
    const prevResultsRef = prev.results

    accumulateProviderEvent(prev, status('aic', 1), [summary('aic', 1)])

    expect(prev.results).toBe(prevResultsRef)
    expect(prev.results).toHaveLength(1)
  })
})
