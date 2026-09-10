const RESERVATION_STATE = {
  facilityId: '11a04b1e-8a1a-46aa-bbbe-1c8c2825831f',
  viewMode: 'modal',
  visibleYear: null,
  visibleMonth: null,
  availability: null,
  selectedDateKey: '',
  selectedSlot: null,
  otpRequestId: '',
  otpExpiresInMinutes: 10,
  loadToken: 0,
  locked: false,
  visibleSlotCount: 3
};

const LISBON_TIME_ZONE = 'Europe/Lisbon';
const MIN_RESERVATION_LEAD_HOURS = 6;
const FACILITIES_API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? ''
  : 'https://otw-clevvo-api-facilities-16e00f9e0ae9.herokuapp.com';

function apiRequest(path, options = {}) {
  return fetch(`${FACILITIES_API_BASE}${path}`, options).then(async (response) => {
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload || payload.success !== true) {
      const message =
        payload?.errorMessage ||
        (Array.isArray(payload?.validationMessages) && payload.validationMessages.length
          ? payload.validationMessages.join(' | ')
          : null) ||
        payload?.message ||
        'Não foi possível processar o pedido.';

      const error = new Error(message);
      error.errorCode = payload?.errorCode || null;
      throw error;
    }

    return payload;
  });
}

function getErrorMessage(error, fallback) {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return fallback;
}

function shouldRefreshAvailability(error) {
  const message = getErrorMessage(error, '').toLowerCase();
  const code = String(error?.errorCode || '').toLowerCase();

  return [
    'reservation_conflict',
    'outside_facility_schedule',
    'facility_capacity_exceeded'
  ].includes(code) || message.includes('conflito') || message.includes('ocup') || message.includes('capacidade') || message.includes('horário');
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function getLisbonParts(date) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: LISBON_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  });

  const parts = formatter.formatToParts(date);
  const lookup = {};

  parts.forEach((part) => {
    if (part.type !== 'literal') {
      lookup[part.type] = part.value;
    }
  });

  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
    hour: Number(lookup.hour),
    minute: Number(lookup.minute),
    second: Number(lookup.second)
  };
}

function getLisbonDateKey(date) {
  const parts = getLisbonParts(date);
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

function getLisbonWeekdayIndex(date) {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: LISBON_TIME_ZONE,
    weekday: 'short'
  }).format(date);

  const map = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6
  };

  return map[weekday] ?? 0;
}

function getLisbonMonthLabel(year, month) {
  const referenceDate = new Date(Date.UTC(year, month - 1, 15, 12, 0, 0));
  return new Intl.DateTimeFormat('pt-PT', {
    timeZone: LISBON_TIME_ZONE,
    month: 'long',
    year: 'numeric'
  }).format(referenceDate);
}

function formatLisbonDateLabel(date) {
  return new Intl.DateTimeFormat('pt-PT', {
    timeZone: LISBON_TIME_ZONE,
    weekday: 'long',
    day: '2-digit',
    month: 'long'
  }).format(date);
}

function formatLisbonTime(date) {
  return new Intl.DateTimeFormat('pt-PT', {
    timeZone: LISBON_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatLisbonDateTime(date) {
  return new Intl.DateTimeFormat('pt-PT', {
    timeZone: LISBON_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function getDayBoundsUtc(year, month, day) {
  const start = getUtcFromLisbonDateTime(year, month, day, 0, 0, 0);
  const end = getUtcFromLisbonDateTime(year, month, day + 1, 0, 0, 0);
  return { start, end };
}

function getUtcFromLisbonDateTime(year, month, day, hour, minute, second) {
  let utcTime = Date.UTC(year, month - 1, day, hour, minute, second);
  let lastDiff = 0;

  for (let i = 0; i < 4; i += 1) {
    const parts = getLisbonParts(new Date(utcTime));
    const comparison = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    const target = Date.UTC(year, month - 1, day, hour, minute, second);
    const diff = target - comparison;

    if (diff === 0 || diff === lastDiff) {
      break;
    }

    utcTime += diff;
    lastDiff = diff;
  }

  return new Date(utcTime);
}

function getMonthInfoFromDate(date) {
  const parts = getLisbonParts(date);
  return { year: parts.year, month: parts.month };
}

function addMonths(year, month, delta) {
  const nextDate = new Date(Date.UTC(year, month - 1 + delta, 1, 12, 0, 0));
  const parts = getLisbonParts(nextDate);
  return { year: parts.year, month: parts.month };
}

function getDaysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0, 12, 0, 0)).getUTCDate();
}

function intersectsPeriod(period, start, end) {
  const periodStart = new Date(period.startUtc).getTime();
  const periodEnd = new Date(period.endUtc).getTime();
  return periodEnd > start.getTime() && periodStart < end.getTime();
}

function buildHourlySlotsForDay(year, month, day) {
  if (!RESERVATION_STATE.availability) {
    return [];
  }

  const dayBounds = getDayBoundsUtc(year, month, day);
  const slotDurationMs = 60 * 60 * 1000;
  const cutoffUtc = getReservationCutoffUtc();
  const slots = [];
  const seen = new Set();

  (RESERVATION_STATE.availability.availablePeriods || [])
    .filter((period) => intersectsPeriod(period, dayBounds.start, dayBounds.end))
    .forEach((period) => {
      const periodStart = new Date(Math.max(new Date(period.startUtc).getTime(), dayBounds.start.getTime()));
      const periodEnd = new Date(Math.min(new Date(period.endUtc).getTime(), dayBounds.end.getTime()));

      for (
        let startMs = periodStart.getTime();
        startMs + slotDurationMs <= periodEnd.getTime();
        startMs += slotDurationMs
      ) {
        const endMs = startMs + slotDurationMs;
        if (startMs < cutoffUtc.getTime()) {
          continue;
        }

        const key = `${startMs}-${endMs}`;

        if (seen.has(key)) {
          continue;
        }

        seen.add(key);
        const displayStart = new Date(startMs);
        const displayEnd = new Date(endMs);

        slots.push({
          startUtc: displayStart.toISOString(),
          endUtc: displayEnd.toISOString(),
          displayStart,
          displayEnd,
          label: `${formatLisbonTime(displayStart)} - ${formatLisbonTime(displayEnd)}`
        });
      }
    });

  return slots.sort((a, b) => new Date(a.startUtc).getTime() - new Date(b.startUtc).getTime());
}

function getSelectedDayAvailability() {
  if (!RESERVATION_STATE.availability || !RESERVATION_STATE.selectedDateKey) {
    return [];
  }

  const parts = RESERVATION_STATE.selectedDateKey.split('-').map(Number);
  if (parts.length !== 3 || parts.some((value) => Number.isNaN(value))) {
    return [];
  }

  return buildHourlySlotsForDay(parts[0], parts[1], parts[2]);
}

function getMonthQueryRange(year, month) {
  const start = getUtcFromLisbonDateTime(year, month, 1, 0, 0, 0);
  const nextMonth = addMonths(year, month, 1);
  const end = getUtcFromLisbonDateTime(nextMonth.year, nextMonth.month, 1, 0, 0, 0);

  start.setUTCDate(start.getUTCDate() - 1);
  end.setUTCDate(end.getUTCDate() + 1);

  return { fromUtc: start.toISOString(), toUtc: end.toISOString() };
}

function getNextMonthFromToday() {
  const now = getLisbonParts(new Date());
  return addMonths(now.year, now.month, 1);
}

function getCurrentMonthFromToday() {
  const now = getLisbonParts(new Date());
  return { year: now.year, month: now.month };
}

function getReservationCutoffUtc() {
  return new Date(Date.now() + MIN_RESERVATION_LEAD_HOURS * 60 * 60 * 1000);
}

function showLoading() {
  document.getElementById('reservation-loading').classList.remove('hidden');
  document.getElementById('reservation-content').classList.add('hidden');
  document.getElementById('reservation-error').classList.add('hidden');
}

function showError(message) {
  const errorBox = document.getElementById('reservation-error');
  errorBox.textContent = message;
  errorBox.classList.remove('hidden');
  document.getElementById('reservation-loading').classList.add('hidden');
  document.getElementById('reservation-content').classList.add('hidden');
}

function setInlineError(id, message) {
  const box = document.getElementById(id);
  if (!message) {
    box.classList.add('hidden');
    box.textContent = '';
    return;
  }

  box.textContent = message;
  box.classList.remove('hidden');
}

function setButtonLoading(buttonId, loading, text) {
  const button = document.getElementById(buttonId);
  if (!button.dataset.originalHtml) {
    button.dataset.originalHtml = button.innerHTML;
  }

  button.disabled = loading;
  button.innerHTML = loading
    ? `<i class="fa-solid fa-spinner fa-spin"></i> ${text}`
    : button.dataset.originalHtml;
}

function setStep1Locked(locked) {
  RESERVATION_STATE.locked = locked;

  const ids = [
    'reservation-name',
    'reservation-email',
    'reservation-participants',
    'reservation-purpose',
    'reservation-prev-month',
    'reservation-next-month',
    'reservation-request-otp-btn'
  ];

  ids.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.disabled = locked;
    }
  });

  document.querySelectorAll('#reservation-calendar-grid button, #reservation-slot-list button').forEach((button) => {
    button.disabled = locked || button.disabled;
  });
}

function updateSummary() {
  const summary = document.getElementById('reservation-summary');
  const requestButton = document.getElementById('reservation-request-otp-btn');

  if (!RESERVATION_STATE.selectedSlot || !RESERVATION_STATE.selectedDateKey) {
    summary.classList.add('hidden');
    summary.textContent = '';
    requestButton.disabled = true;
    return;
  }

  const dayLabel = formatLisbonDateLabel(new Date(`${RESERVATION_STATE.selectedDateKey}T12:00:00Z`));
  summary.textContent = `Selecionaste ${dayLabel} entre ${RESERVATION_STATE.selectedSlot.label}.`;
  summary.classList.remove('hidden');
  requestButton.disabled = RESERVATION_STATE.locked;
}

function setSelectedSlot(slot) {
  RESERVATION_STATE.selectedSlot = slot;
  updateSummary();
  renderSlots();
}

function selectDay(dateKey) {
  RESERVATION_STATE.selectedDateKey = dateKey;
  RESERVATION_STATE.selectedSlot = null;

  document.getElementById('reservation-day-label').textContent = formatLisbonDateLabel(new Date(`${dateKey}T12:00:00Z`));
  renderCalendar();
  renderSlots();
  updateSummary();
}

function renderCalendar() {
  const grid = document.getElementById('reservation-calendar-grid');
  const monthLabel = document.getElementById('reservation-month-label');

  if (!RESERVATION_STATE.availability) {
    grid.innerHTML = '';
    monthLabel.textContent = '';
    return;
  }

  const { visibleYear: year, visibleMonth: month } = RESERVATION_STATE;
  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    grid.innerHTML = '';
    monthLabel.textContent = '';
    return;
  }

  monthLabel.textContent = getLisbonMonthLabel(year, month);

  const firstDayMidday = new Date(Date.UTC(year, month - 1, 1, 12, 0, 0));
  const firstWeekdayIndex = getLisbonWeekdayIndex(firstDayMidday);
  const totalDays = getDaysInMonth(year, month);
  const cells = [];

  for (let i = 0; i < firstWeekdayIndex; i += 1) {
    cells.push('<div class="aspect-square rounded-xl bg-transparent"></div>');
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const dayDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const dateKey = getLisbonDateKey(dayDate);
    const hasAvailability = buildHourlySlotsForDay(year, month, day).length > 0;
    const isSelected = dateKey === RESERVATION_STATE.selectedDateKey;
    const disabled = !hasAvailability || RESERVATION_STATE.locked;

    cells.push(`
      <button
        type="button"
        data-date-key="${dateKey}"
        class="aspect-square rounded-2xl border text-left p-2 md:p-3 transition ${
          isSelected
            ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-sm'
            : hasAvailability
              ? 'border-emerald-200 bg-white text-gray-900 hover:border-emerald-500 hover:shadow-sm'
              : 'border-gray-200 bg-gray-100 text-gray-400'
        } ${disabled ? 'cursor-not-allowed opacity-70' : ''}"
        ${disabled ? 'disabled' : ''}
        aria-pressed="${isSelected ? 'true' : 'false'}"
      >
        <span class="block text-xs font-semibold uppercase tracking-wide mb-1">${new Intl.DateTimeFormat('pt-PT', {
          timeZone: LISBON_TIME_ZONE,
          weekday: 'short'
        }).format(dayDate)}</span>
        <span class="block text-2xl font-black">${day}</span>
        <span class="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold ${hasAvailability ? 'text-emerald-700' : 'text-gray-400'}">
          <span class="w-2 h-2 rounded-full ${hasAvailability ? 'bg-emerald-600' : 'bg-gray-300'}"></span>
          ${hasAvailability ? 'Livre' : 'Ocupado'}
        </span>
      </button>
    `);
  }

  grid.innerHTML = cells.join('');

  grid.querySelectorAll('button[data-date-key]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.disabled) return;
      selectDay(button.dataset.dateKey);
    });
  });
}

function renderSlots() {
  const list = document.getElementById('reservation-slot-list');
  const emptyState = document.getElementById('reservation-slot-empty');
  const slots = getSelectedDayAvailability();

  if (!RESERVATION_STATE.selectedDateKey || slots.length === 0) {
    list.innerHTML = '';
    emptyState.classList.remove('hidden');
    document.getElementById('reservation-day-label').textContent = RESERVATION_STATE.selectedDateKey
      ? formatLisbonDateLabel(new Date(`${RESERVATION_STATE.selectedDateKey}T12:00:00Z`))
      : 'Seleciona um dia';
    return;
  }

  emptyState.classList.add('hidden');
  const visibleCount = Math.max(3, RESERVATION_STATE.visibleSlotCount || 3);
  const visibleSlots = slots.slice(0, visibleCount);
  const hasMoreSlots = slots.length > visibleCount;

  list.innerHTML = slots
    .slice(0, visibleCount)
    .map((slot) => {
      const isSelected =
        RESERVATION_STATE.selectedSlot &&
        RESERVATION_STATE.selectedSlot.startUtc === slot.startUtc &&
        RESERVATION_STATE.selectedSlot.endUtc === slot.endUtc;

      return `
        <button
          type="button"
          class="w-full rounded-xl border px-4 py-3 text-left transition ${
            isSelected
              ? 'border-amber-400 bg-amber-50 text-amber-900'
              : 'border-emerald-200 bg-white text-gray-900 hover:border-emerald-500 hover:bg-emerald-50'
          } ${RESERVATION_STATE.locked ? 'cursor-not-allowed opacity-70' : ''}"
          ${RESERVATION_STATE.locked ? 'disabled' : ''}
          data-slot-start="${slot.startUtc}"
          data-slot-end="${slot.endUtc}"
        >
          <span class="block text-sm font-bold">${slot.label}</span>
          <span class="block text-xs text-gray-500 mt-1">Slot livre de 1 hora disponível para pedido de reserva</span>
        </button>
      `;
    })
    .join('');

  if (hasMoreSlots) {
    list.insertAdjacentHTML(
      'beforeend',
      `
        <button
          type="button"
          id="reservation-show-more-slots"
          class="w-full rounded-xl border border-dashed border-emerald-300 bg-emerald-50 px-4 py-3 text-left text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
        >
          Mostrar mais 3 horários
        </button>
      `
    );
  }

  list.querySelectorAll('button[data-slot-start]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.disabled) return;
      setSelectedSlot({
        startUtc: button.dataset.slotStart,
        endUtc: button.dataset.slotEnd,
        label: button.querySelector('span').textContent
      });
    });
  });

  const showMoreButton = document.getElementById('reservation-show-more-slots');
  if (showMoreButton) {
    showMoreButton.addEventListener('click', () => {
      RESERVATION_STATE.visibleSlotCount = Math.min(slots.length, visibleCount + 3);
      renderSlots();
    });
  }
}

function selectInitialDay() {
  if (!RESERVATION_STATE.availability) return;

  const { visibleYear: year, visibleMonth: month } = RESERVATION_STATE;
  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    RESERVATION_STATE.selectedDateKey = '';
    return;
  }

  const totalDays = getDaysInMonth(year, month);

  for (let day = 1; day <= totalDays; day += 1) {
    const hasAvailability = buildHourlySlotsForDay(year, month, day).length > 0;

    if (hasAvailability) {
      const dateKey = `${year}-${pad(month)}-${pad(day)}`;
      RESERVATION_STATE.selectedDateKey = dateKey;
      RESERVATION_STATE.visibleSlotCount = 3;
      document.getElementById('reservation-day-label').textContent = formatLisbonDateLabel(
        new Date(`${dateKey}T12:00:00Z`)
      );
      return;
    }
  }

  RESERVATION_STATE.selectedDateKey = '';
  RESERVATION_STATE.visibleSlotCount = 3;
}

async function loadAvailability() {
  const token = ++RESERVATION_STATE.loadToken;
  showLoading();

  const { visibleYear: year, visibleMonth: month } = RESERVATION_STATE;
  const query = getMonthQueryRange(year, month);

  try {
    const payload = await apiRequest(
      `/api/facilities/public/${encodeURIComponent(RESERVATION_STATE.facilityId)}/availability?fromUtc=${encodeURIComponent(query.fromUtc)}&toUtc=${encodeURIComponent(query.toUtc)}`
    );

    if (token !== RESERVATION_STATE.loadToken) {
      return;
    }

    RESERVATION_STATE.availability = payload.content || null;
    document.getElementById('reservation-loading').classList.add('hidden');
    document.getElementById('reservation-content').classList.remove('hidden');

    const monthInfo = getMonthInfoFromDate(new Date(Date.UTC(year, month - 1, 1, 12, 0, 0)));
    RESERVATION_STATE.visibleYear = monthInfo.year;
    RESERVATION_STATE.visibleMonth = monthInfo.month;

    if (!RESERVATION_STATE.selectedDateKey) {
      selectInitialDay();
    }

    renderCalendar();
    renderSlots();
    updateSummary();
    setInlineError('reservation-step1-error', '');
    setInlineError('reservation-step2-error', '');
    document.getElementById('reservation-success').classList.add('hidden');
  } catch (error) {
    if (token !== RESERVATION_STATE.loadToken) {
      return;
    }

    showError(getErrorMessage(error, 'Não foi possível carregar a disponibilidade do pavilhão.'));
  }
}

function resetOtpFlow() {
  RESERVATION_STATE.otpRequestId = '';
  RESERVATION_STATE.otpExpiresInMinutes = 10;
  document.getElementById('reservation-otp-form').classList.add('hidden');
  document.getElementById('reservation-otp-code').value = '';
  document.getElementById('reservation-success').classList.add('hidden');
}

function openReservationModal() {
  const modal = document.getElementById('reservationModal');
  if (RESERVATION_STATE.viewMode === 'page') {
    return;
  }

  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  const currentMonth = getCurrentMonthFromToday();
  RESERVATION_STATE.visibleYear = currentMonth.year;
  RESERVATION_STATE.visibleMonth = currentMonth.month;
  RESERVATION_STATE.selectedDateKey = '';
  RESERVATION_STATE.selectedSlot = null;
  RESERVATION_STATE.availability = null;
  resetOtpFlow();

  document.getElementById('reservation-request-form').reset();
  document.getElementById('reservation-participants').value = '1';
  document.getElementById('reservation-day-label').textContent = 'Seleciona um dia';
  document.getElementById('reservation-calendar-grid').innerHTML = '';
  document.getElementById('reservation-slot-list').innerHTML = '';
  document.getElementById('reservation-slot-empty').classList.remove('hidden');
  updateSummary();
  setStep1Locked(false);
  loadAvailability();
}

function closeReservationModal() {
  const modal = document.getElementById('reservationModal');
  if (RESERVATION_STATE.viewMode === 'page') {
    window.location.href = 'pavilhao.html';
    return;
  }

  if (modal) {
    modal.classList.add('hidden');
  }
  document.body.style.overflow = 'auto';
}

async function handleReservationRequest(event) {
  event.preventDefault();
  setInlineError('reservation-step1-error', '');
  setInlineError('reservation-step2-error', '');

  if (!RESERVATION_STATE.selectedSlot) {
    setInlineError('reservation-step1-error', 'Seleciona um horário livre no calendário.');
    return;
  }

  const name = document.getElementById('reservation-name').value.trim();
  const email = document.getElementById('reservation-email').value.trim();
  const participants = Number(document.getElementById('reservation-participants').value);
  const purpose = document.getElementById('reservation-purpose').value.trim();

  if (!name || !email || !purpose || !Number.isFinite(participants) || participants < 1) {
    setInlineError('reservation-step1-error', 'Preenche o nome, email, finalidade e número de participantes.');
    return;
  }

  const payload = {
    facilityId: RESERVATION_STATE.facilityId,
    requesterName: name,
    requesterEmail: email,
    purpose,
    participantCount: participants,
    startUtc: RESERVATION_STATE.selectedSlot.startUtc,
    endUtc: RESERVATION_STATE.selectedSlot.endUtc,
    recurrence: null
  };

  setButtonLoading('reservation-request-otp-btn', true, 'A enviar OTP...');

  try {
    const result = await apiRequest('/api/reservations/public/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    RESERVATION_STATE.otpRequestId = result.content.otpRequestId;
    RESERVATION_STATE.otpExpiresInMinutes = result.content.expiresInMinutes || 10;

    document.getElementById('reservation-otp-info').textContent = `Enviámos um código para ${result.content.email || email}. Expira em ${RESERVATION_STATE.otpExpiresInMinutes} minutos.`;
    document.getElementById('reservation-otp-form').classList.remove('hidden');
    document.getElementById('reservation-otp-code').focus();
    setStep1Locked(true);
  } catch (error) {
    setInlineError('reservation-step1-error', getErrorMessage(error, 'Não foi possível pedir o código OTP.'));
    if (shouldRefreshAvailability(error)) {
      RESERVATION_STATE.selectedDateKey = '';
      RESERVATION_STATE.selectedSlot = null;
      document.getElementById('reservation-day-label').textContent = 'Seleciona um dia';
      updateSummary();
      await loadAvailability();
    }
  } finally {
    setButtonLoading('reservation-request-otp-btn', false, 'Pedir código OTP');
  }
}

function resetReservationViewport() {
  const currentMonth = getCurrentMonthFromToday();
  RESERVATION_STATE.visibleYear = currentMonth.year;
  RESERVATION_STATE.visibleMonth = currentMonth.month;
  RESERVATION_STATE.selectedDateKey = '';
  RESERVATION_STATE.selectedSlot = null;
  RESERVATION_STATE.availability = null;
  RESERVATION_STATE.otpRequestId = '';
  RESERVATION_STATE.otpExpiresInMinutes = 10;
  RESERVATION_STATE.visibleSlotCount = 3;
}

async function openReservationPanel() {
  const modal = document.getElementById('reservationModal');
  if (!modal || RESERVATION_STATE.viewMode !== 'tab') {
    return;
  }

  resetReservationViewport();
  document.body.style.overflow = 'auto';
  await loadAvailability();
}

async function handleReservationConfirm(event) {
  event.preventDefault();
  setInlineError('reservation-step2-error', '');

  const otpCode = document.getElementById('reservation-otp-code').value.trim();

  if (!RESERVATION_STATE.otpRequestId) {
    setInlineError('reservation-step2-error', 'Primeiro tens de pedir o código OTP.');
    return;
  }

  if (!/^\d{6}$/.test(otpCode)) {
    setInlineError('reservation-step2-error', 'Introduz um código OTP de 6 dígitos.');
    return;
  }

  setButtonLoading('reservation-confirm-otp-btn', true, 'A confirmar...');

  try {
    const result = await apiRequest('/api/reservations/public/confirm-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        otpRequestId: RESERVATION_STATE.otpRequestId,
        otpCode
      })
    });

    const content = result.content || {};
    const reference = content.reservationCode || content.code || content.id || '-';

    document.getElementById('reservation-otp-form').classList.add('hidden');
    RESERVATION_STATE.selectedDateKey = '';
    RESERVATION_STATE.selectedSlot = null;
    document.getElementById('reservation-day-label').textContent = 'Seleciona um dia';
    updateSummary();
    setStep1Locked(true);
    await loadAvailability();
    document.getElementById('reservation-success-text').textContent = `O pedido foi confirmado com sucesso. Referência: ${reference}.`;
    document.getElementById('reservation-success').classList.remove('hidden');
  } catch (error) {
    setInlineError('reservation-step2-error', getErrorMessage(error, 'Não foi possível confirmar o pedido.'));
    if (shouldRefreshAvailability(error)) {
      RESERVATION_STATE.otpRequestId = '';
      RESERVATION_STATE.selectedDateKey = '';
      RESERVATION_STATE.selectedSlot = null;
      document.getElementById('reservation-day-label').textContent = 'Seleciona um dia';
      updateSummary();
      document.getElementById('reservation-otp-form').classList.add('hidden');
      setStep1Locked(false);
      await loadAvailability();
    }
  } finally {
    setButtonLoading('reservation-confirm-otp-btn', false, 'Confirmar pedido');
  }
}

function initReservationModal() {
  const modal = document.getElementById('reservationModal');
  if (!modal) return;

  if (modal.dataset.reservationView === 'page') {
    RESERVATION_STATE.viewMode = 'page';
  } else if (modal.dataset.reservationView === 'tab') {
    RESERVATION_STATE.viewMode = 'tab';
  } else {
    RESERVATION_STATE.viewMode = 'modal';
  }

  document.getElementById('reservation-request-form').addEventListener('submit', handleReservationRequest);
  document.getElementById('reservation-otp-form').addEventListener('submit', handleReservationConfirm);
  document.getElementById('reservation-prev-month').addEventListener('click', () => {
    if (RESERVATION_STATE.locked) return;
    const next = addMonths(RESERVATION_STATE.visibleYear, RESERVATION_STATE.visibleMonth, -1);
    RESERVATION_STATE.visibleYear = next.year;
    RESERVATION_STATE.visibleMonth = next.month;
    RESERVATION_STATE.selectedDateKey = '';
    RESERVATION_STATE.selectedSlot = null;
    document.getElementById('reservation-day-label').textContent = 'Seleciona um dia';
    loadAvailability();
  });

  document.getElementById('reservation-next-month').addEventListener('click', () => {
    if (RESERVATION_STATE.locked) return;
    const next = addMonths(RESERVATION_STATE.visibleYear, RESERVATION_STATE.visibleMonth, 1);
    RESERVATION_STATE.visibleYear = next.year;
    RESERVATION_STATE.visibleMonth = next.month;
    RESERVATION_STATE.selectedDateKey = '';
    RESERVATION_STATE.selectedSlot = null;
    document.getElementById('reservation-day-label').textContent = 'Seleciona um dia';
    loadAvailability();
  });

  if (RESERVATION_STATE.viewMode === 'modal') {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeReservationModal();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeReservationModal();
      }
    });
  } else {
    resetReservationViewport();
    document.body.style.overflow = 'auto';
  }

  document.getElementById('reservation-otp-code').addEventListener('input', (event) => {
    event.target.value = event.target.value.replace(/\D/g, '').slice(0, 6);
  });

  window.openReservationModal = openReservationModal;
  window.closeReservationModal = closeReservationModal;
  window.openReservationPanel = openReservationPanel;
}

document.addEventListener('DOMContentLoaded', initReservationModal);
