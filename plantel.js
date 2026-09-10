(function () {
  'use strict';

  var API_BASE_URL = 'https://otw-clevvo-api-competitions-cb45ebb65abc.herokuapp.com/api';
  var TEAM_PLAYERS_ENDPOINT = '/public/scouting/teams/';
  var TEAM_CALENDAR_ENDPOINT = '/public/competition-data-v2/teams/';
  var PLAYER_STATISTICS_ENDPOINT = '/public/scouting/players/';
  var modal = document.getElementById('player-modal');
  var modalContent = document.getElementById('player-card-content');
  var playersContainer = document.getElementById('players');
  var calendarContainer = document.getElementById('team-calendar');
  var rankingsContainer = document.getElementById('team-rankings');
  var calendarLoaded = false;
  var rankingsLoaded = false;
  var lastFocusedElement = null;

  function text(value, fallback) { return value === null || value === undefined || value === '' ? (fallback || '—') : String(value); }
  function physicalAttributes(player) {
    var values = [];
    if (player.heightCentimeters !== null && player.heightCentimeters !== undefined) values.push(player.heightCentimeters + ' cm');
    if (player.weightKilograms !== null && player.weightKilograms !== undefined) values.push(player.weightKilograms + ' kg');
    return values.length ? values.join(' · ') : '—';
  }
  function getBirthDate(player) {
    if (!player.birthDate) return null;
    var date = new Date(player.birthDate);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  function getAge(player) {
    var birthDate = getBirthDate(player);
    if (!birthDate) return null;
    var today = new Date();
    var age = today.getFullYear() - birthDate.getFullYear();
    var birthdayHasPassed = today.getMonth() > birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
    return birthdayHasPassed ? age : age - 1;
  }
  function birthDateWithAge(player) {
    var birthDate = getBirthDate(player);
    var age = getAge(player);
    if (!birthDate) return '—';
    return birthDate.toLocaleDateString('pt-PT') + (age === null ? '' : '\n' + age + ' anos');
  }
  function playerNationalities(player) {
    if (Array.isArray(player.nationalities) && player.nationalities.length) return player.nationalities.filter(Boolean).join(' · ');
    return text(player.nationality);
  }
  function initials(player) { return text(player.knownName || player.name || player.fullName, '?').trim().split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0); }).join('').toUpperCase(); }
  function playerName(player) { return text(player.knownName || player.name || player.fullName, 'Jogador'); }
  function getReturnPath() {
    var params = new URLSearchParams(window.location.search);
    var returnTo = params.get('returnTo');
    return returnTo && !/^[a-z][a-z0-9+.-]*:/i.test(returnTo) && returnTo.indexOf('//') !== 0 ? returnTo : 'competicoes.html';
  }
  function showState(icon, message) { playersContainer.innerHTML = '<div class="squad-state"><i class="fa-solid ' + icon + '"></i><p>' + message + '</p></div>'; }
  function showCalendarState(icon, message) { calendarContainer.innerHTML = '<div class="squad-state"><i class="fa-solid ' + icon + '"></i><p>' + message + '</p></div>'; }
  function showRankingsState(icon, message) { rankingsContainer.innerHTML = '<div class="squad-state"><i class="fa-solid ' + icon + '"></i><p>' + message + '</p></div>'; }
  function makeAvatar(player, className) {
    var image = document.createElement('img');
    image.className = className;
    image.alt = 'Fotografia de ' + playerName(player);
    image.src = player.photoUrl;
    image.addEventListener('error', function () { var fallback = document.createElement('div'); fallback.className = className + '__fallback'; fallback.textContent = initials(player); image.replaceWith(fallback); });
    return image;
  }
  function createTile(player) {
    var tile = document.createElement('button');
    tile.type = 'button'; tile.className = 'player-tile'; tile.setAttribute('aria-label', 'Abrir carta de ' + playerName(player));
    if (player.isConfiguredClubPlayer) { var badge = document.createElement('span'); badge.className = 'player-tile__badge'; badge.textContent = 'Carta destacada'; tile.appendChild(badge); }
    if (player.photoUrl) { tile.appendChild(makeAvatar(player, 'player-tile__photo')); } else { var fallback = document.createElement('div'); fallback.className = 'player-tile__fallback'; fallback.textContent = initials(player); tile.appendChild(fallback); }
    var body = document.createElement('span'); body.className = 'player-tile__body';
    var name = document.createElement('span'); name.className = 'player-tile__name'; name.textContent = playerName(player);
    var position = document.createElement('span'); position.className = 'player-tile__position'; position.textContent = text(player.position, 'Posição por confirmar');
    var profile = document.createElement('span'); profile.className = 'player-tile__profile';
    var age = getAge(player); profile.textContent = [age === null ? null : age + ' anos', player.nationality || null].filter(Boolean).join(' · ') || 'Dados por confirmar';
    body.appendChild(name); body.appendChild(position); body.appendChild(profile); tile.appendChild(body);
    tile.addEventListener('click', function () { openCard(player); });
    return tile;
  }
  function infoItem(label, value) { var item = document.createElement('div'); item.className = 'player-info__item'; var dt = document.createElement('dt'); dt.textContent = label; var dd = document.createElement('dd'); dd.textContent = text(value); item.appendChild(dt); item.appendChild(dd); return item; }
  function statValue(value) { return value === null || value === undefined ? '—' : String(value); }
  function createStatTile(icon, label, value, modifier) {
    var tile = document.createElement('div'); tile.className = 'player-stat' + (modifier ? ' player-stat--' + modifier : '');
    var symbol = document.createElement('i'); symbol.className = 'fa-solid ' + icon; symbol.setAttribute('aria-hidden', 'true');
    var number = document.createElement('strong'); number.textContent = statValue(value);
    var caption = document.createElement('span'); caption.textContent = label;
    tile.appendChild(symbol); tile.appendChild(number); tile.appendChild(caption);
    return tile;
  }
  function createStatisticsSection() {
    var section = document.createElement('section'); section.className = 'player-statistics'; section.setAttribute('aria-live', 'polite');
    var heading = document.createElement('h3'); heading.textContent = 'Destaques da época'; section.appendChild(heading);
    var state = document.createElement('p'); state.className = 'player-statistics__state'; state.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> A carregar estatísticas...'; section.appendChild(state);
    return section;
  }
  function showStatisticsError(section, message) {
    var state = section.querySelector('.player-statistics__state');
    if (!state) { state = document.createElement('p'); section.appendChild(state); }
    state.className = 'player-statistics__state player-statistics__state--empty';
    state.textContent = message;
  }
  function isGoalkeeper(player) { return /guarda[-\s]?redes|guarda redes|goalkeeper/i.test(text(player.position, '')); }
  function appendStatisticsHighlights(section, statistics, player) {
    var highlights = isGoalkeeper(player) ? [
      ['fa-futbol', 'Jogos realizados', statistics.numberOfMatchesPlayed], ['fa-stopwatch', 'Tempo de jogo', statistics.minutes], ['fa-shield-halved', 'Golos sofridos', statistics.goalsConceded]
    ] : [
      ['fa-futbol', 'Jogos realizados', statistics.numberOfMatchesPlayed], ['fa-stopwatch', 'Tempo de jogo', statistics.minutes], ['fa-bullseye', 'Golos marcados', statistics.goalsScored]
    ];
    var grid = document.createElement('div'); grid.className = 'player-statistics__highlights';
    highlights.forEach(function (highlight) { grid.appendChild(createStatTile(highlight[0], highlight[1], highlight[2], 'featured')); });
    section.appendChild(grid);
  }
  function renderStatistics(section, statistics, player) {
    var totals = statistics.totals || {};
    section.textContent = '';
    var header = document.createElement('div'); header.className = 'player-statistics__header';
    var eyebrow = document.createElement('p'); eyebrow.className = 'player-statistics__eyebrow'; eyebrow.textContent = 'Rendimento em campo'; header.appendChild(eyebrow);
    var heading = document.createElement('h3'); heading.textContent = 'Destaques da época'; header.appendChild(heading); section.appendChild(header);
    if (!Object.keys(totals).length) { showStatisticsError(section, 'Ainda não há estatísticas disponíveis nesta época.'); return; }
    appendStatisticsHighlights(section, totals, player);
  }
  async function loadPlayerStatistics(player, section) {
    var playerId = player.playerId !== null && player.playerId !== undefined ? player.playerId : player.id;
    if (playerId === null || playerId === undefined || playerId === '') { showStatisticsError(section, 'Estatísticas indisponíveis para este jogador.'); return; }
    try {
      var response = await fetch(API_BASE_URL + PLAYER_STATISTICS_ENDPOINT + encodeURIComponent(playerId) + '/statistics');
      if (!response.ok) throw new Error('statistics request failed');
      var data = await response.json(); renderStatistics(section, data && data.content ? data.content : {}, player);
    } catch (error) { console.error('Error loading player statistics:', error); showStatisticsError(section, 'Não foi possível carregar as estatísticas neste momento.'); }
  }
  function openCard(player) {
    lastFocusedElement = document.activeElement;
    modalContent.textContent = '';
    var card = document.createElement('div'); card.className = 'collectible-card' + (player.isConfiguredClubPlayer ? '' : ' collectible-card--standard');
    var hero = document.createElement('section'); hero.className = 'collectible-card__hero';
    var brand = document.createElement('p'); brand.className = 'collectible-card__brand'; brand.textContent = 'Plantel Leça FC'; hero.appendChild(brand);
    var tag = document.createElement('span'); tag.className = 'collectible-card__tag'; tag.textContent = player.isConfiguredClubPlayer ? 'Carta destacada' : 'Carta de jogador'; hero.appendChild(tag);
    if (player.photoUrl) { hero.appendChild(makeAvatar(player, 'collectible-card__avatar')); } else { var avatarFallback = document.createElement('div'); avatarFallback.className = 'collectible-card__initials'; avatarFallback.textContent = initials(player); hero.appendChild(avatarFallback); }
    var name = document.createElement('h2'); name.id = 'card-player-name'; name.className = 'collectible-card__name'; name.textContent = playerName(player); hero.appendChild(name);
    var club = document.createElement('p'); club.className = 'collectible-card__club'; club.textContent = text(player.currentClubName, 'Leça Futebol Clube'); hero.appendChild(club);
    var status = document.createElement('p'); status.className = 'collectible-card__status'; status.textContent = player.isActiveInCompetitions ? 'Disponível para competir' : 'Perfil do plantel'; hero.appendChild(status);
    var details = document.createElement('section'); details.className = 'collectible-card__details'; var heading = document.createElement('h2'); heading.textContent = 'Ficha do jogador'; details.appendChild(heading);
    var list = document.createElement('dl'); list.className = 'player-info'; [['Nome completo', player.fullName || player.name], ['Data de nascimento', birthDateWithAge(player)], ['Nacionalidades', playerNationalities(player)], ['Clube atual', player.currentClubName], ['Posição', player.position], ['Posição secundária', player.secondaryPosition], ['Pé preferido', player.preferredFoot], ['Altura e peso', physicalAttributes(player)]].forEach(function (item) { list.appendChild(infoItem(item[0], item[1])); }); details.appendChild(list);
    var statisticsSection = createStatisticsSection(); details.appendChild(statisticsSection);
    card.appendChild(hero); card.appendChild(details); modalContent.appendChild(card); modal.hidden = false; document.body.style.overflow = 'hidden'; modal.querySelector('.player-card-modal').focus();
    loadPlayerStatistics(player, statisticsSection);
  }
  function closeCard() { if (modal.hidden) return; modal.hidden = true; document.body.style.overflow = ''; if (lastFocusedElement) lastFocusedElement.focus(); }
  function getPlayersFromResponse(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data && data.content)) return data.content;
    if (Array.isArray(data && data.players)) return data.players;
    if (Array.isArray(data && data.content && data.content.items)) return data.content.items;
    return [];
  }
  function formatMatchDate(value) { var date = new Date(value); return Number.isNaN(date.getTime()) ? 'Data por confirmar' : new Intl.DateTimeFormat('pt-PT', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date); }
  function getMatchesFromResponse(data) { var content = data && data.content !== undefined ? data.content : data; if (Array.isArray(content)) return content; return Array.isArray(content && content.matches) ? content.matches : []; }
  function escapeHtml(value) { return String(value === undefined || value === null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
  function calendarGroup(match) { return [match.competitionName || 'Competição', match.phaseName, match.phaseGroupName].filter(Boolean).join(' · '); }
  function matchHasResult(match) { return match.score && match.score !== 'Aguardar' && match.score !== '-'; }
  function renderTeamMatchCard(match, teamId) { var isHome = String(match.homeTeamId) === String(teamId) || match.isHomeTeamHighlighted === true; var hasResult = matchHasResult(match); var score = hasResult ? String(match.score).replace('(NO)', '') : '—'; var info = [match.fixtureDescription, match.stadium].filter(Boolean).join(' · ') || 'Local por confirmar'; var returnTo = window.location.pathname.split('/').pop() + window.location.search; var scoreMarkup = hasResult && match.id ? '<a class="team-match-card__score-link" href="jogo.html?calendarId=' + encodeURIComponent(match.id) + '&returnTo=' + encodeURIComponent(returnTo) + '" aria-label="Ver detalhes do jogo: ' + escapeHtml(score) + '" title="Ver detalhes do jogo"><span>' + escapeHtml(score) + '</span><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>' : escapeHtml(score); return '<article class="team-match-card ' + (isHome ? 'team-match-card--home' : '') + '"><div class="team-match-card__date"><span class="team-match-card__icon"><i class="fa-solid fa-calendar-days"></i></span><span>' + escapeHtml(formatMatchDate(match.date)) + '</span></div><div class="team-match-card__teams"><div><strong>' + escapeHtml(match.homeTeam || 'Equipa da casa') + '</strong><small>Casa</small></div><span class="team-match-card__score">' + scoreMarkup + '</span><div><strong>' + escapeHtml(match.awayTeam || 'Equipa visitante') + '</strong><small>Fora</small></div></div><div class="team-match-card__meta"><p>' + escapeHtml(info) + '</p></div></article>'; }
  function renderTeamCalendarList(matches, teamId, view) {
    var visible = matches.filter(function (match) { return view === 'upcoming' ? !matchHasResult(match) : view === 'results' ? matchHasResult(match) : true; });
    var categories = visible.reduce(function (all, match) { var category = match.categoryDescription || 'Outros'; var competition = calendarGroup(match); if (!all[category]) all[category] = {}; if (!all[category][competition]) all[category][competition] = []; all[category][competition].push(match); return all; }, {});
    var list = document.getElementById('team-calendar-list');
    if (!visible.length) { list.innerHTML = '<div class="squad-state"><i class="fa-solid fa-calendar-xmark"></i><p>' + (view === 'results' ? 'Ainda não há jogos realizados.' : 'Não há jogos agendados.') + '</p></div>'; return; }
    list.innerHTML = Object.keys(categories).sort(function (a, b) { return a.localeCompare(b, 'pt'); }).map(function (category) { return '<section class="team-calendar-category"><h3><i class="fa-solid fa-layer-group"></i>' + escapeHtml(category) + '</h3>' + Object.keys(categories[category]).sort(function (a, b) { return a.localeCompare(b, 'pt'); }).map(function (competition) { var sorted = categories[category][competition].sort(function (a, b) { return view === 'results' ? new Date(b.date).getTime() - new Date(a.date).getTime() : new Date(a.date).getTime() - new Date(b.date).getTime(); }); return '<section class="team-calendar-competition"><h4>' + escapeHtml(competition) + '</h4><div class="team-match-list">' + sorted.map(function (match) { return renderTeamMatchCard(match, teamId); }).join('') + '</div></section>'; }).join('') + '</section>'; }).join('');
  }
  function renderTeamCalendar(matches, teamId) {
    var upcoming = matches.filter(function (match) { return !matchHasResult(match); }).sort(function (a, b) { return new Date(a.date).getTime() - new Date(b.date).getTime(); });
    var results = matches.filter(matchHasResult);
    var nextMatch = upcoming[0];
    calendarContainer.innerHTML = (nextMatch ? '<section class="next-match"><div class="next-match__label"><i class="fa-solid fa-bolt"></i> Próximo jogo</div><div class="next-match__content"><div><p class="next-match__competition">' + escapeHtml(calendarGroup(nextMatch)) + '</p><p class="next-match__date">' + escapeHtml(formatMatchDate(nextMatch.date)) + '</p></div><div class="next-match__teams"><strong>' + escapeHtml(nextMatch.homeTeam || 'Equipa da casa') + '</strong><span>—</span><strong>' + escapeHtml(nextMatch.awayTeam || 'Equipa visitante') + '</strong></div><p>' + escapeHtml([nextMatch.fixtureDescription, nextMatch.stadium].filter(Boolean).join(' · ') || 'Local por confirmar') + '</p></div></section>' : '') + '<div class="calendar-filters" role="tablist" aria-label="Filtrar calendário"><button type="button" class="calendar-filter is-active" data-calendar-view="upcoming" role="tab" aria-selected="true">Próximos jogos <span>' + upcoming.length + '</span></button><button type="button" class="calendar-filter" data-calendar-view="results" role="tab" aria-selected="false">Jogos realizados <span>' + results.length + '</span></button><button type="button" class="calendar-filter" data-calendar-view="all" role="tab" aria-selected="false">Calendário completo <span>' + matches.length + '</span></button></div><div id="team-calendar-list"></div>';
    calendarContainer.querySelectorAll('[data-calendar-view]').forEach(function (button) { button.addEventListener('click', function () { var view = this.dataset.calendarView; calendarContainer.querySelectorAll('[data-calendar-view]').forEach(function (item) { var active = item === button; item.classList.toggle('is-active', active); item.setAttribute('aria-selected', active ? 'true' : 'false'); }); renderTeamCalendarList(matches, teamId, view); }); });
    renderTeamCalendarList(matches, teamId, 'upcoming');
  }
  async function loadCalendar() {
    if (calendarLoaded) return;
    var params = new URLSearchParams(window.location.search); var teamId = params.get('teamId');
    if (!teamId) { showCalendarState('fa-circle-exclamation', 'Não foi possível identificar a equipa.'); return; }
    showCalendarState('fa-spinner fa-spin', 'A carregar calendário completo...');
    try { var response = await fetch(API_BASE_URL + TEAM_CALENDAR_ENDPOINT + encodeURIComponent(teamId) + '/calendars'); if (!response.ok) throw new Error('calendar request failed'); var matches = getMatchesFromResponse(await response.json()); if (!matches.length) { showCalendarState('fa-calendar-xmark', 'Ainda não há jogos registados para esta equipa.'); return; } renderTeamCalendar(matches, teamId); calendarLoaded = true; } catch (error) { console.error('Error loading team calendar:', error); showCalendarState('fa-triangle-exclamation', 'Não foi possível carregar o calendário neste momento.'); }
  }
  function collectRankings(value, rankings) {
    if (Array.isArray(value)) { value.forEach(function (item) { collectRankings(item, rankings); }); return; }
    if (!value || typeof value !== 'object') return;
    if (value.position !== undefined && value.competitionId !== undefined) { rankings.push(value); return; }
    ['categories', 'competitions', 'phases', 'groups', 'rankings', 'items'].forEach(function (key) { if (value[key]) collectRankings(value[key], rankings); });
  }
  function rankingValue(value) { return value === null || value === undefined || value === '' ? '—' : escapeHtml(value); }
  function renderTeamRankings(rankings) {
    var competitions = rankings.reduce(function (all, ranking) { var name = ranking.competitionName || 'Competição'; var stage = [ranking.phaseName, ranking.phaseGroupName].filter(Boolean).join(' · '); var key = String(ranking.competitionId || '') + '|' + name + '|' + stage; if (!all[key]) all[key] = { name: name, stage: stage, heading: [name, stage].filter(Boolean).join(' · '), rows: [] }; all[key].rows.push(ranking); return all; }, {});
    rankingsContainer.innerHTML = Object.keys(competitions).map(function (key) { return competitions[key]; }).sort(function (a, b) { return a.name.localeCompare(b.name, 'pt') || a.stage.localeCompare(b.stage, 'pt'); }).map(function (competition) { var lastPosition = 0; competition.rows.sort(function (a, b) { return Number(a.position) - Number(b.position); }); return '<section class="ranking-competition"><h3><i class="fa-solid fa-trophy"></i>' + escapeHtml(competition.heading) + '</h3><div class="ranking-table-wrap"><table class="ranking-table"><thead><tr><th>Pos.</th><th>Equipa</th><th>Pts</th><th>J</th><th>GM</th><th>GS</th></tr></thead><tbody>' + competition.rows.map(function (row) { var position = Number(row.position); var displayedPosition = Number.isFinite(position) && position > lastPosition ? position : lastPosition + 1; lastPosition = displayedPosition; return '<tr' + (row.isHighlightedRow ? ' class="ranking-table__highlighted"' : '') + '><td><strong>' + displayedPosition + 'º</strong></td><td><strong>' + rankingValue(row.teamName || row.clubDescription || row.clubName) + '</strong></td><td><strong>' + rankingValue(row.points) + '</strong></td><td>' + rankingValue(row.numberOfMatches !== undefined ? row.numberOfMatches : row.matches) + '</td><td>' + rankingValue(row.goalsScored) + '</td><td>' + rankingValue(row.goalsConceded !== undefined ? row.goalsConceded : row.goalsAgainst) + '</td></tr>'; }).join('') + '</tbody></table></div></section>'; }).join('');
  }
  async function loadRankings() {
    if (rankingsLoaded) return;
    var teamId = new URLSearchParams(window.location.search).get('teamId');
    if (!teamId) { showRankingsState('fa-circle-exclamation', 'Não foi possível identificar a equipa.'); return; }
    showRankingsState('fa-spinner fa-spin', 'A carregar classificações...');
    try { var response = await fetch(API_BASE_URL + TEAM_CALENDAR_ENDPOINT + encodeURIComponent(teamId) + '/rankings'); if (!response.ok) throw new Error('rankings request failed'); var rankings = []; collectRankings((await response.json()).content, rankings); if (!rankings.length) { showRankingsState('fa-table-list', 'Ainda não há classificações disponíveis para esta equipa.'); return; } renderTeamRankings(rankings); rankingsLoaded = true; } catch (error) { console.error('Error loading team rankings:', error); showRankingsState('fa-triangle-exclamation', 'Não foi possível carregar as classificações neste momento.'); }
  }
  function selectTab(tab) { ['players', 'calendar', 'rankings'].forEach(function (name) { var selected = name === tab; document.getElementById('panel-' + name).hidden = !selected; var button = document.getElementById('tab-' + name); button.classList.toggle('is-active', selected); button.setAttribute('aria-selected', selected); }); if (tab === 'calendar') loadCalendar(); if (tab === 'rankings') loadRankings(); }
  async function loadPlayers() {
    var params = new URLSearchParams(window.location.search); var teamId = params.get('teamId'); var teamName = params.get('teamName'); var category = params.get('category');
    document.getElementById('back-link').href = getReturnPath();
    if (teamName) { document.getElementById('squad-title').textContent = teamName; if (category) { var categoryBadge = document.getElementById('squad-category'); categoryBadge.textContent = category; categoryBadge.hidden = false; } document.getElementById('squad-subtitle').textContent = 'Plantel, calendário e classificação da equipa.'; }
    if (!teamId) { showState('fa-circle-exclamation', 'Não foi possível identificar a equipa deste contexto.'); return; }
    showState('fa-spinner fa-spin', 'A carregar plantel...');
    try {
      var response = await fetch(API_BASE_URL + TEAM_PLAYERS_ENDPOINT + encodeURIComponent(teamId) + '/players');
      if (!response.ok) throw new Error('players request failed');
      var data = await response.json(); var players = getPlayersFromResponse(data);
      if (!players.length) { showState('fa-users-slash', 'Ainda não há jogadores disponíveis para esta equipa.'); return; }
      playersContainer.textContent = ''; players.forEach(function (player) { playersContainer.appendChild(createTile(player)); });
    } catch (error) { console.error('Error loading squad:', error); showState('fa-triangle-exclamation', 'Não foi possível carregar o plantel neste momento.'); }
  }
  document.querySelectorAll('[data-close-modal]').forEach(function (element) { element.addEventListener('click', closeCard); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeCard(); });
  document.addEventListener('DOMContentLoaded', function () { document.getElementById('tab-players').addEventListener('click', function () { selectTab('players'); }); document.getElementById('tab-calendar').addEventListener('click', function () { selectTab('calendar'); }); document.getElementById('tab-rankings').addEventListener('click', function () { selectTab('rankings'); }); loadPlayers(); });
}());
