export interface MissionPillar {
  eyebrow: string
  title: string
  description: string
}

export type LandingDestinationId = 'atrium' | 'puzzle' | 'daiki'

export interface LandingDestination {
  id: LandingDestinationId
  eyebrow: string
  title: string
  description: string
  action: string
  path: string
}

/**
 * Landing-page model. Keeping editorial content outside the React view makes
 * it possible to revise the narrative without coupling copy to layout code.
 */
export const MISSION_PILLARS: readonly MissionPillar[] = [
  {
    eyebrow: 'Acesso',
    title: 'Sem passagem aérea.',
    description:
      'Acervos abertos de museus em outros países chegam à mesma tela, em português e sem depender de uma viagem.',
  },
  {
    eyebrow: 'Escala',
    title: 'Cada obra no seu tamanho.',
    description:
      'As dimensões publicadas pelos museus devolvem a diferença entre uma pintura de poucos centímetros e uma tela monumental.',
  },
  {
    eyebrow: 'Contexto',
    title: 'Tempo para olhar.',
    description:
      'Busca, salas interativas e quebra-cabeças aproximam a obra de sua história sem transformar a visita em uma lista de resultados.',
  },
] as const

export const LANDING_DESTINATIONS: readonly LandingDestination[] = [
  {
    id: 'atrium',
    eyebrow: 'Acervos abertos',
    title: 'Atravesse sete museus.',
    description:
      'Escolha uma instituição no átrio e percorra obras publicadas por seu acervo digital aberto.',
    action: 'Entrar no átrio',
    path: '/atrio',
  },
  {
    id: 'puzzle',
    eyebrow: 'Olhar demorado',
    title: 'Reconstrua uma obra.',
    description:
      'Monte o quebra-cabeça no seu ritmo. Ao terminar, uma nota de parede revela o contexto da imagem.',
    action: 'Abrir quebra-cabeça',
    path: '/quebra-cabeca',
  },
  {
    id: 'daiki',
    eyebrow: 'Próxima experiência',
    title: 'Visite a nova sala.',
    description:
      'Um espaço reservado para a próxima parte do percurso interativo, ainda em construção.',
    action: 'Ver tarefa do Daiki',
    path: '/tarefa-do-daiki',
  },
] as const

