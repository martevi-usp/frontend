export interface MissionPillar {
  eyebrow: string
  title: string
  description: string
  highlight?: string
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
    eyebrow: 'Democratização',
    title: 'Cultura sem barreiras.',
    description:
      'Ampliamos o acesso ao patrimônio artístico e cultural, reduzindo barreiras econômicas, geográficas e linguísticas,',
    highlight: 'com traduções para o português realizadas por redes neurais.',
  },
  {
    eyebrow: 'Imersão',
    title: 'Além das paredes dos museus.',
    description:
      'Explore acervos de diferentes museus em um ambiente virtual interativo que valoriza as características de cada obra.',
  },
  {
    eyebrow: 'Aprendizado',
    title: 'Conhecimento pela descoberta.',
    description:
      'Descubra a história e o contexto cultural das obras por meio de experiências lúdicas e interativas.',
  },
] as const

export const LANDING_DESTINATIONS: readonly LandingDestination[] = [
  {
    id: 'atrium',
    eyebrow: 'Acervos abertos',
    title: 'Atravesse sete museus.',
    description:
      'Um átrio digital que conecta você a sete museus e suas obras em uma experiência virtual imersiva.',
    action: 'Entrar no átrio',
    path: '/atrio',
  },
  {
    id: 'puzzle',
    eyebrow: 'Olhar demorado',
    title: 'Reconstrua uma obra.',
    description:
      'Participe de uma experiência lúdica montando quebra-cabeças de obras artísticas e, ao completá-los, descubra suas histórias.',
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

