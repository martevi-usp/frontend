const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '')

let sent = false

/**
 * Wakes the backend as early as possible. Cloud Run scales to zero when idle,
 * so the first request after a quiet spell pays a cold start (backend
 * ADR-0006), so the first visit fires this on load — the server wakes while
 * the visitor reads the home page instead of after they open the puzzle.
 *
 * The path is /health, not /healthz: Cloud Run's front end answers /healthz
 * itself, so that request would never reach (or wake) the container.
 *
 * Fire-and-forget: at most once per page load (StrictMode runs effects
 * twice in dev), and a failure is deliberately silent — the page that needs
 * the API has its own loading and error states.
 */
export function warmUpBackend(): void {
  if (sent) return
  sent = true
  fetch(`${API_URL}/health`).catch(() => {})
}

/** Test seam: forget that the ping was sent. */
export function resetWarmUpForTests(): void {
  sent = false
}
