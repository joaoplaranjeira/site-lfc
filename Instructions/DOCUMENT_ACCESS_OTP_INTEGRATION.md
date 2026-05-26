# Document Access via OTP – Integration Guide

This document describes how to integrate the two-step OTP flow into the website to allow a member to access a protected document.

---

## Overview

```
1. Member fills in the form (member code, birth date, email, document)
        ↓
2. POST /api/documentaccess/request-otp
        ↓  (OTP sent by email)
3. Member enters the 6-digit code
        ↓
4. POST /api/documentaccess/validate-otp
        ↓  (access granted → open document)
```

Both endpoints are **public (no authentication required)**.

---

## Step 1 – Request OTP

### `POST /api/documentaccess/request-otp`

Verifies member identity and sends a 6-digit OTP to the member's email.

**Request body**

```json
{
  "memberCode": 1234,
  "birthDate": "1985-06-15",
  "email": "socio@email.com",
  "document": "regulamento-interno"
}
```

| Field | Type | Description |
|---|---|---|
| `memberCode` | `number` | Member number |
| `birthDate` | `string` (ISO 8601) | Date of birth — `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss` |
| `email` | `string` | Email registered in the member's profile |
| `document` | `string` | Identifier of the document to be accessed (free text / slug) |

**Success response — `200 OK`**

```json
{
  "success": true,
  "content": {
    "message": "OTP sent successfully. Check your email."
  },
  "errorMessage": null,
  "validationMessages": null,
  "totalRecords": 0
}
```

**Error response — `400 Bad Request`** (invalid credentials or email failure)

```json
{
  "success": false,
  "content": null,
  "errorMessage": "Invalid credentials.",
  "validationMessages": null,
  "totalRecords": 0
}
```

> The error message is deliberately generic — no indication of which field is wrong (prevents enumeration attacks).

---

## Step 2 – Validate OTP

### `POST /api/documentaccess/validate-otp`

Validates the OTP code entered by the member. The code is **single-use** and expires after **10 minutes**.

**Request body**

```json
{
  "email": "socio@email.com",
  "otp": "482917"
}
```

| Field | Type | Description |
|---|---|---|
| `email` | `string` | Same email used in step 1 |
| `otp` | `string` | 6-digit code received by email |

**Success response — `200 OK`**

```json
{
  "success": true,
  "content": {
    "document": "regulamento-interno",
    "memberCode": 1234,
    "accessedAt": "2026-05-26T14:32:10Z"
  },
  "errorMessage": null,
  "validationMessages": null,
  "totalRecords": 0
}
```

Use the `content.document` field to determine which document to open/redirect to.

**Error response — `400 Bad Request`** (invalid or expired OTP)

```json
{
  "success": false,
  "content": null,
  "errorMessage": "Invalid or expired OTP.",
  "validationMessages": null,
  "totalRecords": 0
}
```

---

## JavaScript / Fetch example

```js
// Step 1 — request OTP
async function requestOtp({ memberCode, birthDate, email, document }) {
  const res = await fetch('https://api.example.com/api/documentaccess/request-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberCode, birthDate, email, document }),
  });
  return res.json();
}

// Step 2 — validate OTP and get document access
async function validateOtp({ email, otp }) {
  const res = await fetch('https://api.example.com/api/documentaccess/validate-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  return res.json();
}

// Usage
const step1 = await requestOtp({
  memberCode: 1234,
  birthDate: '1985-06-15',
  email: 'socio@email.com',
  document: 'regulamento-interno',
});

if (step1.success) {
  // show OTP input form to the member
} else {
  // show step1.errorMessage
}

// After member enters the code:
const step2 = await validateOtp({ email: 'socio@email.com', otp: '482917' });

if (step2.success) {
  const { document, memberCode, accessedAt } = step2.content;
  // redirect to / open the document
} else {
  // show step2.errorMessage ("Invalid or expired OTP.")
}
```

---

## UI flow recommendation

```
┌─────────────────────────────────────────┐
│  Aceder ao documento                    │
│                                         │
│  Nº de Sócio  [________]               │
│  Data de Nasc.[________]               │
│  Email        [________]               │
│  Documento    [regulamento-interno ▾]  │
│                                         │
│           [ Enviar código ]             │
└─────────────────────────────────────────┘
           ↓ (success)
┌─────────────────────────────────────────┐
│  Introduza o código recebido por email  │
│                                         │
│  Código  [ _ _ _ _ _ _ ]               │
│                                         │
│  ⏱ Válido durante 10 minutos           │
│           [ Confirmar ]                 │
└─────────────────────────────────────────┘
           ↓ (success)
       Open / redirect to document
```

---

## Notes

- The OTP is **invalidated immediately after a successful validation** — it cannot be reused.
- Re-submitting step 1 generates a new OTP (previous ones remain in the DB but become irrelevant once the latest is used or expired).
- All access attempts are logged in the `DocumentAccessOtps` table with timestamp and IP address.
