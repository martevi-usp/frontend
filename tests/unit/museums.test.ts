import { describe, expect, it } from 'vitest'
import { getMuseum, MUSEUMS } from '../../src/museums/catalog'

const KNOWN_PROVIDER_IDS = ['met', 'aic', 'cleveland', 'harvard', 'rijksmuseum', 'smithsonian', 'vam']

describe('MUSEUMS catalog', () => {
  it('has exactly the 7 provider_ids the backend registry serves', () => {
    expect(MUSEUMS.map((m) => m.id).sort()).toEqual([...KNOWN_PROVIDER_IDS].sort())
  })

  it('has unique ids', () => {
    const ids = MUSEUMS.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has non-empty name/location/blurb for every entry', () => {
    for (const m of MUSEUMS) {
      expect(m.name.length).toBeGreaterThan(0)
      expect(m.location.length).toBeGreaterThan(0)
      expect(m.blurb.length).toBeGreaterThan(0)
    }
  })
})

describe('getMuseum', () => {
  it('finds a museum by id', () => {
    expect(getMuseum('met')?.name).toBe('The Metropolitan Museum of Art')
  })

  it('returns undefined for an unknown or missing id', () => {
    expect(getMuseum('not-a-museum')).toBeUndefined()
    expect(getMuseum(undefined)).toBeUndefined()
  })
})
