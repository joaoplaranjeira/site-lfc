const INVESTOR_ACCESS_API_BASE = 'https://otw-clevvo-api-authentication-67bd3c9de3ba.herokuapp.com';
const INVESTOR_CONTEXT_TYPE = 'InvestorRoom';
const INVESTOR_CONTEXT_ID = '2';
const INVESTOR_SESSION_KEY = 'investor_room_access_granted';

const INVESTOR_ERROR_MESSAGES = {
  'invalid access code': 'Código inválido. Por favor, tenta novamente.',
  'código de acesso inválido': 'Código inválido. Por favor, tenta novamente.',
  'código de acesso revogado': 'Este código foi revogado e já não pode ser utilizado.',
  'código de acesso expirado': 'Este código expirou e já não é válido.',
  'código de acesso atingiu o limite de utilizações': 'Este código já atingiu o número máximo de utilizações.',
  'código de acesso inválido para este contexto': 'Código inválido. Por favor, tenta novamente.'
};

async function validateInvestorCode(code) {
  const response = await fetch(`${INVESTOR_ACCESS_API_BASE}/api/AccessCode/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: code.trim().toUpperCase(),
      contextType: INVESTOR_CONTEXT_TYPE,
      contextId: INVESTOR_CONTEXT_ID
    })
  });

  if (response.ok) return { valid: true };

  let friendlyMessage = 'Código inválido. Por favor, tenta novamente.';
  try {
    const data = await response.json();
    const raw = (data?.content?.message || data?.message || '').toLowerCase();
    friendlyMessage = INVESTOR_ERROR_MESSAGES[raw] || friendlyMessage;
  } catch {
    // Mantém a mensagem segura por defeito.
  }
  return { valid: false, message: friendlyMessage };
}

function grantInvestorAccess() {
  sessionStorage.setItem(INVESTOR_SESSION_KEY, '1');
  document.body.classList.remove('ir-locked');
  document.getElementById('investor-access-gate')?.remove();
  document.getElementById('investor-content')?.classList.remove('hidden');
}

function initInvestorGate() {
  if (sessionStorage.getItem(INVESTOR_SESSION_KEY) === '1') {
    grantInvestorAccess();
    return;
  }

  const form = document.getElementById('investor-access-form');
  const input = document.getElementById('investor-code-input');
  const error = document.getElementById('investor-access-error');
  const errorText = document.getElementById('investor-access-error-text');
  const submit = document.getElementById('investor-access-submit');
  if (!form || !input || !error || !errorText || !submit) return;

  input.focus();
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!input.value.trim()) return;

    error.classList.add('hidden');
    submit.disabled = true;
    submit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> A verificar...';

    try {
      const result = await validateInvestorCode(input.value);
      if (result.valid) {
        grantInvestorAccess();
        return;
      }
      errorText.textContent = result.message;
      error.classList.remove('hidden');
      input.value = '';
      input.focus();
    } catch {
      errorText.textContent = 'Erro de ligação. Tenta novamente.';
      error.classList.remove('hidden');
    } finally {
      submit.disabled = false;
      submit.innerHTML = '<i class="fa-solid fa-unlock"></i> Entrar';
    }
  });
}

function initInvestorInterface() {
  const topbar = document.querySelector('.ir-topbar');
  const progress = document.querySelector('.ir-progress span');
  const sections = Array.from(document.querySelectorAll('[data-chapter]'));
  const navLinks = Array.from(document.querySelectorAll('.ir-chapter-nav a'));

  function updateScrollState() {
    topbar?.classList.toggle('scrolled', window.scrollY > 24);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    }
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  document.querySelectorAll('.ir-reveal').forEach((element) => revealObserver.observe(element));

  if (sections.length && navLinks.length) {
    const chapterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach((section) => chapterObserver.observe(section));
  }

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();

  document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initInvestorGate();
  initInvestorInterface();
});
