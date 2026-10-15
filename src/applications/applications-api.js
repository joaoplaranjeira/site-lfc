const DEFAULT_API_URL = import.meta.env.DEV
  ? 'http://localhost:5007'
  : 'https://otw-clevvo-api-applications-65044513a2bb.herokuapp.com';

const API_URL = (import.meta.env.VITE_APPLICATIONS_API_URL || DEFAULT_API_URL).replace(/\/$/, '');

function errorMessages(body) {
  if (Array.isArray(body?.validationMessages)) {
    const messages = body.validationMessages
      .map((item) => item?.message)
      .filter(Boolean);
    if (messages.length) return messages;
  }

  if (body?.errors && typeof body.errors === 'object') {
    const messages = Object.values(body.errors).flat().filter(Boolean);
    if (messages.length) return messages;
  }

  if (body?.errorMessage) return [body.errorMessage];
  return [];
}

export class ApplicationsApiError extends Error {
  constructor(messages, status) {
    super(messages[0] || 'Não foi possível concluir a operação.');
    this.name = 'ApplicationsApiError';
    this.messages = messages;
    this.status = status;
  }
}

export async function apiRequest(path, init = {}) {
  const headers = new Headers(init.headers);
  if (init.body) headers.set('Content-Type', 'application/json');

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApplicationsApiError([
      'Não foi possível ligar ao serviço de candidaturas. Verifica a ligação e tenta novamente.'
    ], 0);
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    // Uma resposta sem JSON é tratada abaixo sem expor detalhes internos.
  }

  if (!response.ok || body?.success === false) {
    const messages = response.status === 400 || body?.success === false
      ? errorMessages(body)
      : [];
    throw new ApplicationsApiError(
      messages.length ? messages : ['Não foi possível concluir a operação. Tenta novamente.'],
      response.status
    );
  }

  return body;
}

export function listPrograms() {
  return apiRequest('/api/public/application-programs');
}

export function getProgram(programId) {
  return apiRequest(`/api/public/application-programs/${encodeURIComponent(programId)}`);
}

export function requestApplicationOtp(input) {
  return apiRequest('/api/public/applications/request-otp', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export function confirmApplication(input) {
  return apiRequest('/api/public/applications/confirm', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}
