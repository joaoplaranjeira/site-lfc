# Módulo de Códigos de Acesso Temporários

Este documento descreve a API do módulo `AccessCode` para integração no frontend.

---

## Autenticação e Permissão

Todos os endpoints requerem:

- **Bearer Token** no header `Authorization`
- **Permissão**: `access-codes.manage`

```
Authorization: Bearer <token>
```

A permissão pode ser atribuída a um utilizador através do endpoint existente:

```http
POST /api/Permissions/add
{
  "userId": 1,
  "permissionKey": "access-codes.manage"
}
```

---

## Modelo de Dados

```ts
interface AccessCode {
  id: number;
  code: string;           // Código gerado (ex: "A3BX9KZ2TY"), 10 caracteres alfanuméricos
  contextType: string;    // Tipo de contexto (ex: "Museum", "Event")
  contextId: string;      // Identificador do contexto (ex: ID do museu ou evento)
  expiresAt: string;      // ISO 8601 UTC (ex: "2026-05-01T18:00:00Z")
  maxUsages: number | null; // null = ilimitado
  usageCount: number;
  isRevoked: boolean;
  createdAt: string;      // ISO 8601 UTC
}
```

---

## Endpoints

### 1. Gerar Código

```http
POST /api/AccessCode/generate
```

**Request Body**

```json
{
  "contextType": "Museum",
  "contextId": "42",
  "expiresAt": "2026-05-01T18:00:00Z",
  "maxUsages": 1
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `contextType` | `string` | Sim | Tipo de contexto (`Museum`, `Event`, etc.) |
| `contextId` | `string` | Sim | ID do recurso associado |
| `expiresAt` | `string` (ISO 8601 UTC) | Sim | Data/hora de expiração — deve ser no futuro |
| `maxUsages` | `number \| null` | Não | Limite de utilizações; omitir ou `null` para ilimitado |

**Resposta de sucesso** `200 OK`

```json
{
  "content": {
    "id": 1,
    "code": "A3BX9KZ2TY",
    "contextType": "Museum",
    "contextId": "42",
    "expiresAt": "2026-05-01T18:00:00Z",
    "maxUsages": 1,
    "usageCount": 0,
    "isRevoked": false,
    "createdAt": "2026-04-30T10:00:00Z"
  },
  "totalRecords": 0
}
```

**Respostas de erro**

| Status | Motivo |
|---|---|
| `400` | `expiresAt` no passado, ou `maxUsages` ≤ 0 |
| `401` | Token inválido ou ausente |
| `403` | Sem permissão `access-codes.manage` |
| `500` | Erro interno |

---

### 2. Validar Código

```http
POST /api/AccessCode/validate
```

**Request Body**

```json
{
  "code": "A3BX9KZ2TY",
  "contextType": "Museum",
  "contextId": "42"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `code` | `string` | Sim | Código a validar |
| `contextType` | `string` | Sim | Deve corresponder ao tipo com que o código foi gerado |
| `contextId` | `string` | Sim | Deve corresponder ao ID com que o código foi gerado |

> Cada validação bem-sucedida incrementa o `usageCount`. Quando `usageCount` atinge `maxUsages`, o código deixa de ser válido.

**Resposta de sucesso** `200 OK`

```json
{
  "content": {
    "message": "Código de acesso válido"
  },
  "totalRecords": 0
}
```

**Respostas de erro**

| Status | Mensagem | Motivo |
|---|---|---|
| `400` | `"Código de acesso inválido"` | Código não existe |
| `400` | `"Código de acesso revogado"` | Código foi revogado |
| `400` | `"Código de acesso expirado"` | Data de expiração ultrapassada |
| `400` | `"Código de acesso inválido para este contexto"` | `contextType`/`contextId` não correspondem |
| `400` | `"Código de acesso atingiu o limite de utilizações"` | `maxUsages` esgotado |
| `401` | — | Token inválido ou ausente |
| `403` | — | Sem permissão `access-codes.manage` |

---

### 3. Revogar Código

```http
POST /api/AccessCode/revoke
```

**Request Body**

```json
{
  "code": "A3BX9KZ2TY"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `code` | `string` | Sim | Código a revogar |

**Resposta de sucesso** `200 OK`

```json
{
  "content": {
    "message": "Código de acesso revogado com sucesso"
  },
  "totalRecords": 0
}
```

**Respostas de erro**

| Status | Mensagem | Motivo |
|---|---|---|
| `400` | `"Código de acesso não encontrado"` | Código não existe |
| `400` | `"Código de acesso já se encontra revogado"` | Código já estava revogado |
| `401` | — | Token inválido ou ausente |
| `403` | — | Sem permissão `access-codes.manage` |

---

### 4. Listar e Pesquisar Códigos

```http
GET /api/AccessCode/list
```

Todos os parâmetros são opcionais. Podem ser combinados livremente.

**Query Parameters**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `contextType` | `string` | Filtrar por tipo de contexto (ex: `"Museum"`) |
| `contextId` | `string` | Filtrar por ID do contexto |
| `isRevoked` | `boolean` | Filtrar por estado de revogação (`true` / `false`) |

**Exemplos**

```http
GET /api/AccessCode/list
GET /api/AccessCode/list?contextType=Museum
GET /api/AccessCode/list?contextType=Museum&contextId=42
GET /api/AccessCode/list?isRevoked=false
GET /api/AccessCode/list?contextType=Event&isRevoked=true
```

**Resposta de sucesso** `200 OK`

```json
{
  "content": [
    {
      "id": 1,
      "code": "A3BX9KZ2TY",
      "contextType": "Museum",
      "contextId": "42",
      "expiresAt": "2026-05-01T18:00:00Z",
      "maxUsages": 1,
      "usageCount": 0,
      "isRevoked": false,
      "createdAt": "2026-04-30T10:00:00Z"
    }
  ],
  "totalRecords": 1
}
```

Os resultados são ordenados por `createdAt` descendente (mais recentes primeiro).

**Respostas de erro**

| Status | Motivo |
|---|---|
| `401` | Token inválido ou ausente |
| `403` | Sem permissão `access-codes.manage` |
| `500` | Erro interno |

---

### 5. Verificar Código (público)

```http
GET /api/AccessCode/check
```

Endpoint **público** — não requer autenticação nem permissão. Apenas verifica se o código é válido para o contexto indicado, **sem consumir uma utilização** (`usageCount` não é incrementado).

**Query Parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `code` | `string` | Sim | Código a verificar |
| `contextType` | `string` | Sim | Tipo de contexto |
| `contextId` | `string` | Sim | ID do contexto |

**Exemplo**

```http
GET /api/AccessCode/check?code=A3BX9KZ2TY&contextType=Museum&contextId=42
```

**Resposta de sucesso** `200 OK`

```json
{
  "content": {
    "isValid": true,
    "message": "Código de acesso válido"
  },
  "totalRecords": 0
}
```

**Resposta de código inválido** `400 Bad Request`

```json
{
  "content": {
    "isValid": false,
    "message": "Código de acesso expirado"
  },
  "totalRecords": 0
}
```

Possíveis valores de `message`:

| `isValid` | `message` |
|---|---|
| `true` | `"Código de acesso válido"` |
| `false` | `"Código de acesso inválido"` |
| `false` | `"Código de acesso revogado"` |
| `false` | `"Código de acesso expirado"` |
| `false` | `"Código de acesso inválido para este contexto"` |
| `false` | `"Código de acesso atingiu o limite de utilizações"` |

> **Diferença face ao endpoint `POST /validate`**: o `validate` requer autenticação + permissão e incrementa o `usageCount` a cada chamada bem-sucedida. O `check` é público e apenas consulta — útil para mostrar ao utilizador se um código é válido antes de o consumir.

---

## Formato de Resposta Geral

Todas as respostas seguem o envelope `GenericResult`:

```ts
interface GenericResult<T = unknown> {
  content: T | null;
  totalRecords: number;
}
```

Em caso de erro, a resposta pode ser uma string de mensagem (erros `500`) ou o próprio objeto com `content.message` (erros `400`).

---

## Notas de Implementação

- O `code` é gerado com `RandomNumberGenerator` (criptograficamente seguro), composto por 10 caracteres do conjunto `A-Z0-9`.
- Todas as datas são em **UTC**. O frontend deve converter para hora local ao apresentar.
- O `contextType` é um campo livre — o frontend e o backend devem usar os mesmos valores por convenção (ex: `"Museum"`, `"Event"`).
- Um código com `maxUsages: null` pode ser utilizado um número ilimitado de vezes até expirar ou ser revogado.
