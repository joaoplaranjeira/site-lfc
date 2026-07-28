# Leça FC — instruções do repositório

Este é um site estático multipágina em HTML, CSS e JavaScript sem framework,
bundler, `package.json` ou testes automatizados.

- Consulta `AGENTS.md` para o mapa do projeto, regras de segurança e validação.
- Mantém alterações pequenas e compatíveis com a arquitetura atual.
- Preserva português europeu, identidade visual, responsividade e
  acessibilidade.
- Não inventes dados históricos ou institucionais.
- Não adiciones dependências ou ferramentas de build sem pedido explícito.
- Valida no Nginx local com
  `docker compose -f docker-compose.dev.yml up` e
  `http://localhost:8081`.
