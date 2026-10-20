(function () {
  'use strict';

  var API_BASE_URL = 'https://otw-clevvo-api-competitions-cb45ebb65abc.herokuapp.com/api';
  var FOOTBALL_ENDPOINTS = {
    calendars: '/public/competition-data-v2/calendars',
    rankings: '/public/competition-data-v2/rankings'
  };
  var BILLIARDS_ENDPOINTS = {
    calendario: '/public/billiards/calendar',
    resultados: '/public/billiards/results',
    classificacao: '/public/billiards/classification'
  };
  var validSports = ['futebol', 'bilhar'];
  var validViews = ['calendario', 'classificacao', 'resultados'];
  var currentSport = 'futebol';
  var currentView = 'calendario';
  var footballMatchesPromise = null;
  var footballRankingsPromise = null;
  var billiardsPromises = {};
  var billiardsMatchDetailPromises = {};
  var activeBilliardsMatchRequest = 0;
  var lastBilliardsMatchTrigger = null;

  function escapeHtml(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
  function firstValue(object, keys) {
    for (var i = 0; i < keys.length; i += 1) {
      if (object && object[keys[i]] !== undefined && object[keys[i]] !== null && object[keys[i]] !== '') return object[keys[i]];
    }
    return null;
  }
  function collectionFrom(data, keys) {
    var content = data && data.content !== undefined ? data.content : data;
    if (Array.isArray(content)) return content;
    for (var i = 0; i < keys.length; i += 1) {
      if (Array.isArray(content && content[keys[i]])) return content[keys[i]];
    }
    return [];
  }
  function requestJson(endpoint) {
    return fetch(API_BASE_URL + endpoint).then(function (response) {
      if (!response.ok) {
        var error = new Error('request failed');
        error.status = response.status;
        throw error;
      }
      return response.json();
    });
  }
  function formatDate(value) {
    var date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Data por confirmar' : new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  }
  function formatTime(value) {
    var date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Hora por confirmar' : new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(date);
  }
  function formatBilliardsTime(value) { return value ? String(value).slice(0, 5) : 'Hora a definir'; }
  function formatDateTime(value) {
    var date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  }
  function formatNumber(value, maximumFractionDigits) {
    return value === null || value === undefined ? '—' : new Intl.NumberFormat('pt-PT', { maximumFractionDigits: maximumFractionDigits === undefined ? 2 : maximumFractionDigits }).format(value);
  }
  function state(container, icon, message, retry) {
    container.innerHTML = '<div class="competition-state text-center py-12"><i class="fa-solid ' + icon + ' text-4xl text-emerald-700 mb-3" aria-hidden="true"></i><p class="text-gray-600">' + escapeHtml(message) + '</p>' + (retry ? '<button type="button" data-retry class="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-lg">Tentar novamente</button>' : '') + '</div>';
    var button = container.querySelector('[data-retry]');
    if (button) button.addEventListener('click', retry);
  }
  function returnTo(view) { return '/competicoes?sport=' + encodeURIComponent(currentSport) + '&tab=' + encodeURIComponent(view || currentView); }
  function installImageFallbacks(container) {
    container.querySelectorAll('[data-team-logo]').forEach(function (image) {
      image.addEventListener('error', function () { image.hidden = true; });
    });
  }

  function footballCompetition(match) { return firstValue(match, ['competitionName', 'competition', 'competitionDescription']) || 'Competição'; }
  function footballCategory(match) { return firstValue(match, ['categoryDescription', 'category']) || 'Outros'; }
  function footballPhase(match) { return [firstValue(match, ['phaseName', 'phase']), firstValue(match, ['phaseGroupName', 'phaseGroup', 'groupName'])].filter(Boolean).join(' · '); }
  function footballVenue(match) { return firstValue(match, ['stadium', 'venue', 'location']) || 'Local por confirmar'; }
  function footballHasResult(match) { var score = firstValue(match, ['score', 'result']); return Boolean(score && score !== 'Aguardar' && score !== '-'); }
  function footballTeamLink(match, side) {
    var home = side === 'home';
    var name = firstValue(match, home ? ['homeTeam', 'homeTeamName'] : ['awayTeam', 'awayTeamName']) || 'Equipa por confirmar';
    var teamId = firstValue(match, home ? ['homeTeamId'] : ['awayTeamId']);
    if (!teamId || String(teamId) !== String(match.sourceTeamId)) return escapeHtml(name);
    var href = '/equipa?teamId=' + encodeURIComponent(teamId) + '&teamName=' + encodeURIComponent(name) + '&category=' + encodeURIComponent(footballCategory(match)) + '&returnTo=' + encodeURIComponent(returnTo());
    return '<a class="team-link" href="' + href + '">' + escapeHtml(name) + '<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>';
  }
  function footballMatchCard(match, result) {
    var homeHighlighted = match.isHomeTeamHighlighted === true;
    var score = firstValue(match, ['score', 'result']);
    var scoreDisplay = result && score ? String(score).replace('(NO)', '') : '—';
    var phase = footballPhase(match);
    var detailsHref = '/jogo?calendarId=' + encodeURIComponent(match.id) + '&returnTo=' + encodeURIComponent(returnTo());
    var scoreMarkup = result && match.id ? '<a class="match-score-link" href="' + detailsHref + '" aria-label="Ver detalhes do jogo: ' + escapeHtml(scoreDisplay) + '"><span>' + escapeHtml(scoreDisplay) + '</span><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>' : '<span>' + escapeHtml(scoreDisplay) + '</span>';
    return '<article class="match-card ' + (homeHighlighted ? 'bg-emerald-50' : 'bg-gray-50') + ' rounded-xl p-4 transition"><div class="grid grid-cols-1 lg:grid-cols-[200px_1fr_200px] items-center gap-4"><div class="flex items-center gap-3"><div class="w-10 h-10 ' + (homeHighlighted ? 'bg-emerald-700' : 'bg-gray-400') + ' rounded-full flex items-center justify-center flex-shrink-0"><i class="fa-solid ' + (result ? 'fa-futbol' : 'fa-calendar-days') + ' text-white text-sm" aria-hidden="true"></i></div><div><p class="text-sm text-gray-700 font-semibold capitalize">' + escapeHtml(formatDate(match.date)) + '</p><p class="text-xs text-gray-500">' + escapeHtml(formatTime(match.date)) + '</p></div></div><div class="match-teams flex items-center justify-center gap-4"><div class="text-right flex-1 min-w-0"><p class="font-bold text-gray-900 text-sm">' + footballTeamLink(match, 'home') + '</p><p class="text-xs text-gray-500">Casa</p></div><div class="px-4 py-2 bg-white rounded-lg shadow-sm flex-shrink-0 min-w-[60px] text-center"><p class="font-bold ' + (homeHighlighted ? 'text-emerald-700' : 'text-gray-700') + ' text-base">' + scoreMarkup + '</p></div><div class="text-left flex-1 min-w-0"><p class="font-bold text-gray-900 text-sm">' + footballTeamLink(match, 'away') + '</p><p class="text-xs text-gray-500">Fora</p></div></div><div class="match-details text-center lg:text-right"><p class="text-sm font-semibold text-gray-900">' + escapeHtml(footballCompetition(match)) + '</p>' + (phase ? '<p class="competition-meta">' + escapeHtml(phase) + '</p>' : '') + (match.fixtureDescription ? '<p class="competition-meta">' + escapeHtml(match.fixtureDescription) + '</p>' : '') + '<p class="match-venue"><i class="fa-solid fa-location-dot" aria-hidden="true"></i><span>' + escapeHtml(footballVenue(match)) + '</span></p></div></div></article>';
  }
  function compareDates(a, b, newestFirst) {
    var left = new Date(a.date).getTime(); var right = new Date(b.date).getTime();
    if (Number.isNaN(left)) left = newestFirst ? 0 : Number.MAX_SAFE_INTEGER;
    if (Number.isNaN(right)) right = newestFirst ? 0 : Number.MAX_SAFE_INTEGER;
    return newestFirst ? right - left : left - right;
  }
  function renderFootballGroups(list, result) {
    var categories = list.reduce(function (all, match) {
      var category = footballCategory(match); var categoryId = Number(firstValue(match, ['categoryId']) || Number.MAX_SAFE_INTEGER); var phase = footballPhase(match);
      var competitionId = String(firstValue(match, ['competitionId', 'idCompetition']) || '') + '|' + phase;
      if (!all[category]) all[category] = { id: categoryId, competitions: {} };
      if (!all[category].competitions[competitionId]) all[category].competitions[competitionId] = { name: [footballCompetition(match), phase].filter(Boolean).join(' · '), matches: [] };
      all[category].competitions[competitionId].matches.push(match); return all;
    }, {});
    return Object.keys(categories).sort(function (a, b) { return categories[a].id - categories[b].id || a.localeCompare(b, 'pt'); }).map(function (category) {
      var competitions = categories[category].competitions;
      return '<section class="mb-7"><h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><i class="fa-solid fa-layer-group text-emerald-700" aria-hidden="true"></i>' + escapeHtml(category) + '</h3>' + Object.keys(competitions).sort(function (a, b) { return competitions[a].name.localeCompare(competitions[b].name, 'pt'); }).map(function (competitionId) {
        var competition = competitions[competitionId]; competition.matches.sort(function (a, b) { return compareDates(a, b, result); });
        return '<section class="mb-5"><h4 class="text-base font-bold text-emerald-800 mb-3">' + escapeHtml(competition.name) + '</h4><div class="space-y-3">' + competition.matches.map(function (match) { return footballMatchCard(match, result); }).join('') + '</div></section>';
      }).join('') + '</section>';
    }).join('');
  }
  function footballMatches() {
    if (!footballMatchesPromise) footballMatchesPromise = requestJson(FOOTBALL_ENDPOINTS.calendars).then(function (data) { return collectionFrom(data, ['matches', 'items', 'calendars']); }).catch(function (error) { footballMatchesPromise = null; throw error; });
    return footballMatchesPromise;
  }
  function flattenRankings(value, rows) {
    if (Array.isArray(value)) { value.forEach(function (item) { flattenRankings(item, rows); }); return; }
    if (!value || typeof value !== 'object') return;
    if (firstValue(value, ['position', 'rank']) !== null && firstValue(value, ['clubDescription', 'teamName', 'clubName']) !== null) { rows.push(value); return; }
    ['items', 'rankings', 'standings', 'groups', 'phases', 'competitions', 'categories'].forEach(function (key) { if (value[key]) flattenRankings(value[key], rows); });
  }
  function footballStandingName(row) {
    var name = firstValue(row, ['clubDescription', 'teamName', 'clubName', 'description']) || 'Equipa'; var teamId = firstValue(row, ['teamId', 'sourceTeamId']);
    if (!row.isHighlightedRow || !teamId) return escapeHtml(name);
    var href = '/equipa?teamId=' + encodeURIComponent(teamId) + '&teamName=' + encodeURIComponent(name) + '&category=' + encodeURIComponent(firstValue(row, ['categoryDescription', 'category']) || '') + '&returnTo=' + encodeURIComponent(returnTo('classificacao'));
    return '<a class="team-link" href="' + href + '">' + escapeHtml(name) + '<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>';
  }
  function footballRankingsTable(rows) {
    var headers = ['Pos', 'Clube', 'J', 'GM', 'GS', 'DG', 'Pts']; var keys = [['position', 'rank'], null, ['matches', 'matchesPlayed', 'numberOfMatches'], ['goalsScored'], ['goalsAgainst', 'goalsConceded'], ['goalsDifference', 'goalDifference'], ['points']]; var lastPosition = 0;
    rows.sort(function (a, b) { return Number(firstValue(a, ['position', 'rank'])) - Number(firstValue(b, ['position', 'rank'])); });
    return '<div class="bg-white rounded-xl shadow-md overflow-x-auto"><table class="w-full min-w-[680px]"><thead class="bg-emerald-700 text-white"><tr>' + headers.map(function (header) { return '<th class="px-3 py-3 text-center text-sm">' + header + '</th>'; }).join('') + '</tr></thead><tbody class="divide-y divide-gray-200">' + rows.map(function (row) {
      var sourcePosition = Number(firstValue(row, ['position', 'rank'])); var displayedPosition = Number.isFinite(sourcePosition) && sourcePosition > lastPosition ? sourcePosition : lastPosition + 1; lastPosition = displayedPosition;
      return '<tr class="' + (row.isHighlightedRow ? 'bg-emerald-50 font-semibold' : 'bg-white hover:bg-gray-50') + '">' + keys.map(function (key, index) {
        if (index === 1) return '<td class="px-4 py-3 text-left text-sm">' + (row.isHighlightedRow ? '<i class="fa-solid fa-star text-emerald-700 mr-2" aria-hidden="true"></i>' : '') + footballStandingName(row) + '</td>';
        var value = index === 0 ? displayedPosition : firstValue(row, key);
        return '<td class="px-3 py-3 text-center text-sm ' + (index === 6 ? 'font-bold text-emerald-700' : '') + '">' + (index === 5 && Number(value) > 0 ? '+' : '') + escapeHtml(value === null ? '—' : value) + '</td>';
      }).join('') + '</tr>';
    }).join('') + '</tbody></table></div>';
  }
  function renderFootballRankings(rows) {
    var groups = rows.reduce(function (all, row) {
      var category = firstValue(row, ['categoryDescription', 'category']) || 'Outros'; var competition = firstValue(row, ['competitionName', 'competitionDescription']) || 'Competição'; var stage = [firstValue(row, ['phaseName', 'phase']), firstValue(row, ['phaseGroupName', 'phaseGroup', 'groupName'])].filter(Boolean).join(' · '); var key = category + '|' + (firstValue(row, ['competitionId', 'idCompetition']) || '') + '|' + stage;
      if (!all[key]) all[key] = { category: category, categoryId: Number(firstValue(row, ['categoryId']) || Number.MAX_SAFE_INTEGER), competition: competition, stage: stage, rows: [] };
      all[key].rows.push(row); return all;
    }, {});
    return Object.keys(groups).map(function (key) { return groups[key]; }).sort(function (a, b) { return a.categoryId - b.categoryId || a.competition.localeCompare(b.competition, 'pt') || a.stage.localeCompare(b.stage, 'pt') || a.category.localeCompare(b.category, 'pt'); }).map(function (group) {
      return '<section class="mb-8"><h3 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2"><i class="fa-solid fa-trophy text-emerald-700" aria-hidden="true"></i>' + escapeHtml([group.category, group.competition, group.stage].filter(Boolean).join(' · ')) + '</h3>' + footballRankingsTable(group.rows) + '</section>';
    }).join('');
  }

  function billiardsTeam(team) {
    var name = team && team.name ? team.name : 'Equipa por confirmar';
    var logo = team && team.logoUrl ? '<img data-team-logo class="team-identity__logo" src="' + escapeHtml(team.logoUrl) + '" alt="">' : '<span class="team-identity__fallback"><i class="fa-solid fa-diamond" aria-hidden="true"></i></span>';
    var content = logo + '<span>' + escapeHtml(name) + '</span>';
    if (!team || team.isManagedTeam !== true || !team.id) return '<span class="team-identity">' + content + '</span>';
    return '<a class="team-link team-identity" href="/bilhar/equipas/' + encodeURIComponent(team.id) + '?returnTo=' + encodeURIComponent(returnTo()) + '">' + content + '<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>';
  }
  function billiardsMatchCard(match, result) {
    var managed = (match.homeTeam && match.homeTeam.isManagedTeam === true) || (match.awayTeam && match.awayTeam.isManagedTeam === true);
    var score = result && match.hasOfficialResult ? (match.result || [match.homeScore, match.awayScore].filter(function (value) { return value !== null && value !== undefined; }).join(' - ')) : 'A disputar';
    var date = match.date ? formatDate(match.date) : 'Data a definir';
    var details = ['Jornada ' + formatNumber(match.round, 0), match.matchNumber ? 'Jogo ' + match.matchNumber : null].filter(Boolean).join(' · ');
    var scoreContent = escapeHtml(score || 'Resultado pendente');
    var scoreMarkup = result && match.hasOfficialResult === true && match.id
      ? '<button class="billiards-score-button" type="button" data-billiards-match-id="' + escapeHtml(match.id) + '" aria-haspopup="dialog" aria-label="Ver detalhe do resultado ' + scoreContent + '"><span>' + scoreContent + '</span><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>'
      : '<p class="font-bold text-emerald-700 text-sm">' + scoreContent + '</p>';
    return '<article class="match-card billiards-match ' + (managed ? 'bg-emerald-50' : 'bg-gray-50') + ' rounded-xl p-4 transition"><div class="grid grid-cols-1 lg:grid-cols-[200px_1fr_200px] items-center gap-4"><div class="flex items-center gap-3"><div class="w-10 h-10 bg-emerald-700 rounded-full flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-circle-dot text-white text-sm" aria-hidden="true"></i></div><div><p class="text-sm text-gray-700 font-semibold capitalize">' + escapeHtml(date) + '</p><p class="text-xs text-gray-500">' + escapeHtml(formatBilliardsTime(match.time)) + '</p></div></div><div class="match-teams flex items-center justify-center gap-4"><div class="text-right flex-1 min-w-0"><p class="font-bold text-gray-900 text-sm">' + billiardsTeam(match.homeTeam) + '</p><p class="text-xs text-gray-500">Casa</p></div><div class="billiards-score px-3 py-2 bg-white rounded-lg shadow-sm flex-shrink-0 text-center">' + scoreMarkup + '</div><div class="text-left flex-1 min-w-0"><p class="font-bold text-gray-900 text-sm">' + billiardsTeam(match.awayTeam) + '</p><p class="text-xs text-gray-500">Fora</p></div></div><div class="match-details text-center lg:text-right"><p class="text-sm font-semibold text-gray-900">' + escapeHtml(details) + '</p><p class="match-venue"><i class="fa-solid fa-location-dot" aria-hidden="true"></i><span>' + escapeHtml(match.venue || 'Local a definir') + '</span></p></div></div></article>';
  }
  function billiardsCompetitionHeading(competition) { return [competition.name, competition.variant, competition.season, competition.phase, competition.series].filter(Boolean).join(' · '); }
  function renderBilliardsMatches(competitions, result) {
    return competitions.map(function (competition) {
      var rounds = (competition.matches || []).reduce(function (all, match) { var round = match.round === null || match.round === undefined ? 'Jornada por definir' : 'Jornada ' + match.round; if (!all[round]) all[round] = []; all[round].push(match); return all; }, {});
      var roundNames = Object.keys(rounds).sort(function (a, b) { return Number(a.replace(/\D/g, '')) - Number(b.replace(/\D/g, '')); });
      return '<section class="billiards-competition mb-8"><header class="competition-heading"><span><i class="fa-solid fa-circle-dot" aria-hidden="true"></i></span><div><p>Bilhar · Carambola</p><h3>' + escapeHtml(billiardsCompetitionHeading(competition)) + '</h3></div></header>' + (roundNames.length ? roundNames.map(function (round) {
        rounds[round].sort(function (a, b) { var dateOrder = compareDates(a, b, result); return dateOrder || String(a.time || '').localeCompare(String(b.time || '')) || Number(a.matchNumber || 0) - Number(b.matchNumber || 0); });
        return '<section class="mb-5"><h4 class="round-heading">' + escapeHtml(round) + '</h4><div class="space-y-3">' + rounds[round].map(function (match) { return billiardsMatchCard(match, result); }).join('') + '</div></section>';
      }).join('') : '<p class="empty-inline">Ainda não há jogos disponíveis nesta competição.</p>') + '</section>';
    }).join('');
  }
  function billiardsRankingTable(rows) {
    var headers = ['Pos', 'Equipa', 'J', 'V', 'E', 'D', 'F', 'Partidas', 'Média', 'Pts'];
    return '<div class="bg-white rounded-xl shadow-md overflow-x-auto"><table class="billiards-table w-full"><thead class="bg-emerald-700 text-white"><tr>' + headers.map(function (header) { return '<th>' + header + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.slice().sort(function (a, b) { return Number(a.position) - Number(b.position); }).map(function (row) {
      var highlighted = row.team && row.team.isManagedTeam === true;
      var games = [formatNumber(row.gamesWon, 0), formatNumber(row.gamesLost, 0)].join('–');
      return '<tr class="' + (highlighted ? 'is-managed' : '') + '"><td><strong>' + escapeHtml(formatNumber(row.position, 0)) + 'º</strong></td><td class="team-cell">' + (highlighted ? '<i class="fa-solid fa-star" aria-label="Equipa do Universo Leça FC"></i>' : '') + billiardsTeam(row.team) + '</td><td>' + escapeHtml(formatNumber(row.matches, 0)) + '</td><td>' + escapeHtml(formatNumber(row.wins, 0)) + '</td><td>' + escapeHtml(formatNumber(row.draws, 0)) + '</td><td>' + escapeHtml(formatNumber(row.losses, 0)) + '</td><td>' + escapeHtml(formatNumber(row.forfeits, 0)) + '</td><td>' + escapeHtml(games) + '</td><td>' + escapeHtml(formatNumber(row.average, 3)) + '</td><td><strong>' + escapeHtml(formatNumber(row.points, 0)) + '</strong></td></tr>';
    }).join('') + '</tbody></table></div>';
  }
  function renderBilliardsRankings(competitions) {
    return competitions.map(function (competition) {
      return '<section class="billiards-competition mb-8"><header class="competition-heading"><span><i class="fa-solid fa-trophy" aria-hidden="true"></i></span><div><p>Bilhar · Carambola</p><h3>' + escapeHtml(billiardsCompetitionHeading(competition)) + '</h3></div></header>' + ((competition.ranking || []).length ? billiardsRankingTable(competition.ranking) : '<p class="empty-inline">Ainda não há classificação disponível nesta competição.</p>') + '</section>';
    }).join('');
  }
  function billiardsData(view) {
    if (!billiardsPromises[view]) billiardsPromises[view] = requestJson(BILLIARDS_ENDPOINTS[view]).then(function (data) { return collectionFrom(data, ['items']); }).catch(function (error) { billiardsPromises[view] = null; throw error; });
    return billiardsPromises[view];
  }

  function billiardsMatchDetail(matchId) {
    if (!billiardsMatchDetailPromises[matchId]) {
      billiardsMatchDetailPromises[matchId] = requestJson('/public/billiards/matches/' + encodeURIComponent(matchId)).then(function (data) {
        return data && data.content !== undefined ? data.content : data;
      }).catch(function (error) {
        delete billiardsMatchDetailPromises[matchId];
        throw error;
      });
    }
    return billiardsMatchDetailPromises[matchId];
  }
  function billiardsModalTeam(team, side) {
    var name = team && team.name ? team.name : 'Equipa por confirmar';
    var logo = team && team.logoUrl
      ? '<img data-team-logo class="billiards-match-detail__team-logo" src="' + escapeHtml(team.logoUrl) + '" alt="">'
      : '<span class="billiards-match-detail__team-fallback"><i class="fa-solid fa-diamond" aria-hidden="true"></i></span>';
    var nameMarkup = team && team.isManagedTeam === true && team.id
      ? '<a href="/bilhar/equipas/' + encodeURIComponent(team.id) + '?returnTo=' + encodeURIComponent(returnTo('resultados')) + '">' + escapeHtml(name) + '<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>'
      : '<span>' + escapeHtml(name) + '</span>';
    return '<div class="billiards-match-detail__team ' + (side === 'away' ? 'is-away' : '') + '">' + logo + '<p>' + nameMarkup + '</p><span>' + (side === 'away' ? 'Visitante' : 'Casa') + '</span></div>';
  }
  function billiardsGameCard(game) {
    var label = game.label || (game.order ? 'Jogo ' + game.order : 'Partida');
    return '<article class="billiards-game-card"><header><span>' + escapeHtml(label) + '</span><strong>' + escapeHtml(game.result || 'Resultado indisponível') + '</strong></header><div class="billiards-game-card__players"><div><span>Casa</span><p>' + escapeHtml(game.homeAthleteName || 'Atleta por confirmar') + '</p><strong>' + escapeHtml(formatNumber(game.homeScore, 0)) + '</strong><small>' + escapeHtml(formatNumber(game.homeInnings, 0)) + ' entradas</small></div><i class="fa-solid fa-circle-dot" aria-hidden="true"></i><div><span>Visitante</span><p>' + escapeHtml(game.awayAthleteName || 'Atleta por confirmar') + '</p><strong>' + escapeHtml(formatNumber(game.awayScore, 0)) + '</strong><small>' + escapeHtml(formatNumber(game.awayInnings, 0)) + ' entradas</small></div></div></article>';
  }
  function renderBilliardsMatchDetail(detail) {
    var match = detail.match || {};
    var competition = [detail.competitionCode, detail.season, detail.phase, detail.series ? 'Série ' + detail.series : null].filter(Boolean).join(' · ');
    var matchMeta = [
      match.date ? { icon: 'fa-calendar-day', text: formatDate(match.date) } : null,
      match.time ? { icon: 'fa-clock', text: formatBilliardsTime(match.time) } : null,
      match.venue ? { icon: 'fa-location-dot', text: match.venue } : null,
      match.round !== null && match.round !== undefined ? { icon: 'fa-layer-group', text: 'Jornada ' + match.round } : null,
      match.matchNumber ? { icon: 'fa-hashtag', text: 'Jogo ' + match.matchNumber } : null
    ].filter(Boolean);
    var score = match.result || [match.homeScore, match.awayScore].filter(function (value) { return value !== null && value !== undefined; }).join(' - ') || 'Resultado oficial';
    var importedDate = formatDateTime(detail.importedDate);
    var games = Array.isArray(detail.games) ? detail.games.slice().sort(function (a, b) { return Number(a.order || 0) - Number(b.order || 0); }) : [];
    return '<div class="billiards-match-detail"><header class="billiards-match-detail__header"><p><i class="fa-solid fa-circle-dot" aria-hidden="true"></i> Bilhar Três Tabelas' + (detail.variant ? ' · ' + escapeHtml(detail.variant) : '') + '</p><h2 id="billiards-match-modal-title">' + escapeHtml(detail.competitionName || 'Detalhe do jogo') + '</h2><span>' + escapeHtml(competition) + '</span></header><div class="billiards-match-detail__scoreboard">' + billiardsModalTeam(match.homeTeam, 'home') + '<div class="billiards-match-detail__score"><span>Resultado final</span><strong>' + escapeHtml(score) + '</strong><small>Oficial</small></div>' + billiardsModalTeam(match.awayTeam, 'away') + '</div>' + (matchMeta.length ? '<div class="billiards-match-detail__meta">' + matchMeta.map(function (item) { return '<span><i class="fa-solid ' + item.icon + '" aria-hidden="true"></i>' + escapeHtml(item.text) + '</span>'; }).join('') + '</div>' : '') + '<section class="billiards-match-detail__games"><div class="billiards-match-detail__section-heading"><div><p>Ficha oficial</p><h3>Partidas individuais</h3></div><span>' + games.length + (games.length === 1 ? ' partida' : ' partidas') + '</span></div>' + (games.length ? '<div class="billiards-match-detail__game-list">' + games.map(billiardsGameCard).join('') + '</div>' : '<div class="billiards-match-detail__empty"><i class="fa-regular fa-rectangle-list" aria-hidden="true"></i><p>O resultado está confirmado, mas o detalhe das partidas ainda não está disponível.</p></div>') + '</section>' + (importedDate ? '<footer class="billiards-match-detail__footer"><i class="fa-solid fa-check-circle" aria-hidden="true"></i> Dados oficiais atualizados em ' + escapeHtml(importedDate) + '</footer>' : '') + '</div>';
  }
  function closeBilliardsMatchModal() {
    var modal = document.getElementById('billiards-match-modal');
    if (!modal || modal.hidden) return;
    activeBilliardsMatchRequest += 1;
    modal.hidden = true;
    document.body.classList.remove('has-open-modal');
    if (lastBilliardsMatchTrigger) lastBilliardsMatchTrigger.focus();
    lastBilliardsMatchTrigger = null;
  }
  function openBilliardsMatchModal(matchId, trigger) {
    var modal = document.getElementById('billiards-match-modal');
    var panel = modal && modal.querySelector('.billiards-match-modal__panel');
    var content = document.getElementById('billiards-match-detail');
    if (!modal || !panel || !content || !matchId) return;
    var requestId = activeBilliardsMatchRequest + 1;
    activeBilliardsMatchRequest = requestId;
    lastBilliardsMatchTrigger = trigger;
    content.innerHTML = '<div class="billiards-match-detail__loading" role="status"><i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i><h2 id="billiards-match-modal-title">A carregar ficha do jogo</h2><p>A consultar o resultado oficial e as partidas individuais.</p></div>';
    modal.hidden = false;
    document.body.classList.add('has-open-modal');
    panel.focus();
    billiardsMatchDetail(matchId).then(function (detail) {
      if (requestId !== activeBilliardsMatchRequest || modal.hidden) return;
      content.innerHTML = renderBilliardsMatchDetail(detail || {});
      installImageFallbacks(content);
    }).catch(function (error) {
      if (requestId !== activeBilliardsMatchRequest || modal.hidden) return;
      if (error.status !== 404) console.warn('Billiards match detail unavailable:', error);
      var message = error.status === 404 ? 'O detalhe deste jogo ainda não está disponível.' : 'Não foi possível carregar a ficha deste jogo neste momento.';
      content.innerHTML = '<div class="billiards-match-detail__error"><i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i><h2 id="billiards-match-modal-title">Ficha indisponível</h2><p>' + escapeHtml(message) + '</p><button type="button" data-retry-billiards-match="' + escapeHtml(matchId) + '">Tentar novamente</button></div>';
    });
  }

  function loadFootball(view) {
    var container = document.getElementById(view === 'calendario' ? 'calendar-matches' : view === 'resultados' ? 'results-matches' : 'classification-tables');
    state(container, 'fa-spinner fa-spin', view === 'classificacao' ? 'A carregar classificações...' : view === 'resultados' ? 'A carregar resultados...' : 'A carregar calendário...');
    if (view === 'classificacao') {
      if (!footballRankingsPromise) footballRankingsPromise = requestJson(FOOTBALL_ENDPOINTS.rankings).then(function (data) { var rows = []; flattenRankings(data.content, rows); return rows; }).catch(function (error) { footballRankingsPromise = null; throw error; });
      footballRankingsPromise.then(function (rows) { if (currentSport !== 'futebol' || currentView !== view) return; if (!rows.length) state(container, 'fa-table-list', 'Não há classificações disponíveis.'); else container.innerHTML = renderFootballRankings(rows); }).catch(function (error) { console.error(error); if (currentSport === 'futebol' && currentView === view) state(container, 'fa-triangle-exclamation', 'Não foi possível carregar as classificações.', function () { loadFootball(view); }); });
      return;
    }
    footballMatches().then(function (matches) {
      if (currentSport !== 'futebol' || currentView !== view) return;
      var result = view === 'resultados'; var list = matches.filter(function (match) { return result ? footballHasResult(match) : !footballHasResult(match); });
      if (!list.length) state(container, result ? 'fa-futbol' : 'fa-calendar-xmark', result ? 'Não há resultados disponíveis.' : 'Não há jogos agendados.'); else container.innerHTML = renderFootballGroups(list, result);
    }).catch(function (error) { console.error(error); if (currentSport === 'futebol' && currentView === view) state(container, 'fa-triangle-exclamation', view === 'resultados' ? 'Não foi possível carregar os resultados.' : 'Não foi possível carregar o calendário.', function () { loadFootball(view); }); });
  }
  function loadBilliards(view) {
    var container = document.getElementById(view === 'calendario' ? 'calendar-matches' : view === 'resultados' ? 'results-matches' : 'classification-tables');
    state(container, 'fa-spinner fa-spin', view === 'classificacao' ? 'A carregar classificação de bilhar...' : view === 'resultados' ? 'A carregar resultados de bilhar...' : 'A carregar calendário de bilhar...');
    billiardsData(view).then(function (competitions) {
      if (currentSport !== 'bilhar' || currentView !== view) return;
      if (!competitions.length) { state(container, view === 'classificacao' ? 'fa-table-list' : 'fa-circle-dot', view === 'classificacao' ? 'Ainda não há classificações de bilhar disponíveis.' : view === 'resultados' ? 'Ainda não há resultados de bilhar disponíveis.' : 'Ainda não há jogos de bilhar agendados.'); return; }
      container.innerHTML = view === 'classificacao' ? renderBilliardsRankings(competitions) : renderBilliardsMatches(competitions, view === 'resultados');
      installImageFallbacks(container);
    }).catch(function (error) {
      if (error.status !== 404) console.warn('Billiards information unavailable:', error);
      if (currentSport !== 'bilhar' || currentView !== view) return;
      var unavailable = error.status === 404 ? 'A informação de bilhar estará disponível assim que a nova competição for publicada.' : 'Não foi possível carregar a informação de bilhar neste momento.';
      state(container, 'fa-triangle-exclamation', unavailable, function () { loadBilliards(view); });
    });
  }
  function setSportCopy() {
    var billiards = currentSport === 'bilhar';
    var resultsIcon = billiards ? 'fa-circle-dot' : 'fa-futbol';
    document.getElementById('sport-eyebrow').textContent = billiards ? 'BILHAR · CARAMBOLA' : 'FUTEBOL';
    document.getElementById('sport-title').textContent = billiards ? 'Competições de bilhar' : 'Competições de futebol';
    document.getElementById('sport-description').textContent = billiards ? 'Calendário, resultados, classificação e acesso às equipas e atletas do universo Leça FC.' : 'Calendário, resultados e classificações das equipas do Universo Leça FC.';
    document.getElementById('calendar-title').textContent = billiards ? 'Calendário de Bilhar' : 'Calendário de Jogos';
    document.getElementById('calendar-description').textContent = billiards ? 'Jogos de Carambola organizados por competição e jornada.' : 'Próximos jogos agendados para todas as equipas do Universo Leça Futebol Clube';
    document.getElementById('classification-description').textContent = billiards ? 'Classificação completa, com as equipas do universo Leça FC em destaque.' : 'Tabelas de Classificação das várias competições';
    document.getElementById('results-description').textContent = billiards ? 'Resultados oficiais dos jogos de Carambola.' : 'Resultados dos últimos jogos realizados';
    document.getElementById('results-tab-icon').className = 'fa-solid ' + resultsIcon + ' mr-2';
    document.getElementById('results-heading-icon').className = 'fa-solid ' + resultsIcon + ' text-3xl text-emerald-700';
    document.body.classList.toggle('is-billiards', billiards);
  }
  function updateUrl() {
    var url = new URL(window.location.href); url.searchParams.set('sport', currentSport); url.searchParams.set('tab', currentView); window.history.replaceState({}, '', url);
  }
  function selectView(view, replaceUrl) {
    currentView = validViews.indexOf(view) !== -1 ? view : 'calendario';
    document.querySelectorAll('.tab-content').forEach(function (content) { content.classList.toggle('hidden', content.id !== 'content-' + currentView); });
    document.querySelectorAll('.tab-button').forEach(function (button) { var selected = button.dataset.view === currentView; button.classList.toggle('active', selected); button.classList.toggle('bg-white', selected); button.classList.toggle('text-emerald-700', selected); button.classList.toggle('bg-white/20', !selected); button.classList.toggle('text-white', !selected); button.setAttribute('aria-selected', selected ? 'true' : 'false'); });
    if (replaceUrl !== false) updateUrl();
    if (currentSport === 'bilhar') loadBilliards(currentView); else loadFootball(currentView);
  }
  function selectSport(sport, replaceUrl) {
    currentSport = validSports.indexOf(sport) !== -1 ? sport : 'futebol';
    document.querySelectorAll('.sport-button').forEach(function (button) { var selected = button.dataset.sport === currentSport; button.classList.toggle('active', selected); button.setAttribute('aria-selected', selected ? 'true' : 'false'); });
    setSportCopy();
    if (replaceUrl !== false) updateUrl();
    selectView(currentView, false);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search); var requestedSport = params.get('sport'); var requestedView = params.get('tab');
    currentSport = validSports.indexOf(requestedSport) !== -1 ? requestedSport : 'futebol'; currentView = validViews.indexOf(requestedView) !== -1 ? requestedView : 'calendario';
    document.querySelectorAll('[data-sport]').forEach(function (button) { button.addEventListener('click', function () { selectSport(button.dataset.sport); }); });
    document.querySelectorAll('[data-view]').forEach(function (button) { button.addEventListener('click', function () { selectView(button.dataset.view); }); });
    document.addEventListener('click', function (event) {
      var matchButton = event.target.closest('[data-billiards-match-id]');
      if (matchButton) { openBilliardsMatchModal(matchButton.dataset.billiardsMatchId, matchButton); return; }
      var retryButton = event.target.closest('[data-retry-billiards-match]');
      if (retryButton) openBilliardsMatchModal(retryButton.dataset.retryBilliardsMatch, lastBilliardsMatchTrigger);
      if (event.target.closest('[data-close-billiards-match]')) closeBilliardsMatchModal();
    });
    document.addEventListener('keydown', function (event) {
      var modal = document.getElementById('billiards-match-modal');
      if (!modal || modal.hidden) return;
      if (event.key === 'Escape') { closeBilliardsMatchModal(); return; }
      if (event.key !== 'Tab') return;
      var focusable = Array.prototype.slice.call(modal.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      var first = focusable[0]; var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    selectSport(currentSport, false);
  });
}());
