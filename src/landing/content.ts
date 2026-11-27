export interface MissionPillar {
  eyebrow: string
  title: string
  description: string
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

