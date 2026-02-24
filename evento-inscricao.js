const state = {
  eventCode: null,
  eventData: null,
  otpRequestId: null,
  otpExpiresInMinutes: 10
};

function formatDateTime(dateString) {
  if (!dateString) return '-';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatCurrency(amount, currency = 'EUR') {
  const value = Number(amount || 0);
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency
  }).format(value);
}

function isPublishedStatus(status) {
  return String(status || '').toLowerCase() === 'published';
}

function hasEventCapacityAvailable(eventData) {
  const capacityMax = Number(eventData?.capacityMax);
  const registrationsCount = Number(eventData?.registrationsCount || 0);

  if (!Number.isFinite(capacityMax) || capacityMax <= 0) {
    return true;
  }

  return registrationsCount < capacityMax;
}

function getErrorMessage(payload, fallbackMessage) {
  if (!payload) return fallbackMessage;

  if (typeof payload === 'string') return payload;
  if (payload.message) return payload.message;

  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    return payload.errors.join(' | ');
  }

  if (payload.errors && typeof payload.errors === 'object') {
    const allMessages = Object.values(payload.errors).flat();
    if (allMessages.length > 0) {
      return allMessages.join(' | ');
    }
  }

  if (payload.content && typeof payload.content === 'string') {
    return payload.content;
  }

  return fallbackMessage;
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(getErrorMessage(payload, 'Ocorreu um erro ao processar o pedido.'));
  }

  return payload;
}

function setLoading(loading) {
  document.getElementById('registration-loading').classList.toggle('hidden', !loading);
  document.getElementById('registration-content').classList.toggle('hidden', loading);
}

function showPageError(message) {
  const errorBox = document.getElementById('registration-error');
  const errorText = document.getElementById('registration-error-text');

  errorText.textContent = message;
  errorBox.classList.remove('hidden');
  document.getElementById('registration-loading').classList.add('hidden');
  document.getElementById('registration-content').classList.add('hidden');
}

function renderEventInfo(eventData) {
  document.getElementById('event-name').textContent = eventData.name || 'Evento';
  document.getElementById('event-description').textContent = eventData.description || 'Sem descrição disponível.';
  document.getElementById('event-date').textContent = `${formatDateTime(eventData.startDateTime)}${eventData.endDateTime ? ` - ${formatDateTime(eventData.endDateTime)}` : ''}`;
  document.getElementById('event-location').textContent = eventData.location || 'Local a definir';
}

function populateRegistrationTypes(types) {
  const select = document.getElementById('registrationTypeId');

  const sortedTypes = [...types].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  select.innerHTML = sortedTypes
    .map(type => {
      const priceLabel = formatCurrency(type.price, type.currency || 'EUR');
      return `<option value="${type.id}" data-price="${Number(type.price || 0)}" data-currency="${type.currency || 'EUR'}">${type.description} - ${priceLabel}</option>`;
    })
    .join('');

  updateTotalAmount();
}

function updateTotalAmount() {
  const typeSelect = document.getElementById('registrationTypeId');
  const selectedOption = typeSelect.options[typeSelect.selectedIndex];

  if (!selectedOption) {
    document.getElementById('totalAmount').value = formatCurrency(0);
    return;
  }

  const price = Number(selectedOption.dataset.price || 0);
  const currency = selectedOption.dataset.currency || 'EUR';
  document.getElementById('totalAmount').value = formatCurrency(price, currency);
}

function getSelectedAmount() {
  const typeSelect = document.getElementById('registrationTypeId');
  const selectedOption = typeSelect.options[typeSelect.selectedIndex];

  if (!selectedOption) {
    return 0;
  }

  return Number(selectedOption.dataset.price || 0);
}

function setStepError(stepId, message) {
  const errorBox = document.getElementById(stepId);

  if (!message) {
    errorBox.classList.add('hidden');
    errorBox.textContent = '';
    return;
  }

  errorBox.textContent = message;
  errorBox.classList.remove('hidden');
}

function setButtonLoading(buttonId, loading, loadingText) {
  const button = document.getElementById(buttonId);

  if (!button.dataset.originalText) {
    button.dataset.originalText = button.innerHTML;
  }

  button.disabled = loading;
  button.classList.toggle('opacity-70', loading);
  button.classList.toggle('cursor-not-allowed', loading);
  button.innerHTML = loading
    ? `<i class="fa-solid fa-spinner fa-spin"></i> ${loadingText}`
    : button.dataset.originalText;
}

async function loadEventDetails() {
  setLoading(true);

  try {
    const payload = await apiRequest(`/api/Event/public/code/${encodeURIComponent(state.eventCode)}`);
    const eventData = payload.content;

    state.eventData = eventData;
    renderEventInfo(eventData);

    const form = document.getElementById('registration-form');
    const registrationClosed = document.getElementById('registration-closed');

    if (!isPublishedStatus(eventData.status)) {
      registrationClosed.classList.remove('hidden');
      registrationClosed.textContent = 'As inscrições não estão disponíveis neste momento.';
      form.classList.add('hidden');
      setLoading(false);
      return;
    }

    if (!hasEventCapacityAvailable(eventData)) {
      const registrationsCount = Number(eventData.registrationsCount || 0);
      const capacityMax = Number(eventData.capacityMax);

      registrationClosed.classList.remove('hidden');
      registrationClosed.textContent = `Inscrições encerradas (lotação atingida: ${registrationsCount}/${capacityMax}).`;
      form.classList.add('hidden');
      setLoading(false);
      return;
    }

    const registrationTypes = eventData.registrationTypes || [];
    if (registrationTypes.length === 0) {
      registrationClosed.classList.remove('hidden');
      registrationClosed.textContent = 'Não existem tipos de inscrição disponíveis para este evento.';
      form.classList.add('hidden');
      setLoading(false);
      return;
    }

    populateRegistrationTypes(registrationTypes);
    setLoading(false);
  } catch (error) {
    showPageError(error.message || 'Não foi possível carregar os dados do evento.');
  }
}

async function handleRequestOtp(event) {
  event.preventDefault();
  setStepError('step1-error', '');

  if (!state.eventData) {
    setStepError('step1-error', 'Dados do evento indisponíveis.');
    return;
  }

  if (!state.eventCode) {
    setStepError('step1-error', 'Código do evento não encontrado.');
    return;
  }

  const memberNumberRaw = document.getElementById('memberNumber').value.trim();
  const payload = {
    eventCode: state.eventCode,
    registrationTypeId: document.getElementById('registrationTypeId').value,
    memberNumber: memberNumberRaw ? Number(memberNumberRaw) : null,
    name: document.getElementById('name').value.trim(),
    nif: document.getElementById('nif').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    totalAmount: getSelectedAmount(),
    notes: document.getElementById('notes').value.trim(),
    requiresFiscalData: document.getElementById('requiresFiscalData').checked
  };

  setButtonLoading('request-otp-btn', true, 'A enviar OTP...');

  try {
    const otpPayload = await apiRequest('/api/EventRegistration/public/request-otp-by-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    state.otpRequestId = otpPayload.content.otpRequestId;
    state.otpExpiresInMinutes = otpPayload.content.expiresInMinutes || 10;

    const maskedEmail = otpPayload.content.email || payload.email;
    const otpInfo = document.getElementById('otp-info');
    otpInfo.textContent = `Enviámos um código para ${maskedEmail}. Expira em ${state.otpExpiresInMinutes} minutos.`;

    document.getElementById('otp-form').classList.remove('hidden');
    document.getElementById('otpCode').focus();
  } catch (error) {
    setStepError('step1-error', error.message || 'Não foi possível pedir o OTP.');
  } finally {
    setButtonLoading('request-otp-btn', false, 'A enviar OTP...');
  }
}

async function handleConfirmOtp(event) {
  event.preventDefault();
  setStepError('step2-error', '');

  const otpCode = document.getElementById('otpCode').value.trim();
  if (!state.otpRequestId) {
    setStepError('step2-error', 'Primeiro tens de pedir o código OTP.');
    return;
  }

  if (!otpCode) {
    setStepError('step2-error', 'Introduz o código OTP.');
    return;
  }

  setButtonLoading('confirm-otp-btn', true, 'A confirmar...');

  try {
    const confirmPayload = await apiRequest('/api/EventRegistration/public/confirm-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        otpRequestId: state.otpRequestId,
        otpCode
      })
    });

    const registration = confirmPayload.content || {};

    document.getElementById('registration-form').classList.add('hidden');
    document.getElementById('otp-form').classList.add('hidden');

    const successBox = document.getElementById('registration-success');
    successBox.classList.remove('hidden');

    const registrationCode = registration.registrationCode || registration.id || '-';
    document.getElementById('registration-code').textContent = `Código de inscrição: ${registrationCode}`;
    document.getElementById('payment-registration-code').textContent = registrationCode;
  } catch (error) {
    setStepError('step2-error', error.message || 'Não foi possível confirmar o OTP.');
  } finally {
    setButtonLoading('confirm-otp-btn', false, 'A confirmar...');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  state.eventCode = params.get('code');

  if (!state.eventCode) {
    showPageError('Código de evento inválido.');
    return;
  }

  document.getElementById('registrationTypeId').addEventListener('change', updateTotalAmount);
  document.getElementById('registration-form').addEventListener('submit', handleRequestOtp);
  document.getElementById('otp-form').addEventListener('submit', handleConfirmOtp);

  loadEventDetails();
});
