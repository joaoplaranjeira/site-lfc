---
applyTo: "**/*.js"
---

# JavaScript do browser

- Escreve JavaScript vanilla carregado por `<script>` clássico; não uses
  imports, TypeScript ou APIs de Node.js.
- Evita criar novos nomes globais. Quando a página não exige funções globais
  para handlers HTML, encapsula o código numa IIFE ou no callback de
  `DOMContentLoaded`.
- Confirma que os elementos existem antes de lhes aceder quando o ficheiro é
  partilhado por várias páginas.
- Em chamadas `fetch`, implementa estados de carregamento, sucesso, vazio e
  erro. Não exponhas detalhes internos da API ao utilizador.
- Usa `encodeURIComponent` em valores colocados no URL e valida parâmetros
  obtidos com `URLSearchParams`.
- Dados externos, formulários e respostas da API não devem entrar diretamente
  em `innerHTML`. Usa `textContent` ou funções explícitas para escapar HTML e
  atributos.
- Mantém datas, números e moeda formatados com `Intl` e locale `pt-PT`.
- Preserva os contratos documentados em `API_DOCUMENTATION.md`,
  `EVENTS_API_INTEGRATION.md`, `ACCESS_CODES_INTEGRATION.md` e
  `Instructions/DOCUMENT_ACCESS_OTP_INTEGRATION.md`.
- Nos pares `*-data.js`/`*.js`, mantém conteúdo e configuração no ficheiro de
  dados e comportamento no ficheiro de lógica.
