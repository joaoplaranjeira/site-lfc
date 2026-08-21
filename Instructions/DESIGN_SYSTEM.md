# Universo Leça — Design System

## Objetivo

O design system unifica todas as experiências digitais do Universo Leça sem
eliminar a diferença funcional entre páginas institucionais e experiências
imersivas.

A implementação base encontra-se em `design-system.css`.

## Modos

### Institucional

Aplicado com:

```html
<body data-design-mode="institutional">
```

Destina-se a portais, formulários e páginas com elevada densidade de
informação:

- homepage;
- Transparência;
- Competições;
- Eventos;
- inscrição em eventos;
- Talk Club;
- Reconstrução;
- Palmarés.

Características:

- fundo verde profundo com textura subtil;
- superfícies claras para leitura;
- cartões funcionais;
- hierarquia compacta;
- movimento reduzido;
- estados de foco evidentes;
- formulários e tabelas consistentes.

### Imersivo

Aplicado com:

```html
<body data-design-mode="immersive">
```

Destina-se a storytelling e experiências especiais:

- Museu Digital e subpáginas;
- galerias;
- Investor Room e projetos.

Características:

- base verde-negro;
- media em grande escala;
- texto branco;
- luz esmeralda;
- composição editorial;
- animação narrativa;
- navegação discreta.

## Princípios

1. A identidade é comum; o nível de imersão depende da tarefa.
2. Verde esmeralda indica marca, ação e progresso.
3. Informação extensa usa superfícies claras e elevado contraste.
4. Movimento explica relações e nunca bloqueia a interação.
5. Todos os controlos devem funcionar com teclado e toque.
6. `prefers-reduced-motion` é respeitado globalmente.
7. Novas páginas devem declarar explicitamente o respetivo modo.

## Tokens principais

### Cores

- `--ul-green-950`: fundo imersivo.
- `--ul-green-900` a `--ul-green-500`: escala institucional.
- `--ul-mint`: destaque e foco.
- `--ul-canvas`: fundo de conteúdo claro.
- `--ul-surface`: cartões claros.
- `--ul-ink`: texto principal sobre superfícies claras.
- `--ul-muted`: texto secundário.
- `--ul-line` e `--ul-line-dark`: divisores.

### Forma

- `--ul-radius-sm`: campos e pequenos elementos.
- `--ul-radius-md`: cartões compactos.
- `--ul-radius-lg`: cartões editoriais.
- `--ul-radius-pill`: botões, filtros e badges.

### Profundidade

- `--ul-shadow-sm`: cartão em repouso.
- `--ul-shadow-md`: cartão interativo.
- `--ul-shadow-dark`: superfícies imersivas.

### Movimento

- `--ul-ease`: curva principal de transição.
- Microinterações: 150–250 ms.
- Componentes: 250–400 ms.
- Narrativa: 400–900 ms.

## Componentes partilhados

### Marca e títulos

- Poppins permanece como família principal.
- Títulos usam peso 900, line-height compacto e tracking negativo.
- Descrições usam contraste inferior, nunca abaixo dos mínimos de
  acessibilidade.

### Cartões

- Institucionais: superfície clara, borda subtil e sombra curta.
- Homepage: superfície escura translúcida, funcionando como ponte para o modo
  imersivo.
- Imersivos: media, overlay e conteúdo editorial.
- Apenas cartões acionáveis recebem elevação no hover.

### Botões

- Ação primária: verde sólido e texto branco.
- Ação secundária escura: superfície branca translúcida.
- Ação secundária clara: borda verde ou neutra.
- Botões pill são reservados a ações e filtros, não a contentores genéricos.

### Formulários

- Altura mínima de 44 px.
- Bordas verdes discretas.
- Focus ring esmeralda comum.
- Erros junto ao campo ou etapa correspondente.
- Labels nunca dependem exclusivamente de placeholders.

### Tabelas

- Cabeçalho verde com texto branco.
- Cantos superiores coerentes.
- Alinhamento numérico consistente.
- Scroll horizontal explícito em mobile.

### Feedback

- Loading mantém a estrutura estável.
- Erros explicam a próxima ação.
- Estados vazios evitam becos sem saída.
- Badges distinguem estado de conteúdo de controlo de acesso.

## Acessibilidade

- Objetivo WCAG 2.2 AA.
- Focus visível global.
- Área mínima de toque de 44 × 44 px.
- Navegação por teclado.
- Sem informação transmitida apenas por cor.
- Movimento reduzido desativa animações e smooth scroll.
- Seleção de texto mantém contraste elevado.

## Regras para evolução

- Não criar novas cores ou raios sem verificar os tokens existentes.
- Não duplicar estilos globais dentro de páginas.
- Estilos específicos podem estender o sistema, não redefinir a marca.
- Componentes de produto e componentes cinematográficos devem permanecer
  distintos.
- Alterações à navegação global devem ser verificadas em todas as páginas.
