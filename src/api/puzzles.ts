import type { Artwork, Story } from '../components/jigsaw/artworks'

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '')

interface PuzzleDto {
  id: string
  title: string
  credit: string
  src: string
  rights: string
  verified: boolean
  movement: string
  pieces: number
}

interface PuzzleDetailDto extends PuzzleDto {
  stories: { lede: string; body: string; unlock_pct: number }[]
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { signal })
  if (!res.ok) throw new Error(`${path} answered ${res.status}`)
  return (await res.json()) as T
}

const toArtwork = ({ id, title, credit, src, rights, verified, movement }: PuzzleDto): Artwork => ({
  id,
  title,
  credit,
  src,
  rights,
  verified,
  movement,
})

export async function fetchPuzzles(signal?: AbortSignal): Promise<Artwork[]> {
  return (await getJson<PuzzleDto[]>('/puzzles', signal)).map(toArtwork)
}

/**
 * The wall note, asked for at 100% progress. The backend withholds text until
 * the reported progress reaches its unlock point, but the client reports its
 * own progress (no auth), so this is a courtesy against casual spoilers, not
 * a guarantee — see backend ADR-0004.
 */
export async function fetchStory(id: string, signal?: AbortSignal): Promise<Story | null> {
  const detail = await getJson<PuzzleDetailDto>(
    `/puzzles/${encodeURIComponent(id)}?progress_pct=100`,
    signal,
  )
  const story = detail.stories.at(-1)
  return story ? { lede: story.lede, body: story.body } : null
}
