import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { warmUpBackend } from './api/warmup'
import AtriumPage from './pages/AtriumPage'
import HomePage from './pages/HomePage'
import MuseumPage from './pages/MuseumPage'
import PuzzlePage from './pages/PuzzlePage'
import SearchPage from './pages/SearchPage'

// `key={providerId}` forces a fresh MuseumPage (and its default browse
// query) if two museum pages are ever linked directly, without going
// through the atrium in between — not reachable today, but cheap insurance.
function MuseumRoute() {
  const { providerId } = useParams<{ providerId: string }>()
  return <MuseumPage key={providerId} />
}

function App() {
  useEffect(() => {
    warmUpBackend()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AtriumPage />} />
        <Route path="/inicio" element={<HomePage />} />
        <Route path="/busca" element={<SearchPage />} />
        <Route path="/museu/:providerId" element={<MuseumRoute />} />
        <Route path="/quebra-cabeca" element={<PuzzlePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
