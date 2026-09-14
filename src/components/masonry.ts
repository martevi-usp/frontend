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

export interface GroupLabel {
  kind: 'label'
  key: string
  providerId: string
}

export type GroupedEntry<T> = { kind: 'item'; key: string; item: T } | GroupLabel

/**
 * Inserts a label entry immediately before each run of same-provider items,
 * for a cross-museum grid where cards should read as "[MET] ... [AIC] ...".
 * Assumes same-provider items already arrive contiguous (true of the
 * backend's fan_out_search, which concatenates one provider's results at a
 * time) — items are never reordered, just labeled.
 */
export function withGroupLabels<T extends { id: string; provider_id: string }>(
  items: readonly T[],
): GroupedEntry<T>[] {
  const out: GroupedEntry<T>[] = []
  let lastProvider: string | null = null
  for (const item of items) {
    if (item.provider_id !== lastProvider) {
      out.push({ kind: 'label', key: `label-${item.provider_id}`, providerId: item.provider_id })
      lastProvider = item.provider_id
    }
    out.push({ kind: 'item', key: item.id, item })
  }
  return out
}
