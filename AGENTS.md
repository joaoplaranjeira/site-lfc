# Guia de desenvolvimento

## Contexto do projeto

Este repositório contém o site público multipágina do Leça Futebol Clube. É uma
aplicação estática em HTML, CSS e JavaScript sem framework, bundler ou gestor de
pacotes. Em desenvolvimento, o Nginx serve os ficheiros na porta `8081` e
encaminha `/api/` para `host.docker.internal:5004`.

## Mapa do código

- `*.html`: páginas independentes; muitas incluem estilos e scripts específicos.
- `styles.css`: estilos globais pequenos.
- `tailwind.css`: CSS Tailwind compilado usado por `index.html`.
- `script.js`: comportamentos partilhados por algumas páginas.
- `<funcionalidade>.js`: lógica da página com o mesmo nome.
- `*-data.js`: conteúdo/configuração separado da lógica de apresentação.
- `images/`, `videos/` e `documents/`: ficheiros públicos referenciados por
  caminhos relativos.
- `Instructions/` e os ficheiros `*_INTEGRATION.md`: documentação das
  integrações existentes.

## Princípios de alteração

1. Faz alterações pequenas e localizadas. Não introduzas frameworks, passos de
   build ou dependências npm sem pedido explícito.
2. Preserva o padrão visual existente: Poppins, Font Awesome, verde esmeralda e
   classes Tailwind. Garante comportamento responsivo.
3. Mantém texto visível em português europeu e conserva acentos e nomes
   próprios.
4. Ao alterar navegação, cabeçalho ou rodapé, verifica as restantes páginas
   porque a marcação está duplicada e não existe um sistema de componentes.
5. Mantém os caminhos relativos e respeita maiúsculas/minúsculas; o deploy
   corre em Linux.
6. Não edites conteúdo histórico, estatutos, atas, relatórios ou dados
   institucionais por inferência. Usa apenas material fornecido ou confirmado.
7. Não alteres URLs de API, códigos de evento, identificadores de analytics,
   tags Cloudinary ou chaves de `sessionStorage` sem validar todos os
   consumidores e a documentação de integração.

## JavaScript e segurança

- Usa JavaScript compatível com browsers modernos, sem imports nem módulos.
- Inicializa código dependente do DOM em `DOMContentLoaded`, salvo quando o
  script está comprovadamente colocado depois da marcação correspondente.
- Trata estados de carregamento, vazio e erro nas chamadas `fetch`.
- Codifica segmentos de URL dinâmicos com `encodeURIComponent`.
- Para dados externos ou introduzidos pelo utilizador, prefere `textContent`.
  Se for necessário gerar HTML, escapa texto e atributos antes de usar
  `innerHTML`.
- Nunca coloques segredos, tokens privados ou dados pessoais no repositório.
- O acesso ao museu guardado em `sessionStorage` é apenas controlo de
  navegação no cliente, não uma fronteira de segurança.

## Execução e validação

Arranca o ambiente local com:

```sh
docker compose -f docker-compose.dev.yml up
```

Abre `http://localhost:8081`. Como não existe suite de testes automatizados,
valida manualmente:

- consola do browser sem erros;
- navegação e recursos sem respostas 404;
- vista móvel e desktop;
- estados de sucesso, vazio e erro das funcionalidades alteradas;
- fluxos relacionados, incluindo inscrição/OTP, quando aplicável.

Se `tailwind.css` não for regenerado por uma ferramenta já disponível no
ambiente, usa as classes presentes no ficheiro ou CSS em `styles.css`; não
assumas que o CDN Tailwind está disponível em `index.html`.

## Instruções complementares

As regras específicas por tipo de ficheiro estão em
`.github/instructions/*.instructions.md`. Antes de alterar uma integração,
consulta também a documentação Markdown correspondente na raiz ou em
`Instructions/`.
