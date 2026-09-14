import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import AtriumPage from './pages/AtriumPage'
import MuseumPage from './pages/MuseumPage'

// `key={providerId}` forces a fresh MuseumPage (and its default browse
// query) if two museum pages are ever linked directly, without going
// through the atrium in between — not reachable today, but cheap insurance.
function MuseumRoute() {
  const { providerId } = useParams<{ providerId: string }>()
  return <MuseumPage key={providerId} />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AtriumPage />} />
        <Route path="/museu/:providerId" element={<MuseumRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
