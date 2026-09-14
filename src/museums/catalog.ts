import type { ProviderId } from '../api/types'

// The backend exposes no museum-metadata endpoint (no display name,
// location, or description per provider_id) — this is a hardcoded, factual
// list matching the 7 provider_id values the backend registry actually
// serves (backend/src/martevi/providers/registry.py).
export interface MuseumMeta {
  id: ProviderId
  name: string
  location: string
  blurb: string
}

export const MUSEUMS: readonly MuseumMeta[] = [
  {
    id: 'met',
    name: 'The Metropolitan Museum of Art',
    location: 'Nova York, Estados Unidos',
    blurb:
      'Um dos maiores museus de arte do mundo, com mais de dois milhões de obras — da Antiguidade à arte contemporânea — às margens do Central Park desde 1870.',
  },
  {
    id: 'aic',
    name: 'Art Institute of Chicago',
    location: 'Chicago, Estados Unidos',
    blurb:
      'Acervo enciclopédico à beira do Lago Michigan, com força particular no impressionismo francês e na arte americana — de Seurat a Hopper.',
  },
  {
    id: 'cleveland',
    name: 'Cleveland Museum of Art',
    location: 'Cleveland, Estados Unidos',
    blurb:
      'Museu de entrada gratuita com acervo enciclopédico de mais de 60 mil obras, incluindo uma das coleções de arte asiática mais respeitadas dos Estados Unidos.',
  },
  {
    id: 'harvard',
    name: 'Harvard Art Museums',
    location: 'Cambridge, Estados Unidos',
    blurb:
      'Três museus da Universidade Harvard — Fogg, Busch-Reisinger e Sackler — reunidos sob um só teto, com acervo forte em arte europeia, alemã e asiática.',
  },
  {
    id: 'rijksmuseum',
    name: 'Rijksmuseum',
    location: 'Amsterdã, Países Baixos',
    blurb:
      'O museu nacional dos Países Baixos, guardião da Idade de Ouro holandesa — Rembrandt, Vermeer, Frans Hals — à beira do Museumplein.',
  },
  {
    id: 'smithsonian',
    name: 'Smithsonian Institution',
    location: 'Washington, Estados Unidos',
    blurb:
      'Acesso aberto ao acervo de dezenas de museus e institutos da Smithsonian, o maior complexo de museus e pesquisa do mundo.',
  },
  {
    id: 'vam',
    name: 'Victoria and Albert Museum',
    location: 'Londres, Reino Unido',
    blurb:
      'O maior museu de artes decorativas e design do mundo, com acervo que vai de têxteis e cerâmica a moda, escultura e fotografia.',
  },
] as const

export function getMuseum(id: string | undefined): MuseumMeta | undefined {
  return MUSEUMS.find((m) => m.id === id)
}
