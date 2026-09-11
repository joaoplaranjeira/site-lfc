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

  document.addEventListener('DOMContentLoaded', () => {
    initEcosystem();
    initRaceMap();
    initKnowledgeAreas();
    initAiAssistant();
    initMediaOriginMap();
    initTerritoryMap();
  });
}());
