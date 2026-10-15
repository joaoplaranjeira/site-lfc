# Leça FC — instruções do repositório

Este é um site React multipágina compilado pelo Vite para publicação estática.
A marcação migrada está em `legacy-pages/` e os scripts clássicos permanecem na
raiz durante a fase de compatibilidade.

- Consulta `AGENTS.md` para o mapa do projeto, regras de segurança e validação.
- Mantém alterações pequenas e compatíveis com a arquitetura atual.
- Preserva português europeu, identidade visual, responsividade e
  acessibilidade.
- Não inventes dados históricos ou institucionais.
- Não adiciones dependências ou frameworks adicionais sem pedido explícito.
- Valida no Nginx local com
  `docker compose -f docker-compose.dev.yml up` e
  `http://localhost:8081`.
