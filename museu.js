const ACCESS_API_BASE = 'https://otw-clevvo-api-authentication-67bd3c9de3ba.herokuapp.com';
const MUSEUM_CONTEXT_TYPE = 'Museum';
const MUSEUM_CONTEXT_ID = '1';
const SESSION_KEY = 'museu_access_granted';

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
  return response.ok;
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
      const valid = await validateAccessCode(code);
      if (valid) {
        grantAccess();
      } else {
        error.classList.remove('hidden');
        input.value = '';
        input.focus();
      }
    } catch {
      error.textContent = 'Erro de ligação. Tenta novamente.';
      error.classList.remove('hidden');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-unlock"></i> Entrar';
    }
  });
})();

document.getElementById('year').textContent = new Date().getFullYear();
