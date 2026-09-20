import { useEffect, useState } from 'react'

import { warmUpBackend } from './api/warmup'
import HomePage from './pages/HomePage'
import PuzzlePage from './pages/PuzzlePage'
import { routeFromHash } from './routes'

function App() {
  const [route, setRoute] = useState(() => routeFromHash(window.location.hash))

  useEffect(() => {
    warmUpBackend()
    const onHashChange = () => setRoute(routeFromHash(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return route === 'puzzle' ? <PuzzlePage /> : <HomePage />
}

export default App
