(function () {
  'use strict';
  var API_BASE_URL = 'https://otw-clevvo-api-competitions-cb45ebb65abc.herokuapp.com/api';
  var container = document.getElementById('billiards-team-detail');
  var athleteModal = document.getElementById('billiards-athlete-modal');
  var athleteModalContent = document.getElementById('billiards-athlete-card-content');
  var lastFocusedElement = null;
  var athleteRequestId = 0;

  function escapeHtml(value) { return String(value === undefined || value === null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
  function value(valueToShow) { return valueToShow === null || valueToShow === undefined || valueToShow === '' ? '—' : String(valueToShow); }
  function number(valueToShow, digits) { return valueToShow === null || valueToShow === undefined ? '—' : new Intl.NumberFormat('pt-PT', { maximumFractionDigits: digits === undefined ? 2 : digits }).format(valueToShow); }
  function routeId() { var parts = window.location.pathname.split('/').filter(Boolean); if (parts.length !== 3 || parts[0] !== 'bilhar' || parts[1] !== 'equipas') return null; try { return decodeURIComponent(parts[2]); } catch (error) { return null; } }
  function safeReturnPath() { var path = new URLSearchParams(window.location.search).get('returnTo'); return path && path.charAt(0) === '/' && path.indexOf('//') !== 0 && !/^[a-z][a-z0-9+.-]*:/i.test(path) ? path : '/competicoes?sport=bilhar'; }
  function formatDate(dateValue) { if (!dateValue) return 'Data a definir'; var date = new Date(dateValue); return Number.isNaN(date.getTime()) ? 'Data a definir' : new Intl.DateTimeFormat('pt-PT', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(date); }
  function state(icon, message, retry) { container.innerHTML = '<div class="detail-state"><i class="fa-solid ' + icon + '" aria-hidden="true"></i><p>' + escapeHtml(message) + '</p>' + (retry ? '<button type="button">Tentar novamente</button>' : '') + '</div>'; var button = container.querySelector('button'); if (button) button.addEventListener('click', retry); }
  function stat(icon, label, statValue) { return '<div class="detail-stat"><i class="fa-solid ' + icon + '" aria-hidden="true"></i><strong>' + escapeHtml(statValue) + '</strong><span>' + escapeHtml(label) + '</span></div>'; }
  function fact(label, factValue) { return '<div class="detail-fact"><dt>' + escapeHtml(label) + '</dt><dd>' + escapeHtml(value(factValue)) + '</dd></div>'; }
  function initials(name) { return String(name || '?').trim().split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0); }).join('').toUpperCase(); }
  function playerCard(player) {
    var image = player.photoUrl ? '<img class="roster-card__photo" data-detail-image src="' + escapeHtml(player.photoUrl) + '" alt="Fotografia de ' + escapeHtml(player.name) + '">' : '<span class="roster-card__fallback">' + escapeHtml(initials(player.name)) + '</span>';
    var record = player.matches === null || player.matches === undefined ? 'Estatísticas por confirmar' : number(player.wins, 0) + ' vitórias em ' + number(player.matches, 0) + ' jogos';
    return '<button class="roster-card" type="button" data-athlete-id="' + escapeHtml(player.id) + '" aria-label="Abrir carta de ' + escapeHtml(player.name || 'atleta') + '">' + image + '<span><strong>' + escapeHtml(player.name || 'Atleta') + '</strong><small>' + escapeHtml(record) + '</small></span></button>';
  }
  function athleteTeam(team) {
    var name = team.name || 'Equipa';
    if (team.isManagedTeam !== true || !team.id) return '<strong>' + escapeHtml(name) + '</strong>';
    return '<a class="managed-team-link" href="/bilhar/equipas/' + encodeURIComponent(team.id) + '"><strong>' + escapeHtml(name) + '</strong></a>';
  }
  function athleteMatch(match) {
    return '<article class="athlete-card-match"><div><strong>' + escapeHtml(match.competitionName || 'Competição') + '</strong><small>' + escapeHtml(formatDate(match.date)) + (match.phase ? ' · ' + escapeHtml(match.phase) : '') + '</small></div><div><span>vs. ' + escapeHtml(match.opponentName || 'Adversário por confirmar') + '</span><strong>' + escapeHtml(match.result || match.status || 'A disputar') + '</strong></div></article>';
  }
  function renderAthleteCard(athlete) {
    var rankings = Array.isArray(athlete.rankings) ? athlete.rankings : [];
    var teams = Array.isArray(athlete.teams) ? athlete.teams : [];
    var competitions = Array.isArray(athlete.competitions) ? athlete.competitions : [];
    var matches = Array.isArray(athlete.matches) ? athlete.matches : [];
    var photo = athlete.photoUrl ? '<img class="billiards-player-card__photo" data-athlete-image src="' + escapeHtml(athlete.photoUrl) + '" alt="Fotografia de ' + escapeHtml(athlete.name) + '">' : '<div class="billiards-player-card__fallback">' + escapeHtml(initials(athlete.name)) + '</div>';
    athleteModalContent.innerHTML = '<article class="billiards-player-card"><section class="billiards-player-card__hero"><p class="billiards-player-card__brand">Leça FC · Bilhar Três Tabelas</p><span class="billiards-player-card__tag">Carta de atleta</span>' + photo + '<h2 id="billiards-athlete-name">' + escapeHtml(athlete.name || 'Atleta') + '</h2><p>' + escapeHtml(athlete.clubName || 'Clube por confirmar') + '</p></section><section class="billiards-player-card__details"><p class="detail-eyebrow">Perfil do atleta</p><h3>Ficha de competição</h3><dl class="athlete-card-facts">' + fact('Idade', athlete.age === null || athlete.age === undefined ? null : athlete.age + ' anos') + fact('Distrito', athlete.district) + fact('Clube', athlete.clubName) + fact('Identificador', athlete.id) + '</dl><div class="athlete-card-summary">' + stat('fa-ranking-star', 'Rankings', number(rankings.length, 0)) + stat('fa-people-group', 'Equipas', number(teams.length, 0)) + stat('fa-calendar-check', 'Jogos', number(matches.length, 0)) + '</div></section><section class="athlete-card-section"><h3>Equipas</h3>' + (teams.length ? '<div class="athlete-card-chips">' + teams.map(function (team) { return '<div>' + athleteTeam(team) + '<small>' + escapeHtml([team.variant, team.sportingRight].filter(Boolean).join(' · ') || 'Informação por confirmar') + '</small></div>'; }).join('') + '</div>' : '<p class="empty-detail">Sem equipas disponíveis.</p>') + '</section><section class="athlete-card-section"><h3>Rankings e competições</h3><div class="athlete-card-columns"><div>' + (rankings.length ? rankings.map(function (ranking) { return '<div class="athlete-card-row"><strong>' + escapeHtml(ranking.name || 'Ranking') + '</strong><span>' + (ranking.position === null || ranking.position === undefined ? 'Posição por confirmar' : escapeHtml(ranking.position) + '.ª posição') + '</span></div>'; }).join('') : '<p class="empty-detail">Sem rankings disponíveis.</p>') + '</div><div>' + (competitions.length ? competitions.map(function (competition) { return '<div class="athlete-card-row"><strong>' + escapeHtml(competition.name || 'Competição') + '</strong><span>' + escapeHtml([competition.variant, competition.type].filter(Boolean).join(' · ') || 'Informação por confirmar') + '</span></div>'; }).join('') : '<p class="empty-detail">Sem competições disponíveis.</p>') + '</div></div></section><section class="athlete-card-section"><h3>Jogos individuais</h3>' + (matches.length ? '<div class="athlete-card-matches">' + matches.slice().sort(function (a, b) { return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(); }).map(athleteMatch).join('') + '</div>' : '<p class="empty-detail">Sem jogos individuais disponíveis.</p>') + '</section></article>';
    var image = athleteModalContent.querySelector('[data-athlete-image]');
    if (image) image.addEventListener('error', function () { image.hidden = true; });
  }
  function closeAthleteCard() {
    if (athleteModal.hidden) return;
    athleteRequestId += 1;
    athleteModal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusedElement) lastFocusedElement.focus();
  }
  function openAthleteCard(athleteId) {
    if (!athleteId || !/^[A-Za-z0-9_-]+$/.test(athleteId)) return;
    var requestId = athleteRequestId + 1; athleteRequestId = requestId;
    lastFocusedElement = document.activeElement;
    athleteModalContent.innerHTML = '<div class="athlete-card-loading"><i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i><h2 id="billiards-athlete-name">A carregar carta...</h2></div>';
    athleteModal.hidden = false;
    document.body.style.overflow = 'hidden';
    athleteModal.querySelector('.billiards-athlete-modal__card').focus();
    fetch(API_BASE_URL + '/public/billiards/athletes/' + encodeURIComponent(athleteId)).then(function (response) { if (!response.ok) { var error = new Error('request failed'); error.status = response.status; throw error; } return response.json(); }).then(function (data) { if (requestId !== athleteRequestId) return; if (!data.content) throw new Error('empty response'); renderAthleteCard(data.content); }).catch(function (error) { if (requestId !== athleteRequestId) return; if (error.status !== 404) console.warn('Billiards athlete unavailable:', error); athleteModalContent.innerHTML = '<div class="athlete-card-loading"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><h2 id="billiards-athlete-name">Carta indisponível</h2><p>' + (error.status === 404 ? 'O detalhe deste atleta ainda não está disponível.' : 'Não foi possível carregar o atleta neste momento.') + '</p></div>'; });
  }
  function teamName(team) {
    var name = team && team.name ? team.name : 'Equipa';
    if (!team || team.isManagedTeam !== true || !team.id) return escapeHtml(name);
    return '<a class="managed-team-link" href="/bilhar/equipas/' + encodeURIComponent(team.id) + '">' + escapeHtml(name) + '</a>';
  }
  function matchCard(match) {
    var result = match.hasOfficialResult ? (match.result || [match.homeScore, match.awayScore].filter(function (score) { return score !== null && score !== undefined; }).join(' - ')) : 'A disputar';
    return '<article class="detail-list-card"><div class="detail-list-card__meta"><i class="fa-solid fa-calendar-days" aria-hidden="true"></i> ' + escapeHtml(formatDate(match.date)) + ' · ' + escapeHtml(match.time ? String(match.time).slice(0, 5) : 'Hora a definir') + '<br>Jornada ' + escapeHtml(number(match.round, 0)) + (match.matchNumber ? ' · Jogo ' + escapeHtml(match.matchNumber) : '') + '</div><div class="detail-list-card__main"><strong>' + teamName(match.homeTeam) + ' — ' + teamName(match.awayTeam) + '</strong><small>' + escapeHtml(match.venue || 'Local a definir') + '</small></div><div class="detail-list-card__result">' + escapeHtml(result || 'Resultado pendente') + '</div></article>';
  }
  function installImageFallbacks() { container.querySelectorAll('[data-detail-image]').forEach(function (image) { image.addEventListener('error', function () { image.hidden = true; }); }); }
  function render(team) {
    if (team.isManagedTeam !== true) { state('fa-circle-info', 'O detalhe desta equipa não pertence ao universo Leça FC.'); return; }
    document.title = (team.name || 'Equipa de Bilhar') + ' - Universo Leça FC';
    var media = team.logoUrl ? '<img data-detail-image src="' + escapeHtml(team.logoUrl) + '" alt="Símbolo de ' + escapeHtml(team.name) + '">' : '<i class="fa-solid fa-circle-dot" aria-hidden="true"></i>';
    var facilities = [team.facilitiesName, team.facilitiesAddress].filter(Boolean).join('\n');
    var roster = Array.isArray(team.roster) ? team.roster : []; var calendar = Array.isArray(team.calendar) ? team.calendar : [];
    container.innerHTML = '<header class="detail-hero"><div class="detail-hero__media">' + media + '</div><div class="detail-hero__content"><p class="detail-eyebrow">Bilhar · Carambola · Universo Leça FC</p><h1>' + escapeHtml(team.name || 'Equipa de Bilhar') + '</h1><p class="detail-hero__lead">' + escapeHtml(team.clubName || 'Leça Futebol Clube') + '</p><div class="detail-tags">' + [team.variant, team.district].filter(Boolean).map(function (tag) { return '<span class="detail-tag">' + escapeHtml(tag) + '</span>'; }).join('') + '</div></div></header><section class="detail-grid" aria-label="Estatísticas da equipa">' + stat('fa-calendar-check', 'Jogos', number(team.matches, 0)) + stat('fa-trophy', 'Vitórias', number(team.wins, 0)) + stat('fa-scale-balanced', 'Empates', number(team.draws, 0)) + stat('fa-circle-xmark', 'Derrotas', number(team.losses, 0)) + stat('fa-bullseye', 'Partidas', number(team.gamesWon, 0) + '–' + number(team.gamesLost, 0)) + stat('fa-percent', 'Percentagem de vitórias', team.winPercentage === null || team.winPercentage === undefined ? '—' : number(team.winPercentage, 1) + '%') + '</section><section class="detail-section"><div class="detail-section__heading"><div><p>Perfil</p><h2>Informação da equipa</h2></div></div><dl class="detail-facts">' + fact('Clube', team.clubName) + fact('Variante', team.variant) + fact('Distrito', team.district) + fact('Instalações', facilities) + fact('Média', number(team.average, 3)) + fact('Identificador', team.id) + '</dl></section><section class="detail-section"><div class="detail-section__heading"><div><p>Atletas</p><h2>Plantel</h2></div><span>' + roster.length + ' atleta' + (roster.length === 1 ? '' : 's') + '</span></div>' + (roster.length ? '<div class="roster-grid">' + roster.map(playerCard).join('') + '</div>' : '<p class="empty-detail">Ainda não há atletas disponíveis para esta equipa.</p>') + '</section><section class="detail-section"><div class="detail-section__heading"><div><p>Época atual</p><h2>Calendário e resultados</h2></div><span>' + calendar.length + ' jogo' + (calendar.length === 1 ? '' : 's') + '</span></div>' + (calendar.length ? '<div class="detail-list">' + calendar.slice().sort(function (a, b) { return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime(); }).map(matchCard).join('') + '</div>' : '<p class="empty-detail">Ainda não há jogos disponíveis para esta equipa.</p>') + '</section>';
    installImageFallbacks();
    container.querySelectorAll('[data-athlete-id]').forEach(function (button) { button.addEventListener('click', function () { openAthleteCard(button.dataset.athleteId); }); });
  }
  function load() {
    var id = routeId(); document.getElementById('detail-back').href = safeReturnPath();
    if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) { state('fa-circle-exclamation', 'Não foi possível identificar a equipa.'); return; }
    state('fa-spinner fa-spin', 'A carregar equipa...');
    fetch(API_BASE_URL + '/public/billiards/teams/' + encodeURIComponent(id)).then(function (response) { if (!response.ok) { var error = new Error('request failed'); error.status = response.status; throw error; } return response.json(); }).then(function (data) { if (!data.content) throw new Error('empty response'); render(data.content); }).catch(function (error) { if (error.status !== 404) console.warn('Billiards team unavailable:', error); state(error.status === 404 ? 'fa-circle-info' : 'fa-triangle-exclamation', error.status === 404 ? 'O detalhe desta equipa ainda não está disponível.' : 'Não foi possível carregar a equipa neste momento.', load); });
  }
  document.querySelectorAll('[data-close-athlete-modal]').forEach(function (element) { element.addEventListener('click', closeAthleteCard); });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeAthleteCard(); });
  document.addEventListener('DOMContentLoaded', load);
}());
