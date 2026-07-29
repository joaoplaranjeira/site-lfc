# Investor Room — Arquitetura Funcional de Produto

**Produto:** Universo Leça — Investor Room  
**Primeiro projeto:** Leça Cycling Project  
**Estado:** Documento-base para design e desenvolvimento  
**Âmbito:** Arquitetura funcional, experiência, interface e evolução do produto  
**Fora de âmbito:** Conteúdo editorial, wireframes, mockups e implementação

---

## 0. Enquadramento e decisões estruturantes

O Investor Room deve ser tratado como um produto digital autónomo dentro do
ecossistema Universo Leça. Pode partilhar infraestrutura, identidade e
credibilidade institucional com o website público, mas não deve parecer uma
secção escondida desse website.

A experiência divide-se em dois ambientes deliberadamente distintos:

1. **Investor Room:** ambiente de orientação e descoberta. É funcional,
   discreto, previsível e eficiente.
2. **Project Experience:** ambiente imersivo dedicado a um projeto. É
   editorial, cinematográfico, progressivo e emocional.

A transição entre ambos deve ser explícita. Quando o utilizador abre um projeto,
o dashboard deixa de dominar a interface. O projeto ganha linguagem visual,
ritmo e navegação próprios, mantendo apenas mecanismos mínimos para regressar,
consultar capítulos e regressar ao dashboard.

### 0.1 Premissas

- O acesso é feito através de um código válido, segundo o mesmo padrão funcional
  de `museu.html`.
- Todos os códigos válidos dão acesso à mesma área, aos mesmos projetos e aos
  mesmos conteúdos.
- O primeiro projeto é o Leça Cycling Project, mas nenhum elemento estrutural
  deve depender exclusivamente do ciclismo.
- A validação e a persistência do acesso durante a visita devem replicar o
  comportamento do Museu.
- A plataforma deve funcionar de forma excelente em desktop e mobile.
- O produto deve poder evoluir sem redesenhar a arquitetura a cada novo projeto.

### 0.2 Critérios de sucesso

O produto será bem-sucedido se:

- um convidado compreender imediatamente que entrou num ambiente exclusivo;
- o acesso decorrer sem fricção desnecessária;
- cada utilizador identificar rapidamente os projetos que lhe estão disponíveis;
- a experiência de projeto manter atenção e progressão sem desorientação;
- materiais de apoio surgirem no momento certo, sem transformar a experiência
  numa biblioteca de ficheiros;
- o utilizador chegar ao final com uma próxima ação clara;
- a equipa conseguir adicionar projetos sem alterações estruturais;
- existirem sinais mensuráveis de interesse, sem práticas de tracking invasivas.

### 0.3 Referência visual interna

O ponto de partida visual do Investor Room deve ser a experiência existente em
`museu.html`. Esta decisão assegura continuidade com o Universo Leça e evita
criar uma marca digital sem ligação ao produto atual.

Devem ser herdados e refinados:

- fundo verde-negro profundo;
- verde esmeralda como cor de assinatura;
- tipografia Poppins e títulos de elevado contraste;
- capas full viewport com imagem ou vídeo;
- overlays cinematográficos e vinheta;
- títulos brancos com palavra ou segmento em verde claro;
- eyebrow labels em uppercase com espaçamento amplo;
- cartões editoriais com imagem, gradiente, badge e ação;
- botões pill primários e secundários;
- entradas por fade e deslocação vertical curta;
- profundidade criada por luz, media e contraste, não por excesso de
  decoração.

Não se pretende duplicar literalmente a página do Museu. O Investor Room deve
ser a evolução mais madura, sistemática e funcional dessa linguagem: maior
precisão tipográfica, melhor acessibilidade, navegação de produto, estados
completos e um sistema de componentes preparado para vários projetos.

A referência ao Museu abrange a **direção de design e o fluxo de acesso**. A
validação do código, a abertura da área e a persistência do acesso durante a
visita devem seguir o mesmo padrão funcional.

---

# 1. Visão geral

## 1.1 Objetivos da plataforma

### Objetivos primários

- Apresentar projetos estratégicos com maior profundidade, clareza e impacto do
  que seria possível no website institucional.
- Criar um ambiente de confiança para investidores, patrocinadores, municípios
  e parceiros institucionais.
- Transformar informação complexa numa narrativa compreensível e memorável.
- Disponibilizar todo o portefólio reservado depois da validação do código.
- Facilitar a passagem de interesse para conversa, reunião, pedido de
  informação ou participação.

### Objetivos secundários

- Centralizar versões atualizadas dos materiais de cada projeto.
- Dar visibilidade a atualizações relevantes sem depender apenas de email.
- Perceber, de forma agregada e proporcional, que projetos e capítulos geram
  mais interesse.
- Sustentar relações de longo prazo, incluindo fases posteriores ao primeiro
  contacto.

## 1.2 Posicionamento

O Investor Room posiciona-se como a camada privada de visão estratégica do
Universo Leça: um espaço curado onde oportunidades, ambição, execução e
transparência se encontram.

Não é:

- uma intranet;
- um repositório documental;
- uma landing page com password;
- um pitch deck convertido em HTML;
- uma área de cliente convencional;
- um catálogo indiscriminado de oportunidades.

É uma plataforma de apresentação e relacionamento, acessível por código, na
qual cada projeto é tratado como uma experiência editorial própria.

## 1.3 Proposta de valor

### Para o convidado

- acesso simples e reservado;
- compreensão progressiva de projetos complexos;
- materiais organizados e contextualizados;
- experiência consistente e cuidadosamente curada;
- contacto direto e próximos passos claros.

### Para o Universo Leça

- gestão dos códigos e do conteúdo através do backoffice existente;
- apresentação consistente de múltiplos projetos;
- maior qualidade percebida;
- capacidade de acompanhar interesse e manter materiais atualizados;
- base reutilizável para relações de investimento e parceria.

## 1.4 Princípios do produto

### Exclusividade sem ostentação

A exclusividade deve resultar da curadoria, precisão e atenção ao detalhe, não
de efeitos visuais exuberantes ou linguagem artificialmente luxuosa.

### Confiança antes de persuasão

O produto deve privilegiar clareza, proveniência, atualidade e controlo. A
experiência emocional não pode ocultar factos, riscos ou limitações.

### Narrativa antes de documentação

O percurso principal explica e envolve. Os documentos aprofundam e comprovam,
mas permanecem numa camada secundária.

### Progressão com controlo

O scroll conduz a narrativa, mas nunca aprisiona. O utilizador pode pausar,
saltar para capítulos, regressar e reduzir movimento.

### Conteúdo como sistema

Projetos, capítulos, módulos, documentos e atualizações devem ser entidades
reutilizáveis, não páginas construídas de raiz.

### Qualidade em condições reais

O produto deve manter-se elegante em dispositivos modestos, redes lentas,
preferências de movimento reduzido e ecrãs pequenos.

### Acessibilidade como qualidade

Contraste, foco, teclado, semântica, legendas, transcrições e alternativas a
animações fazem parte do produto premium.

---

# 2. Arquitetura global

## 2.1 Sitemap

### Access gate

- **Acesso por código**
  - introdução do código;
  - validação na API de códigos de acesso;
  - erro de código inválido, revogado, expirado ou sem utilizações disponíveis;
  - abertura do Investor Room após validação;
  - persistência do acesso na visita, tal como no Museu.

### Investor Room

- **Home / Dashboard**
- **Todos os projetos**
- **Atualizações**
- **Pesquisa**
- **Ajuda e contacto**

### Experiência de projeto

- **Capa / entrada do projeto**
- **Prólogo**
- **Capítulos narrativos**
- **Interlúdios e transições**
- **Centro de documentos do projeto**
- **Atualizações do projeto**
- **Conclusão**
- **Próximo passo / contacto**
- **Navegador de capítulos**

### Estados de sistema

- código inválido;
- código revogado;
- código expirado;
- código sem utilizações disponíveis;
- projeto indisponível;
- conteúdo em atualização;
- sem ligação;
- erro inesperado;
- manutenção.

O backoffice existente é responsável pela gestão de códigos e conteúdos. A sua
arquitetura, funcionalidades e interface estão fora do âmbito deste documento e
deste website.

## 2.2 Hierarquia funcional

```text
Access Gate
└── Validação do código
    └── Investor Room

Investor Room
├── Dashboard
├── Projetos
│   └── Projeto
│       ├── Versão
│       ├── Capítulos
│       │   └── Módulos narrativos
│       ├── Documentos
│       ├── Atualizações
│       └── Ações
├── Atualizações transversais
├── Pesquisa
└── Contactos
```

Todos os códigos válidos conduzem à mesma árvore funcional. Não existem áreas,
projetos ou documentos diferenciados por utilizador.

## 2.3 Modelo de navegação

### Navegação no Investor Room

É persistente e orientada a tarefas. Deve incluir:

- marca Investor Room;
- Dashboard;
- Projetos;
- Atualizações;
- pesquisa, quando o volume a justificar;
- ajuda e contacto.

### Navegação dentro de um projeto

É mínima e editorial:

- regressar ao Investor Room;
- identidade do projeto;
- progresso global;
- índice de capítulos;
- som, quando existir e nunca ativado por defeito;
- opções de acessibilidade;
- ação contextual discreta.

A navegação do dashboard não acompanha visualmente o projeto. Isso evita que a
experiência pareça apenas uma página interna.

## 2.4 Modelo de acesso único

Existem apenas dois estados:

1. **Sem acesso:** o utilizador vê exclusivamente o access gate.
2. **Com acesso:** depois de validar um código, o utilizador vê todo o Investor
   Room, todos os projetos publicados e todos os respetivos conteúdos.

Não existem contas, perfis, roles, níveis, segmentos ou permissões
diferenciadas. O código serve apenas para abrir ou impedir o acesso à totalidade
da área.

O gate aplica-se a todo o produto:

- o dashboard permanece oculto antes da validação;
- nenhuma experiência de projeto pode ser aberta sem a confirmação de acesso;
- acessos diretos a URLs internas devem regressar ao ponto de entrada quando a
  confirmação não existir;
- cards, pesquisa, atualizações, documentos e media só ficam disponíveis depois
  do código ser aceite;
- um código válido não exige nova seleção, identificação ou confirmação.

## 2.5 Escalabilidade futura

A arquitetura deve assumir:

- dezenas de projetos;
- múltiplas versões e estados;
- vários idiomas;
- branding contextual moderado por projeto;
- arquivo de projetos concluídos;
- analytics agregados;
- conteúdos e códigos geridos pelo backoffice existente.

## 2.6 Arquitetura de conteúdo

Cada projeto deve ser composto por:

- metadados;
- capa;
- capítulos ordenados;
- módulos reutilizáveis;
- documentos relacionados;
- atualizações;
- contactos;
- ações finais;
- versão e data de atualização.

Os módulos narrativos não devem conhecer o projeto que os usa. Um módulo de
estatística, vídeo ou timeline deve funcionar no ciclismo, academia, estádio ou
tecnologia com configuração e conteúdo diferentes.

---

# 3. Fluxo do utilizador

## 3.1 Receção do convite

O convite deve comunicar apenas o necessário:

- origem verificável;
- natureza reservada do acesso;
- link para o Investor Room;
- código exclusivo ou link com convite associado;
- validade;
- contacto para assistência.

Não deve revelar informação sensível sobre projetos no próprio email.

## 3.2 Entrada

Ao abrir o link, o utilizador encontra uma superfície focada, sem navegação do
website público. A marca Universo Leça assegura legitimidade; a designação
Investor Room estabelece o contexto.

O ecrã deve explicar:

- que o acesso é reservado;
- como introduzir o código;
- que assistência está disponível;
- quais os requisitos mínimos de privacidade.

O access gate deve ser igual ao de `museu.html` na composição, linguagem visual
e comportamento:

- fundo em gradiente verde;
- card branco central;
- logótipo do Leça FC;
- título e explicação curta;
- campo de código centrado, uppercase e com tracking amplo;
- mensagem de erro inline;
- botão verde de entrada;
- loading durante a validação;
- remoção do gate e apresentação do conteúdo após sucesso.

Mudam apenas a designação e o texto contextual necessários para identificar o
Investor Room.

## 3.3 Autenticação

### Fluxo normal

1. Introduzir código.
2. Normalizar o código.
3. Validar o código através da API existente.
4. Guardar a confirmação de acesso, segundo o padrão do Museu.
5. Remover o access gate.
6. Mostrar o dashboard completo.

### Comportamentos importantes

- o código pode ser colado integralmente;
- formatação visual não deve alterar o valor real;
- a validação deve comunicar progresso sem parecer bloqueada;
- apresentar mensagens amigáveis para código inválido, revogado, expirado ou
  sem utilizações disponíveis;
- um erro de rede permite tentar novamente;
- uma visita já validada reabre diretamente o Investor Room, tal como no Museu.

## 3.4 Primeira entrada

Na primeira entrada, um acolhimento curto pode:

- explicar a estrutura em uma ou duas frases;
- indicar quantos projetos estão disponíveis;
- permitir começar imediatamente.

Não deve existir um tutorial longo. A interface deve ser autoexplicativa.

## 3.5 Dashboard

O dashboard abre com:

- saudação contextual sóbria;
- projeto recomendado ou mais relevante;
- restantes projetos disponíveis;
- atualizações recentes;
- continuação de uma experiência interrompida;
- contacto geral do projeto.

Se existir apenas um projeto, o dashboard continua a ter valor: contextualiza o
acesso, mostra atualizações e cria um ponto seguro de regresso. Pode, contudo,
dar maior protagonismo à entrada direta nesse projeto.

## 3.6 Exploração

O utilizador pode:

- abrir um projeto;
- consultar detalhes rápidos;
- ver o que foi atualizado;
- guardar ou retomar progresso;
- pesquisar quando existir volume suficiente;
- aceder a ajuda ou contacto.

## 3.7 Abertura de projeto

Ao selecionar um projeto:

1. o card responde imediatamente;
2. surge uma transição curta de contexto;
3. carrega-se primeiro a capa essencial;
4. elementos pesados são preparados progressivamente;
5. o dashboard desaparece;
6. a identidade do projeto assume o ecrã;
7. o utilizador escolhe iniciar ou retomar, quando aplicável.

## 3.8 Percurso narrativo

O utilizador progride por scroll natural. Cada capítulo:

- estabelece uma pergunta ou tensão;
- desenvolve uma ideia principal;
- apresenta evidência visual ou factual;
- conclui com uma ponte para o capítulo seguinte.

O sistema pode registar progresso apenas no browser. O utilizador pode abrir o
índice sem perder a posição.

## 3.9 Conclusão

O final deve:

- marcar claramente que a narrativa terminou;
- oferecer síntese estrutural, sem repetir todo o conteúdo;
- apresentar uma próxima ação clara;
- permitir consultar materiais;
- permitir regressar a capítulos;
- sugerir outro projeto apenas quando fizer sentido.

Não deve terminar apenas com um rodapé institucional.

## 3.10 Saída e regresso

Não existe perfil, gestão de sessão ou ação de logout na interface. O utilizador
pode regressar ao website Universo Leça através de uma ligação discreta. O
comportamento de acesso ao voltar ao Investor Room é igual ao Museu: enquanto a
confirmação de acesso existir na visita do browser, o gate não volta a ser
apresentado.

---

# 4. Dashboard

## 4.1 Papel do dashboard

O dashboard é uma antecâmara premium. Deve orientar e criar expectativa, sem
competir emocionalmente com os projetos. A sua linguagem é mais próxima de um
produto digital preciso do que de uma campanha.

Visualmente, deve parecer pertencente à mesma família de `museu.html`, mas com
maior densidade funcional. O fundo, a paleta, a tipografia, os cartões com media
e a iluminação esmeralda criam continuidade; a grelha, navegação, pesquisa,
progresso e estados transformam essa linguagem numa aplicação.

## 4.2 Estrutura funcional

### Cabeçalho global

- identidade Investor Room;
- pesquisa;
- acesso a ajuda.

### Área de contexto

- introdução curta;
- indicação de novidades desde a última visita;
- informação de confidencialidade sem dramatização.

### Projeto em destaque

Componente dominante para:

- projeto prioritário;
- projeto mais recente;
- projeto retomado;
- cenário com um único projeto.

Inclui apenas metadados essenciais, estado, progresso e ação de entrada. Não
resume a narrativa.

### Grelha de projetos

Cada card pode apresentar:

- identidade visual;
- categoria;
- estado;
- data da última atualização;
- progresso;
- marcador “novo” ou “atualizado”;
- ação primária.

O card completo deve ser acionável, acessível por teclado e ter foco claro.

O seu tratamento visual deriva dos `.section-card` do Museu:

- imagem ou composição visual a ocupar o fundo;
- overlay escuro mais forte junto ao conteúdo;
- badge de categoria ou estado;
- título de grande contraste;
- metadados secundários breves;
- ação em verde claro;
- elevação e zoom de imagem muito subtis no hover.

No dashboard, esta composição deve ser mais contida do que no Museu para
suportar vários projetos, estados e progressos sem sacrificar leitura.

### Continuação

Quando existe progresso, apresenta:

- projeto;
- capítulo;
- percentagem aproximada;
- tempo estimado restante, se calculável;
- ação “Continuar”.

### Atualizações

Timeline curta com:

- projeto associado;
- tipo de atualização;
- data;
- indicação de não lido;
- ligação ao contexto exato.

### Contacto

Um ponto humano persistente, mas não intrusivo:

- responsável;
- função;
- canais permitidos;
- pedido de reunião ou mensagem.

## 4.3 Menu

O menu principal deve começar reduzido:

- Início;
- Projetos;
- Atualizações.

A pesquisa só se torna um destino permanente quando o volume de conteúdo
justificar. Evita-se arquitetura antecipada visível ao utilizador.

## 4.4 Pesquisa

A pesquisa deve abranger o conteúdo do Investor Room:

- títulos de projeto;
- capítulos;
- atualizações;
- nomes e descrições de documentos.

Requisitos:

- resultados agrupados por tipo;
- indicação do projeto de origem;
- correspondência contextual;
- zero resultados com sugestões úteis;
- ligação direta ao resultado no projeto correspondente.

## 4.5 Filtros

Os filtros são progressivos e surgem apenas com diversidade real:

- estado;
- categoria;
- entidade do Universo Leça;
- atualização recente;
- concluído/não iniciado/em progresso.

Não se deve filtrar uma grelha com dois ou três projetos.

## 4.6 Estados do dashboard

Devem ser desenhados:

- primeira entrada;
- um único projeto;
- vários projetos;
- projeto novo;
- projeto atualizado;
- nenhum projeto ativo;
- projeto arquivado;
- carregamento;
- erro parcial;
- offline.

---

# 5. Estrutura do Leça Cycling Project

## 5.1 Modelo narrativo

A experiência deve seguir uma curva documental:

1. captar atenção;
2. estabelecer contexto;
3. revelar a visão;
4. demonstrar a estrutura;
5. aprofundar pilares;
6. mostrar capacidade de execução;
7. enquadrar a oportunidade;
8. fechar com direção e ação.

Os nomes abaixo são nomes funcionais de capítulos, não títulos editoriais
definitivos.

## 5.2 Matriz de capítulos

### Capítulo 0 — Capa e preparação

- **Objetivo:** confirmar que o utilizador entrou no projeto correto e preparar
  o tom.
- **Emoção:** antecipação e exclusividade.
- **Multimédia:** imagem ou vídeo ambiente de curta duração, poster otimizado e
  paisagem sonora opcional.
- **Animações:** revelação da identidade, profundidade subtil e indicador de
  início.
- **Componentes:** Project Cover, metadata strip, start/resume control,
  accessibility controls.
- **Ligações:** regresso ao Investor Room e abertura do índice.
- **Duração média:** 15–30 segundos antes do primeiro scroll.
- **Intenção narrativa:** criar uma pausa deliberada entre dashboard e
  documentário.

### Capítulo 1 — Prólogo

- **Objetivo:** introduzir a pergunta central do projeto sem explicar tudo.
- **Emoção:** curiosidade.
- **Multimédia:** sequência visual curta, tipografia cinética moderada e som
  opcional.
- **Animações:** cortes por scroll e passagem gradual de escala.
- **Componentes:** cinematic intro, statement frame, scroll cue.
- **Ligações:** apenas progressão; índice continua acessível.
- **Duração média:** 30–60 segundos.
- **Intenção narrativa:** criar tensão e motivação para continuar.

### Capítulo 2 — Contexto e ponto de partida

- **Objetivo:** estabelecer a realidade existente e o enquadramento do projeto.
- **Emoção:** credibilidade.
- **Multimédia:** fotografia documental, cronologia e dados estruturais.
- **Animações:** timeline progressiva e contadores apenas quando visíveis.
- **Componentes:** Context Timeline, Fact Grid, media annotation, source note.
- **Ligações:** documentos de suporte contextuais.
- **Duração média:** 2–3 minutos.
- **Intenção narrativa:** demonstrar que existe uma base real antes de
  apresentar ambição.

### Capítulo 3 — Visão e transformação

- **Objetivo:** explicar a mudança de estado pretendida sem entrar ainda nos
  detalhes de cada pilar.
- **Emoção:** ambição e possibilidade.
- **Multimédia:** composição comparativa, visualização sistémica e vídeo de
  visão.
- **Animações:** transição de estado atual para estado futuro; ligações entre
  elementos.
- **Componentes:** Vision Shift, Before/After System, North Star statement.
- **Ligações:** navegação profunda para os pilares.
- **Duração média:** 2–3 minutos.
- **Intenção narrativa:** converter contexto em direção estratégica.

### Capítulo 4 — Ecossistema do projeto

- **Objetivo:** apresentar como os pilares se relacionam e evitam uma leitura
  fragmentada.
- **Emoção:** clareza e escala.
- **Multimédia:** mapa do ecossistema e relações entre capacidades.
- **Animações:** construção sequencial de ligações e destaque do pilar ativo.
- **Componentes:** Ecosystem Map, Pillar Navigator, relationship detail.
- **Ligações:** cada pilar abre o respetivo segmento sem abandonar o capítulo.
- **Duração média:** 2–4 minutos.
- **Intenção narrativa:** mostrar que o valor resulta do sistema, não de
  iniciativas isoladas.

### Capítulo 5 — Equipa profissional

- **Objetivo:** definir o papel deste pilar na arquitetura estratégica.
- **Emoção:** performance e confiança.
- **Multimédia:** ação desportiva, estrutura, dados e perfis funcionais.
- **Animações:** progressão orientada por etapas e dados em contexto.
- **Componentes:** Pillar Hero, Capability Stack, Performance Metric,
  supporting media.
- **Ligações:** documentos ou módulos relacionados.
- **Duração média:** 2–4 minutos.
- **Intenção narrativa:** estabelecer o núcleo competitivo do sistema.

### Capítulo 6 — Academia

- **Objetivo:** enquadrar desenvolvimento de talento e continuidade.
- **Emoção:** futuro e pertença.
- **Multimédia:** jornada de progressão, imagens humanas e mapa de percurso.
- **Animações:** evolução por fases e ligações entre níveis.
- **Componentes:** Development Path, Stage Cards, Outcome Framework.
- **Ligações:** Performance Lab, território e equipa profissional.
- **Duração média:** 2–4 minutos.
- **Intenção narrativa:** mostrar como o projeto se reproduz e cresce.

### Capítulo 7 — Performance Lab

- **Objetivo:** mostrar a camada de conhecimento, método e melhoria contínua.
- **Emoção:** precisão e inovação.
- **Multimédia:** dados, instrumentação, processos e visualizações científicas.
- **Animações:** leituras progressivas e comparações controladas.
- **Componentes:** Lab Process, Data Snapshot, Method Pipeline, evidence note.
- **Ligações:** tecnologia, IA, academia e equipa.
- **Duração média:** 3–5 minutos.
- **Intenção narrativa:** converter inovação abstrata em capacidade operacional.

### Capítulo 8 — Tecnologia e inteligência artificial

- **Objetivo:** explicar a função tecnológica sem recorrer a espetáculo ou
  promessas vagas.
- **Emoção:** inteligência e vantagem.
- **Multimédia:** fluxos de dados, casos de utilização e interfaces conceptuais.
- **Animações:** data flow, causa-efeito e simulações explicativas simples.
- **Componentes:** Technology Stack, Use-case Sequence, Responsible AI Note,
  Integration Map.
- **Ligações:** Performance Lab, comunicação e métricas.
- **Duração média:** 3–5 minutos.
- **Intenção narrativa:** demonstrar tecnologia como meio mensurável, não como
  decoração.

### Capítulo 9 — Comunicação e marca

- **Objetivo:** estruturar o papel da narrativa pública, identidade e alcance.
- **Emoção:** energia e reconhecimento.
- **Multimédia:** sistema visual, formatos de comunicação e mapa de canais.
- **Animações:** montagem editorial e transições de formato.
- **Componentes:** Brand System Preview, Channel Matrix, Content Engine,
  audience flow.
- **Ligações:** internacionalização, parceiros e território.
- **Duração média:** 2–4 minutos.
- **Intenção narrativa:** revelar como performance se transforma em atenção e
  valor de marca.

### Capítulo 10 — Território e projeção internacional

- **Objetivo:** mostrar a ligação entre impacto local e alcance externo.
- **Emoção:** orgulho, relevância e expansão.
- **Multimédia:** mapas, percursos, redes de parceiros e indicadores de alcance.
- **Animações:** escala local-nacional-internacional e rotas progressivas.
- **Componentes:** Territory Map, Reach Layers, Stakeholder Network,
  impact categories.
- **Ligações:** comunicação, academia e oportunidades institucionais.
- **Duração média:** 3–4 minutos.
- **Intenção narrativa:** apresentar crescimento como amplificação de origem,
  não perda de identidade.

### Capítulo 11 — Modelo de execução

- **Objetivo:** transformar visão em etapas, responsabilidades e capacidade de
  entrega.
- **Emoção:** segurança.
- **Multimédia:** roadmap, governance model, dependências e marcos.
- **Animações:** revelação por fase e relações de dependência.
- **Componentes:** Roadmap, Milestones, Governance Cards, Risk/Response Matrix.
- **Ligações:** documentos de detalhe e atualização futura.
- **Duração média:** 3–5 minutos.
- **Intenção narrativa:** responder à pergunta “como será executado?”.

### Capítulo 12 — Estrutura da oportunidade

- **Objetivo:** enquadrar a ronda, uso de recursos e mecanismos de participação,
  sem transformar o capítulo numa tabela isolada.
- **Emoção:** clareza, seriedade e urgência racional.
- **Multimédia:** allocation model, fases, cenários e relação entre investimento
  e aceleração.
- **Animações:** composição gradual dos blocos e comparação entre cenários,
  sem manipulação visual.
- **Componentes:** Investment Structure, Allocation Breakdown, Scenario
  Comparison, disclosure, document links.
- **Ligações:** documentação reservada e contacto.
- **Duração média:** 3–5 minutos.
- **Intenção narrativa:** ligar recursos a resultados e próximos marcos.

### Capítulo 13 — Evidência, transparência e documentação

- **Objetivo:** disponibilizar validação, fontes e materiais de aprofundamento.
- **Emoção:** confiança.
- **Multimédia:** índices, documentos, datas, versões e responsáveis.
- **Animações:** mínimas; prioridade à leitura e controlo.
- **Componentes:** Document Center, Source Notes, Version History, FAQ,
  confidentiality labels.
- **Ligações:** visualização segura ou download autorizado.
- **Duração média:** variável e não incluída no percurso principal.
- **Intenção narrativa:** permitir due diligence sem quebrar a história.

### Capítulo 14 — Epílogo e próxima ação

- **Objetivo:** fechar o percurso e converter interesse em ação adequada.
- **Emoção:** convicção e proximidade.
- **Multimédia:** imagem final, síntese estrutural e presença humana.
- **Animações:** desaceleração, conclusão do progresso e entrada calma das ações.
- **Componentes:** Closing Frame, Action Selector, Contact Card, Meeting
  Request, return/revisit controls.
- **Ligações:** contacto, reunião, documentos, dashboard e outros projetos.
- **Duração média:** 1–2 minutos.
- **Intenção narrativa:** concluir sem pressão comercial excessiva.

## 5.3 Ritmo

O percurso principal deve apontar para 25–40 minutos, mas permitir:

- leitura rápida em 10–15 minutos;
- acesso direto a capítulos;
- retoma;
- aprofundamento documental separado;
- resumo estrutural para utilizadores recorrentes.

Tempo estimado nunca deve ser apresentado como obrigação.

---

# 6. Sistema de componentes

## 6.1 Componentes globais

- App Shell;
- Access Gate;
- Header;
- Navigation Rail / Mobile Navigation;
- Search Overlay;
- Contact Entry Point;
- Toast e Inline Notice;
- Error Boundary;
- Skeleton e Loading State;
- Empty State;
- Offline State.

## 6.2 Componentes do dashboard

- Welcome Context;
- Featured Project;
- Project Card;
- Project Grid;
- Continue Journey;
- Update Item;
- Update Timeline;
- New/Updated Badge;
- Progress Indicator;
- Filter Bar;
- Search Result;
- Contact Card;
- Confidentiality Notice.

## 6.3 Componentes narrativos

- Project Cover;
- Chapter Cover;
- Chapter Progress;
- Chapter Navigator;
- Scroll Cue;
- Cinematic Hero;
- Full-bleed Media;
- Split Media/Text;
- Sticky Narrative;
- Scrollytelling Sequence;
- Statement Frame;
- Quote;
- Pull Quote;
- Fact;
- Statistic;
- Statistics Grid;
- Counter;
- Timeline;
- Milestone;
- Before/After;
- Comparison;
- Ecosystem Map;
- Process;
- Roadmap;
- Map;
- Route;
- Gallery;
- Lightbox;
- Video;
- Audio Control;
- Transcript;
- Data Visualisation;
- Table;
- Partner/Stakeholder Group;
- Accordion;
- Footnote;
- Source Note;
- Disclosure;
- Chapter Recap;
- Narrative Bridge;
- Interlude;

## 6.4 Componentes documentais

- Document Card;
- Secure Document Viewer;
- Download Action;
- Version Badge;
- Document Group;
- Related Document;
- Update History;
- Terms Acceptance;

## 6.5 Componentes de conversão

- Primary CTA;
- Contextual CTA;
- Request Information;
- Request Meeting;
- Contact Person;
- Interest Selector;
- Confirmation State;
- Follow-up Expectation.

## 6.6 Regras do sistema

Cada componente deve definir:

- objetivo;
- contextos permitidos;
- variantes;
- estados;
- conteúdo obrigatório e opcional;
- comportamento responsivo;
- comportamento com teclado;
- motion normal e reduzido;
- analytics permitidos;
- fallback de multimédia;
- regras de contraste;
- limites de conteúdo.

---

# 7. Arquitetura UX

## 7.1 Separar dashboard e projeto

Esta decisão reduz interferência funcional durante a narrativa. O dashboard
serve orientação; o projeto serve envolvimento. Misturar ambos criaria uma
página institucional com menu lateral.

## 7.2 Scroll como mecanismo principal

O scroll é familiar, funciona em múltiplos dispositivos e permite controlar o
ritmo. Deve ser natural; não se deve substituir o scroll do browser por
mecanismos artificiais.

## 7.3 Índice sempre disponível

Uma experiência longa sem índice gera ansiedade e dificulta visitas
profissionais. O índice oferece controlo sem tornar a narrativa num conjunto de
slides.

## 7.4 Progressive disclosure

Informação principal aparece primeiro. Metodologia, fontes, documentos e detalhe
técnico surgem sob pedido ou no momento relevante. Isto mantém ritmo e respeita
utilizadores com necessidades diferentes.

## 7.5 Progresso sem gamificação

O indicador de progresso ajuda a estimar esforço e retomar. Não existem pontos,
conquistas ou mecanismos lúdicos incompatíveis com o contexto.

## 7.6 Confidencialidade

Deve ser visível de forma calma:

- classificação de documentos;
- condições de utilização;
- marca de água apenas quando proporcional;
- ausência de indexação e previews públicos.

Bloqueios agressivos, prevenção absoluta de screenshots e avisos repetidos
prejudicam confiança e não garantem segurança.

## 7.7 Acessibilidade

Requisitos mínimos:

- WCAG 2.2 AA;
- navegação total por teclado;
- ordem de foco coerente;
- landmarks e headings semânticos;
- contraste adequado;
- zoom e reflow;
- legendas e transcrições;
- alternativas textuais a visualizações;
- `prefers-reduced-motion`;
- ausência de autoplay com som;
- controlos com área de toque suficiente;
- não depender apenas de cor.

## 7.8 Gestão de erros

Os erros devem ser específicos e recuperáveis:

- falha de um vídeo não bloqueia o capítulo;
- falha de uma atualização não bloqueia projetos;
- perda de rede preserva posição;
- falha na validação do código permite nova tentativa;
- documento indisponível apresenta responsável e data, quando apropriado.

## 7.9 Métricas de experiência

Medir apenas o necessário:

- autenticações bem-sucedidas e falhadas agregadas;
- projetos abertos;
- capítulos iniciados e concluídos;
- retomas;
- documentos abertos;
- ações finais;
- erros e performance;
- preferência de movimento.

Não usar métricas de scroll como equivalente automático a interesse. Qualquer
inferência comercial deve combinar sinais e contexto.

---

# 8. Arquitetura UI

## 8.1 Direção visual

A identidade deve evoluir diretamente a linguagem de `museu.html`, combinando:

- património e credibilidade do Leça;
- linguagem tecnológica contemporânea;
- espaço e silêncio visual;
- imagens com qualidade editorial;
- dados tratados com rigor;
- movimento contido.

O verde institucional funciona como assinatura, iluminação e indicador de ação,
não como preenchimento dominante de todos os elementos.

### Elementos de continuidade com o Museu

- base cromática próxima de `#010f0c`;
- escala esmeralda já usada no website, com `#056b57` como referência principal
  e um verde claro próximo de `#5ecfb1` para acentos;
- títulos brancos pesados, compactos e com tracking ligeiramente negativo;
- texto secundário em branco translúcido;
- fundos com gradientes entre verde profundo e preto;
- fotografia ou vídeo com tratamento escuro;
- vinheta e overlays que garantem leitura;
- badges pequenos em forma de cápsula;
- botões arredondados;
- cartões de grande raio com media;
- ícones Font Awesome enquanto o sistema atual os utilizar;
- animações `fadeUp`, zoom de imagem e resposta vertical curta.

### Evolução necessária

- converter valores recorrentes em design tokens;
- retirar estilos inline da futura implementação;
- criar hierarquia tipográfica consistente para leitura longa e dados;
- normalizar focus, loading, disabled e error;
- assegurar contraste AA, inclusive no texto secundário;
- suportar `prefers-reduced-motion`;
- evitar handlers inline;
- tornar modais verdadeiramente acessíveis, com focus trap, restituição do foco
  e controlo por teclado;
- definir variantes compactas de cartões para o dashboard;
- separar claramente componentes de produto dos componentes cinematográficos.

## 8.2 Tema

### Investor Room

Base `Leça Deep`, inspirada no `#010f0c` do Museu, com superfícies ligeiramente
mais claras, bordas brancas translúcidas e iluminação esmeralda seletiva. Esta
proximidade torna o produto reconhecível; a maior disciplina de grelha e estados
comunica maturidade.

### Projetos

Cada projeto pode ter um tema derivado:

- cor de acento;
- tratamento fotográfico;
- textura;
- ritmo gráfico;
- tipografia display opcional.

A tipografia funcional, os controlos e os padrões de acessibilidade permanecem
consistentes.

O Leça Cycling Project pode introduzir uma cor ou textura secundária associada
ao projeto, mas o verde Leça continua a assegurar a pertença ao ecossistema.
Temas futuros devem seguir a mesma regra: expressão própria dentro de uma base
comum, nunca microsites visualmente desligados.

## 8.3 Tipografia

O sistema deve incluir:

- Display;
- Heading 1–6;
- Lead;
- Body;
- Small;
- Label;
- Data/Tabular;
- Caption;
- Quote.

Poppins pode manter continuidade institucional, mas deve ser avaliada para
leitura longa e dados. Uma segunda família pode ser introduzida apenas com papel
claro e licenciamento adequado.

Para a primeira fase, a recomendação é manter Poppins como única família e
obter sofisticação através de escala, peso, largura de linha e espaço. Isto
preserva a ligação direta ao Museu e reduz complexidade. Uma segunda família só
deve ser considerada após testes de leitura nos capítulos extensos.

Regras:

- largura de linha controlada;
- contraste forte de escala;
- poucas espessuras;
- números tabulares em dados;
- capitulares e uppercase apenas em labels curtas;
- nunca usar baixo contraste como sinónimo de sofisticação.

## 8.4 Espaçamento

Usar uma escala coerente baseada numa unidade pequena, com tokens para:

- espaços internos compactos;
- relação entre label e valor;
- separação de componentes;
- separação de secções;
- respiro cinematográfico.

O espaço vertical dos projetos pode ser mais generoso que no dashboard, mas
deve adaptar-se à altura real do viewport.

## 8.5 Grelha

- Dashboard: grelha funcional responsiva.
- Narrativa: grelha editorial flexível com alinhamentos consistentes.
- Dados: colunas estáveis e comparação fácil.
- Full bleed: exceção intencional, não padrão de todas as secções.

## 8.6 Cartões

Os cartões devem comunicar agrupamento e ação:

- raio generoso, próximo da linguagem do Museu;
- borda branca subtil;
- contraste de superfície;
- sombra curta e pouco difusa, quando necessária;
- estados hover, focus, pressed, loading e disabled;
- hierarquia clara entre projeto, documento e atualização.

Evitar “cardificar” todas as secções. Conteúdo narrativo deve respirar fora de
caixas quando não precisa de agrupamento.

Os cartões de projeto são a evolução direta dos cartões de secção do Museu.
Documentos e atualizações não devem copiar esse formato; precisam de variantes
mais densas e funcionais.

## 8.7 Ícones

- sistema único;
- traço e proporção consistentes;
- ícone acompanhado por label quando a ação não é universal;
- tamanhos adequados a toque;
- ícones decorativos escondidos de tecnologias assistivas.

## 8.8 Sombras, luz e gradientes

Servem para profundidade e direção de atenção:

- gradientes protegem legibilidade sobre imagem;
- luz contextual pode separar capítulos;
- sombras distinguem superfícies interativas;
- efeitos não devem reduzir contraste nem sugerir ações inexistentes.

O overlay cinematográfico do Museu — vinheta escura, transparência intermédia e
verde na base — deve servir de referência para capas e cards de projeto. No
dashboard, a intensidade deve ser reduzida para não tornar cada card um hero.

## 8.9 Imagem e vídeo

- direção fotográfica coerente;
- crops editoriais definidos por breakpoint;
- poster obrigatório;
- carregamento adaptativo;
- vídeo com controlos, legendas e transcrição;
- sem autoplay com som;
- placeholders cromáticos para evitar saltos de layout.

## 8.10 Estados visuais

O design system deve documentar:

- default;
- hover;
- focus-visible;
- active;
- selected;
- visited, quando relevante;
- loading;
- empty;
- error;
- success;
- disabled;
- restricted;
- expired;
- updated.

---

# 9. Motion design

## 9.1 Princípios

Motion deve:

- explicar relações;
- indicar mudança de estado;
- orientar atenção;
- apoiar ritmo narrativo;
- nunca atrasar tarefas repetidas;
- nunca ser requisito para compreender informação.

## 9.2 Escala de movimento

### Micro

100–200 ms para hover, focus, press, toggles e feedback imediato.

### Interface

200–400 ms para menus, overlays, cards e mudanças de estado.

### Narrativa

400–900 ms para entradas de capítulo e composição de conteúdos.

### Cinematográfica

Pode exceder estes valores apenas em capas e interlúdios, sempre interrompível
por scroll ou ação.

## 9.3 Transição dashboard–projeto

Deve:

- preservar a identidade do card selecionado;
- ampliar o contexto de forma breve;
- evitar ecrã preto prolongado;
- carregar conteúdo essencial primeiro;
- ter fallback instantâneo com movimento reduzido.

A transição pode prolongar visualmente o padrão do Museu: a imagem do card
expande, o overlay ganha profundidade e a identidade do projeto substitui
progressivamente os metadados do dashboard. Deve durar o suficiente para marcar
a mudança de contexto, sem se tornar uma introdução obrigatória repetitiva.

## 9.4 Scroll

- progressão ligada ao scroll apenas quando a relação causa-efeito é clara;
- sticky sections limitadas em duração;
- evitar scroll hijacking;
- evitar parallax intenso;
- não exigir precisão de scroll;
- capítulos profundos devem continuar navegáveis por teclado.

## 9.5 Loading

Ordem:

1. estrutura;
2. texto essencial;
3. poster/imagem;
4. vídeo e recursos pesados;
5. prefetch do próximo capítulo quando apropriado.

Usar skeletons apenas para estruturas previsíveis. Para a entrada cinematográfica,
um estado de preparação curto pode ser mais coerente, mas nunca deve fingir
progresso.

## 9.6 Entrada de conteúdos

- títulos por opacidade e pequena deslocação, evoluindo o `fadeUp` do Museu;
- dados por composição, não por contagens longas;
- imagens por máscara ou fade simples;
- sequências com stagger curto;
- elementos já vistos devem poder aparecer de imediato em visitas seguintes.

## 9.7 Microinterações

- cards elevam ou iluminam subtilmente;
- botões respondem no press;
- progresso atualiza sem saltos;
- documento confirma abertura;
- cópia de referência confirma sucesso;
- ações críticas exigem feedback claro.

## 9.8 Movimento reduzido

Com `prefers-reduced-motion`:

- transições passam a fades curtos ou cortes;
- parallax é removido;
- secções sticky complexas tornam-se fluxo linear;
- vídeos não iniciam automaticamente;
- gráficos apresentam estado final legível.

---

# 10. Mobile

## 10.1 Papel do mobile

Mobile não é uma versão reduzida. É provável que o link seja aberto primeiro
num telefone. A entrada por código, visão geral e narrativa devem ser
completas.

## 10.2 Adaptações do dashboard

- navegação compacta;
- projeto em destaque sem altura excessiva;
- cards em uma coluna;
- filtros numa sheet;
- contacto por ações adequadas ao dispositivo;
- áreas de toque de pelo menos 44 × 44 px.

## 10.3 Adaptações da narrativa

- menos elementos simultâneos;
- sticky sections encurtadas ou convertidas em sequência;
- mapas e diagramas com detalhe progressivo;
- tabelas convertidas cuidadosamente ou com scroll indicado;
- vídeo adaptativo;
- controlos ao alcance do polegar;
- índice em bottom sheet;
- progresso discreto no topo.

## 10.4 Multimédia e performance

- imagens responsivas;
- vídeo de menor bitrate;
- poster antes do vídeo;
- não descarregar capítulos distantes;
- respeitar data saver;
- manter leitura possível sem vídeo;
- evitar efeitos que causem aquecimento e consumo excessivo.

## 10.5 Orientação

O produto deve funcionar em portrait. Landscape pode melhorar vídeo e
visualizações, mas nunca ser obrigatório. Ao mudar orientação, posição e estado
devem ser preservados.

---

# 11. Desktop

## 11.1 Papel do desktop

Desktop oferece o máximo de imersão e é provável em reuniões, análise detalhada
e consulta documental.

## 11.2 Dashboard

- maior densidade controlada;
- grelha de projetos;
- painel de atualizações;
- pesquisa por teclado;
- preview contextual sem substituir a entrada no projeto;
- navegação persistente.

## 11.3 Narrativa

- composições full-viewport quando justificadas;
- texto com largura limitada;
- relações lado a lado;
- navegação de capítulos acessível sem dominar;
- visualizações com mais detalhe;
- cursor e hover como melhoria, nunca requisito.

## 11.4 Ecrãs muito largos

O conteúdo não deve simplesmente expandir. Usar:

- limites máximos;
- margens cinematográficas;
- imagem full bleed seletiva;
- grelha interna estável;
- densidade de dados controlada.

## 11.5 Apresentação em reunião

Prever um modo futuro de apresentação:

- navegação clara entre capítulos;
- ausência de dados pessoais no ecrã;
- controlo de som e legendas;
- possibilidade de projetar sem expor o dashboard.

Este modo não deve transformar o produto num slideshow.

---

# 12. Evolução futura

## 12.1 Fases recomendadas

### Fase 1 — Fundação

- acesso por código igual ao Museu;
- dashboard;
- um projeto;
- narrativa modular;
- documentos;
- contacto;
- métricas essenciais.

### Fase 2 — Portefólio

- múltiplos projetos;
- atualizações;
- pesquisa;
- versões;
- arquivo de projetos.

### Fase 3 — Internacionalização

- múltiplos idiomas;
- conteúdos e documentos localizados;
- formatos regionais;
- legendas e transcrições localizadas.

### Fase 4 — Consolidação

- melhoria contínua de performance;
- evolução do sistema narrativo;
- novos tipos de visualização;
- arquivo histórico;
- integração mais profunda com o backoffice existente, se necessária.

## 12.2 Adição de novos projetos

Um novo projeto deve exigir:

1. criação de metadados;
2. escolha de tema derivado;
3. composição de capítulos;
4. configuração de módulos;
5. associação de documentos;
6. revisão de acessibilidade;
7. revisão jurídica e factual;
8. pré-visualização;
9. publicação versionada.

Não deve exigir alterar a navegação global ou criar componentes exclusivos salvo
necessidade real.

## 12.3 Novos códigos de acesso

Os códigos são geridos no backoffice existente. Para este website, o contrato
funcional é simples:

- o frontend envia o código e o contexto do Investor Room;
- a API devolve sucesso ou erro;
- qualquer código válido abre todo o conteúdo;
- o frontend apresenta mensagens equivalentes às do Museu;
- não existem variações de conteúdo associadas ao código.

## 12.4 Modelo de estados de projeto

- rascunho;
- revisão;
- aprovado;
- agendado;
- publicado;
- atualizado;
- pausado;
- concluído;
- arquivado.

Alterações materiais a um projeto publicado devem criar versão, data e nota de
alteração.

## 12.5 Internacionalização

Prever desde início:

- conteúdo separado da apresentação;
- locale definido na interface ou pela configuração do produto;
- datas, moeda e números localizados;
- expansão de texto;
- legendas e transcrições por idioma;
- documentos associados a locale;
- fallback explícito, nunca mistura silenciosa.

## 12.6 Acesso e privacidade

Requisitos arquiteturais:

- replicar o fluxo de acesso de `museu.html`;
- validar o código na API existente;
- não mostrar o conteúdo do Investor Room antes de uma validação bem-sucedida;
- guardar no browser a confirmação de acesso segundo o padrão do Museu;
- não criar contas, perfis ou sessões visíveis;
- proteção contra indexação;
- Content Security Policy;
- conformidade RGPD;
- nenhum segredo no frontend.

## 12.7 Performance

Objetivos:

- shell e capa rapidamente utilizáveis;
- estabilidade visual;
- interação responsiva;
- lazy loading de capítulos e multimédia;
- imagens e vídeo adaptativos;
- prefetch baseado em probabilidade;
- orçamento de JavaScript por experiência;
- monitorização de Core Web Vitals e erros reais.

O efeito premium depende mais de fluidez e estabilidade do que de complexidade
gráfica.

## 12.8 Governance

Definir responsáveis por:

- produto;
- conteúdo;
- design system;
- aprovação factual;
- aprovação jurídica;
- documentos;
- analytics;
- contacto de suporte.

Cada projeto deve ter owner, data de revisão e política de arquivo.

---

# 13. Requisitos funcionais transversais

## 13.1 Conteúdo

- módulos configuráveis;
- versões;
- agendamento;
- preview;
- rollback;
- data de atualização;
- autoria e aprovação;
- associação de fontes.

## 13.2 Acesso

- introdução do código;
- normalização para uppercase;
- validação na API;
- mensagens de erro equivalentes às do Museu;
- persistência do acesso no browser;
- apresentação integral do Investor Room após sucesso.

## 13.3 Documentos

- visualização e/ou download;
- versão;
- data;
- classificação;
- validade;
- registo de acesso proporcional;
- substituição com histórico.

## 13.4 Comunicação

- contacto contextual;
- pedido de reunião;
- confirmação e expectativa de resposta.

## 13.5 Observabilidade

- erros frontend e backend;
- falhas de multimédia;
- performance;
- disponibilidade;
- métricas de produto com privacidade.

---

# 14. Entregáveis das fases seguintes

Este documento deve originar, por ordem:

1. inventário e modelo de conteúdo;
2. jornadas e diagramas de fluxo;
3. contrato de integração com a API de códigos;
4. arquitetura técnica;
5. taxonomia de eventos analíticos;
6. design principles e mood direction;
7. design tokens;
8. wireframes de baixa fidelidade;
9. protótipo do dashboard;
10. protótipo de um capítulo narrativo;
11. motion prototype;
12. testes com convidados representativos;
13. design system;
14. especificação de componentes;
15. implementação faseada.

Nenhuma decisão visual de alta fidelidade deve anteceder a validação do modelo de
conteúdo, fluxo de acesso e curva narrativa.

---

# 15. Decisões que exigem validação antes do design

- validade e reutilização dos códigos;
- classificação dos documentos;
- política de download;
- idiomas iniciais;
- responsável por cada projeto;
- ferramentas de gestão de conteúdo;
- requisitos jurídicos e RGPD;
- métricas aceitáveis;
- processo de aprovação e versionamento;
- política de arquivo;
- possibilidade de acesso em reunião ou ecrã partilhado.

Estas decisões não impedem explorar a direção visual, mas condicionam
o access gate, o modelo de dados e os componentes.

---

## Conclusão

O Investor Room deve assentar numa arquitetura estável e discreta, capaz de
receber muitos projetos, enquanto cada Project Experience mantém identidade e
ritmo próprios. O dashboard cria orientação e confiança; a narrativa cria
compreensão e envolvimento; a camada documental cria transparência; e o sistema
de acesso por código mantém toda a área reservada atrás de uma entrada simples e
consistente.

O Leça Cycling Project deve ser o primeiro caso de uso deste sistema, não a
exceção que determina toda a sua estrutura.
