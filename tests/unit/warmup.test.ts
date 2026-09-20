import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { resetWarmUpForTests, warmUpBackend } from '../../src/api/warmup'

beforeEach(() => resetWarmUpForTests())
afterEach(() => vi.unstubAllGlobals())

describe('warmUpBackend', () => {
  it('pings /health, and only once per page load', () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}'))
    vi.stubGlobal('fetch', fetchMock)

    warmUpBackend()
    warmUpBackend()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/health$/)
  })

  it('swallows a failed ping instead of surfacing it', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    expect(() => warmUpBackend()).not.toThrow()
    await Promise.resolve() // let the rejection settle; an unhandled one would fail the run
  })
})
