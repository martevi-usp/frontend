import { describe, expect, it } from 'vitest'

import { artworkCatalog, DIFFICULTIES } from '../../src/components/artworks'

describe('the built-in collection', () => {
  const artworks = artworkCatalog.list()

  it('is not empty and has unique ids', () => {
    expect(artworks.length).toBeGreaterThan(0)
    expect(new Set(artworks.map((a) => a.id)).size).toBe(artworks.length)
  })

  it('offers at least 20 artworks', () => {
    expect(artworks.length).toBeGreaterThanOrEqual(20)
  })

  it('states a title, a credit, rights and a movement for every entry', () => {
    for (const a of artworks) {
      expect(a.title.trim()).not.toBe('')
      expect(a.credit.trim()).not.toBe('')
      expect(a.rights.trim()).not.toBe('')
      expect(a.movement.trim()).not.toBe('')
    }
  })

  /**
   * There is no local fallback image — every entry is remote (Wikimedia).
   * The one thing still worth guaranteeing is that the puzzle doesn't open
   * on an entry nobody has confirmed actually loads.
   */
  it('opens on a verified entry', () => {
    expect(artworkCatalog.defaultArtwork.verified).toBe(true)
  })

  /**
   * STEERING.md: demo records must not reach a user as authoritative. A
   * remote entry may only claim `verified: true` once its URL has actually
   * been confirmed to resolve — this doesn't re-check the network itself
   * (a unit test shouldn't depend on connectivity), but it does insist that
   * `verified: true` and `rights` agree that the source is a checkable one.
   */
  it('never claims verification without stating checkable rights', () => {
    for (const a of artworks) {
      if (a.verified && /^https?:/.test(a.src)) {
        expect(a.rights.trim(), `${a.id} is verified but states no rights`).not.toBe('')
      }
    }
  })

  it('gives every entry a wall note to unlock', () => {
    for (const a of artworks) {
      expect(a.story.lede.trim()).not.toBe('')
      expect(a.story.body.trim()).not.toBe('')
    }
  })

  it('keeps the lede to a single sentence', () => {
    for (const a of artworks) {
      const sentences = a.story.lede.split(/[.!?](\s|$)/).filter((s) => s.trim())
      expect(sentences.length, `${a.id}: "${a.story.lede}"`).toBeLessThanOrEqual(2)
    }
  })

  /** These are histories, not visual descriptions, and run longer than
   *  STEERING.md's general 45–75 word guidance as a result. */
  it('keeps each wall note within a sane length', () => {
    for (const a of artworks) {
      const words = a.story.body.trim().split(/\s+/).length
      expect(words, `${a.id} runs ${words} words`).toBeGreaterThan(30)
      expect(words, `${a.id} runs ${words} words`).toBeLessThan(220)
    }
  })
})

describe('difficulty presets', () => {
  it('offers ascending piece counts, each with a label', () => {
    let prev = 0
    for (const d of DIFFICULTIES) {
      expect(d.label.trim()).not.toBe('')
      expect(d.pieces).toBeGreaterThan(prev)
      prev = d.pieces
    }
  })
})
