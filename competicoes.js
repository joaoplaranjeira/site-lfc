// API Configuration
const API_CONFIG = {
  baseUrl: 'https://otw-clevvo-api-competitions-cb45ebb65abc.herokuapp.com/api', // Replace with your actual API URL
  endpoints: {
    calendar: '/competition/calendar/1074',
    classification: '/competition/rankings',
    results: '/competition/results'
  }
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
  if (tabName === 'calendario') {
    loadCalendarData();
  } else if (tabName === 'classificacao') {
    loadClassificationData();
  } else if (tabName === 'resultados') {
    loadResultsData();
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

// Format time
function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
}

// Load Calendar Data
async function loadCalendarData() {
  const container = document.getElementById('calendar-matches');
  
  // Show loading state
  container.innerHTML = `
    <div class="text-center py-12">
      <i class="fa-solid fa-spinner fa-spin text-4xl text-emerald-700 mb-3"></i>
      <p class="text-gray-600">A carregar calendário...</p>
    </div>
  `;
  
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.calendar}`);
    
    if (!response.ok) {
      throw new Error('Erro ao carregar dados');
    }
    
    const data = await response.json();
    const matches = data.content || [];
    
    if (matches.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <i class="fa-solid fa-calendar-xmark text-4xl text-gray-300 mb-3"></i>
          <p class="text-gray-500">Nenhum jogo agendado</p>
        </div>
      `;
      return;
    }
    
    // Group matches by category
    const groupedMatches = groupMatchesByCategory(matches);
    
    // Render matches grouped by category
    container.innerHTML = Object.keys(groupedMatches)
      .map(category => renderCategorySection(category, groupedMatches[category]))
      .join('');
    
  } catch (error) {
    console.error('Error loading calendar:', error);
    container.innerHTML = `
      <div class="text-center py-8">
        <i class="fa-solid fa-exclamation-triangle text-4xl text-red-500 mb-3"></i>
        <p class="text-red-600">Erro ao carregar calendário</p>
        <button onclick="loadCalendarData()" class="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition">
          Tentar novamente
        </button>
      </div>
    `;
  }
}

// Group matches by category
function groupMatchesByCategory(matches) {
  const grouped = {};
  matches.forEach(match => {
    const category = match.category || 'Outros';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(match);
  });
  return grouped;
}

// Render category section
function renderCategorySection(category, matches) {
  return `
    <div class="mb-6">
      <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <i class="fa-solid fa-layer-group text-emerald-700"></i>
        ${category}
      </h3>
      <div class="space-y-3">
        ${matches.map(match => renderMatchCard(match)).join('')}
      </div>
    </div>
  `;
}

// Render a match card
function renderMatchCard(match) {
  const isHome = match.isHomeTeamHighlighted;
  const bgColor = isHome ? 'bg-emerald-50' : 'bg-gray-50';
  const hoverColor = isHome ? 'hover:bg-emerald-100' : 'hover:bg-gray-100';
  const iconBg = isHome ? 'bg-emerald-700' : 'bg-gray-400';
  
  return `
    <div class="${bgColor} rounded-lg p-4 ${hoverColor} transition">
      <div class="grid grid-cols-1 lg:grid-cols-[200px_1fr_200px] items-center gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0">
            <i class="fa-solid fa-calendar text-white text-sm"></i>
          </div>
          <div>
            <p class="text-sm text-gray-600 font-semibold">${formatDate(match.date)}</p>
            <p class="text-xs text-gray-500">${formatTime(match.date)}</p>
          </div>
        </div>
        <div class="flex items-center justify-center gap-4">
          <div class="text-right flex-1">
            <p class="font-bold text-gray-900 text-sm">${match.homeTeam}</p>
            <p class="text-xs text-gray-600">Casa</p>
          </div>
          <div class="px-4 py-2 bg-white rounded-lg flex-shrink-0 min-w-[60px] text-center">
            <p class="font-bold ${isHome ? 'text-emerald-700' : 'text-gray-700'} text-base">-</p>
          </div>
          <div class="text-left flex-1">
            <p class="font-bold text-gray-900 text-sm">${match.awayTeam}</p>
            <p class="text-xs text-gray-600">Fora</p>
          </div>
        </div>
        <div class="text-right lg:text-right text-center">
          <p class="text-sm font-semibold text-gray-900">${match.competition}</p>
          <p class="text-xs text-gray-600">${match.stadium || ''}</p>
        </div>
      </div>
    </div>
  `;
}

// Load Classification Data
async function loadClassificationData() {
  const container = document.getElementById('classification-tables');
  
  // Show loading state
  container.innerHTML = `
    <div class="text-center py-12">
      <i class="fa-solid fa-spinner fa-spin text-4xl text-emerald-700 mb-3"></i>
      <p class="text-gray-600">A carregar classificações...</p>
    </div>
  `;
  
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.classification}`);
    
    if (!response.ok) {
      throw new Error('Erro ao carregar dados');
    }
    
    const data = await response.json();
    const standings = data.content || [];
    
    if (standings.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <i class="fa-solid fa-table-list text-4xl text-gray-300 mb-3"></i>
          <p class="text-gray-500">Nenhuma classificação disponível</p>
        </div>
      `;
      return;
    }
    
    // Group standings by category and competition
    const groupedStandings = groupStandingsByCategory(standings);
    
    // Render tables grouped by category
    container.innerHTML = Object.keys(groupedStandings)
      .map(category => renderClassificationTable(category, groupedStandings[category]))
      .join('');
    
  } catch (error) {
    console.error('Error loading classification:', error);
    container.innerHTML = `
      <div class="text-center py-8">
        <i class="fa-solid fa-exclamation-triangle text-4xl text-red-500 mb-3"></i>
        <p class="text-red-600">Erro ao carregar classificações</p>
        <button onclick="loadClassificationData()" class="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition">
          Tentar novamente
        </button>
      </div>
    `;
  }
}

// Group standings by category
function groupStandingsByCategory(standings) {
  const grouped = {};
  standings.forEach(standing => {
    const category = standing.category || 'Outros';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(standing);
  });
  
  // Sort each category by position
  Object.keys(grouped).forEach(category => {
    grouped[category].sort((a, b) => a.position - b.position);
  });
  
  return grouped;
}

// Render classification table for a category
function renderClassificationTable(category, standings) {
  return `
    <div class="mb-8">
      <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <i class="fa-solid fa-trophy text-emerald-700"></i>
        ${category}
      </h3>
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-emerald-700 text-white">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold">Pos</th>
                <th class="px-4 py-3 text-left text-sm font-semibold">Clube</th>
                <th class="px-2 py-3 text-center text-sm font-semibold">J</th>
                <th class="px-2 py-3 text-center text-sm font-semibold">V</th>
                <th class="px-2 py-3 text-center text-sm font-semibold">E</th>
                <th class="px-2 py-3 text-center text-sm font-semibold">D</th>
                <th class="px-2 py-3 text-center text-sm font-semibold">GM</th>
                <th class="px-2 py-3 text-center text-sm font-semibold">GS</th>
                <th class="px-2 py-3 text-center text-sm font-semibold">DG</th>
                <th class="px-4 py-3 text-center text-sm font-semibold">Pts</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${standings.map(standing => renderStandingRow(standing)).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// Render a single standing row
function renderStandingRow(standing) {
  const isHighlighted = standing.isHighlightedRow;
  const rowClass = isHighlighted ? 'bg-emerald-50 font-semibold' : 'bg-white hover:bg-gray-50';
  const textClass = isHighlighted ? 'text-emerald-900' : 'text-gray-900';
  
  return `
    <tr class="${rowClass} transition">
      <td class="px-4 py-3 text-sm ${textClass}">${standing.position}º</td>
      <td class="px-4 py-3 text-sm ${textClass}">
        ${isHighlighted ? '<i class="fa-solid fa-star text-emerald-700 mr-2"></i>' : ''}
        ${standing.clubDescription}
      </td>
      <td class="px-2 py-3 text-center text-sm ${textClass}">${standing.matches}</td>
      <td class="px-2 py-3 text-center text-sm text-green-600">${standing.wins}</td>
      <td class="px-2 py-3 text-center text-sm text-gray-600">${standing.draws}</td>
      <td class="px-2 py-3 text-center text-sm text-red-600">${standing.losses}</td>
      <td class="px-2 py-3 text-center text-sm ${textClass}">${standing.goalsScored}</td>
      <td class="px-2 py-3 text-center text-sm ${textClass}">${standing.goalsAgainst}</td>
      <td class="px-2 py-3 text-center text-sm ${textClass}">${standing.goalsDifference > 0 ? '+' : ''}${standing.goalsDifference}</td>
      <td class="px-4 py-3 text-center text-sm font-bold ${isHighlighted ? 'text-emerald-700' : textClass}">${standing.points}</td>
    </tr>
  `;
}

// Load Results Data
async function loadResultsData() {
  const container = document.getElementById('results-matches');
  
  if (!container) {
    console.error('results-matches container not found!');
    return;
  }
  
  // Show loading state
  container.innerHTML = `
    <div class="text-center py-12">
      <i class="fa-solid fa-spinner fa-spin text-4xl text-emerald-700 mb-3"></i>
      <p class="text-gray-600">A carregar resultados...</p>
    </div>
  `;
  
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.results}`);
    
    if (!response.ok) {
      throw new Error('Erro ao carregar dados');
    }
    
    const data = await response.json();
    const results = data.content || [];
    
    if (results.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <i class="fa-solid fa-futbol text-4xl text-gray-300 mb-3"></i>
          <p class="text-gray-500">Nenhum resultado disponível</p>
        </div>
      `;
      return;
    }
    
    // Group results by category
    const groupedResults = groupMatchesByCategory(results);
    
    // Render results grouped by category
    container.innerHTML = Object.keys(groupedResults)
      .map(category => renderResultsCategory(category, groupedResults[category]))
      .join('');
    
  } catch (error) {
    console.error('Error loading results:', error);
    container.innerHTML = `
      <div class="text-center py-8">
        <i class="fa-solid fa-exclamation-triangle text-4xl text-red-500 mb-3"></i>
        <p class="text-red-600">Erro ao carregar resultados</p>
        <button onclick="loadResultsData()" class="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition">
          Tentar novamente
        </button>
      </div>
    `;
  }
}

// Render results category section
function renderResultsCategory(category, results) {
  return `
    <div class="mb-6">
      <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <i class="fa-solid fa-layer-group text-emerald-700"></i>
        ${category}
      </h3>
      <div class="space-y-3">
        ${results.map(result => renderResultCard(result)).join('')}
      </div>
    </div>
  `;
}

// Render a result card
function renderResultCard(match) {
  const isHome = match.isHomeTeamHighlighted;
  const bgColor = isHome ? 'bg-emerald-50' : 'bg-gray-50';
  const hoverColor = isHome ? 'hover:bg-emerald-100' : 'hover:bg-gray-100';
  
  // Determine match outcome for Leça teams
  let outcomeClass = '';
  let outcomeIcon = '';
  
  if (match.score && match.score !== 'Aguardar') {
    // Extract score (format can be "3-1(NO)" or "0-0(NO)")
    const scoreMatch = match.score.match(/(\d+)-(\d+)/);
    if (scoreMatch) {
      const homeGoals = parseInt(scoreMatch[1]);
      const awayGoals = parseInt(scoreMatch[2]);
      
      if (isHome) {
        // Leça is home team
        if (homeGoals > awayGoals) {
          outcomeClass = 'border-l-4 border-green-500';
          outcomeIcon = '<i class="fa-solid fa-circle-check text-green-500"></i>';
        } else if (homeGoals < awayGoals) {
          outcomeClass = 'border-l-4 border-red-500';
          outcomeIcon = '<i class="fa-solid fa-circle-xmark text-red-500"></i>';
        } else {
          outcomeClass = 'border-l-4 border-yellow-500';
          outcomeIcon = '<i class="fa-solid fa-circle-minus text-yellow-500"></i>';
        }
      } else {
        // Leça is away team
        if (awayGoals > homeGoals) {
          outcomeClass = 'border-l-4 border-green-500';
          outcomeIcon = '<i class="fa-solid fa-circle-check text-green-500"></i>';
        } else if (awayGoals < homeGoals) {
          outcomeClass = 'border-l-4 border-red-500';
          outcomeIcon = '<i class="fa-solid fa-circle-xmark text-red-500"></i>';
        } else {
          outcomeClass = 'border-l-4 border-yellow-500';
          outcomeIcon = '<i class="fa-solid fa-circle-minus text-yellow-500"></i>';
        }
      }
    }
  }
  
  return `
    <div class="${bgColor} rounded-lg p-4 ${hoverColor} transition ${outcomeClass}">
      <div class="grid grid-cols-1 lg:grid-cols-[200px_1fr_200px] items-center gap-4">
        <div class="flex items-center gap-3">
          ${outcomeIcon ? `<div class="text-xl flex-shrink-0">${outcomeIcon}</div>` : ''}
          <div>
            <p class="text-sm text-gray-600 font-semibold">${formatDate(match.date)}</p>
            <p class="text-xs text-gray-500">${formatTime(match.date)}</p>
          </div>
        </div>
        <div class="flex items-center justify-center gap-4">
          <div class="text-right flex-1">
            <p class="font-bold text-gray-900 text-sm">${match.homeTeam}</p>
            <p class="text-xs text-gray-600">Casa</p>
          </div>
          <div class="px-4 py-2 bg-white rounded-lg flex-shrink-0 min-w-[60px] text-center">
            <p class="font-bold ${isHome ? 'text-emerald-700' : 'text-gray-700'} text-base">
              ${match.score === 'Aguardar' ? '-' : match.score.replace('(NO)', '')}
            </p>
          </div>
          <div class="text-left flex-1">
            <p class="font-bold text-gray-900 text-sm">${match.awayTeam}</p>
            <p class="text-xs text-gray-600">Fora</p>
          </div>
        </div>
        <div class="text-right lg:text-right text-center">
          <p class="text-sm font-semibold text-gray-900">${match.competition}</p>
          <p class="text-xs text-gray-600">${match.stadium || ''}</p>
        </div>
      </div>
    </div>
  `;
}

// Load initial data when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadCalendarData();
});
