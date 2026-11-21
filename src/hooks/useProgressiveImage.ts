import { useEffect, useState } from 'react'

export type ProgressiveImage =
  { kind: 'loading' } | { kind: 'ready'; src: string; aspect: number; full: boolean } | { kind: 'error' }

/**
 * Show the small thumbnail as soon as it loads, then swap in the full-size
 * image once that arrives — some providers' originals are many megabytes.
 * Also reports the image's natural aspect ratio, which the gallery room uses
 * to sanity-check the museum's measurements.
 */
export function useProgressiveImage(thumb: string | null, full: string | null): ProgressiveImage {
  const [state, setState] = useState<{ key: string; image: ProgressiveImage }>({ key: '', image: { kind: 'loading' } })
  const key = `${thumb ?? ''}|${full ?? ''}`

  useEffect(() => {
    let cancelled = false
    const sources = [thumb, full].filter((s, i, all): s is string => !!s && all.indexOf(s) === i)
    if (sources.length === 0) return

    let best = -1
    let failures = 0
    const images = sources.map((src, i) => {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        if (cancelled || i < best || !img.naturalWidth || !img.naturalHeight) return
        best = i
        setState({
          key,
          image: { kind: 'ready', src, aspect: img.naturalWidth / img.naturalHeight, full: i === sources.length - 1 },
        })
      }
      img.onerror = () => {
        if (cancelled) return
        failures += 1
        if (failures === sources.length) setState({ key, image: { kind: 'error' } })
      }
      img.src = src
      return img
    })

    return () => {
      cancelled = true
      for (const img of images) {
        img.onload = null
        img.onerror = null
      }
    }
  }, [key, thumb, full])

  if (!thumb && !full) return { kind: 'error' }
  if (state.key === key) return state.image
  // Upgrading thumbnail → full: keep showing what's already on screen rather
  // than blinking back to "loading" while the new source list is fetched.
  const prev = state.image
  return prev.kind === 'ready' && (prev.src === thumb || prev.src === full)
    ? { ...prev, full: false }
    : { kind: 'loading' }
}
