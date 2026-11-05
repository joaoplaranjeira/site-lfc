// Session status updater
(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Session dates
  const sessions = [
    { id: 'session1-badge', date: new Date('2025-11-12') },
    { id: 'session2-badge', date: new Date('2026-02-11') },
    { id: 'session3-badge', date: new Date('2026-05-14') }, // Formação Futebol
    { id: 'session4-badge', date: new Date('2026-06-01') }  // Placeholder for June
  ];
  
  sessions.forEach(session => {
    const badge = document.getElementById(session.id);
    if (badge) {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      
      if (today.getTime() === sessionDate.getTime()) {
        // Today
        badge.className = 'inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold mb-3';
        badge.textContent = 'HOJE';
      } else if (today > sessionDate) {
        // Past
        badge.className = 'inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold mb-3';
        badge.textContent = 'REALIZADA';
      } else {
        // Future
        badge.className = 'inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold mb-3';
        badge.textContent = 'EM BREVE';
      }
    }
  });
})();

// Convite para a votação da Gala do Desporto 2026, exclusivo da página inicial.
(function () {
  'use strict';

  const EVENT_CODE = 'GALA-DESPORTO-2026';
  const DISPLAY_DURATION_MS = 5000;
  const API_BASE_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? ''
    : 'https://otw-clevvo-api-events-b91905bb79ee.herokuapp.com';
  const popup = document.getElementById('event-voting-popup');
  if (!popup) return;

  const closeButton = document.getElementById('event-voting-popup-close');
  const cta = document.getElementById('event-voting-popup-cta');
  const eventLabel = popup.querySelector('.event-voting-popup__event');
  let closeTimer = null;
  let closing = false;

  function wait(milliseconds) {
    return new Promise(resolve => window.setTimeout(resolve, milliseconds));
  }

  function isVotingOpen(event) {
    if (!event || event.isVotingActive !== true) return false;
    if (typeof event.status === 'string' && event.status.toLowerCase() !== 'published') return false;

    const now = Date.now();
    const start = event.votingStartDateTime ? new Date(event.votingStartDateTime).getTime() : Number.NaN;
    const end = event.votingEndDateTime ? new Date(event.votingEndDateTime).getTime() : Number.NaN;
    if (!Number.isNaN(start) && now < start) return false;
    if (!Number.isNaN(end) && now > end) return false;
    return true;
  }

  async function getEvent() {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/Event/public/code/${encodeURIComponent(EVENT_CODE)}`,
          { cache: 'no-store', headers: { Accept: 'application/json' } }
        );
        if (response.status === 429 && attempt < 2) {
          await wait(1000 * (attempt + 1));
          continue;
        }
        if (!response.ok) return null;

        const result = await response.json().catch(() => null);
        return result && result.success === true ? result.content : null;
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  function closePopup() {
    if (closing || popup.hidden) return;
    closing = true;
    window.clearTimeout(closeTimer);
    popup.classList.remove('is-visible');
    popup.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => {
      popup.hidden = true;
    }, 450);
  }

  function showPopup(event) {
    if (event.name) eventLabel.textContent = event.name;
    popup.hidden = false;
    popup.setAttribute('aria-hidden', 'false');
    window.requestAnimationFrame(() => popup.classList.add('is-visible'));
    closeTimer = window.setTimeout(closePopup, DISPLAY_DURATION_MS);
  }

  closeButton.addEventListener('click', closePopup);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !popup.hidden) closePopup();
  });
  cta.addEventListener('click', () => {
    window.clearTimeout(closeTimer);
    if (typeof gtag === 'function') {
      gtag('event', 'event_voting_popup_click', {
        event_category: 'engagement',
        event_label: EVENT_CODE
      });
    }
  });

  getEvent().then(event => {
    if (isVotingOpen(event)) showPopup(event);
  });
})();
