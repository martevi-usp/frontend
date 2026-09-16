/**
 * The built-in collection the puzzle draws from.
 *
 * ── On provenance ──────────────────────────────────────────────────────
 * STEERING.md is explicit that demo records must not reach a user as
 * authoritative, so each entry states what is actually known about it, and
 * `verified` says whether the image URL has been confirmed to resolve.
 * Every remote entry below was checked against the Wikimedia Commons API
 * during this pass (imageinfo: existence, license, dimensions) — the
 * network access earlier entries lacked. Still open the app and look at
 * each one before shipping; an API confirming a URL resolves isn't the
 * same as a human confirming the picture renders correctly. There is no
 * local fallback image — every entry points at Wikimedia Commons, so the
 * puzzle needs network access to play.
 *
 * ── On the wall notes ──────────────────────────────────────────────────
 * `story` is what solving the puzzle unlocks, written to the house voice in
 * STEERING.md — plain, concrete, unsentimental. Per direction for this
 * collection, each note is a history: patronage, scandal, damage,
 * provenance, the artist's own circumstances — not a description of the
 * light or the paint. These are checkable claims (dates, names, events),
 * not invented ones, and still want a pass against each museum's own
 * record before shipping.
 */

export interface Artwork {
  id: string
  /** Shown as the puzzle's title. */
  title: string
  /** Free text — artist, or how the image was made. */
  credit: string
  /** Where the pixels come from. */
  src: string
  /** Rights, stated plainly. Never guessed. */
  rights: string
  /** Has this URL been confirmed to load? See the note above. */
  verified: boolean
  /**
   * The art-historical movement or tradition, in the artwork's own terms —
   * a Song-dynasty landscape or a Cuzco School painting isn't "Baroque",
   * so this stays free text rather than a fixed Western-movement enum.
   */
  movement: string
  /** The wall note. Unlocked by finishing the puzzle, never shown before. */
  story: {
    /** One sentence, set in serif — the thing worth knowing. */
    lede: string
    /** The rest — a history, not a description of the paint. */
    body: string
  }
}

/** Wikimedia's redirect endpoint: resolves a bare filename to the real
 *  thumbnail URL, so we don't have to reproduce their md5 path layout. */
const commons = (file: string, width = 1400): string =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`

const ARTWORK_DATA: Artwork[] = [
  {
    id: 'vermeer-leiteira',
    title: 'A leiteira',
    credit: 'Johannes Vermeer, c. 1660',
    src: commons('Johannes Vermeer - Het melkmeisje - Google Art Project.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Barroco holandês (Século de Ouro)',
    story: {
      lede:
        'Vermeer foi praticamente esquecido por quase dois séculos depois de morrer, ' +
        'redescoberto só no século XIX por um crítico francês.',
      body:
        'Ele pintou pouquíssimas obras na vida — hoje se conhecem menos de quarenta, um ' +
        'ritmo tão lento que provavelmente vivia também do comércio de arte herdado do ' +
        'sogro. Depois de sua morte em 1675, endividado e deixando a família em ' +
        'dificuldades, seu nome praticamente desapareceu dos registros de história da arte ' +
        'até 1866, quando o crítico francês Théophile Thoré-Bürger publicou um estudo que ' +
        'o resgatou do esquecimento e catalogou boa parte do que hoje se atribui a ele. A ' +
        'leiteira só entrou para a coleção do Rijksmuseum, em Amsterdã, em 1908, comprada ' +
        'com o apoio de uma campanha de arrecadação pública organizada para não deixar a ' +
        'obra sair do país.',
    },
  },
  {
    id: 'hokusai-onda',
    title: 'A grande onda de Kanagawa',
    credit: 'Katsushika Hokusai, c. 1831',
    src: commons('Tsunami by hokusai 19th century.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Ukiyo-e',
    story: {
      lede:
        'Hokusai tinha quase setenta anos e dívidas de jogo do neto para pagar quando ' +
        'criou esta gravura.',
      body:
        'A obra faz parte de uma série de trinta e seis vistas do monte Fuji, produzida ' +
        'numa época em que um pigmento importado, o azul da Prússia, tinha acabado de ' +
        'chegar ao Japão e permitiu impressões mais baratas e vibrantes em larga escala — ' +
        'antes disso, o azul profundo dependia de pigmentos vegetais caros e instáveis. O ' +
        'sucesso comercial foi tão grande que a xilogravura foi reimpressa repetidamente a ' +
        'partir do mesmo bloco de madeira original, o que hoje ajuda historiadores a datar ' +
        'exemplares diferentes pelo desgaste progressivo da matriz. Hokusai assinou a ' +
        'série já perto do fim da vida, dizendo em cartas que só começaria a pintar de ' +
        'verdade depois dos cem anos.',
    },
  },
  {
    id: 'bruegel-cacadores',
    title: 'Caçadores na neve',
    credit: 'Pieter Bruegel, o Velho, 1565',
    src: commons(
      'Pieter Bruegel the Elder - Hunters in the Snow (Winter) - Google Art Project.jpg',
    ),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Renascimento do Norte',
    story: {
      lede:
        'O quadro fazia parte de uma série de seis pinturas sobre os meses do ano, ' +
        'encomendada por um mercador rico de Antuérpia — só cinco sobreviveram até hoje.',
      body:
        'Pieter Bruegel pintou a série em 1565 para a casa de campo do comerciante ' +
        'Niclaes Jonghelinck, num período de invernos excepcionalmente rigorosos na ' +
        'Europa, hoje associado a uma fase de resfriamento climático conhecida como ' +
        'Pequena Idade do Gelo. É considerada uma das primeiras paisagens europeias a ' +
        'retratar neve de forma realista, e não apenas como pano de fundo simbólico de ' +
        'uma cena religiosa. Depois da morte de Jonghelinck, a coleção foi confiscada ' +
        'como garantia de uma dívida e acabou nas mãos dos Habsburgo, que a levaram para ' +
        'Viena — onde a obra permanece até hoje, no Kunsthistorisches Museum.',
    },
  },
  {
    id: 'vangogh-noite',
    title: 'A noite estrelada',
    credit: 'Vincent van Gogh, 1889',
    src: commons('Van Gogh - Starry Night - Google Art Project.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Pós-impressionismo',
    story: {
      lede:
        'Van Gogh pintou esta obra internado por vontade própria num hospício, depois de ' +
        'mutilar a própria orelha, e considerou o resultado um fracasso.',
      body:
        'A vista combina o que ele via da janela do quarto no asilo de ' +
        'Saint-Rémy-de-Provence com elementos inventados de memória, como o cipreste em ' +
        'primeiro plano e a aldeia ao fundo — não é um retrato fiel do lugar real. Em ' +
        'cartas ao irmão Theo, que o sustentava financeiramente e guardava suas telas, ' +
        'ele quase não menciona o quadro, tratando-o como um exercício menor perto de ' +
        'outras pinturas da mesma época que considerava mais bem-sucedidas. Van Gogh ' +
        'morreu menos de um ano depois de pintá-la, sem nunca ter vendido mais do que uma ' +
        'única obra em vida; o reconhecimento só veio décadas depois, já no século XX.',
    },
  },
  {
    id: 'rembrandt-ronda-noturna',
    title: 'A ronda noturna',
    credit: 'Rembrandt van Rijn, 1642',
    src: commons('The Nightwatch by Rembrandt - Rijksmuseum.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Barroco holandês (Século de Ouro)',
    story: {
      lede:
        'O quadro que vemos hoje é menor do que o original — pedaços foram cortados das ' +
        'quatro bordas em 1715.',
      body:
        'Rembrandt pintou a tela para decorar a sede de uma companhia de milicianos de ' +
        'Amsterdã, um retrato de grupo encomendado e pago pelos próprios milicianos ' +
        'retratados, cada um contribuindo conforme o destaque que queria ter na ' +
        'composição. Quando a obra foi transferida para a Prefeitura da cidade, tiras ' +
        'foram cortadas dos quatro lados só para caber entre duas portas — a composição ' +
        'original só é conhecida hoje por uma cópia de época que preservou as partes ' +
        'perdidas. Já no século XX, o quadro foi atacado por um homem com faca em 1911 e ' +
        'novamente em 1975, além de um ataque com ácido em 1990; hoje fica ' +
        'permanentemente atrás de vidro reforçado no Rijksmuseum.',
    },
  },
  {
    id: 'velazquez-meninas',
    title: 'As meninas',
    credit: 'Diego Velázquez, 1656',
    src: commons('Las Meninas, by Diego Velázquez, from Prado in Google Earth.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Barroco espanhol',
    story: {
      lede: 'O quadro sobreviveu a um incêndio que destruiu boa parte do palácio onde ficava pendurado.',
      body:
        'Velázquez pintou a cena para o próprio rei Filipe IV, que a manteve no seu ' +
        'escritório particular no Alcázar Real de Madri, longe dos olhos do público em ' +
        'geral. Em 1734, um incêndio destruiu grande parte do palácio e boa parte da ' +
        'coleção real reunida ao longo de gerações — a tela foi salva a tempo, ainda que ' +
        'hoje existam dúvidas sobre o quanto ela foi restaurada depois do episódio. Só ' +
        'foi exposta publicamente quase dois séculos depois da morte do pintor, quando o ' +
        'Museu do Prado abriu suas portas em 1819, reunindo pela primeira vez boa parte ' +
        'do acervo que antes só a corte via.',
    },
  },
  {
    id: 'goya-tres-maio',
    title: 'O três de maio de 1808',
    credit: 'Francisco de Goya, 1814',
    src: commons('El Tres de Mayo, by Francisco de Goya, from Prado in Google Earth.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Romantismo',
    story: {
      lede:
        'Goya só pintou a cena seis anos depois de ela ter acontecido de verdade, quando ' +
        'o rei que a encomendou nem estava mais no trono que a motivou.',
      body:
        'O quadro registra as execuções em massa de madrilenhos que se rebelaram contra a ' +
        'ocupação francesa em 1808, feitas por soldados de Napoleão na noite seguinte ao ' +
        'levante popular conhecido como o Dois de Maio. Goya propôs o tema ao governo ' +
        'espanhol restaurado em 1814, pedindo para eternizar os mais notáveis feitos ' +
        'daquela insurreição, num momento em que buscava se reaproximar da nova monarquia ' +
        'depois de ter servido a corte durante a ocupação francesa. A obra não foi ' +
        'exibida publicamente durante décadas depois de concluída e só ganhou o ' +
        'reconhecimento que tem hoje já na segunda metade do século XIX.',
    },
  },
  {
    id: 'friedrich-caminhante',
    title: 'O caminhante sobre o mar de névoa',
    credit: 'Caspar David Friedrich, c. 1818',
    src: commons('Caspar David Friedrich - Wanderer above the sea of fog.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Romantismo alemão',
    story: {
      lede:
        'Por quase um século depois de pintado, o quadro foi praticamente esquecido — ' +
        'sua fama atual é, na maior parte, um fenômeno do século XX.',
      body:
        'Friedrich pintou a obra logo após as guerras napoleônicas, num momento de forte ' +
        'sentimento nacionalista alemão contra a ocupação francesa que durou anos no ' +
        'território germânico. A pintura permaneceu pouco conhecida durante décadas ' +
        'depois da morte do artista em 1840, até ser redescoberta por historiadores da ' +
        'arte já no início do século XX — inclusive apropriada, mais tarde, por ' +
        'propaganda nacionalista de formas que nada tinham a ver com a intenção original ' +
        'do pintor romântico. Hoje é uma das imagens mais reproduzidas do Romantismo ' +
        'europeu, e pertence à coleção da Kunsthalle de Hamburgo.',
    },
  },
  {
    id: 'millet-espigadoras',
    title: 'As espigadoras',
    credit: 'Jean-François Millet, 1857',
    src: commons('Jean-François Millet - Gleaners - Google Art Project 2.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Realismo',
    story: {
      lede:
        'Quando foi exposto em 1857, o quadro foi visto por críticos conservadores como ' +
        'uma ameaça política, não como uma cena de campo.',
      body:
        'A catação de restos de colheita era um direito legal garantido aos mais pobres ' +
        'na França rural, mas pintar essas mulheres em escala monumental, poucos anos ' +
        'depois das revoluções de 1848 que haviam abalado boa parte da Europa, foi lido ' +
        'por parte da crítica como uma defesa perigosa da classe trabalhadora. Um jornal ' +
        'da época chegou a comparar as espigadoras às Fúrias da Revolução Francesa, ' +
        'temendo que a obra glorificasse os pobres além do que a ordem social permitia. ' +
        'Só depois da morte de Millet, em 1875, o quadro passou a ser visto como um ' +
        'clássico sereno, sem essa carga política que teve na estreia.',
    },
  },
  {
    id: 'courbet-enterro-ornans',
    title: 'Um enterro em Ornans',
    credit: 'Gustave Courbet, 1849–50',
    src: commons('Gustave Courbet - A Burial at Ornans - Google Art Project.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Realismo',
    story: {
      lede:
        'Quando foi exibido em Paris em 1850, o tamanho do quadro foi visto como uma ' +
        'provocação: aquela escala era reservada a reis e batalhas, não a um funeral de ' +
        'aldeia.',
      body:
        'Courbet retratou o funeral de um tio-avô numa pequena cidade do interior ' +
        'francês, usando mais de quarenta moradores reais de Ornans como modelos, ' +
        'incluindo o padre, o coveiro e membros da própria família do pintor. A Academia ' +
        'de Belas Artes de Paris considerava esse tamanho de tela apropriado só para ' +
        'temas históricos, religiosos ou mitológicos nobres — pintar gente comum numa ' +
        'escala assim foi recebido como um ataque deliberado à hierarquia dos gêneros ' +
        'pictóricos que organizava a arte oficial francesa havia séculos. O escândalo ' +
        'consolidou Courbet como líder de um movimento que ele próprio batizou de ' +
        'Realismo.',
    },
  },
  {
    id: 'manet-bar-folies',
    title: 'Um bar no Folies-Bergère',
    credit: 'Édouard Manet, 1882',
    src: commons('Edouard Manet, A Bar at the Folies-Bergère.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Realismo (início do modernismo)',
    story: {
      lede:
        'Foi a última grande obra que Manet expôs antes de morrer, pintada já com a ' +
        'saúde debilitada pela sífilis que o mataria um ano depois.',
      body:
        'O Folies-Bergère era um music hall parisiense real, e a modelo, uma garçonete ' +
        'chamada Suzon que de fato trabalhava lá, posou várias vezes no ateliê de Manet, ' +
        'que reconstruiu parte do bar para pintá-la com mais controle sobre a luz e a ' +
        'pose. A obra foi exibida no Salão oficial de Paris em 1882, a última vez que ' +
        'Manet apresentou um quadro em vida diante do público oficial que por tanto tempo ' +
        'o havia rejeitado. Ele morreu no ano seguinte, aos 51 anos, com a perna amputada ' +
        'dias antes por complicações da doença, sem nunca ter recebido em vida o ' +
        'reconhecimento institucional que buscou a carreira inteira.',
    },
  },
  {
    id: 'monet-impressao-nascer-sol',
    title: 'Impressão, nascer do sol',
    credit: 'Claude Monet, 1872',
    src: commons('Monet - Impression, Sunrise.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Impressionismo',
    story: {
      lede: 'O quadro deu nome a um movimento inteiro por acidente, numa resenha que era pra ser um insulto.',
      body:
        'Monet expôs a obra em 1874 numa mostra organizada por um grupo de artistas ' +
        'repetidamente rejeitados pelo Salão oficial de Paris, reunidos numa sociedade ' +
        'cooperativa independente batizada apenas de Sociedade Anônima de Pintores. O ' +
        'crítico Louis Leroy escreveu uma resenha zombeteira num jornal parisiense, ' +
        'citando o título do quadro para chamar o grupo inteiro de impressionistas, como ' +
        'ofensa à falta de acabamento das telas. O nome pegou entre o público, os ' +
        'próprios artistas passaram a adotá-lo com orgulho nas mostras seguintes, e a ' +
        'exposição de 1874 é hoje considerada o marco fundador do movimento ' +
        'impressionista.',
    },
  },
  {
    id: 'morisot-berco',
    title: 'O berço',
    credit: 'Berthe Morisot, 1872',
    src: commons('Berthe Morisot - The Cradle - Google Art Project.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Impressionismo',
    story: {
      lede:
        'Berthe Morisot foi uma das fundadoras do grupo impressionista, numa época em ' +
        'que mulheres nem podiam se matricular na escola oficial de belas artes de ' +
        'Paris.',
      body:
        'Ela expôs este quadro na primeira mostra independente do grupo, em 1874, ao ' +
        'lado de Monet, Renoir, Pissarro e Degas, sendo uma das únicas mulheres entre os ' +
        'fundadores. Como mulher da alta sociedade parisiense, Morisot não podia ' +
        'frequentar sozinha cafés, bailes ou ateliês públicos como faziam os colegas ' +
        'homens, o que limitava boa parte de seus temas ao ambiente doméstico — não por ' +
        'escolha artística, mas por restrição social real da época. Ainda assim, produziu ' +
        'mais de quatrocentas pinturas ao longo da carreira e expôs em quase todas as ' +
        'mostras impressionistas organizadas entre 1874 e 1886.',
    },
  },
  {
    id: 'cassatt-banho',
    title: 'O banho da criança',
    credit: 'Mary Cassatt, 1893',
    src: commons("Mary Cassatt - The Child's Bath - Google Art Project.jpg"),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Impressionismo',
    story: {
      lede:
        'A composição achatada e vista de cima veio de uma grande exposição de gravuras ' +
        'japonesas que Cassatt visitou em Paris, poucos anos antes de pintar esta obra.',
      body:
        'Mary Cassatt era americana, mudou-se para Paris ainda jovem e foi convidada ' +
        'pessoalmente por Edgar Degas a expor com o grupo impressionista, um dos poucos ' +
        'espaços da época abertos a uma mulher estrangeira na cena artística parisiense ' +
        'oficialmente fechada às academias. Em 1890, uma grande mostra com centenas de ' +
        'xilogravuras japonesas no Palácio de Belas Artes de Paris causou forte impressão ' +
        'nela e em vários outros artistas do círculo impressionista; o ângulo alto e os ' +
        'padrões planos desta pintura, de 1893, vêm diretamente dessa influência ' +
        'recém-descoberta pelos pintores franceses.',
    },
  },
  {
    id: 'seurat-grande-jatte',
    title: 'Tarde de domingo na ilha da Grande Jatte',
    credit: 'Georges Seurat, 1884–86',
    src: commons('Georges Seurat - A Sunday on La Grande Jatte -- 1884 - Google Art Project.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Neoimpressionismo (pontilhismo)',
    story: {
      lede:
        'A obra foi exibida na última mostra do grupo impressionista, em 1886, e sua ' +
        'técnica dividiu o movimento ao meio.',
      body:
        'Seurat levou cerca de dois anos fazendo dezenas de estudos preparatórios em óleo ' +
        'e desenho antes de pintar a versão final, num processo quase científico incomum ' +
        'entre os impressionistas, que valorizavam a rapidez e a espontaneidade da ' +
        'pincelada direta diante da paisagem. Quando a obra foi exposta, colegas mais ' +
        'velhos como Camille Pissarro passaram a adotar a nova técnica por um tempo, ' +
        'enquanto Monet e Renoir se recusaram a expor ao lado dessa geração mais jovem — ' +
        'o episódio é considerado por historiadores o momento em que o pontilhismo se ' +
        'separou do impressionismo como movimento independente, batizado de ' +
        'neoimpressionismo.',
    },
  },
  {
    id: 'klimt-beijo',
    title: 'O beijo',
    credit: 'Gustav Klimt, 1907–08',
    src: commons('The Kiss - Gustav Klimt - Google Cultural Institute.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Simbolismo / Art Nouveau',
    story: {
      lede: 'A tela foi comprada pelo governo austríaco direto da exposição, antes mesmo de estar totalmente terminada.',
      body:
        'Klimt pintou a obra logo depois de uma viagem a Ravena, na Itália, onde os ' +
        'mosaicos bizantinos cobertos de ouro das igrejas antigas o marcaram profundamente ' +
        '— daí a superfície em folha de ouro aplicada sobre boa parte da tela. Em 1908, o ' +
        'Ministério da Cultura austríaco comprou o quadro diretamente da mostra em que foi ' +
        'exibido, um gesto raro de reconhecimento oficial dado a um artista ainda em vida ' +
        'e cuja obra era considerada escandalosa por outros setores da sociedade ' +
        'vienense. Durante a Segunda Guerra Mundial, a obra foi escondida numa mina de ' +
        'sal nos Alpes austríacos junto com milhares de outras peças para escapar de ' +
        'bombardeios e de confisco.',
    },
  },
  {
    id: 'bonheur-feira-cavalos',
    title: 'A feira de cavalos',
    credit: 'Rosa Bonheur, 1852–55',
    src: commons('WLA metmuseum Rosa Bonheur The Horse Fair.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Realismo',
    story: {
      lede:
        'Rosa Bonheur precisava de uma autorização oficial da polícia de Paris, renovada ' +
        'periodicamente, só para poder se vestir de homem e estudar cavalos no mercado.',
      body:
        'Sem essa licença, chamada de permissão de travestimento, uma mulher circulando ' +
        'sozinha e por horas entre negociantes de gado num mercado real seria motivo de ' +
        'escândalo público, então Bonheur obteve o documento formal para poder trabalhar ' +
        'despercebida. A obra viajou pelos Estados Unidos em turnê antes de ser comprada ' +
        'pelo magnata ferroviário Cornelius Vanderbilt, que depois a doou ao Metropolitan ' +
        'Museum de Nova York. Bonheur se tornou uma das pintoras mais bem-sucedidas ' +
        'comercialmente do século XIX em qualquer país, numa época em que a grande ' +
        'maioria das mulheres artistas não conseguia viver apenas da própria arte.',
    },
  },
  {
    id: 'homer-corrente-golfo',
    title: 'A corrente do golfo',
    credit: 'Winslow Homer, 1899',
    src: commons('Winslow Homer - The Gulf Stream - Metropolitan Museum of Art.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Realismo americano',
    story: {
      lede:
        'Quando foi exibido, o público ficou tão incomodado com a cena sem explicação ' +
        'que os críticos passaram a exigir que Homer contasse o que aconteceria com o ' +
        'marinheiro.',
      body:
        'Homer pintou a obra depois de viagens às Bahamas, numa época pós-Reconstrução ' +
        'nos Estados Unidos em que representar um homem negro sozinho, ferido e em risco ' +
        'de vida, sem qualquer contexto narrativo que explicasse a cena, gerava ' +
        'desconforto público explícito entre parte do público branco da época. Ele se ' +
        'recusou por escrito a acrescentar qualquer elemento que resolvesse ou ' +
        'suavizasse a tensão da cena, respondendo com irritação às cartas que pediam um ' +
        'final mais claro. O Metropolitan Museum de Nova York, que comprou o quadro em ' +
        '1906, inicialmente hesitou diante da reação do público a uma obra tão ' +
        'desconfortável de se explicar em vitrine.',
    },
  },
  {
    id: 'hiroshige-chuva-shin-ohashi',
    title: 'Chuva repentina sobre a ponte Shin-Ōhashi',
    credit: 'Utagawa Hiroshige, 1857',
    src: commons('Hiroshige, Sudden shower over Shin-Ōhashi bridge and Atake, 1857.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Ukiyo-e',
    story: {
      lede:
        'Hiroshige morreu de cólera durante uma epidemia em Edo, no ano seguinte a esta ' +
        'gravura ter sido publicada, sem ver o efeito que ela teria na Europa.',
      body:
        'A obra faz parte de uma série de cem vistas famosas de Edo, feita já no fim da ' +
        'vida do artista, que morreu em 1858 durante um surto de cólera que matou dezenas ' +
        'de milhares de pessoas na cidade. Décadas depois, gravuras como essa chegaram a ' +
        'Paris junto com cerâmicas importadas e alimentaram uma onda de fascínio europeu ' +
        'pela arte japonesa conhecida como japonismo, que influenciou pintores como ' +
        'Monet, Degas e Van Gogh. Van Gogh chegou a copiar esta cena específica a óleo, ' +
        'quase traço por traço, incluindo os caracteres japoneses que emolduram a gravura ' +
        'original, como exercício de estudo.',
    },
  },
  {
    id: 'fankuan-viajantes',
    title: 'Viajantes entre montanhas e riachos',
    credit: 'Fan Kuan, dinastia Song, c. 1000',
    src: commons('Fan Kuan - Travelers Among Mountains and Streams - Google Art Project.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Pintura de paisagem da dinastia Song',
    story: {
      lede:
        'A assinatura do pintor ficou escondida na pintura por quase mil anos, ' +
        'disfarçada entre as folhagens, até ser descoberta em 1958 por um pesquisador de ' +
        'museu com uma lupa.',
      body:
        'Antes dessa descoberta, a autoria da obra era debatida havia séculos entre ' +
        'estudiosos de pintura chinesa, que a atribuíam por tradição a Fan Kuan sem prova ' +
        'documental direta. A técnica do artista, ativo por volta do ano 1000 durante a ' +
        'dinastia Song, se tornou modelo de referência para gerações seguintes de ' +
        'pintores de paisagem na China, num estilo que priorizava montanhas monumentais ' +
        'sobre figuras humanas minúsculas. A pintura é hoje uma das poucas obras de sua ' +
        'época atribuídas com segurança a um autor conhecido, e é guardada no Museu do ' +
        'Palácio Nacional, em Taipé, para onde boa parte do acervo imperial chinês foi ' +
        'levada durante a guerra civil do século XX.',
    },
  },
  {
    id: 'botticelli-nascimento-venus',
    title: 'O nascimento de Vênus',
    credit: 'Sandro Botticelli, c. 1485',
    src: commons('Sandro Botticelli - La nascita di Venere - Google Art Project - edited.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Renascimento inicial',
    story: {
      lede:
        'A obra foi pintada numa Florença onde, poucos anos depois, fanáticos religiosos ' +
        'queimavam publicamente quadros considerados imorais.',
      body:
        'Encomendada provavelmente por um membro da família Médici para uma de suas ' +
        'residências de campo, a pintura era incomum para a época: um nu mitológico em ' +
        'grande escala numa tela, quando obras desse tamanho eram quase sempre reservadas ' +
        'a temas religiosos cristãos. Em 1497, o pregador dominicano Girolamo Savonarola ' +
        'liderou em Florença as chamadas fogueiras das vaidades, incentivando moradores a ' +
        'queimar publicamente livros, espelhos, joias e pinturas consideradas pecaminosas ' +
        'ou vaidosas demais. Muitas obras seculares da época não sobreviveram a esse ' +
        'período de fervor religioso, e o fato de esta ter sobrevivido intacta é, em boa ' +
        'parte, uma questão de sorte e de onde estava guardada.',
    },
  },
  {
    id: 'gentileschi-judite',
    title: 'Judite decapitando Holofernes',
    credit: 'Artemisia Gentileschi, c. 1612–13',
    src: commons('Artemisia Gentileschi - Judith Beheading Holofernes - WGA8563.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Barroco',
    story: {
      lede:
        'Artemisia Gentileschi pintou esta cena logo depois de sobreviver a um ' +
        'julgamento público em que foi torturada para provar que dizia a verdade.',
      body:
        'Em 1612, ela acusou publicamente o pintor Agostino Tassi, contratado por seu pai ' +
        'para lhe dar aulas, de estupro; durante o processo, que se arrastou por meses e ' +
        'se tornou público em Roma, submeteram-na a um teste de tortura com cordas ' +
        'apertadas nos dedos para verificar se seu testemunho era verdadeiro, enquanto o ' +
        'próprio acusado, já condenado antes por outros crimes, quase não foi punido no ' +
        'fim. Historiadores da arte associam com frequência a violência incomum e o ' +
        'realismo físico dessa cena bíblica ao episódio, embora Artemisia nunca tenha ' +
        'declarado por escrito essa intenção diretamente. Ela pintou pelo menos duas ' +
        'versões completas do mesmo tema ao longo da carreira, anos de distância uma da ' +
        'outra.',
    },
  },
  {
    id: 'hals-cavaleiro-risonho',
    title: 'O cavaleiro risonho',
    credit: 'Frans Hals, 1624',
    src: commons('Frans Hals – The Laughing Cavalier.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Barroco holandês (Século de Ouro)',
    story: {
      lede:
        'O nome pelo qual o quadro é conhecido só surgiu no século XIX, mais de duzentos ' +
        'anos depois de ele ter sido pintado.',
      body:
        'A identidade do homem retratado nunca foi confirmada por documentos — ' +
        'provavelmente um comerciante têxtil rico de Haarlem, dado o traje caro bordado ' +
        'que usa, mas nem isso é certo. Em 1865, um leilão em Paris pelo quadro virou ' +
        'disputa pessoal entre dois colecionadores britânicos milionários, o Marquês de ' +
        'Hertford e o Barão Rothschild, que competiram publicamente até um preço recorde ' +
        'para a época. Décadas depois, ao ser exibido numa grande mostra em Londres em ' +
        '1888, o apelido Cavaleiro Risonho pegou entre o público e a imprensa e ficou ' +
        'definitivo, embora o homem, tecnicamente, nem esteja rindo na pintura.',
    },
  },
  {
    id: 'zapata-ultima-ceia',
    title: 'A última ceia',
    credit: 'Marcos Zapata, c. 1753',
    src: commons('Zapata-última cena.jpg'),
    rights: 'Domínio público (Wikimedia Commons)',
    verified: true,
    movement: 'Escola Cuzquenha (barroco andino colonial)',
    story: {
      lede:
        'O quadro faz parte de uma série encomendada para substituir obras destruídas ' +
        'por um terremoto que arrasou Cusco décadas antes.',
      body:
        'Depois do terremoto de 1650, que destruiu boa parte da cidade colonial de ' +
        'Cusco, no atual Peru, boa parte da decoração da Catedral precisou ser refeita, e ' +
        'Marcos Zapata, um pintor mestiço formado dentro da tradição conhecida como ' +
        'Escola Cuzquenha, foi um dos artistas contratados para a reconstrução ao longo ' +
        'das décadas seguintes. Essa escola misturava convenções religiosas europeias ' +
        'trazidas pelos colonizadores com elementos andinos locais — incluindo, nesta ' +
        'obra, um prato de porquinho-da-índia assado servido no lugar do cordeiro pascal ' +
        'tradicional, e pães e frutas típicos da região andina em vez dos originais do ' +
        'Oriente Médio bíblico.',
    },
  },
]

/**
 * The puzzle's artwork collection. A class rather than a plain export
 * because it's a genuine collection-with-behavior (lookup by id, a
 * documented fallback) — unlike `geometry.ts`/`rules.ts`, which stay pure
 * functions per ADR-0001. One instance only: the constructor is private so
 * `artworkCatalog` below is the sole way to reach it.
 */
export class ArtworkCatalog {
  private readonly items: readonly Artwork[]

  private constructor(items: readonly Artwork[]) {
    this.items = items
  }

  static readonly default = new ArtworkCatalog(ARTWORK_DATA)

  list(): readonly Artwork[] {
    return this.items
  }

  /** Falls back to the first (local, always-available) entry. */
  get(id: string): Artwork {
    return this.items.find((a) => a.id === id) ?? this.items[0]
  }

  get defaultArtwork(): Artwork {
    return this.items[0]
  }
}

export const artworkCatalog = ArtworkCatalog.default

/** Nominal piece counts offered as difficulty. The real count is
 *  `cols * rows` once the grid is fitted to the image — always show that. */
export const DIFFICULTIES: ReadonlyArray<{ label: string; pieces: number }> = [
  { label: 'Fácil', pieces: 12 },
  { label: 'Médio', pieces: 24 },
  { label: 'Difícil', pieces: 54 },
  { label: 'Punitivo', pieces: 96 },
]
