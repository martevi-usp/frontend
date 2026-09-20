/** What the backend's /puzzles endpoints return, for tests that must not
 *  depend on a running API. Image URLs are the real ones so the grid math
 *  matches production. */
const commons = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1400`

export const PUZZLES = [
  {
    id: 'vermeer-leiteira',
    title: 'A leiteira',
    credit: 'Johannes Vermeer, c. 1660',
    src: commons('Johannes Vermeer - Het melkmeisje - Google Art Project.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Barroco holandês (Século de Ouro)',
    pieces: 24,
  },
  {
    id: 'hokusai-onda',
    title: 'A grande onda de Kanagawa',
    credit: 'Katsushika Hokusai, c. 1831',
    src: commons('Tsunami by hokusai 19th century.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Ukiyo-e',
    pieces: 24,
  },
]

export const STORY = {
  lede: 'Vermeer foi praticamente esquecido por quase dois séculos depois de morrer.',
  body: 'Ele pintou pouquíssimas obras na vida, e só foi redescoberto no século XIX.',
  unlock_pct: 100,
}
