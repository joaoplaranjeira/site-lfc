# Integração Frontend - Registo Público com OTP

Este documento descreve o fluxo para permitir inscrições públicas em eventos com validação por OTP (One-Time Password).

## Base URL (ambiente local)

- API de eventos: `http://localhost:5004`
- Frontend (site): usar chamadas relativas com prefixo `/api` (ex.: `/api/Event/public/code/{code}`)
- O encaminhamento para a porta `5004` é feito pelo proxy reverso no `nginx.conf`

## Objetivo

Garantir que **a inscrição só é gravada na base de dados após validação de OTP** enviado para o email do utilizador.

---

## Endpoints

### 0) Obter evento público por código

`GET /api/Event/public/code/{code}`

Este endpoint devolve os dados públicos do evento, o número de inscrições já criadas e os **tipos de inscrição disponíveis** para o utilizador escolher no site.

> Tipos disponíveis = `IsActive = true` e dentro da janela de venda (`SalesStartDate` / `SalesEndDate`, quando definidas).

#### Response de sucesso (exemplo)

```json
{
  "success": true,
  "content": {
    "code": "EVT-LECA-2026",
    "name": "Jantar Anual",
    "description": "Evento anual do Universo Leça",
    "categoryName": "Social",
    "status": "Published",
    "startDateTime": "2026-03-20T19:30:00Z",
    "endDateTime": "2026-03-20T23:30:00Z",
    "location": "Estádio do Leça FC",
    "capacityMax": 250,
    "allowsNonMembers": true,
    "registrationsCount": 87,
    "registrationTypes": [
      {
        "id": "9c4f8c02-fdf8-4db4-9c53-0f57dce0c1ab",
        "description": "Sócio",
        "price": 20.0,
        "currency": "EUR",
        "maxRegistrations": 150,
        "salesStartDate": "2026-02-01T00:00:00Z",
        "salesEndDate": "2026-03-18T23:59:59Z",
        "displayOrder": 1
      },
      {
        "id": "a4ccf7e0-6f1d-4ee1-9910-2f746a5808f2",
        "description": "Não Sócio",
        "price": 30.0,
        "currency": "EUR",
        "maxRegistrations": 100,
        "salesStartDate": "2026-02-01T00:00:00Z",
        "salesEndDate": "2026-03-18T23:59:59Z",
        "displayOrder": 2
      }
    ]
  },
  "totalRecords": 0
}
```

`registrationsCount` representa o número total de inscrições já criadas para o evento até ao momento (inclui todos os estados de inscrição).

---

### 1) Pedir OTP

`POST /api/EventRegistration/public/request-otp-by-code`

Este endpoint:
- valida os dados base do pedido
- valida se o evento existe (por código) e está em `Published`
- gera OTP de 6 dígitos
- envia OTP por email
- guarda o pedido temporariamente em memória (expira em 10 minutos)

#### Body (JSON)

```json
{
  "eventCode": "EVENTO2026",
  "registrationTypeId": "9c4f8c02-fdf8-4db4-9c53-0f57dce0c1ab",
  "memberNumber": 1234,
  "name": "João Silva",
  "nif": "123456789",
  "email": "joao@email.com",
  "phone": "+351912345678",
  "totalAmount": 25.00,
  "notes": "Sem observações",
  "requiresFiscalData": true
}
```

> **Nota:** Use `eventCode` (código público do evento, ex: "EVENTO2026") em vez de `eventId` (GUID). O backend resolve o evento internamente pelo código.

#### Response de sucesso (exemplo)

```json
{
  "success": true,
  "content": {
    "otpRequestId": "abc123...",
    "expiresInMinutes": 10,
    "email": "j***@example.com"
  }
}
```

---

### 2) Confirmar OTP e criar inscrição

`POST /api/EventRegistration/public/confirm-otp`

Este endpoint:
- valida o `otpRequestId`
- valida OTP (máximo 5 tentativas)
- se OTP for válido, cria a inscrição na BD
- dispara email normal de confirmação de inscrição

#### Body (JSON)

```json
{
  "otpRequestId": "15d4182438c14d6fb8ef8966385e3a1f",
  "otpCode": "123456"
}
```

#### Response de sucesso (exemplo)

```json
{
  "success": true,
  "content": {
    "id": "0f3cbf20-8d0d-4b9a-9d0e-9a67f8c3ad87",
    "registrationCode": "REG-2026-00001",
    "eventId": "f0c8d6aa-3f52-4a17-8b37-6b8f7e9bfa11",
    "name": "João Silva",
    "email": "joao@email.com"
  },
  "totalRecords": 0
}
```

---

## Fluxo recomendado no frontend

1. Frontend chama `GET /api/Event/public/code/{code}` para obter evento + tipos disponíveis.
2. Utilizador escolhe tipo de inscrição e preenche formulário.
3. Frontend chama `POST /api/EventRegistration/public/request-otp-by-code` com `eventCode` (do parâmetro da URL).
4. Se sucesso, mostrar ecrã para inserir OTP.
5. Frontend chama `POST /api/EventRegistration/public/confirm-otp` com `otpRequestId + otpCode`.
6. Se sucesso, mostrar mensagem "Inscrição concluída" + `registrationCode` + métodos de pagamento disponíveis.

---

## Métodos de Pagamento

Após confirmação da inscrição, o utilizador é informado dos seguintes métodos de pagamento disponíveis:

1. **Transferência Bancária**
   - IBAN: `PT50003300004567594559005`
   - O utilizador pode copiar o IBAN com um clique
   - **Importante:** Após realizar a transferência, o utilizador deve enviar o comprovativo de pagamento para `administrativo@lecafc.pt` com:
     - Primeiro e último nome
     - NIF
     - Código da inscrição

2. **Pagamento Presencial**
   - Secretaria do Universo Leça Futebol Clube
   - Morada: Rua António Ferrinha, 146, 4450-614 Leça da Palmeira

---

## Erros esperados

### No pedido de OTP
- `Event not found`
- `Registrations are not open for this event`
- `Unable to send OTP. Please try again.`
- mensagens de validação (nome/email/valor)

### Na confirmação de OTP
- `OTP request id and OTP code are required`
- `OTP request not found or expired`
- `OTP expired`
- `Maximum OTP attempts exceeded`
- `Invalid OTP code`

---

## Segurança aplicada

- Inscrição só é persistida após OTP válido.
- OTP expira em 10 minutos.
- Máximo 5 tentativas de OTP por pedido.
- OTP é armazenado em hash (SHA-256), não em texto simples.
- Rate limit por endpoint público:
  - `PublicRegistrationOtpRequest`: 5 req/min
  - `PublicRegistrationOtpConfirm`: 20 req/min

---

## Dependência de email (Loops)

Configuração necessária no `appsettings`:

```json
"Loops": {
  "ApiKey": "...",
  "RegistrationConfirmationTemplateId": "...",
  "PaymentConfirmationTemplateId": "...",
  "RegistrationOtpTemplateId": "registration-otp"
}
```

### Variáveis esperadas no template OTP

No template transacional do Loops (`RegistrationOtpTemplateId`) use:
- `name`
- `eventName`
- `otp` (variável principal usada no MJML)
- `otpCode`
- `expiresInMinutes`

---

## Exemplo rápido (JavaScript)

```javascript
async function submitRegistrationWithOtp(registrationPayload, otpCode) {
  // registrationPayload deve conter eventCode, não eventId
  const otpReq = await fetch('/api/EventRegistration/public/request-otp-by-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registrationPayload)
  }).then(r => r.json());

  if (!otpReq.success) return otpReq;

  const confirmReq = await fetch('/api/EventRegistration/public/confirm-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      otpRequestId: otpReq.content.otpRequestId,
      otpCode
    })
  }).then(r => r.json());

  return confirmReq;
}
```

---

## Nota operacional importante

Atualmente o OTP é guardado em memória (`IMemoryCache`). Em ambiente com múltiplas instâncias da API, recomenda-se migrar para cache distribuída (ex.: Redis) para garantir consistência entre nós.
