// Events data structure
const eventsData = {
  clube: [
    {
      id: 1,
      title: "Jantar do 114º Aniversário do Leça Futebol Clube",
      date: "2026-03-21",
      time: "20:00",
      location: "Local a definir",
      description: "Celebração do 114º aniversário do Leça Futebol Clube com jantar para sócios, dirigentes e convidados.",
      type: "jantar",
      status: "upcoming",
      image: null,
      link: null
    },
    {
      id: 2,
      title: "Jogo das Estrelas",
      date: "2026-03-28",
      time: "A definir",
      location: "Local a definir",
      description: "Jogo com ex-atletas das modalidades de Basquetebol e Andebol do clube.",
      type: "default",
      status: "upcoming",
      image: null,
      link: null
    },
    {
      id: 3,
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
      id: 4,
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
      id: 5,
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
      id: 6,
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
      id: 7,
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
      id: 8,
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
      id: 9,
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
      id: 10,
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
      id: 11,
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
      id: 12,
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
      id: 13,
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
      id: 14,
      title: "Talk Club - 2ª Sessão",
      date: "2026-02-11",
      time: "21:00",
      location: "Local a definir",
      description: "Segunda sessão do Talk Club - conversas com os sócios sobre modalidades e património. Ver mais detalhes na página do Talk Club.",
      type: "default",
      status: "upcoming",
      image: null,
      link: "talkclub.html"
    },
    {
      id: 15,
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
      id: 16,
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
      id: 17,
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
      id: 18,
      title: "Festa de Natal da Patinagem Artística",
      date: "2025-12-20",
      time: "15:00 - 18:00",
      location: "Local a definir",
      description: "Festa de Natal da modalidade de Patinagem Artística.",
      type: "default",
      status: "completed",
      image: null,
      link: null
    }
  ],
  institucionais: [
    {
      id: 19,
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
      id: 20,
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
      id: 21,
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
      id: 22,
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
function formatDate(dateString) {
  const date = new Date(dateString);
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
function getEventIcon(type) {
  const icons = {
    'jantar': 'fa-utensils',
    'assembleia': 'fa-users',
    'conferencia': 'fa-microphone',
    'aniversario': 'fa-cake-candles',
    'default': 'fa-calendar-check'
  };
  return icons[type] || icons['default'];
}

// Get event status badge
function getStatusBadge(status) {
  const badges = {
    'upcoming': '<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">Próximo</span>',
    'completed': '<span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Realizado</span>',
    'cancelled': '<span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Cancelado</span>'
  };
  return badges[status] || '';
}

// Render event card
function renderEventCard(event) {
  const icon = getEventIcon(event.type);
  const statusBadge = getStatusBadge(event.status);
  const isUpcoming = event.status === 'upcoming';
  const bgColor = isUpcoming ? 'bg-emerald-50' : 'bg-gray-50';
  const iconBg = isUpcoming ? 'bg-emerald-700' : 'bg-gray-400';
  
  return `
    <div class="${bgColor} rounded-lg p-6 hover:shadow-md transition">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0">
          <i class="fa-solid ${icon} text-white text-lg"></i>
        </div>
        <div class="flex-1">
          <div class="flex items-start justify-between gap-4 mb-2">
            <h3 class="text-xl font-bold text-gray-900">${event.title}</h3>
            ${statusBadge}
          </div>
          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-2 text-gray-700">
              <i class="fa-solid fa-calendar text-emerald-700"></i>
              <span class="text-sm font-semibold">${formatDate(event.date)}</span>
            </div>
            <div class="flex items-center gap-2 text-gray-700">
              <i class="fa-solid fa-clock text-emerald-700"></i>
              <span class="text-sm">${event.time}</span>
            </div>
            <div class="flex items-center gap-2 text-gray-700">
              <i class="fa-solid fa-location-dot text-emerald-700"></i>
              <span class="text-sm">${event.location}</span>
            </div>
          </div>
          <p class="text-gray-600 text-sm mb-4">${event.description}</p>
          ${event.link ? `
            <a href="${event.link}" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition text-sm font-semibold">
              <i class="fa-solid fa-external-link-alt"></i>
              Mais informações
            </a>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// Load Clube Events
function loadClubeEvents() {
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
    
    // Sort events by date (most recent first)
    const sortedEvents = events.sort((a, b) => new Date(b.date) - new Date(a.date));
    
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
    
    // Sort events by date (most recent first)
    const sortedEvents = events.sort((a, b) => new Date(b.date) - new Date(a.date));
    
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
