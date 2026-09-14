// Pure layout logic — no DOM. Unit-tested directly.

/** How many columns fit a given container width. */
export function columnsFor(width: number): number {
  if (width < 460) return 2
  return Math.min(7, Math.max(2, Math.round(width / 250)))
}

/**
 * Distributes items into `columnCount` columns, always appending to the
 * currently-shortest column (by accumulated height), so the grid stays as
 * balanced as the caller's height estimates allow.
 */
export function packColumns<T>(items: readonly T[], columnCount: number, heightOf: (item: T) => number): T[][] {
  const columns: { height: number; items: T[] }[] = Array.from({ length: columnCount }, () => ({
    height: 0,
    items: [],
  }))
  for (const item of items) {
    const shortest = columns.reduce((a, b) => (b.height < a.height ? b : a))
    shortest.items.push(item)
    shortest.height += heightOf(item)
  }
  return columns.map((c) => c.items)
}
