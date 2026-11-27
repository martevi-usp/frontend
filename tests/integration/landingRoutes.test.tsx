import { ThemeProvider } from '@mui/material/styles'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from '../../src/App'
import { theme } from '../../src/theme'

function renderRoute(path: string) {
  return renderToStaticMarkup(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('landing routes', () => {
  it('renders the complete landing narrative at the root route', () => {
    const html = renderRoute('/')

    expect(html).toContain('A arte não cabe num só')
    expect(html).toContain('Distância não deveria decidir')
    expect(html).toContain('A visita começa aqui')
  })

  it('integrates the three requested destinations with the router', () => {
    const html = renderRoute('/')

    expect(html).toContain('href="/atrio"')
    expect(html).toContain('href="/quebra-cabeca"')
    expect(html).toContain('href="/tarefa-do-daiki"')
  })

  it('renders the Daiki placeholder on its own route', () => {
    const html = renderRoute('/tarefa-do-daiki')

    expect(html).toContain('tarefa do daiki')
    expect(html).not.toContain('A visita começa aqui')
  })
})

