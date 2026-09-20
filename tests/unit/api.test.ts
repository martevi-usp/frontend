import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchPuzzles, fetchStory } from '../../src/api/puzzles'
import { PUZZLES, STORY } from '../fixtures/puzzles'

const respond = (body: unknown, status = 200) =>
  vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }))

afterEach(() => vi.unstubAllGlobals())

describe('fetchPuzzles', () => {
  it('maps the API shape to Artwork, dropping the piece count', async () => {
    vi.stubGlobal('fetch', respond(PUZZLES))
    const [first] = await fetchPuzzles()
    expect(first).toMatchObject({ id: 'vermeer-leiteira', title: 'A leiteira', verified: true })
    expect(first).not.toHaveProperty('pieces')
  })

  it('rejects when the API answers with an error', async () => {
    vi.stubGlobal('fetch', respond({}, 503))
    await expect(fetchPuzzles()).rejects.toThrow('503')
  })
})

describe('fetchStory', () => {
  it('asks at 100% progress and returns the last unlocked note', async () => {
    const fetchMock = respond({ ...PUZZLES[0], stories: [STORY] })
    vi.stubGlobal('fetch', fetchMock)
    const story = await fetchStory('vermeer-leiteira')
    expect(story).toEqual({ lede: STORY.lede, body: STORY.body })
    expect(String(fetchMock.mock.calls[0][0])).toMatch(
      /\/puzzles\/vermeer-leiteira\?progress_pct=100$/,
    )
  })

  it('returns null when nothing is unlocked', async () => {
    vi.stubGlobal('fetch', respond({ ...PUZZLES[0], stories: [] }))
    expect(await fetchStory('vermeer-leiteira')).toBeNull()
  })
})
