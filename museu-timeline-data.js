/**
 * museu-timeline-data.js
 * ─────────────────────────────────────────────────────────────────
 * Dados de conteúdo da Timeline do Museu Leça FC.
 * Edita aqui títulos, textos, imagens e galerias de cada bloco.
 * ─────────────────────────────────────────────────────────────────
 *
 * Estrutura de cada bloco:
 *
 *  id           — identificador único (usado no URL, ex: #block-1)
 *  period       — texto do período visível no bloco e na navegação
 *  periodStyle  — 'extra' para estilo neutro (usado no bloco Ecletismo)
 *  layout       — 'normal' (imagem à esquerda) | 'reverse' (imagem à direita)
 *  articleStyle — CSS inline extra no <article> (opcional)
 *  heroImage    — { src, alt } — imagem principal do bloco
 *  title        — título do bloco
 *  paragraphs   — array de parágrafos de texto
 *  highlight    — destaque lateral opcional:
 *                   { type: 'person', image, name, caption }
 *                   { type: 'squad',  rows: [{ label, text }] }
 *  miniTimeline — array de etapas cronológicas: [{ year, label }]
 *                 (usado em alternativa ao highlight, ex: bloco 8)
 *  galleryLabel — título da galeria (omitir se não houver galeria)
 *  gallery      — array de { src, alt } (omitir se não houver galeria)
 */

const TIMELINE_BLOCKS = [

  // ──────────────────────────────────────────
  // BLOCO 1 — Fundação e Reorganização
  // ──────────────────────────────────────────
  {
    id: 'block-1',
    period: '1912–1922',
    layout: 'normal',
    heroImage: {
      src: 'images/museum/timeline/01_fundacao_jornais.png',
      alt: 'Fundação — Jornais da época',
      caption: 'Notícias da imprensa da época sobre a fundação e reorganização do Leça FC.',
    },
    title: 'O nascimento de um símbolo leceiro',
    paragraphs: [
      'O Leça Futebol Clube surge em 1912, com referências documentais em jornais da época, e reorganiza-se oficialmente a 1 de janeiro de 1922. Após uma primeira interrupção provocada pela saída de elementos importantes e pelo contexto da Primeira Guerra Mundial, o clube regressa para construir uma identidade duradoura.',
      'A fusão entre o "Cruz Branca" e o "União Sportiva de Leixões" foi determinante para esta nova fase, dando origem ao primeiro emblema do clube.',
    ],
    highlight: {
      type: 'person',
      image: 'images/museum/timeline/01_antonio_lino_moreira.png',
      name: 'António Lino Moreira',
      caption: 'Um dos principais rostos da fundação do Leça Futebol Clube.',
    },
    galleryLabel: 'Galeria',
    gallery: [
      { src: 'images/museum/timeline/01_primeiro_emblema_1922.png', alt: 'Primeiro emblema 1922',  caption: 'O primeiro emblema oficial do Leça FC, datado de 1922.' },
      { src: 'images/museum/timeline/01_os_flechas_de_leca.png',    alt: 'Os Flechas de Leça',    caption: 'Os Flechas de Leça — equipa que representa o clube nos primeiros anos.' },
      { src: 'images/museum/timeline/01_documento_1924.png',         alt: 'Documento 1924',         caption: 'Documento histórico de 1924 relativo à organização do clube.' },
    ],
  },

  // ──────────────────────────────────────────
  // BLOCO 2 — As Raízes da Identidade
  // ──────────────────────────────────────────
  {
    id: 'block-2',
    period: '1920–1935',
    layout: 'reverse',
    heroImage: {
      src: 'images/museum/timeline/01_os_flechas_de_leca.png',
      alt: 'Os Flechas de Leça',
      caption: 'Os Flechas de Leça — equipa que representou o clube nos primeiros anos após a reorganização.',
    },
    title: 'Um clube que começou a unir Leça',
    paragraphs: [
      'A reorganização de 1922 marcou o início definitivo da construção da identidade verde e branca. O clube afirma-se como ponto de encontro da comunidade leceira, preservando nomes, símbolos e memórias que ainda hoje fazem parte da sua história.',
      'Mais do que uma equipa de futebol, o Leça começava a tornar-se uma expressão da própria terra.',
    ],
    galleryLabel: 'Galeria',
    gallery: [
      { src: 'images/museum/timeline/01_primeiro_emblema_1922.png', alt: 'Primeiro emblema 1922', caption: 'O primeiro emblema oficial do Leça FC, datado de 1922.' },
      { src: 'images/museum/timeline/01_documento_1924.png',         alt: 'Documento 1924',        caption: 'Documento histórico de 1924 relativo à organização do clube.' },
    ],
  },

  // ──────────────────────────────────────────
  // BLOCO 3 — Hino, Emblema e Identidade
  // ──────────────────────────────────────────
  {
    id: 'block-3',
    period: '1935–1940',
    layout: 'normal',
    heroImage: {
      src: 'images/museum/timeline/03_novo_emblema_1940.png',
      alt: 'Novo emblema 1940',
      caption: 'O emblema renovado de 1940, com novos elementos ligados à Vila de Matosinhos-Leça da Palmeira.',
    },
    title: 'Os símbolos de uma paixão',
    paragraphs: [
      'Em 1935, Jorge Bento cria o hino do Leça Futebol Clube, reforçando a dimensão cultural e emocional do clube.',
      'Em 1940, o emblema é renovado, juntando ao símbolo original elementos ligados à então Vila de Matosinhos-Leça da Palmeira.',
    ],
    galleryLabel: 'Comparação de emblemas',
    gallery: [
      { src: 'images/museum/timeline/01_primeiro_emblema_1922.png', alt: 'Primeiro emblema 1922', caption: 'O primeiro emblema oficial do Leça FC, datado de 1922.' },
      { src: 'images/museum/timeline/03_hino_1935.png',              alt: 'Hino 1935',             caption: 'Registo do hino do Leça FC, criado por Jorge Bento em 1935.' },
    ],
  },

  // ──────────────────────────────────────────
  // BLOCO 4 — A Primeira Liga e o Campo do Leça
  // ──────────────────────────────────────────
  {
    id: 'block-4',
    period: '1941–1944',
    layout: 'reverse',
    heroImage: {
      src: 'images/museum/timeline/04_primeira_liga_1941_1942_1.png',
      alt: 'Primeira Liga 1941–1942',
      caption: 'Época 1941/1942 — a estreia histórica do Leça FC na Primeira Liga Portuguesa.',
    },
    title: 'A primeira chegada à elite',
    paragraphs: [
      'Na época 1941/1942, o Leça Futebol Clube estreia-se na Primeira Liga Portuguesa.',
      'Poucos anos depois, em 1944, inaugura o Campo do Leça, criando uma nova casa para gerações de adeptos verdes e brancos.',
    ],
    galleryLabel: 'Galeria',
    gallery: [
      { src: 'images/museum/timeline/04_primeira_liga_1941_1942_2.png', alt: 'Primeira Liga 1941–1942', caption: 'Registos da participação do Leça FC na Primeira Liga 1941/1942.' },
      { src: 'images/museum/timeline/04_campo_do_leca_1.png',           alt: 'Campo do Leça',           caption: 'O Campo do Leça, inaugurado em 1944 e casa do clube durante décadas.' },
      { src: 'images/museum/timeline/04_campo_do_leca_2.png',           alt: 'Campo do Leça',           caption: 'Vista do Campo do Leça nos primeiros anos após a inauguração.' },
      { src: 'images/museum/timeline/04_campo_do_leca_3.png',           alt: 'Campo do Leça',           caption: 'O Campo do Leça em diferentes perspetivas.' },
      { src: 'images/museum/timeline/04_campo_do_leca_4.png',           alt: 'Campo do Leça',           caption: 'Memórias do Campo do Leça ao longo dos anos.' },
      { src: 'images/museum/timeline/04_localizacao_campos.jpeg',        alt: 'Localização dos campos',  caption: 'Localização dos campos históricos do Leça FC ao longo das décadas.' },
    ],
  },

  // ──────────────────────────────────────────
  // BLOCO 5 — A Geração de Ouro
  // ──────────────────────────────────────────
  {
    id: 'block-5',
    period: '1956–1957',
    layout: 'normal',
    heroImage: {
      src: 'images/museum/timeline/05_geracao_de_ouro_1.jpeg',
      alt: 'Geração de Ouro',
      caption: 'A Geração de Ouro dos juniores do Leça FC — finalistas do campeonato nacional em 1957.',
    },
    title: 'A Geração de Ouro',
    paragraphs: [
      'Os juniores do Leça protagonizaram um dos maiores feitos da formação do clube ao conquistarem o bicampeonato distrital e atingirem a final do campeonato nacional em 1957.',
    ],
    highlight: {
      type: 'squad',
      rows: [
        { label: 'Em cima', text: 'José Henrique, Seixas, João, Bastos, Martinho, Peneda e Israel.' },
        { label: 'Em baixo', text: 'Neto, Fogageiro, Brandão, Correia, Gentil, Augusto e Mocuna.' },
      ],
    },
    galleryLabel: 'Galeria',
    gallery: [
      { src: 'images/museum/timeline/05_geracao_de_ouro_2.jpeg', alt: 'Geração de Ouro', caption: 'Mais um registo da histórica Geração de Ouro do Leça FC.' },
    ],
  },

  // ──────────────────────────────────────────
  // BLOCO 6 — A Nova Casa Verde e Branca
  // ──────────────────────────────────────────
  {
    id: 'block-6',
    period: '1975–1986',
    layout: 'reverse',
    heroImage: {
      src: 'images/museum/timeline/06_estadio_do_leca_1986_1.png',
      alt: 'Estádio do Leça 1986',
      caption: 'O Estádio do Leça, inaugurado oficialmente a 15 de agosto de 1986.',
    },
    title: 'A construção de uma nova casa',
    paragraphs: [
      'Pensado desde os finais dos anos 60, o Estádio do Leça foi oficialmente inaugurado a 15 de agosto de 1986.',
      'A nova casa verde e branca tornou-se um dos principais símbolos do clube.',
    ],
    galleryLabel: 'Galeria',
    gallery: [
      { src: 'images/museum/timeline/06_estadio_do_leca_1986_2.png', alt: 'Estádio do Leça', caption: 'Obras e construção do novo estádio do Leça FC.' },
      { src: 'images/museum/timeline/06_estadio_do_leca_1986_3.png', alt: 'Estádio do Leça', caption: 'O estádio em diferentes fases da sua construção.' },
      { src: 'images/museum/timeline/06_estadio_do_leca_1986_4.png', alt: 'Estádio do Leça', caption: 'Vista do Estádio do Leça após a inauguração.' },
      { src: 'images/museum/timeline/06_estadio_do_leca_1986_5.png', alt: 'Estádio do Leça', caption: 'Adeptos e ambiente no Estádio do Leça nos primeiros anos.' },
      { src: 'images/museum/timeline/06_estadio_do_leca_1986_6.png', alt: 'Estádio do Leça', caption: 'O Estádio do Leça consolidado como símbolo do clube e da comunidade.' },
    ],
  },

  // ──────────────────────────────────────────
  // BLOCO 7 — Campeões da III Divisão
  // ──────────────────────────────────────────
  {
    id: 'block-7',
    period: '1980–1981',
    layout: 'normal',
    heroImage: {
      src: 'images/museum/timeline/07_campeoes_iii_divisao_1980_1981.png',
      alt: 'Campeões III Divisão 1980–1981',
      caption: 'A equipa campeã da III Divisão na época 1980/1981.',
    },
    title: 'Um título para a memória',
    paragraphs: [
      'Na época 1980/1981, o Leça Futebol Clube conquista a III Divisão, acrescentando mais um capítulo de orgulho à sua história competitiva.',
    ],
  },

  // ──────────────────────────────────────────
  // BLOCO 8 — Caminhada até à Primeira Liga
  // ──────────────────────────────────────────
  {
    id: 'block-8',
    period: '1991–1996',
    layout: 'reverse',
    articleStyle: 'background: linear-gradient(180deg, transparent 0%, rgba(5,107,87,0.07) 30%, rgba(5,107,87,0.07) 70%, transparent 100%);',
    heroImage: {
      src: 'images/museum/timeline/08_caminhada_primeira_liga_anos_90_1.png',
      alt: 'Caminhada até à Primeira Liga',
      caption: 'A equipa dos anos 90 que fez a histórica subida até à Primeira Liga Portuguesa.',
    },
    title: 'Do impossível à Primeira Liga',
    paragraphs: [
      'Entre 1991 e 1996, o Leça sobe da III Divisão até à Primeira Liga Portuguesa em apenas quatro épocas. Uma das histórias mais épicas do futebol português.',
    ],
    miniTimeline: [
      { year: '1991/1992', label: 'III Divisão' },
      { year: '1992/1993', label: 'II Divisão B' },
      { year: '1993/1994', label: 'Segunda Divisão de Honra' },
      { year: '1994/1995', label: 'Campeão da Segunda Divisão de Honra' },
      { year: '1995/1996', label: 'Primeira Liga Portuguesa' },
    ],
    galleryLabel: 'Galeria',
    gallery: [
      { src: 'images/museum/timeline/08_caminhada_primeira_liga_anos_90_2.png', alt: 'Anos 90', caption: 'Momentos marcantes da caminhada verde e branca nos anos 90.' },
      { src: 'images/museum/timeline/08_caminhada_primeira_liga_anos_90_3.png', alt: 'Anos 90', caption: 'Jogadores e equipa técnica durante a subida de divisões.' },
      { src: 'images/museum/timeline/08_caminhada_primeira_liga_anos_90_4.jpeg', alt: 'Anos 90', caption: 'A festa e o orgulho de uma época que ficou para a história.' },
      { src: 'images/museum/timeline/08_caminhada_primeira_liga_anos_90_5.png', alt: 'Anos 90', caption: 'Registos das épocas que culminaram no regresso à Primeira Liga.' },
      { src: 'images/museum/timeline/08_caminhada_primeira_liga_anos_90_6.png', alt: 'Anos 90', caption: 'A equipa que escreveu uma das páginas mais épicas do futebol leceiro.' },
      { src: 'images/museum/timeline/08_caminhada_primeira_liga_anos_90_7.png', alt: 'Anos 90', caption: 'Momentos inesquecíveis da ascensão ao principal escalão do futebol português.' },
      { src: 'images/museum/timeline/08_caminhada_primeira_liga_anos_90_8.png', alt: 'Anos 90', caption: 'O Leça FC na época 1995/1996, de regresso à Primeira Liga Portuguesa.' },
    ],
  },

  // ──────────────────────────────────────────
  // BLOCO 9 — Resistir e Voltar
  // ──────────────────────────────────────────
  {
    id: 'block-9',
    period: '2006–2007',
    layout: 'normal',
    heroImage: {
      src: 'images/museum/timeline/09_epoca_2006_2007.jpeg',
      alt: 'Época 2006–2007',
      caption: 'A equipa da época 2006/2007, campeã da III Divisão e de regresso à II Divisão B.',
    },
    title: 'Resistir, acreditar e voltar a subir',
    paragraphs: [
      'Depois dos anos de maior afirmação, o Leça atravessou períodos difíceis. Em 2006/2007, o clube conquista a III Divisão e sobe à II Divisão B, devolvendo esperança aos adeptos.',
    ],
  },

  // ──────────────────────────────────────────
  // BLOCO 10 — O Leça Continua Vivo
  // ──────────────────────────────────────────
  {
    id: 'block-10',
    period: '2017–Hoje',
    layout: 'reverse',
    heroImage: {
      src: 'images/museum/timeline/10_epocas_recentes_1.png',
      alt: 'Épocas recentes',
      caption: 'O Leça FC nas épocas mais recentes, a escrever novos capítulos da sua história.',
    },
    title: 'Uma nova vida verde e branca',
    paragraphs: [
      'Nos últimos anos, o Leça voltou a escrever páginas importantes da sua história, reforçando a sua presença nacional, as modalidades e a ligação à comunidade.',
    ],
    galleryLabel: 'Galeria',
    gallery: [
      { src: 'images/museum/timeline/10_epocas_recentes_2.png', alt: 'Épocas recentes', caption: 'Momentos recentes do clube numa nova fase da sua história.' },
    ],
  },

  // ──────────────────────────────────────────
  // BLOCO EXTRA — Ecletismo
  // ──────────────────────────────────────────
  {
    id: 'block-extra',
    period: 'Ecletismo',
    periodStyle: 'extra',
    layout: 'normal',
    heroImage: {
      src: 'images/museum/timeline/02_modalidades_ecletismo_1.png',
      alt: 'Modalidades — Ecletismo',
      caption: 'O Leça FC como clube eclético, com dezenas de modalidades ao longo da sua história.',
    },
    title: 'Muito mais do que futebol',
    paragraphs: [
      'Ao longo da sua história, o Leça Futebol Clube contou com dezenas de modalidades diferentes, reforçando o seu caráter eclético e comunitário.',
    ],
    galleryLabel: 'Galeria',
    gallery: [
      { src: 'images/museum/timeline/02_modalidades_ecletismo_2.png',  alt: 'Ecletismo', caption: 'Modalidades e atividades desportivas do Leça FC além do futebol.' },
      { src: 'images/museum/timeline/02_modalidades_ecletismo_3.jpeg', alt: 'Ecletismo', caption: 'O espírito comunitário do clube nas diferentes modalidades.' },
      { src: 'images/museum/timeline/02_modalidades_ecletismo_4.png',  alt: 'Ecletismo', caption: 'Atletas do Leça FC em diferentes desportos.' },
      { src: 'images/museum/timeline/02_modalidades_ecletismo_5.png',  alt: 'Ecletismo', caption: 'A vertente eclética do clube ao longo das décadas.' },
      { src: 'images/museum/timeline/02_modalidades_ecletismo_6.jpeg', alt: 'Ecletismo', caption: 'Registos de atividades desportivas do Leça FC.' },
      { src: 'images/museum/timeline/02_modalidades_ecletismo_7.png',  alt: 'Ecletismo', caption: 'O clube como ponto de encontro da comunidade leceira.' },
      { src: 'images/museum/timeline/02_modalidades_ecletismo_8.png',  alt: 'Ecletismo', caption: 'Diversidade e paixão nas modalidades do Leça FC.' },
    ],
  },

];
