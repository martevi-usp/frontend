import { describe, expect, it } from 'vitest'

import { ArtworkCatalog, DIFFICULTIES, type Artwork } from '../../src/components/artworks'
import { PUZZLES } from '../fixtures/puzzles'

const artworks: Artwork[] = PUZZLES.map(({ pieces: _pieces, ...a }) => a)

describe('ArtworkCatalog', () => {
  const catalog = new ArtworkCatalog(artworks)

  it('lists what it was built from, with unique ids', () => {
    expect(catalog.list()).toHaveLength(artworks.length)
    expect(new Set(catalog.list().map((a) => a.id)).size).toBe(artworks.length)
  })

  it('looks an artwork up by id and falls back to the first for an unknown one', () => {
    expect(catalog.get('hokusai-onda').id).toBe('hokusai-onda')
    expect(catalog.get('nope')).toBe(catalog.defaultArtwork)
    expect(catalog.defaultArtwork).toBe(artworks[0])
  })

  it('refuses to be empty — the puzzle has nothing to open on', () => {
    expect(() => new ArtworkCatalog([])).toThrow()
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
