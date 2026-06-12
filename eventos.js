// URL base da API (sempre usado)
const API_BASE_URL = 'https://otw-clevvo-api-events-b91905bb79ee.herokuapp.com';

// Events data structure
const eventsData = {
  clube: [
    {
      id: 1,
      title: "Juntos por Leiria - Solidariedade com as Vítimas da Tempestade Kristin",
      date: "2026-02-02",
      endDate: "2026-02-07",
      time: "Todo o dia",
      location: "Estádio do Leça Futebol Clube",
      description: "Campanha de recolha de bens materiais para entregar à população na zona de Leiria afetada pela tempestade Kristin. Decorre entre 2 e 7 de Fevereiro de 2026.",
      type: "solidario",
      status: "ongoing",
      image: "fa-hand-holding-heart",
      link: null
    },
    {
      id: 2,
      title: "Jantar do 114º Aniversário do Leça Futebol Clube",
      date: "2026-03-21",
      time: "20:00",
      location: "Hotel Tryp Porto Expo (Leça da Palmeira)",
      description: "Celebração do 114º aniversário do Leça Futebol Clube com jantar para sócios, dirigentes e convidados.",
      type: "jantar",
      status: "upcoming",
      image: null,
      link: null,
      registration: {
        eventCode: "EVT-001"
      }
    },
    {
      id: 3,
      title: "Jogo das Estrelas",
      date: "2026-03-28",
      time: "16:00 - 19:30",
      location: "Pavilhão Municipal de Leça da Palmeira",
      description: "Jogo com ex-atletas das modalidades de Basquetebol e Andebol do clube.",
      type: "default",
      status: "completed",
      image: null,
      link: "galeria.html?id=jogo-estrelas-2026"
    },
    {
      id: 4,
      title: "Entrega de Diplomas de Excelência",
      date: "2025-12-02",
      time: "19:00",
      location: "Estádio do Leça Futebol Clube",
      description: "Cerimónia de entrega de diplomas de excelência aos atletas.",
      type: "default",
      status: "completed",
      image: null,
      link: null
    },
    {
      id: 5,
      title: "Campanha de Angariação de Leite",
      date: "2025-11-26",
      time: "Todo o dia",
      location: "Vários locais",
      description: "Campanha de angariação de leite para ajuda nas ceias solidárias organizada pela Junta de Freguesia de Leça da Palmeira. Decorre entre 26 de Novembro e 6 de Dezembro de 2025.",
      type: "default",
      status: "completed",
      image: null,
      link: null
    },
    {
      id: 6,
      title: "Kick Off Leceiro",
      date: "2025-10-25",
      time: "16:30",
      location: "Bitbar em Leça da Palmeira",
      description: "Evento de abertura da época desportiva com convívio entre dirigentes e equipas técnicas de todas as modalidades.",
      type: "default",
      status: "completed",
      image: null,
      link: null
    },
    {
      id: 7,
      title: "Entrega e Benção da Carrinha da Leça Academia 1912",
      date: "2025-09-29",
      time: "19:00",
      location: "Igreja Paroquial de Leça da Palmeira",
      description: "Cerimónia de entrega e benção da nova carrinha da Leça Academia 1912.",
      type: "default",
      status: "completed",
      image: null,
      link: null
    },
    {
      id: 8,
      title: "Evento Decathlon PlaySport",
      date: "2025-09-20",
      time: "Todo o dia",
      location: "Decathlon Matosinhos",
      description: "Participação do clube no evento Decathlon PlaySport nos dias 20 e 21 de Setembro.",
      type: "default",
      status: "completed",
      image: null,
      link: null
    },
    {
      id: 9,
      title: "Assembleia Geral Ordinária",
      date: "2025-09-18",
      time: "20:30",
      location: "Salão Nobre da Junta de Freguesia de Leça da Palmeira",
      description: "Assembleia Geral Ordinária para aprovação de contas e apresentação de documentos anuais.",
      type: "assembleia",
      status: "completed",
      image: null,
      link: null
    },
    {
      id: 10,
      title: "Assembleia Geral Extraordinária",
      date: "2025-09-18",
      time: "20:30",
      location: "Salão Nobre da Junta de Freguesia de Leça da Palmeira",
      description: "Assembleia Geral Extraordinária para deliberação sobre assuntos de interesse do clube.",
      type: "assembleia",
      status: "completed",
      image: null,
      link: null
    },
    {
      id: 11,
      title: "Homenagem ao Sócio Leonardo Soares",
      date: "2025-09-14",
      time: "15:00",
      location: "Estádio do Leça Futebol Clube",
      description: "Homenagem ao sócio Leonardo Soares, sócio número 4, no âmbito das homenagens a sócios com mais de 90 anos de idade.",
      type: "default",
      status: "completed",
      image: null,
      link: null
    },
    {
      id: 12,
      title: "Entrega de Camisola para Torneio Solidário",
      date: "2025-09-07",
      time: "A definir",
      location: "Vila do Conde",
      description: "Entrega de camisola para leiloar no âmbito do torneio solidário 'Todos Juntos pelo Filipe Ferreira'.",
      type: "default",
      status: "completed",
      image: null,
      link: null
    },
    {
      id: 13,
      title: "Hastear da Bandeira - 114º Aniversário",
      date: "2026-03-20",
      time: "A definir",
      location: "Estádio do Leça Futebol Clube",
      description: "Cerimónia de hastear da bandeira para assinalar o 114º aniversário do Leça Futebol Clube.",
      type: "default",
      status: "upcoming",
      image: null,
      link: null
    },
    {
      id: 14,
      title: "Talk Club - 1ª Sessão",
      date: "2025-11-12",
      time: "A definir",
      location: "Estádio do Leça Futebol Clube",
      description: "Primeira sessão do Talk Club - conversas com os sócios sobre modalidades e património. Ver mais detalhes na página do Talk Club.",
      type: "default",
      status: "completed",
      image: null,
      link: "talkclub.html"
    },
    {
      id: 15,
      title: "Talk Club - 2ª Sessão",
      date: "2026-02-11",
      time: "21:00",
      location: "Centro de Dia da 3ª Idade da Junta de Freguesia de Leça da Palmeira",
      description: "Segunda sessão do Talk Club - conversas com os sócios sobre modalidades e património. Ver mais detalhes na página do Talk Club.",
      type: "default",
      status: "upcoming",
      image: null,
      link: "talkclub.html"
    },
    {
      id: 16,
      title: "Assembleia Geral Ordinária e Extraordinária",
      date: "2026-01-31",
      time: "14:30",
      location: "Local a definir",
      description: "Assembleia Geral Ordinária e Extraordinária para deliberação sobre assuntos de interesse do clube.",
      type: "assembleia",
      status: "upcoming",
      image: null,
      link: "documents/events/conv_ago_age_31012026.pdf"
    },
    {
      id: 17,
      title: "2º Torneio Jovem de Xadrez",
      date: "2026-01-04",
      time: "14:00 - 18:00",
      location: "Local a definir",
      description: "Segundo torneio jovem de xadrez organizado pelo clube.",
      type: "default",
      status: "completed",
      image: null,
      link: null
    },
    {
      id: 18,
      title: "2º Torneio Os Palmeirinhas",
      date: "2025-12-27",
      time: "10:00 - 13:00",
      location: "Local a definir",
      description: "Segundo torneio Os Palmeirinhas.",
      type: "default",
      status: "completed",
      image: null,
      link: null
    },
    {
      id: 19,
      title: "Festa de Natal da Patinagem Artística",
      date: "2025-12-20",
      time: "15:00 - 18:00",
      location: "Local a definir",
      description: "Festa de Natal da modalidade de Patinagem Artística.",
      type: "default",
      status: "completed",
      image: null,
      link: null
    },
    {
      id: 21,
      title: "Visita Guiada ao Museu Custódio Antunes",
      date: "2026-05-16",
      time: "11:00",
      location: "Museu Custódio Antunes (Pavilhão Custódio Antunes)",
      description: "Mergulha na história do Leça FC! Junta-te a nós numa visita guiada ao Museu Custódio Antunes e descobre os momentos, figuras e conquistas que moldaram a identidade do nosso clube ao longo de mais de um século.",
      type: "default",
      status: "upcoming",
      image: null,
      link: null,
      registration: {
        eventCode: "EVT-002"
      }
    },
    {
      id: 20,
      title: "Cerimónia de Entrega dos Cartões de Platina, Ouro e Prata",
      date: "2026-05-09",
      time: "10:00 - 13:00",
      location: "Museu Custódio Antunes (Pavilhão Custódio Antunes)",
      description: "Cerimónia de entrega dos cartões de reconhecimento de Platina, Ouro e Prata aos sócios.",
      type: "default",
      status: "upcoming",
      image: null,
      link: null,
      alerts: [
        {
          type: "important",
          title: "Nota aos Sócios",
          message: "Os sócios com mais de 25 anos de associado devem atualizar o seu contacto e foto até dia 20 de Abril em www.lecafutebolclube.com ou através do número 913 467 588."
        }
      ]
    },
    {
      id: 22,
      title: "Sessão de Esclarecimento dos Novos Estatutos e Regulamento Interno",
      date: "2026-06-18",
      time: "21:00",
      location: "Sala Concerto do Salão Paroquial de Leça da Palmeira",
      description: "Sessão de esclarecimento dedicada aos novos Estatutos e Regulamento Interno do Leça Futebol Clube.",
      type: "assembleia",
      status: "upcoming",
      image: null,
      link: null
    },
    {
      id: 23,
      title: "Assembleia Geral Ordinária",
      date: "2026-06-20",
      time: "14:00",
      location: "Salão Nobre da Junta de Freguesia de Leça da Palmeira",
      description: "Assembleia Geral Ordinária do Leça Futebol Clube.",
      type: "assembleia",
      status: "upcoming",
      image: null,
      link: "documents/convocations/conv_ago_20062026.pdf"
    },
    {
      id: 24,
      title: "Assembleia Geral Extraordinária",
      date: "2026-06-20",
      time: "15:00",
      location: "Salão Nobre da Junta de Freguesia de Leça da Palmeira",
      description: "Assembleia Geral Extraordinária do Leça Futebol Clube.",
      type: "assembleia",
      status: "upcoming",
      image: null,
      link: "documents/convocations/conv_age_20062026.pdf"
    }
  ],
  institucionais: [
    {
      id: 25,
      title: "Tarde Verde em Homenagem ao Leça Futebol Clube",
      date: "2026-06-06",
      time: "16:30", em Homenagem ao Leça Futebol Clube, organizada pela Associação de Amigos Aposentados de Leça da Palmeira.",
      type: "default",
      status: "completed",
      image: null,
      link: null
    },
    {
      id: 20,
      title: "90º Aniversário do Rancho Típico da Amorosa",
      date: "2025-11-08",
      time: "21:00",
      location: "Sede do Rancho Típico da Amorosa",
      description: "Presença na cerimónia para celebrar o 90º aniversário do Rancho Típico da Amorosa.",
      type: "aniversario",
      status: "completed",
      image: null,
      link: null
    },
    {
      id: 21,
      title: "Tomada de Posse dos Órgãos Autárquicos",
      date: "2025-10-31",
      time: "A definir",
      location: "Auditório do Salão Paroquial de Leça da Palmeira",
      description: "Presença na tomada de posse dos novos órgãos autárquicos da Junta de Freguesia de Leça da Palmeira.",
      type: "default",
      status: "completed",
      image: null,
      link: null
    },
    {
      id: 22,
      title: "Receção de Comitivas Candidatas aos Órgãos Autárquicos",
      date: "2025-09-22",
      time: "Vários horários",
      location: "Estádio do Leça Futebol Clube",
      description: "Receção das comitivas candidatas aos órgãos autárquicos de Leça da Palmeira e Matosinhos. Evento decorreu entre 22 e 26 de Setembro de 2025.",
      type: "default",
      status: "completed",
      image: null,
      link: null
    },
    {
      id: 23,
      title: "Inauguração do 1º Campo da AF Porto",
      date: "2025-09-15",
      time: "15:00",
      location: "Complexo de Treinos da Associação de Futebol do Porto (Prelada)",
      description: "Participação do clube na cerimónia de inauguração do 1º campo da Associação de Futebol do Porto.",
      type: "default",
      status: "completed",
      image: null,
      link: null
    }
  ]
};

const publicEventCache = {};

function isPublishedStatus(status) {
  return String(status || '').toLowerCase() === 'published';
}

function isDraftStatus(status) {
  return String(status || '').toLowerCase() === 'draft';
}

function hasCapacityAvailable(apiEvent) {
  const capacityMax = Number(apiEvent?.capacityMax);
  const registrationsCount = Number(apiEvent?.registrationsCount || 0);

  if (!Number.isFinite(capacityMax) || capacityMax <= 0) {
    return true;
  }

  return registrationsCount < capacityMax;
}

function getRegistrationAvailability(apiEvent) {
  if (!apiEvent) {
    return {
      canRegister: false,
      reason: 'As inscrições estão indisponíveis no momento.'
    };
  }

  if (!isPublishedStatus(apiEvent.status)) {
    return {
      canRegister: false,
      reason: isDraftStatus(apiEvent.status) 
        ? 'As inscrições ainda não abriram.'
        : 'As inscrições não estão disponíveis neste momento.'
    };
  }

  if (!hasCapacityAvailable(apiEvent)) {
    const registrationsCount = Number(apiEvent.registrationsCount || 0);
    const capacityMax = Number(apiEvent.capacityMax);

    return {
      canRegister: false,
      reason: `Inscrições encerradas (lotação atingida: ${registrationsCount}/${capacityMax}).`
    };
  }

  return {
    canRegister: true,
    reason: ''
  };
}

async function fetchPublicEventByCode(eventCode) {
  if (!eventCode) {
    return null;
  }

  if (publicEventCache[eventCode]) {
    return publicEventCache[eventCode];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/Event/public/code/${encodeURIComponent(eventCode)}`);
    const payload = await response.json();

    if (!response.ok || !payload?.success || !payload?.content) {
      publicEventCache[eventCode] = null;
      return null;
    }

    publicEventCache[eventCode] = payload.content;
    return payload.content;
  } catch (error) {
    console.error(`Error fetching public event by code ${eventCode}:`, error);
    publicEventCache[eventCode] = null;
    return null;
  }
}

async function enrichEventsWithRegistrationAvailability(events) {
  const eventsWithRegistration = events.filter(event => event.registration?.eventCode);

  await Promise.all(
    eventsWithRegistration.map(async (event) => {
      const apiEvent = await fetchPublicEventByCode(event.registration.eventCode);
      const availability = getRegistrationAvailability(apiEvent);

      event.registration = {
        ...event.registration,
        apiEvent,
        canRegister: availability.canRegister,
        unavailableReason: availability.reason
      };
    })
  );
}

// Tab switching function
function showTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.add('hidden');
  });
  
  // Remove active class from all buttons
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('active', 'bg-white', 'text-emerald-700');
    button.classList.add('bg-white/20', 'text-white');
  });
  
  // Show selected tab content
  document.getElementById('content-' + tabName).classList.remove('hidden');
  
  // Add active class to selected button
  const activeButton = document.getElementById('tab-' + tabName);
  activeButton.classList.add('active', 'bg-white', 'text-emerald-700');
  activeButton.classList.remove('bg-white/20', 'text-white');
  
  // Load data for the selected tab
  if (tabName === 'clube') {
    loadClubeEvents();
  } else if (tabName === 'institucionais') {
    loadInstitucionaisEvents();
  }
}

// Format date to Portuguese format
function parseEventDate(dateString) {
  if (!dateString) {
    return new Date(NaN);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(dateString);
}

function formatDate(dateString) {
  const date = parseEventDate(dateString);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${dayName}, ${day} ${month} ${year}`;
}

// Get event type icon
// Render alert/notification banners for events
function renderEventAlerts(alerts) {
  if (!alerts || alerts.length === 0) return '';
  
  const alertStyles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'fa-circle-info',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      textColor: 'text-blue-800'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'fa-triangle-exclamation',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      titleColor: 'text-amber-900',
      textColor: 'text-amber-800'
    },
    important: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'fa-bell',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      titleColor: 'text-orange-900',
      textColor: 'text-orange-800'
    },
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: 'fa-circle-check',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      titleColor: 'text-emerald-900',
      textColor: 'text-emerald-800'
    }
  };
  
  return alerts.map(alert => {
    const style = alertStyles[alert.type] || alertStyles.info;
    return `
      <div class="${style.bg} ${style.border} border rounded-lg p-4 mb-3">
        <div class="flex items-start gap-3">
          <div class="${style.iconBg} rounded-full p-2 flex-shrink-0">
            <i class="fa-solid ${style.icon} ${style.iconColor} text-sm"></i>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-bold ${style.titleColor} text-sm mb-1">${alert.title}</h4>
            <p class="${style.textColor} text-sm leading-relaxed">${alert.message}</p>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function getEventIcon(type) {
  const icons = {
    'jantar': 'fa-utensils',
    'assembleia': 'fa-users',
    'conferencia': 'fa-microphone',
    'aniversario': 'fa-cake-candles',
    'solidario': 'fa-hands-holding-heart',
    'default': 'fa-calendar-check'
  };
  return icons[type] || icons['default'];
}

// Get event status badge
function getStatusBadge(status) {
  const badges = {
    'upcoming': '<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">Próximo</span>',
    'ongoing': '<span class="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">A decorrer</span>',
    'completed': '<span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Realizado</span>',
    'cancelled': '<span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Cancelado</span>'
  };
  return badges[status] || '';
}

// Render event card
function renderEventCard(event) {
  const icon = event.image || getEventIcon(event.type);
  const statusBadge = getStatusBadge(event.status);
  const isUpcoming = event.status === 'upcoming';
  const isOngoing = event.status === 'ongoing';
  const bgColor = isOngoing ? 'bg-orange-50' : (isUpcoming ? 'bg-emerald-50' : 'bg-gray-50');
  const iconBg = isOngoing ? 'bg-orange-600' : (isUpcoming ? 'bg-emerald-700' : 'bg-gray-400');
  
  const registrationButton = event.registration?.canRegister
    ? `
      <a href="evento-inscricao.html?code=${encodeURIComponent(event.registration.eventCode)}" class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition text-sm font-semibold">
        <i class="fa-solid fa-ticket"></i>
        Inscrição
      </a>
    `
    : '';

  const registrationUnavailableMessage = event.registration && !event.registration.canRegister
    ? `<p class="text-sm text-emerald-700 font-semibold">${event.registration.unavailableReason || 'Inscrições indisponíveis.'}</p>`
    : '';

  return `
    <div class="${bgColor} rounded-lg p-4 md:p-6 hover:shadow-md transition">
      <div class="flex items-start gap-3 md:gap-4">
        <div class="w-12 h-12 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0">
          <i class="fa-solid ${icon} text-white text-lg"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
            <h3 class="text-lg md:text-xl font-bold text-gray-900 break-words">${event.title}</h3>
            <div class="flex-shrink-0 self-start">
              ${statusBadge}
            </div>
          </div>
          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-2 text-gray-700">
              <i class="fa-solid fa-calendar text-emerald-700 flex-shrink-0"></i>
              <span class="text-sm font-semibold break-words">${formatDate(event.date)}</span>
            </div>
            <div class="flex items-center gap-2 text-gray-700">
              <i class="fa-solid fa-clock text-emerald-700 flex-shrink-0"></i>
              <span class="text-sm">${event.time}</span>
            </div>
            <div class="flex items-center gap-2 text-gray-700">
              <i class="fa-solid fa-location-dot text-emerald-700 flex-shrink-0"></i>
              <span class="text-sm break-words">${event.location}</span>
            </div>
          </div>
          <p class="text-gray-600 text-sm mb-4 line-clamp-3">${event.description}</p>
          ${renderEventAlerts(event.alerts)}
          ${registrationUnavailableMessage}
          <div class="flex flex-wrap gap-3">
            ${event.link ? (() => {
              const isGallery = event.link.startsWith('galeria.html');
              const isInternal = isGallery || (!event.link.startsWith('http') && !event.link.startsWith('//'));
              const target = isInternal ? '' : 'target="_blank"';
              const icon = isGallery ? 'fa-images' : 'fa-external-link-alt';
              const label = isGallery ? 'Ver galeria' : 'Mais informações';
              return `<a href="${event.link}" ${target} class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition text-sm font-semibold">
                <i class="fa-solid ${icon}"></i>
                ${label}
              </a>`;
            })() : ''}
            ${registrationButton}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Update event status based on current date
function updateEventStatus(event) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const eventDate = parseEventDate(event.date);
  eventDate.setHours(0, 0, 0, 0);
  
  // If event has an end date (for multi-day events)
  if (event.endDate) {
    const endDate = parseEventDate(event.endDate);
    endDate.setHours(0, 0, 0, 0);
    
    if (today < eventDate) {
      return 'upcoming';
    } else if (today >= eventDate && today <= endDate) {
      return 'ongoing';
    } else {
      return 'completed';
    }
  }
  
  // For single-day events
  if (today < eventDate) {
    return 'upcoming';
  } else if (today.getTime() === eventDate.getTime()) {
    return 'ongoing';
  } else {
    return 'completed';
  }
}

// Load Clube Events
async function loadClubeEvents() {
  const container = document.getElementById('clube-events');
  
  try {
    const events = eventsData.clube || [];
    
    if (events.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <i class="fa-solid fa-calendar-xmark text-4xl text-gray-300 mb-3"></i>
          <p class="text-gray-500">Nenhum evento disponível</p>
        </div>
      `;
      return;
    }
    
    // Update status for all events based on current date
    const eventsWithUpdatedStatus = events.map(event => ({
      ...event,
      status: updateEventStatus(event)
    }));

    await enrichEventsWithRegistrationAvailability(eventsWithUpdatedStatus);
    
    // Sort events by date (most recent first)
    const sortedEvents = eventsWithUpdatedStatus.sort((a, b) => parseEventDate(b.date) - parseEventDate(a.date));
    
    container.innerHTML = sortedEvents.map(event => renderEventCard(event)).join('');
    
  } catch (error) {
    console.error('Error loading clube events:', error);
    container.innerHTML = `
      <div class="text-center py-8">
        <i class="fa-solid fa-exclamation-triangle text-4xl text-red-500 mb-3"></i>
        <p class="text-red-600">Erro ao carregar eventos</p>
      </div>
    `;
  }
}

// Load Institucionais Events
function loadInstitucionaisEvents() {
  const container = document.getElementById('institucionais-events');
  
  try {
    const events = eventsData.institucionais || [];
    
    if (events.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <i class="fa-solid fa-calendar-xmark text-4xl text-gray-300 mb-3"></i>
          <p class="text-gray-500">Nenhum evento disponível</p>
        </div>
      `;
      return;
    }
    
    // Update status for all events based on current date
    const eventsWithUpdatedStatus = events.map(event => ({
      ...event,
      status: updateEventStatus(event)
    }));
    
    // Sort events by date (most recent first)
    const sortedEvents = eventsWithUpdatedStatus.sort((a, b) => parseEventDate(b.date) - parseEventDate(a.date));
    
    container.innerHTML = sortedEvents.map(event => renderEventCard(event)).join('');
    
  } catch (error) {
    console.error('Error loading institucionais events:', error);
    container.innerHTML = `
      <div class="text-center py-8">
        <i class="fa-solid fa-exclamation-triangle text-4xl text-red-500 mb-3"></i>
        <p class="text-red-600">Erro ao carregar eventos</p>
      </div>
    `;
  }
}

// Load initial data when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadClubeEvents();
});
