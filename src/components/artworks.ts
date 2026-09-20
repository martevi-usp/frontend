/**
 * The puzzle's catalog types and the collection wrapper.
 *
 * The catalog itself (titles, credits, image URLs, rights, wall notes) is
 * editorial content served by the backend from its read-only database — see
 * backend ADR-0004 and frontend ADR-0005. Provenance notes (`verified`,
 * `rights`) travel with the data: STEERING.md is explicit that demo records
 * must not reach a user as authoritative, so each entry states what is
 * actually known about it rather than the UI guessing.
 */

export interface Artwork {
  id: string
  /** Shown as the puzzle's title. */
  title: string
  /** Free text — artist, or how the image was made. */
  credit: string
  /** Where the pixels come from. */
  src: string
  /** Rights, stated plainly. Never guessed. */
  rights: string
  /** Has this URL been confirmed to load? */
  verified: boolean
  /**
   * The art-historical movement or tradition, in the artwork's own terms —
   * a Song-dynasty landscape or a Cuzco School painting isn't "Baroque",
   * so this stays free text rather than a fixed Western-movement enum.
   */
  movement: string
}

/** The wall note. Unlocked by finishing the puzzle, never shown before. */
export interface Story {
  /** One sentence, set in serif — the thing worth knowing. */
  lede: string
  /** The rest — a history, not a description of the paint. */
  body: string
}

/**
 * The puzzle's artwork collection. A class rather than a plain export
 * because it's a genuine collection-with-behavior (lookup by id, a
 * documented fallback) — unlike `geometry.ts`/`rules.ts`, which stay pure
 * functions per ADR-0001. Built from whatever the API returned.
 */
export class ArtworkCatalog {
  private readonly items: readonly Artwork[]

  constructor(items: readonly Artwork[]) {
    if (items.length === 0) throw new Error('an ArtworkCatalog needs at least one artwork')
    this.items = items
  }

  list(): readonly Artwork[] {
    return this.items
  }

  /** Falls back to the first entry. */
  get(id: string): Artwork {
    return this.items.find((a) => a.id === id) ?? this.items[0]
  }

  get defaultArtwork(): Artwork {
    return this.items[0]
  }
}

/** Nominal piece counts offered as difficulty. The real count is
 *  `cols * rows` once the grid is fitted to the image — always show that. */
export const DIFFICULTIES: ReadonlyArray<{ label: string; pieces: number }> = [
  { label: 'Fácil', pieces: 12 },
  { label: 'Médio', pieces: 24 },
  { label: 'Difícil', pieces: 54 },
  { label: 'Punitivo', pieces: 96 },
]
