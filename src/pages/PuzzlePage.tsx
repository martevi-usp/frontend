import { useCallback, useEffect, useState } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'

import { fetchPuzzles } from '../api/puzzles'
import { ArtworkCatalog } from '../components/jigsaw/artworks'
import JigsawPuzzle from './JigsawPuzzle'

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; catalog: ArtworkCatalog }
  | { kind: 'error' }

/** How long to wait before saying the server may be waking up. Cloud Run
 *  scales to zero when idle, so the first request after a quiet spell pays a
 *  cold start (backend ADR-0006). */
const SLOW_AFTER_MS = 4000

export default function PuzzlePage() {
  const [state, setState] = useState<State>({ kind: 'loading' })
  const [slow, setSlow] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const ctl = new AbortController()
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS)
    fetchPuzzles(ctl.signal)
      .then((items) => setState({ kind: 'ready', catalog: new ArtworkCatalog(items) }))
      .catch(() => {
        if (!ctl.signal.aborted) setState({ kind: 'error' })
      })
      .finally(() => clearTimeout(timer))
    return () => {
      ctl.abort()
      clearTimeout(timer)
    }
  }, [attempt])

  const retry = useCallback(() => {
    setState({ kind: 'loading' })
    setSlow(false)
    setAttempt((n) => n + 1)
  }, [])

  if (state.kind === 'ready') return <JigsawPuzzle catalog={state.catalog} />

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
      <Stack spacing={2} sx={{ maxWidth: '44ch', textAlign: 'center' }}>
        {state.kind === 'loading' ? (
          <>
            <Typography variant="overline">carregando o acervo…</Typography>
            {slow && (
              <Typography variant="body2">
                O servidor pode estar acordando — isso leva até um minuto na primeira visita.
              </Typography>
            )}
          </>
        ) : (
          <>
            <Typography variant="body2">Não foi possível carregar o acervo.</Typography>
            <Button onClick={retry}>Tentar de novo</Button>
          </>
        )}
      </Stack>
    </Box>
  )
}
