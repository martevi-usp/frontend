import { describe, expect, it } from 'vitest'
import { columnsFor, filterByActiveProviders, packColumns, withGroupLabels } from '../../src/components/masonry'

describe('columnsFor', () => {
  it('never returns fewer than 2 columns, even at phone width', () => {
    expect(columnsFor(320)).toBe(2)
    expect(columnsFor(0)).toBe(2)
  })

  it('grows roughly with width, capped at 7', () => {
    expect(columnsFor(500)).toBe(2)
    expect(columnsFor(1000)).toBe(4)
    expect(columnsFor(3000)).toBe(7)
  })
})

describe('packColumns', () => {
  it('always appends to the currently-shortest column', () => {
    const items = ['a', 'b', 'c', 'd']
    const heights: Record<string, number> = { a: 10, b: 1, c: 1, d: 1 }
    const columns = packColumns(items, 2, (item) => heights[item])
    // a (10) goes to column 0. b (1) goes to column 1 (shorter, 0 < 10).
    // c (1) goes to column 1 (1 < 10). d (1) goes to column 1 (2 < 10).
    expect(columns[0]).toEqual(['a'])
    expect(columns[1]).toEqual(['b', 'c', 'd'])
  })

  it('distributes evenly when every item has the same height', () => {
    const items = [1, 2, 3, 4, 5, 6]
    const columns = packColumns(items, 3, () => 1)
    expect(columns.map((c) => c.length)).toEqual([2, 2, 2])
    expect(columns.flat().sort((a, b) => a - b)).toEqual(items)
  })

  it('returns exactly columnCount columns, some possibly empty', () => {
    const columns = packColumns(['only-one'], 4, () => 1)
    expect(columns).toHaveLength(4)
    expect(columns.filter((c) => c.length > 0)).toHaveLength(1)
  })
})

describe('withGroupLabels', () => {
  const item = (id: string, provider_id: string) => ({ id, provider_id })

  it('inserts one label before each contiguous run of the same provider', () => {
    const items = [item('met:1', 'met'), item('met:2', 'met'), item('aic:1', 'aic')]
    const entries = withGroupLabels(items)
    expect(entries.map((e) => e.kind)).toEqual(['label', 'item', 'item', 'label', 'item'])
    expect(entries[0]).toMatchObject({ kind: 'label', providerId: 'met' })
    expect(entries[3]).toMatchObject({ kind: 'label', providerId: 'aic' })
  })

  it('re-labels if the same provider reappears in a non-contiguous run', () => {
    const items = [item('met:1', 'met'), item('aic:1', 'aic'), item('met:2', 'met')]
    const entries = withGroupLabels(items)
    expect(entries.map((e) => e.kind)).toEqual(['label', 'item', 'label', 'item', 'label', 'item'])
  })

  it('returns an empty list for no items', () => {
    expect(withGroupLabels([])).toEqual([])
  })
})

describe('filterByActiveProviders', () => {
  const item = (id: string, provider_id: string) => ({ id, provider_id })

  it('keeps items whose provider is not in the inactive set', () => {
    const items = [item('met:1', 'met'), item('aic:1', 'aic')]
    expect(filterByActiveProviders(items, new Set(['aic']))).toEqual([item('met:1', 'met')])
  })

  it('keeps everything when nothing is inactive', () => {
    const items = [item('met:1', 'met'), item('aic:1', 'aic')]
    expect(filterByActiveProviders(items, new Set())).toEqual(items)
  })

  it('drops everything when every provider is inactive', () => {
    const items = [item('met:1', 'met'), item('aic:1', 'aic')]
    expect(filterByActiveProviders(items, new Set(['met', 'aic']))).toEqual([])
  })
})
