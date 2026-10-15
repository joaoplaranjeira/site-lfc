(function () {
  'use strict';

  const API_BASE_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? ''
    : 'https://otw-clevvo-api-events-b91905bb79ee.herokuapp.com';
  const state = {
    eventCode: '',
    voting: null,
    activeCategoryIndex: 0,
    selectedNomineeId: '',
    completedCategoryIds: new Set(),
    otpRequestId: '',
    lastFocusedElement: null
  };

  const byId = id => document.getElementById(id);

  function getApiError(result, fallback) {
    if (!result) return fallback;

    const rawMessages = [];
    if (typeof result.errorMessage === 'string') rawMessages.push(result.errorMessage);
    if (typeof result.message === 'string') rawMessages.push(result.message);
    if (typeof result.content === 'string') rawMessages.push(result.content);
    if (Array.isArray(result.validationMessages)) {
      result.validationMessages.forEach(item => {
        if (typeof item === 'string') rawMessages.push(item);
        if (item && typeof item.message === 'string') rawMessages.push(item.message);
      });
    }

    const message = rawMessages.find(Boolean);
    if (!message) return fallback;

    const normalized = message.toLowerCase();
    if (normalized.includes('already voted')) return 'Este email já foi utilizado para votar nesta categoria.';
    if (normalized.includes('not found or expired') || normalized.includes('otp expired')) return 'O código expirou. Fecha esta janela e pede um novo código.';
    if (normalized.includes('invalid otp')) return 'O código introduzido não é válido.';
    if (normalized.includes('maximum otp attempts')) return 'Foi atingido o número máximo de tentativas. Pede um novo código.';
    if (normalized.includes('no longer available')) return 'Esta categoria ou este nomeado já não está disponível.';
    if (normalized.includes('has not started')) return 'A votação ainda não começou.';
    if (normalized.includes('period has ended')) return 'O período de votação já terminou.';
    if (normalized.includes('not active') || normalized.includes('period is not configured')) return 'A votação não está disponível neste momento.';
    if (normalized.includes('send') && normalized.includes('otp')) return 'Não foi possível enviar o código. Tenta novamente dentro de instantes.';
    return message;
  }

  async function apiRequest(path, options) {
    const requestOptions = options || {};
    const headers = Object.assign({}, requestOptions.headers || {});
    if (requestOptions.body) headers['Content-Type'] = 'application/json';

    let response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, Object.assign({}, requestOptions, { headers }));
    } catch (error) {
      throw new Error('Não foi possível contactar o serviço de votação. Tenta novamente mais tarde.');
    }

    const result = await response.json().catch(() => null);
    if (!response.ok || !result || result.success !== true) {
      throw new Error(getApiError(result, 'Não foi possível concluir o pedido.'));
    }

    return result.content;
  }

  function formatVotingPeriod(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return '';

    const formatter = new Intl.DateTimeFormat('pt-PT', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `Votação aberta de ${formatter.format(startDate)} a ${formatter.format(endDate)}`;
  }

  function showPageError(message) {
    byId('voting-loading').classList.add('hidden');
    byId('voting-content').classList.add('hidden');
    byId('voting-error-text').textContent = message;
    byId('voting-error').classList.remove('hidden');
  }

  function makeIcon(className) {
    const icon = document.createElement('i');
    icon.className = className;
    icon.setAttribute('aria-hidden', 'true');
    return icon;
  }

  function getActiveCategory() {
    return state.voting.categories[state.activeCategoryIndex];
  }

  function renderCategoryNavigation() {
    const navigation = byId('category-navigation');
    navigation.replaceChildren();

    state.voting.categories.forEach((category, index) => {
      const button = document.createElement('button');
      const status = document.createElement('span');
      const label = document.createElement('span');
      const isComplete = state.completedCategoryIds.has(category.id);

      button.type = 'button';
      button.className = `category-tab${isComplete ? ' category-tab--complete' : ''}`;
      button.setAttribute('aria-current', index === state.activeCategoryIndex ? 'true' : 'false');
      button.setAttribute('aria-label', `${category.name}${isComplete ? ', voto registado' : ''}`);
      button.addEventListener('click', () => showCategory(index));

      status.className = 'category-tab__status';
      if (isComplete) {
        status.appendChild(makeIcon('fa-solid fa-check'));
      } else {
        status.textContent = String(index + 1).padStart(2, '0');
      }

      label.textContent = category.name;
      button.append(status, label);
      navigation.appendChild(button);
    });
  }

  function buildNomineeCard(nominee) {
    const card = document.createElement('button');
    const media = document.createElement('span');
    const check = document.createElement('span');
    const body = document.createElement('span');

    card.type = 'button';
    card.className = 'nominee-card';
    card.dataset.nomineeId = nominee.id;
    card.setAttribute('role', 'radio');
    card.setAttribute('aria-checked', nominee.id === state.selectedNomineeId ? 'true' : 'false');
    card.setAttribute('aria-label', `Escolher ${nominee.name}`);
    card.addEventListener('click', () => selectNominee(nominee.id));

    media.className = 'nominee-card__media';
    if (nominee.imageUrl) {
      const image = document.createElement('img');
      image.src = nominee.imageUrl;
      image.alt = `Retrato de ${nominee.name}`;
      image.loading = 'lazy';
      image.addEventListener('error', () => {
        const placeholder = document.createElement('span');
        placeholder.className = 'nominee-card__placeholder';
        placeholder.appendChild(makeIcon('fa-solid fa-user'));
        image.replaceWith(placeholder);
      }, { once: true });
      media.appendChild(image);
    } else {
      const placeholder = document.createElement('span');
      placeholder.className = 'nominee-card__placeholder';
      placeholder.appendChild(makeIcon('fa-solid fa-user'));
      media.appendChild(placeholder);
    }

    check.className = 'nominee-card__check';
    check.appendChild(makeIcon('fa-solid fa-check'));
    media.appendChild(check);

    body.className = 'nominee-card__body';
    if (nominee.role) {
      const role = document.createElement('span');
      role.className = 'nominee-card__role';
      role.textContent = nominee.role;
      body.appendChild(role);
    }

    const name = document.createElement('h3');
    name.textContent = nominee.name;
    body.appendChild(name);

    if (nominee.description) {
      const description = document.createElement('span');
      description.className = 'nominee-card__description';
      description.textContent = nominee.description;
      body.appendChild(description);
    }

    card.append(media, body);
    return card;
  }

  function renderCategory() {
    const category = getActiveCategory();
    const completed = state.completedCategoryIds.has(category.id);

    byId('category-counter').textContent = `Categoria ${state.activeCategoryIndex + 1} de ${state.voting.categories.length}`;
    byId('category-title').textContent = category.name;
    byId('category-description').textContent = category.description || 'Escolhe o nomeado que queres distinguir nesta categoria.';

    const grid = byId('nominees-grid');
    grid.replaceChildren();
    category.nominees.forEach(nominee => grid.appendChild(buildNomineeCard(nominee)));

    if (completed) {
      const message = document.createElement('div');
      message.className = 'voting-state';
      message.appendChild(makeIcon('fa-solid fa-circle-check'));
      const text = document.createElement('p');
      text.textContent = 'O teu voto nesta categoria já foi registado.';
      message.appendChild(text);
      grid.replaceChildren(message);
    }

    byId('vote-form').classList.add('hidden');
    setFormError('vote-form-error', '');
    state.selectedNomineeId = '';
    renderCategoryNavigation();
  }

  function showCategory(index) {
    if (index < 0 || index >= state.voting.categories.length) return;
    state.activeCategoryIndex = index;
    renderCategory();
    byId('category-title').focus({ preventScroll: true });
    document.querySelector('.category-stage').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function selectNominee(nomineeId) {
    const category = getActiveCategory();
    if (state.completedCategoryIds.has(category.id)) return;

    const nominee = category.nominees.find(item => item.id === nomineeId);
    if (!nominee) return;

    state.selectedNomineeId = nomineeId;
    document.querySelectorAll('.nominee-card').forEach(card => {
      card.setAttribute('aria-checked', card.dataset.nomineeId === nomineeId ? 'true' : 'false');
    });
    byId('selected-nominee-name').textContent = nominee.name;
    byId('vote-form').classList.remove('hidden');
    setFormError('vote-form-error', '');
    byId('voter-email').focus({ preventScroll: true });
    byId('vote-form').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function setFormError(id, message) {
    const element = byId(id);
    element.textContent = message;
    element.classList.toggle('hidden', !message);
  }

  function setButtonLoading(id, loading, loadingLabel) {
    const button = byId(id);
    if (!button.dataset.defaultContent) button.dataset.defaultContent = button.innerHTML;
    button.disabled = loading;
    button.innerHTML = loading
      ? `<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> ${loadingLabel}`
      : button.dataset.defaultContent;
  }

  function openOtpModal(maskedEmail, expiresInMinutes) {
    state.lastFocusedElement = document.activeElement;
    byId('otp-info').textContent = `Enviámos o código para ${maskedEmail}. É válido durante ${expiresInMinutes || 10} minutos.`;
    byId('otp-code').value = '';
    setFormError('otp-error', '');
    byId('otp-modal').classList.remove('hidden');
    document.body.classList.add('modal-open');
    window.setTimeout(() => byId('otp-code').focus(), 0);
  }

  function closeOtpModal() {
    byId('otp-modal').classList.add('hidden');
    document.body.classList.remove('modal-open');
    setFormError('otp-error', '');
    if (state.lastFocusedElement) state.lastFocusedElement.focus();
  }

  async function handleRequestOtp(event) {
    event.preventDefault();
    setFormError('vote-form-error', '');

    const emailInput = byId('voter-email');
    if (!state.selectedNomineeId) {
      setFormError('vote-form-error', 'Escolhe um nomeado antes de continuar.');
      return;
    }
    if (!emailInput.reportValidity()) return;

    const category = getActiveCategory();
    setButtonLoading('request-vote-otp-btn', true, 'A enviar código...');

    try {
      const result = await apiRequest('/api/EventVoting/public/request-otp', {
        method: 'POST',
        body: JSON.stringify({
          eventCode: state.eventCode,
          categoryId: category.id,
          nomineeId: state.selectedNomineeId,
          email: emailInput.value.trim()
        })
      });
      state.otpRequestId = result.otpRequestId;
      openOtpModal(result.email || emailInput.value.trim(), result.expiresInMinutes);
    } catch (error) {
      setFormError('vote-form-error', error.message || 'Não foi possível enviar o código.');
    } finally {
      setButtonLoading('request-vote-otp-btn', false, 'A enviar código...');
    }
  }

  function showNextCategoryOrCompletion(categoryId) {
    state.completedCategoryIds.add(categoryId);
    closeOtpModal();

    const nextIndex = state.voting.categories.findIndex(category => !state.completedCategoryIds.has(category.id));
    if (nextIndex === -1) {
      document.querySelector('.category-stage').classList.add('hidden');
      byId('category-navigation').classList.add('hidden');
      byId('voting-complete').classList.remove('hidden');
      byId('voting-complete').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    state.activeCategoryIndex = nextIndex;
    renderCategory();
    document.querySelector('.category-stage').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleConfirmOtp(event) {
    event.preventDefault();
    setFormError('otp-error', '');

    const otpInput = byId('otp-code');
    const otpCode = otpInput.value.trim();
    if (!otpInput.reportValidity()) return;
    if (!state.otpRequestId) {
      setFormError('otp-error', 'Pede um novo código para confirmar o voto.');
      return;
    }

    setButtonLoading('confirm-vote-otp-btn', true, 'A registar...');
    try {
      const result = await apiRequest('/api/EventVoting/public/confirm-otp', {
        method: 'POST',
        body: JSON.stringify({ otpRequestId: state.otpRequestId, otpCode })
      });
      state.otpRequestId = '';
      showNextCategoryOrCompletion(result.categoryId || getActiveCategory().id);
    } catch (error) {
      setFormError('otp-error', error.message || 'Não foi possível confirmar o voto.');
    } finally {
      setButtonLoading('confirm-vote-otp-btn', false, 'A registar...');
    }
  }

  function renderVoting(voting) {
    const activeCategories = (voting.categories || [])
      .filter(category => category && category.isActive !== false)
      .map(category => Object.assign({}, category, {
        nominees: (category.nominees || []).filter(nominee => nominee && nominee.isActive !== false)
      }))
      .filter(category => category.nominees.length > 0);

    if (activeCategories.length === 0) {
      showPageError('Ainda não existem categorias com nomeados disponíveis para votação.');
      return;
    }

    state.voting = Object.assign({}, voting, { categories: activeCategories });
    document.title = `${voting.eventName || 'Votação'} - Universo Leça FC`;
    byId('voting-title').textContent = voting.eventName || 'Votação do evento';
    byId('voting-period').textContent = formatVotingPeriod(voting.votingStartDateTime, voting.votingEndDateTime);

    if (voting.award) {
      byId('voting-award').textContent = voting.award;
      byId('voting-award').classList.remove('hidden');
    }

    byId('voting-loading').classList.add('hidden');
    byId('voting-content').classList.remove('hidden');
    renderCategory();
  }

  async function loadVoting() {
    const params = new URLSearchParams(window.location.search);
    state.eventCode = (params.get('code') || '').trim();
    if (!state.eventCode || state.eventCode.length > 100) {
      showPageError('O código do evento é inválido ou não foi indicado.');
      return;
    }

    try {
      const voting = await apiRequest(`/api/EventVoting/public/event/${encodeURIComponent(state.eventCode)}`);
      renderVoting(voting);
    } catch (error) {
      showPageError(error.message || 'A votação não está disponível neste momento.');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    byId('year').textContent = new Date().getFullYear();
    byId('vote-form').addEventListener('submit', handleRequestOtp);
    byId('otp-form').addEventListener('submit', handleConfirmOtp);
    byId('change-vote-btn').addEventListener('click', () => {
      state.selectedNomineeId = '';
      byId('vote-form').classList.add('hidden');
      document.querySelectorAll('.nominee-card').forEach(card => card.setAttribute('aria-checked', 'false'));
      const firstCard = document.querySelector('.nominee-card');
      if (firstCard) firstCard.focus();
    });
    byId('close-otp-modal').addEventListener('click', closeOtpModal);
    byId('otp-modal').addEventListener('click', event => {
      if (event.target.classList.contains('otp-modal__backdrop')) closeOtpModal();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !byId('otp-modal').classList.contains('hidden')) closeOtpModal();
    });
    loadVoting();
  });
}());
