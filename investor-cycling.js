(function () {
  function initEcosystem() {
    const ecosystem = document.querySelector('[data-ecosystem]');
    const detail = ecosystem?.querySelector('[data-ecosystem-detail]');
    const nodes = Array.from(ecosystem?.querySelectorAll('[data-ecosystem-copy]') || []);
    if (!ecosystem || !detail || !nodes.length) return;

    nodes.forEach((node) => {
      node.addEventListener('click', () => {
        nodes.forEach((item) => item.classList.toggle('active', item === node));
        detail.textContent = node.dataset.ecosystemCopy || '';
      });
    });
  }

  function createSvgElement(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
  }

  function projectMapCoordinate(coordinate) {
    const longitude = coordinate[0];
    const latitude = coordinate[1];
    return [((longitude + 25) / 70) * 1000, ((72 - latitude) / 40) * 680];
  }

  function polygonToPath(polygon) {
    return polygon.map((ring) => ring.map((coordinate, index) => {
      const projected = projectMapCoordinate(coordinate);
      return `${index ? 'L' : 'M'}${projected[0].toFixed(2)},${projected[1].toFixed(2)}`;
    }).join('') + 'Z').join('');
  }

  function geometryToPath(geometry) {
    if (geometry.type === 'Polygon') return polygonToPath(geometry.coordinates);
    if (geometry.type === 'MultiPolygon') return geometry.coordinates.map(polygonToPath).join('');
    return '';
  }

  function animateMapView(svg, targetViewBox) {
    const start = svg.viewBox.baseVal;
    const initial = [start.x, start.y, start.width, start.height];
    const startedAt = performance.now();
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 850;

    if (svg.mapAnimationFrame) cancelAnimationFrame(svg.mapAnimationFrame);
    function frame(now) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = initial.map((value, index) => value + ((targetViewBox[index] - value) * eased));
      svg.setAttribute('viewBox', current.join(' '));
      if (progress < 1) svg.mapAnimationFrame = requestAnimationFrame(frame);
    }
    svg.mapAnimationFrame = requestAnimationFrame(frame);
  }

  function renderGeographicMap(map) {
    const svg = map.querySelector('[data-geographic-map]');
    const countriesLayer = map.querySelector('[data-map-countries]');
    const routesLayer = map.querySelector('[data-map-routes]');
    const pointsLayer = map.querySelector('[data-map-points]');
    const geography = window.CYCLING_MAP_GEOGRAPHY;
    if (!svg || !countriesLayer || !routesLayer || !pointsLayer || !geography?.features) return false;

    geography.features.forEach((feature) => {
      const path = createSvgElement('path');
      path.setAttribute('d', geometryToPath(feature.geometry));
      path.setAttribute('class', `ir-map-country${feature.properties.iso === 'PRT' ? ' is-portugal' : ''}${feature.properties.iso === 'ESP' ? ' is-spain' : ''}`);
      countriesLayer.appendChild(path);
    });

    const locations = {
      origin: [-8.704, 41.191],
      algarve: [-7.93, 37.02],
      alentejo: [-7.91, 38.57],
      camino: [-8.54, 42.88],
      beiras: [-7.50, 40.28],
      agostinho: [-9.26, 39.09],
      portugal: [-8.00, 39.70],
      luxembourg: [6.13, 49.61]
    };
    const origin = projectMapCoordinate(locations.origin);

    Object.entries(locations).forEach(([name, coordinate]) => {
      const projected = projectMapCoordinate(coordinate);
      if (name !== 'origin') {
        const route = createSvgElement('path');
        const controlX = (origin[0] + projected[0]) / 2;
        const controlY = Math.min(origin[1], projected[1]) - Math.max(18, Math.abs(projected[0] - origin[0]) * .08);
        route.setAttribute('d', `M${origin[0]},${origin[1]} Q${controlX},${controlY} ${projected[0]},${projected[1]}`);
        route.setAttribute('class', 'ir-map-route');
        route.dataset.mapRoute = name;
        routesLayer.appendChild(route);
      }

      const point = createSvgElement('g');
      point.setAttribute('class', `ir-map-point${name === 'origin' || name === 'algarve' ? ' active' : ''}`);
      point.dataset.mapPoint = name;
      const circle = createSvgElement('circle');
      circle.setAttribute('cx', projected[0]);
      circle.setAttribute('cy', projected[1]);
      circle.setAttribute('r', name === 'origin' ? '6' : '4');
      circle.setAttribute('vector-effect', 'non-scaling-stroke');
      point.appendChild(circle);
      pointsLayer.appendChild(point);
    });
    return true;
  }

  function initRaceMap() {
    const map = document.querySelector('[data-race-map]');
    if (!map || !renderGeographicMap(map)) return;
    const svg = map.querySelector('[data-geographic-map]');
    const races = Array.from(map?.querySelectorAll('[data-race]') || []);
    const points = Array.from(map?.querySelectorAll('[data-map-point]') || []);
    const routes = Array.from(map.querySelectorAll('[data-map-route]'));
    const scaleButtons = Array.from(map.querySelectorAll('[data-map-scale]'));
    if (!svg || !races.length || !points.length || !scaleButtons.length) return;

    const views = {
      origin: [205, 483, 120, 82],
      portugal: [145, 435, 260, 177],
      iberia: [110, 345, 430, 292],
      europe: [0, 0, 1000, 680]
    };
    function selectScale(scale) {
      scaleButtons.forEach((button) => {
        const active = button.dataset.mapScale === scale;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      const radius = { origin: 1.1, portugal: 1.8, iberia: 2.5, europe: 5 }[scale];
      points.forEach((point) => point.querySelector('circle')?.setAttribute('r', String(point.dataset.mapPoint === 'origin' ? radius * 1.35 : radius)));
      animateMapView(svg, views[scale]);
    }
    scaleButtons.forEach((button) => button.addEventListener('click', () => selectScale(button.dataset.mapScale)));
    selectScale('origin');

    races.forEach((race) => {
      race.addEventListener('click', () => {
        const selectedRace = race.dataset.race;
        races.forEach((item) => item.classList.toggle('active', item === race));
        points.forEach((point) => point.classList.toggle('active', point.dataset.mapPoint === selectedRace || point.dataset.mapPoint === 'origin'));
        routes.forEach((route) => route.classList.toggle('active', route.dataset.mapRoute === selectedRace));
        selectScale(selectedRace === 'luxembourg' ? 'europe' : selectedRace === 'camino' ? 'iberia' : 'portugal');
      });
    });
  }

  function initKnowledgeAreas() {
    const component = document.querySelector('[data-knowledge-areas]');
    const detail = component?.querySelector('[data-area-detail]');
    const buttons = Array.from(component?.querySelectorAll('[data-area-copy]') || []);
    if (!component || !detail || !buttons.length) return;

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        buttons.forEach((item) => item.classList.toggle('active', item === button));
        detail.textContent = button.dataset.areaCopy || '';
      });
    });
  }

  function initAiAssistant() {
    const assistant = document.querySelector('[data-ai-assistant]');
    const questionDisplay = assistant?.querySelector('[data-ai-question-display]');
    const responseDisplay = assistant?.querySelector('[data-ai-response]');
    const questions = Array.from(assistant?.querySelectorAll('[data-ai-question]') || []);
    if (!assistant || !questionDisplay || !responseDisplay || !questions.length) return;

    questions.forEach((question) => {
      question.addEventListener('click', () => {
        questions.forEach((item) => {
          const isActive = item === question;
          item.classList.toggle('active', isActive);
          item.setAttribute('aria-pressed', String(isActive));
        });
        questionDisplay.textContent = question.dataset.aiQuestion || '';
        responseDisplay.textContent = question.dataset.aiAnswer || '';
      });
    });
  }

  function initMediaOriginMap() {
    const map = document.querySelector('[data-media-origin-map]');
    if (!map || !renderGeographicMap(map)) return;

    const svg = map.querySelector('[data-geographic-map]');
    const buttons = Array.from(map.querySelectorAll('[data-origin-scale]'));
    const points = Array.from(map.querySelectorAll('[data-map-point]'));
    if (!svg || !buttons.length) return;

    const views = {
      europe: [0, 0, 1000, 680],
      iberia: [110, 345, 430, 292],
      portugal: [145, 435, 260, 177],
      matosinhos: [205, 483, 120, 82],
      origin: [221, 510, 32, 22]
    };
    const timers = [];
    function selectScale(scale) {
      buttons.forEach((button) => {
        const active = button.dataset.originScale === scale;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      points.forEach((point) => point.classList.toggle('active', scale === 'origin' && point.dataset.mapPoint === 'origin'));
      animateMapView(svg, views[scale]);
    }
    function stopSequence() {
      timers.forEach((timer) => window.clearTimeout(timer));
    }

    buttons.forEach((button) => button.addEventListener('click', () => {
      stopSequence();
      selectScale(button.dataset.originScale);
    }));
    selectScale('europe');

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      ['iberia', 'portugal', 'matosinhos', 'origin'].forEach((scale, index) => {
        timers.push(window.setTimeout(() => selectScale(scale), 700 + (index * 1050)));
      });
      observer.disconnect();
    }, { threshold: .35 });
    observer.observe(map);
  }

  function initTerritoryMap() {
    const map = document.querySelector('[data-territory-map]');
    if (!map || !renderGeographicMap(map)) return;

    const svg = map.querySelector('[data-geographic-map]');
    const buttons = Array.from(map.querySelectorAll('[data-territory-scale]'));
    const originPoint = map.querySelector('[data-map-point="origin"]');
    if (!svg || !buttons.length || !originPoint) return;

    const views = {
      origin: [221, 510, 32, 22],
      portugal: [145, 435, 260, 177],
      iberia: [110, 345, 430, 292],
      europe: [0, 0, 1000, 680]
    };
    const radii = { origin: 1, portugal: 2, iberia: 3, europe: 5 };
    const timers = [];
    function selectScale(scale) {
      buttons.forEach((button) => {
        const active = button.dataset.territoryScale === scale;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      originPoint.classList.add('active');
      originPoint.querySelector('circle')?.setAttribute('r', String(radii[scale]));
      animateMapView(svg, views[scale]);
    }
    function stopSequence() {
      timers.forEach((timer) => window.clearTimeout(timer));
    }

    buttons.forEach((button) => button.addEventListener('click', () => {
      stopSequence();
      selectScale(button.dataset.territoryScale);
    }));
    selectScale('origin');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      ['portugal', 'iberia', 'europe'].forEach((scale, index) => {
        timers.push(window.setTimeout(() => selectScale(scale), 700 + (index * 1100)));
      });
      observer.disconnect();
    }, { threshold: .35 });
    observer.observe(map);
  }

  function initRoadmapTimeline() {
    const roadmap = document.querySelector('[data-roadmap]');
    const buttons = Array.from(roadmap?.querySelectorAll('[data-roadmap-target]') || []);
    const periods = Array.from(roadmap?.querySelectorAll('[data-roadmap-period]') || []);
    if (!roadmap || !buttons.length || !periods.length) return;

    function selectPeriod(periodId) {
      buttons.forEach((button) => {
        const active = button.dataset.roadmapTarget === periodId;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    }

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const period = document.getElementById(button.dataset.roadmapTarget || '');
        if (!period) return;
        selectPeriod(period.id);
        period.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start'
        });
      });
    });

    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      const visiblePeriod = entries.find((entry) => entry.isIntersecting);
      if (visiblePeriod) selectPeriod(visiblePeriod.target.dataset.roadmapPeriod || '');
    }, { rootMargin: '-38% 0px -48% 0px', threshold: 0 });
    periods.forEach((period) => observer.observe(period));
  }

  function initPartnerGoals() {
    const component = document.querySelector('[data-partner-goals]');
    const buttons = Array.from(component?.querySelectorAll('[data-partner-goal]') || []);
    const result = component?.querySelector('[data-partner-goal-result]');
    if (!component || !buttons.length || !result) return;

    function selectGoal(button) {
      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      const opportunities = (button.dataset.partnerOpportunities || '').split('|').filter(Boolean);
      result.replaceChildren(...opportunities.map((opportunity) => {
        const item = document.createElement('strong');
        item.textContent = opportunity;
        return item;
      }));
    }

    buttons.forEach((button) => button.addEventListener('click', () => selectGoal(button)));
  }

  function initPartnershipUniverse() {
    const component = document.querySelector('[data-partnership-universe]');
    const detail = component?.querySelector('[data-partnership-detail]');
    const buttons = Array.from(component?.querySelectorAll('[data-partnership-area]') || []);
    if (!component || !detail || !buttons.length) return;

    function selectArea(button) {
      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      detail.textContent = button.dataset.partnershipCopy || '';
    }

    buttons.forEach((button) => {
      button.addEventListener('click', () => selectArea(button));
      button.addEventListener('focus', () => selectArea(button));
      button.addEventListener('mouseenter', () => selectArea(button));
    });
  }

  function initPartnershipBuilder() {
    const builder = document.querySelector('[data-partnership-builder]');
    const options = Array.from(builder?.querySelectorAll('[data-builder-goal]') || []);
    const explore = builder?.querySelector('[data-builder-explore]');
    const result = builder?.querySelector('[data-builder-result]');
    const status = builder?.querySelector('[data-builder-status]');
    if (!builder || !options.length || !explore || !result || !status) return;

    function selectedOptions() {
      return options.filter((option) => option.classList.contains('active'));
    }
    function updateSelection(option) {
      const selected = selectedOptions();
      const isActive = option.classList.contains('active');
      if (!isActive && selected.length >= 3) {
        status.textContent = 'Pode selecionar no máximo três objetivos.';
        return;
      }
      option.classList.toggle('active', !isActive);
      option.setAttribute('aria-pressed', String(!isActive));
      const count = selectedOptions().length;
      explore.disabled = count === 0;
      status.textContent = count ? `${count} ${count === 1 ? 'objetivo selecionado' : 'objetivos selecionados'}.` : 'Experiência conceptual, sem preços ou proposta comercial.';
    }
    function exploreCombination() {
      const areas = selectedOptions().flatMap((option) => (option.dataset.builderAreas || '').split('|')).filter(Boolean);
      const uniqueAreas = Array.from(new Set(areas)).slice(0, 6);
      result.replaceChildren(...uniqueAreas.map((area) => {
        const item = document.createElement('strong');
        item.textContent = area;
        return item;
      }));
      status.textContent = 'Combinação conceptual para exploração. Não constitui uma proposta comercial.';
    }

    options.forEach((option) => option.addEventListener('click', () => updateSelection(option)));
    explore.addEventListener('click', exploreCombination);
  }

  function initInvestmentUnlocks() {
    const component = document.querySelector('[data-investment-unlocks]');
    const buttons = Array.from(component?.querySelectorAll('[data-unlock]') || []);
    const before = component?.querySelector('[data-unlock-before-output]');
    const after = component?.querySelector('[data-unlock-after-output]');
    const note = component?.querySelector('[data-unlock-note-output]');
    if (!component || !buttons.length || !before || !after || !note) return;

    function selectUnlock(button) {
      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      before.textContent = button.dataset.unlockBefore || '';
      after.textContent = button.dataset.unlockAfter || '';
      note.textContent = button.dataset.unlockNote || '';
    }

    buttons.forEach((button) => button.addEventListener('click', () => selectUnlock(button)));
  }

  function initFoundingBuild() {
    const component = document.querySelector('[data-founding-build]');
    const options = Array.from(component?.querySelectorAll('[data-founding-build-option]') || []);
    const output = component?.querySelector('[data-founding-build-output]');
    if (!component || !options.length || !output) return;

    function selectDimension(option) {
      options.forEach((item) => {
        const active = item === option;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      output.textContent = option.dataset.foundingBuildCopy || '';
    }

    options.forEach((option) => option.addEventListener('click', () => selectDimension(option)));
  }

  function initFoundingConversation() {
    const component = document.querySelector('[data-founding-conversation]');
    const areas = Array.from(component?.querySelectorAll('[data-founding-area]') || []);
    const output = component?.querySelector('[data-founding-area-output]');
    if (!component || !areas.length || !output) return;

    function updateSelection(area) {
      const active = !area.classList.contains('active');
      area.classList.toggle('active', active);
      area.setAttribute('aria-pressed', String(active));
      const selected = areas.filter((item) => item.classList.contains('active')).map((item) => item.textContent.trim());
      output.textContent = selected.length ? selected.join(' · ') : 'Nenhuma área selecionada.';
    }

    areas.forEach((area) => area.addEventListener('click', () => updateSelection(area)));
  }

  function emitCyclingEvent(name, detail) {
    document.dispatchEvent(new CustomEvent('leca:investor-event', {
      detail: { name, ...detail }
    }));
  }

  function initPartnershipIntake() {
    const intake = document.querySelector('[data-partnership-intake]');
    const brief = document.querySelector('[data-partnership-brief]');
    if (!intake || !brief) return;
    const groups = Array.from(intake.querySelectorAll('[data-profile-group]'));
    const output = {
      areas: brief.querySelector('[data-brief-areas]'),
      objectives: brief.querySelector('[data-brief-objectives]'),
      contributionTypes: brief.querySelector('[data-brief-contributions]'),
      connections: brief.querySelector('[data-brief-connections]'),
      state: brief.querySelector('[data-brief-state]')
    };
    if (Object.values(output).some((element) => !element)) return;

    const partnershipProfile = {
      project: 'leca-cycling',
      areas: [],
      objectives: [],
      contributionTypes: []
    };
    function selectedValues(group) {
      return Array.from(group.querySelectorAll('[data-profile-option].active')).map((option) => option.dataset.profileValue || option.textContent.trim());
    }
    function unique(values) {
      return Array.from(new Set(values.filter(Boolean)));
    }
    function updateBrief() {
      groups.forEach((group) => {
        const key = group.dataset.profileGroup;
        if (Object.prototype.hasOwnProperty.call(partnershipProfile, key)) partnershipProfile[key] = selectedValues(group);
      });
      const earlierAreas = [
        ...Array.from(document.querySelectorAll('[data-builder-goal].active')).map((item) => item.textContent.trim()),
        ...Array.from(document.querySelectorAll('[data-founding-area].active')).map((item) => item.textContent.trim())
      ];
      const combinedAreas = unique([...earlierAreas, ...partnershipProfile.areas]);
      partnershipProfile.areas = combinedAreas;
      const activeAreaOptions = Array.from(intake.querySelectorAll('[data-profile-group="areas"] [data-profile-option].active'));
      const connections = unique(activeAreaOptions.flatMap((option) => (option.dataset.profileConnections || '').split('|'))).slice(0, 5);
      output.areas.textContent = combinedAreas.length ? combinedAreas.join(' + ') : 'Por selecionar';
      output.objectives.textContent = partnershipProfile.objectives.length ? partnershipProfile.objectives.join(' + ') : 'Por selecionar';
      output.contributionTypes.textContent = partnershipProfile.contributionTypes.length ? partnershipProfile.contributionTypes.join(' + ') : 'Opcional';
      output.connections.textContent = connections.length ? connections.join(' + ') : 'Selecione uma ou mais dimensões para revelar ligações possíveis.';
      output.state.textContent = combinedAreas.length || partnershipProfile.objectives.length ? 'Resumo atualizado' : 'Pronto para explorar';
      emitCyclingEvent('partnership_brief_generated', { profile: { ...partnershipProfile } });
    }

    groups.forEach((group) => {
      const eventName = group.dataset.profileGroup === 'areas' ? 'interest_selected' : group.dataset.profileGroup === 'objectives' ? 'objective_selected' : 'contribution_selected';
      group.querySelectorAll('[data-profile-option]').forEach((option) => option.addEventListener('click', () => {
        const active = !option.classList.contains('active');
        option.classList.toggle('active', active);
        option.setAttribute('aria-pressed', String(active));
        updateBrief();
        emitCyclingEvent(eventName, { value: option.dataset.profileValue || '', selected: active });
      }));
    });
    document.querySelectorAll('[data-builder-goal],[data-founding-area]').forEach((option) => option.addEventListener('click', () => window.setTimeout(updateBrief, 0)));
    updateBrief();
    return partnershipProfile;
  }

  function initJoinContact(partnershipProfile) {
    const form = document.querySelector('[data-join-contact]');
    const status = form?.querySelector('[data-contact-status]');
    const finalConversation = document.querySelector('[data-final-conversation]');
    const finalThanks = document.querySelector('[data-final-thanks]');
    if (!form || !status) return;
    let contactStarted = false;

    form.addEventListener('focusin', () => {
      if (contactStarted) return;
      contactStarted = true;
      emitCyclingEvent('contact_started', { project: 'leca-cycling' });
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const fields = new FormData(form);
      const contactData = {
        name: String(fields.get('name') || '').trim(),
        organization: String(fields.get('organization') || '').trim(),
        role: String(fields.get('role') || '').trim(),
        email: String(fields.get('email') || '').trim(),
        phone: String(fields.get('phone') || '').trim(),
        message: String(fields.get('message') || '').trim()
      };
      const profile = partnershipProfile || { project: 'leca-cycling', areas: [], objectives: [], contributionTypes: [] };
      const lines = [
        'Manifestação de interesse — Leça Cycling Project',
        '',
        `Nome: ${contactData.name}`,
        `Organização: ${contactData.organization}`,
        contactData.role ? `Cargo: ${contactData.role}` : '',
        `Email: ${contactData.email}`,
        contactData.phone ? `Telefone: ${contactData.phone}` : '',
        '',
        `Interesse: ${profile.areas.length ? profile.areas.join(', ') : 'Não especificado'}`,
        `Objetivos: ${profile.objectives.length ? profile.objectives.join(', ') : 'Não especificado'}`,
        `Contributo: ${profile.contributionTypes.length ? profile.contributionTypes.join(', ') : 'Não especificado'}`,
        contactData.message ? `\nMensagem:\n${contactData.message}` : ''
      ].filter(Boolean);
      const mailto = `mailto:marketing@lecafc.pt?subject=${encodeURIComponent('Interesse no Leça Cycling Project')}&body=${encodeURIComponent(lines.join('\n'))}`;
      status.textContent = 'Obrigado. Preparámos a mensagem na sua aplicação de email; conclua aí o envio para iniciar a conversa.';
      finalConversation?.classList.add('hidden');
      finalThanks?.classList.remove('hidden');
      emitCyclingEvent('contact_submitted', { project: 'leca-cycling', delivery: 'email-client' });
      window.location.href = mailto;
    });
  }

  function initJoinReturnMap() {
    const map = document.querySelector('[data-join-return-map]');
    if (!map || !renderGeographicMap(map)) return;
    const svg = map.querySelector('[data-geographic-map]');
    const labels = Array.from(map.querySelectorAll('[data-join-scale]'));
    const originPoint = map.querySelector('[data-map-point="origin"]');
    if (!svg || !labels.length || !originPoint) return;
    const views = {
      europe: [0, 0, 1000, 680],
      iberia: [110, 345, 430, 292],
      portugal: [145, 435, 260, 177],
      matosinhos: [205, 483, 120, 82],
      origin: [221, 510, 32, 22]
    };
    function selectScale(scale) {
      labels.forEach((label) => label.classList.toggle('active', label.dataset.joinScale === scale));
      originPoint.classList.toggle('active', scale === 'origin');
      animateMapView(svg, views[scale]);
    }
    selectScale('europe');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      selectScale('origin');
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      ['iberia', 'portugal', 'matosinhos', 'origin'].forEach((scale, index) => window.setTimeout(() => selectScale(scale), 650 + (index * 950)));
      observer.disconnect();
    }, { threshold: .35 });
    observer.observe(map);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initEcosystem();
    initRaceMap();
    initKnowledgeAreas();
    initAiAssistant();
    initMediaOriginMap();
    initTerritoryMap();
    initRoadmapTimeline();
    initPartnerGoals();
    initPartnershipUniverse();
    initPartnershipBuilder();
    initInvestmentUnlocks();
    initFoundingBuild();
    initFoundingConversation();
    const partnershipProfile = initPartnershipIntake();
    initJoinContact(partnershipProfile);
    initJoinReturnMap();
    if (document.querySelector('#join-project')) emitCyclingEvent('chapter_18_viewed', { project: 'leca-cycling' });
  });
}());
