const ACCESS_API_BASE = 'https://otw-clevvo-api-authentication-67bd3c9de3ba.herokuapp.com';
const MUSEUM_CONTEXT_TYPE = 'Museum';
const MUSEUM_CONTEXT_ID = '1';
const SESSION_KEY = 'museu_access_granted';

const ERROR_MESSAGES = {
  'invalid access code': 'Código inválido. Por favor, tenta novamente.',
  'código de acesso inválido': 'Código inválido. Por favor, tenta novamente.',
  'código de acesso revogado': 'Este código foi revogado e já não pode ser utilizado.',
  'código de acesso expirado': 'Este código expirou e já não é válido.',
  'código de acesso atingiu o limite de utilizações': 'Este código já atingiu o número máximo de utilizações.',
  'código de acesso inválido para este contexto': 'Código inválido. Por favor, tenta novamente.',
};

async function validateAccessCode(code) {
  const response = await fetch(`${ACCESS_API_BASE}/api/AccessCode/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: code.trim().toUpperCase(),
      contextType: MUSEUM_CONTEXT_TYPE,
      contextId: MUSEUM_CONTEXT_ID,
    }),
  });

  if (response.ok) return { valid: true };

  let friendlyMessage = 'Código inválido. Por favor, tenta novamente.';
  try {
    const data = await response.json();
    const raw = (data?.content?.message || data?.message || '').toLowerCase();
    friendlyMessage = ERROR_MESSAGES[raw] || friendlyMessage;
  } catch { /* use default message */ }

  return { valid: false, message: friendlyMessage };
}

function grantAccess() {
  sessionStorage.setItem(SESSION_KEY, '1');
  document.getElementById('access-gate').remove();
  document.getElementById('page-content').classList.remove('hidden');
}

(function init() {
  if (sessionStorage.getItem(SESSION_KEY) === '1') {
    grantAccess();
    return;
  }

  const form = document.getElementById('access-form');
  const input = document.getElementById('access-code-input');
  const error = document.getElementById('access-error');
  const submitBtn = document.getElementById('access-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = input.value;
    if (!code.trim()) return;

    error.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> A verificar...';

    try {
      const result = await validateAccessCode(code);
      if (result.valid) {
        grantAccess();
      } else {
        document.getElementById('access-error-text').textContent = result.message;
        error.classList.remove('hidden');
        error.classList.add('flex');
        input.value = '';
        input.focus();
      }
    } catch {
      document.getElementById('access-error-text').textContent = 'Erro de ligação. Tenta novamente.';
      error.classList.remove('hidden');
      error.classList.add('flex');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-unlock"></i> Entrar';
    }
  });
})();

document.getElementById('year').textContent = new Date().getFullYear();
