import { ThemeProvider } from '@mui/material/styles'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from '../../src/App'
import { MUSEUMS } from '../../src/components/museums/catalog'
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

    expect(html).toContain('Martevi:')
    expect(html).toMatch(/<em[^>]*>Democratizando<\/em>.*<span[^>]*>o acesso à cultura<\/span>/)
    expect(html).toContain('A arte não deveria conhecer barreiras sociais, econômicas ou geográficas.')
    expect(html).toContain('O acesso à cultura não deve conhecer barreiras')
    expect(html).toContain('Sua experiência começa aqui.')
    expect(html).toMatch(/<span[^>]*>com traduções para o português realizadas por redes neurais\.<\/span>/)
    expect(html).not.toContain('Passe o cursor ou navegue pelo teclado')
    expect(html).not.toContain('Explorar os museus')
    expect(html).not.toContain('Montar uma obra')
    expect(html).not.toContain('museus abertos para olhar devagar')
  })

  it('renders the first museum from the atrium catalog and carousel controls', () => {
    const html = renderRoute('/')

    expect(html).toContain('um átrio · sete acervos')
    expect(html).toMatch(new RegExp(`<figcaption[^>]*>${MUSEUMS[0].name}</figcaption>`))
    expect(html).toContain('aria-label="Museu anterior"')
    expect(html).toContain('aria-label="Próximo museu"')
    expect(html).toContain('Pausar rotação')
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
    expect(html).not.toContain('Sua experiência começa aqui')
  })
})

