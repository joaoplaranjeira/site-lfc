# Universo Leça FC

Site público do Leça Futebol Clube, servido como aplicação React estática.
O Vite compila a aplicação para `dist/`; os URLs públicos são limpos
(`/eventos`, `/competicoes`, etc.) e os antigos endereços `*.html` são
normalizados pela camada de compatibilidade em `src/App.jsx`.

## Desenvolvimento

```sh
npm install
npm run dev
```

O site fica disponível em `http://localhost:8081`. Em desenvolvimento, os
pedidos relativos a `/api` são encaminhados para `http://localhost:5004`.

O portal público de candidaturas usa uma API própria em
`http://localhost:5007`. Para alterar o destino, cria um ficheiro `.env.local`
a partir de `.env.example`. No build de produção,
`VITE_APPLICATIONS_API_URL` pode substituir o endereço público configurado no
cliente.

O ambiente Docker equivalente continua disponível:

```sh
docker compose -f docker-compose.dev.yml up
```

## Validação e produção

```sh
npm run validate
npm run build
npm run preview
```

O deploy no Render usa `render.yaml`, executa `npm ci && npm run build` e
publica `dist/` como Static Site. A regra de rewrite preserva refresh e acesso
direto a todas as rotas.

## Organização

- `src/`: bootstrap React, resolução de rotas e ponte para as páginas migradas.
- `legacy-pages/`: marcação integral de cada página, preservada durante a
  primeira fase da migração para minimizar regressões.
- `*.js` e `*.css`: comportamentos e estilos existentes, copiados sem alteração
  para o artefacto estático.
- `images/`, `videos/` e `documents/`: recursos públicos.
- `scripts/`: cópia dos recursos públicos e validação de referências.
