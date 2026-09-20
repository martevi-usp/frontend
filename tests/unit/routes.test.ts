import { describe, expect, it } from 'vitest'

import { PUZZLE_HASH, routeFromHash } from '../../src/routes'

describe('routeFromHash', () => {
  it('opens the puzzle on its hash', () => {
    expect(routeFromHash(PUZZLE_HASH)).toBe('puzzle')
  })

  it('treats no hash and unknown hashes as home', () => {
    expect(routeFromHash('')).toBe('home')
    expect(routeFromHash('#/nada')).toBe('home')
    expect(routeFromHash('#/quebra-cabeca/extra')).toBe('home')
  })
})
