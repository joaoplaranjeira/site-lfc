import { useEffect, useRef, useState } from 'react';
import './christmas.css';

const STARTING_LIGHTS = 100;
const FOUNDATION_LIGHTS = 1912;
const MAX_LIGHTS = 2026;
const CLUB_LIGHT_POINTS = 1088;
const CHRISTMAS_ACCESS_API_BASE = 'https://otw-clevvo-api-authentication-67bd3c9de3ba.herokuapp.com';
const CHRISTMAS_ACCESS_CONTEXT_TYPE = 'InvestorRoom';
const CHRISTMAS_ACCESS_CONTEXT_ID = '5';
const CHRISTMAS_ACCESS_SESSION_KEY = `investor_room_access_granted_${CHRISTMAS_ACCESS_CONTEXT_ID}`;

const CHRISTMAS_ACCESS_ERRORS = {
  'invalid access code': 'Código inválido. Por favor, tenta novamente.',
  'código de acesso inválido': 'Código inválido. Por favor, tenta novamente.',
  'código de acesso revogado': 'Este código foi revogado e já não pode ser utilizado.',
  'código de acesso expirado': 'Este código expirou e já não é válido.',
  'código de acesso atingiu o limite de utilizações': 'Este código já atingiu o número máximo de utilizações.',
  'código de acesso inválido para este contexto': 'Código inválido. Por favor, tenta novamente.'
};

const INITIAL_WISHES = [
  { text: 'Que nunca nos falte força para acreditar.', author: 'Um leceiro' },
  { text: 'Mais domingos juntos, na bancada e em família.', author: 'Família Martins' },
  { text: 'Que 2027 traga alegria a toda a nossa vila.', author: 'Anónimo' },
  { text: 'Leça hoje, amanhã e sempre.', author: 'Sócio n.º 1842' }
];

const CARD_THEMES = {
  classic: { label: 'Clássico', className: 'is-classic', line: 'Há luzes que nunca se apagam.' },
  football: { label: 'Futebol', className: 'is-football', line: 'Jogamos todos com o mesmo coração.' },
  leca: { label: 'Leça da Palmeira', className: 'is-leca', line: 'Da nossa terra para o mundo.' }
};

function seededRandom(seed) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function shuffleLights(points, seed) {
  const random = seededRandom(seed);
  const shuffled = [...points];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}

function selectEvenLights(candidates, total, seed) {
  const shuffled = shuffleLights(candidates, seed);
  for (const minimumDistance of [12, 10, 8, 6, 4]) {
    const cellSize = minimumDistance / 1000;
    const buckets = new Map();
    const selected = [];
    for (const candidate of shuffled) {
      const cellX = Math.floor(candidate.x / cellSize);
      const cellY = Math.floor(candidate.y / cellSize);
      let tooClose = false;
      for (let offsetY = -1; offsetY <= 1 && !tooClose; offsetY += 1) {
        for (let offsetX = -1; offsetX <= 1 && !tooClose; offsetX += 1) {
          const neighbours = buckets.get(`${cellX + offsetX}:${cellY + offsetY}`) || [];
          tooClose = neighbours.some((point) => Math.hypot(point.x - candidate.x, point.y - candidate.y) < cellSize);
        }
      }
      if (tooClose) continue;
      selected.push(candidate);
      const key = `${cellX}:${cellY}`;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(candidate);
      if (selected.length === total) return selected;
    }
  }
  return shuffled.slice(0, total);
}

function sampleTextLights(context, text, options) {
  const { y, font, total, color, seed } = options;
  context.clearRect(0, 0, 1000, 1000);
  context.fillStyle = '#fff';
  context.font = font;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 500, y);

  const pixels = context.getImageData(0, 0, 1000, 1000).data;
  const candidates = [];
  for (let pixelY = 0; pixelY < 1000; pixelY += 4) {
    for (let pixelX = 0; pixelX < 1000; pixelX += 4) {
      if (pixels[(pixelY * 1000 + pixelX) * 4 + 3] > 100) {
        candidates.push({ x: pixelX / 1000, y: pixelY / 1000, color });
      }
    }
  }
  if (candidates.length >= total) return selectEvenLights(candidates, total, seed);
  return Array.from({ length: total }, (_, index) => candidates[index % candidates.length]);
}

let christmasMessageDrawingCache = null;

function createChristmasMessageDrawing() {
  if (christmasMessageDrawingCache) return christmasMessageDrawingCache;
  const surface = document.createElement('canvas');
  surface.width = 1000;
  surface.height = 1000;
  const context = surface.getContext('2d', { willReadFrequently: true });

  const greetingPoints = [
    ...sampleTextLights(context, 'FELIZ', { y: 210, font: '900 240px Poppins, Arial, sans-serif', total: 800, color: 'warm', seed: 21 }),
    ...sampleTextLights(context, 'NATAL', { y: 490, font: '900 270px Poppins, Arial, sans-serif', total: 1112, color: 'warm', seed: 25 })
  ];
  const clubPoints = sampleTextLights(context, 'LFC', { y: 950, font: '900 220px Poppins, Arial, sans-serif', total: CLUB_LIGHT_POINTS, color: 'gold', seed: 30 });
  const greetingSequence = shuffleLights(greetingPoints.map((_, index) => index), FOUNDATION_LIGHTS);
  const greetingActivation = new Array(greetingPoints.length);
  greetingSequence.forEach((pointIndex, rank) => { greetingActivation[pointIndex] = rank; });
  const clubSequence = shuffleLights(clubPoints.map((_, index) => index), MAX_LIGHTS);
  const clubActivation = new Array(clubPoints.length);
  clubSequence.forEach((pointIndex, rank) => {
    clubActivation[pointIndex] = FOUNDATION_LIGHTS + Math.floor(rank * (MAX_LIGHTS - FOUNDATION_LIGHTS) / CLUB_LIGHT_POINTS);
  });
  christmasMessageDrawingCache = [
    ...greetingPoints.map((point, index) => ({ ...point, activation: greetingActivation[index] })),
    ...clubPoints.map((point, index) => ({ ...point, activation: clubActivation[index] }))
  ];
  return christmasMessageDrawingCache;
}

function ChristmasMessageLightsCanvas({ count, milestone }) {
  const canvasRef = useRef(null);
  const displayedCountRef = useRef(STARTING_LIGHTS);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d');
    const drawing = createChristmasMessageDrawing();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fromCount = displayedCountRef.current;
    const targetCount = Math.min(count, MAX_LIGHTS);
    const transitionDuration = reducedMotion ? 0 : Math.min(700, 180 + Math.abs(targetCount - fromCount) * .45);
    let transitionStart = null;
    let frame = 0;
    let stopped = false;
    const animatePoints = !reducedMotion && count <= 600;

    const draw = (time = 0) => {
      if (stopped) return;
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * ratio));
      const height = Math.max(1, Math.round(rect.height * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      context.clearRect(0, 0, width, height);
      const random = seededRandom(1912);
      if (transitionStart === null) transitionStart = time;
      const transitionProgress = transitionDuration === 0 ? 1 : Math.min((time - transitionStart) / transitionDuration, 1);
      const easedProgress = 1 - Math.pow(1 - transitionProgress, 3);
      const visibleLights = Math.round(fromCount + (targetCount - fromCount) * easedProgress);
      displayedCountRef.current = visibleLights;
      const scale = Math.min(width, height);
      const radiusBase = 1.7 * ratio;

      for (let index = 0; index < drawing.length; index += 1) {
        const point = drawing[index];
        const x = width / 2 + (point.x - .5) * scale;
        const y = height / 2 + (point.y - .5) * scale;
        const isLit = point.activation < visibleLights;
        const phase = random() * Math.PI * 2;
        const isRecent = point.activation >= Math.max(0, visibleLights - 80) && point.activation < visibleLights;
        const pulse = isLit ? (animatePoints && isRecent ? .62 + Math.sin(time / 700 + phase) * .24 : milestone ? .98 : .86) : .12;
        const radius = isLit ? radiusBase : .72 * ratio;
        const colors = {
          gold: ['248,211,123', '#f6ce70'],
          warm: ['255,238,190', '#ffe2a0'],
          mint: ['155,241,211', '#64e5b7']
        };
        const [rgb, glow] = colors[point.color] || colors.gold;
        context.beginPath();
        context.fillStyle = `rgba(${rgb},${pulse})`;
        context.shadowColor = isLit ? glow : 'transparent';
        context.shadowBlur = isLit ? (index % 9 === 0 ? (milestone ? 10 : 7) : milestone ? 3 : 1.5) * ratio : 0;
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }

      if (transitionProgress < 1 || animatePoints) frame = window.requestAnimationFrame(draw);
    };

    draw(performance.now());
    const resizeObserver = new ResizeObserver(() => draw(performance.now()));
    resizeObserver.observe(canvas);
    return () => {
      stopped = true;
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [count, milestone]);

  return <canvas ref={canvasRef} className="christmas-village-lights" aria-hidden="true" />;
}

function createWishStarPoints(count) {
  const random = seededRandom(2027);
  return Array.from({ length: count }, (_, index) => ({
    index,
    x: 0.04 + random() * 0.92,
    y: 0.08 + random() * 0.86,
    phase: random() * Math.PI * 2,
    warm: random() > 0.72,
    brightness: random()
  }));
}

function WishStarsCanvas({ count, highlightedIndices, onSelect, selectedIndex }) {
  const canvasRef = useRef(null);
  const pointsRef = useRef([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const highlightedKey = highlightedIndices.join(':');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d');
    const points = createWishStarPoints(count);
    const highlighted = new Set(highlightedIndices);
    pointsRef.current = points;
    const animate = count > 0 && count <= 180 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let stopped = false;

    function draw(time = 0) {
      if (stopped) return;
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * ratio));
      const height = Math.max(1, Math.round(rect.height * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      context.clearRect(0, 0, width, height);
      const radius = (count < 80 ? 1.8 : count < 500 ? 1.25 : count < 1500 ? 0.9 : 0.62) * ratio;

      for (const point of points) {
        const x = point.x * width;
        const y = point.y * height;
        const pulse = animate ? 0.38 + (Math.sin(time / 850 + point.phase) + 1) * 0.26 : 0.62 + point.brightness * 0.28;
        const isSelected = point.index === selectedIndex;
        const isHovered = point.index === hoveredIndex;
        const isOwned = highlighted.has(point.index);
        const isHighlighted = isSelected || isHovered || isOwned;
        context.beginPath();
        context.fillStyle = isOwned ? '#fff1bd' : point.warm ? `rgba(244,211,126,${isHighlighted ? 1 : pulse})` : `rgba(225,255,245,${isHighlighted ? 1 : pulse})`;
        context.shadowColor = isHighlighted ? '#f4d681' : 'transparent';
        context.shadowBlur = isSelected ? 16 * ratio : isHovered ? 11 * ratio : isOwned ? 8 * ratio : 0;
        const emphasis = isSelected ? 2.4 : isHovered ? 1.8 : isOwned ? 1.55 : 1;
        context.arc(x, y, isHighlighted ? Math.max(radius * emphasis, isOwned ? 2.6 * ratio : 3 * ratio) : radius, 0, Math.PI * 2);
        context.fill();
      }
      if (animate) frame = window.requestAnimationFrame(draw);
    }

    draw();
    const resizeObserver = new ResizeObserver(() => draw());
    resizeObserver.observe(canvas);
    return () => {
      stopped = true;
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [count, highlightedKey, hoveredIndex, selectedIndex]);

  function findNearestStar(event) {
    if (!count) return null;
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    let nearest = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const point of pointsRef.current) {
      const distance = Math.hypot(point.x * rect.width - clickX, point.y * rect.height - clickY);
      if (distance < nearestDistance) {
        nearest = point.index;
        nearestDistance = distance;
      }
    }
    const hitRadius = count > 1000 ? 10 : count > 180 ? 13 : 18;
    return nearest !== null && nearestDistance <= hitRadius ? nearest : null;
  }

  function selectNearestStar(event) {
    const nearest = findNearestStar(event);
    if (nearest !== null) onSelect(nearest);
  }

  return (
    <canvas
      ref={canvasRef}
      className="christmas-wish-stars-canvas"
      role={count ? 'button' : undefined}
      tabIndex={count ? 0 : -1}
      aria-label={count ? `Campo com ${count.toLocaleString('pt-PT')} estrelas. Seleciona uma estrela para descobrir o desejo.${highlightedIndices.length ? ' A tua estrela está mais brilhante.' : ''}` : undefined}
      aria-hidden={!count}
      style={{ cursor: hoveredIndex === null ? 'default' : 'pointer' }}
      onClick={selectNearestStar}
      onPointerMove={(event) => setHoveredIndex(findNearestStar(event))}
      onPointerLeave={() => setHoveredIndex(null)}
      onKeyDown={(event) => {
        if ((event.key === 'Enter' || event.key === ' ') && count) {
          event.preventDefault();
          onSelect(selectedIndex === null ? 0 : (selectedIndex + 1) % count);
        }
      }}
    />
  );
}

function Skyline() {
  return (
    <div className="christmas-skyline" aria-hidden="true">
      <span className="christmas-moon" />
      <span className="christmas-star star-one" />
      <span className="christmas-star star-two" />
      <span className="christmas-star star-three" />
      <span className="christmas-lighthouse"><i /></span>
      <span className="christmas-buildings building-one" />
      <span className="christmas-buildings building-two" />
      <span className="christmas-buildings building-three" />
      <span className="christmas-sea"><i /></span>
    </div>
  );
}

function FestiveDecor() {
  return (
    <div className="christmas-festive-decor" aria-hidden="true">
      <div className="christmas-pine christmas-pine-left">
        {Array.from({ length: 8 }, (_, index) => <i key={index} style={{ '--sprig': index }} />)}
        <span className="christmas-berry berry-one" /><span className="christmas-berry berry-two" /><span className="christmas-berry berry-three" />
      </div>
      <div className="christmas-pine christmas-pine-right">
        {Array.from({ length: 8 }, (_, index) => <i key={index} style={{ '--sprig': index }} />)}
        <span className="christmas-berry berry-one" /><span className="christmas-berry berry-two" /><span className="christmas-berry berry-three" />
      </div>
      <div className="christmas-light-string">
        {Array.from({ length: 15 }, (_, index) => <i key={index} style={{ '--bulb': index }} />)}
      </div>
      <div className="christmas-snowfall">
        {Array.from({ length: 26 }, (_, index) => (
          <i key={index} style={{
            '--flake-left': `${(index * 37) % 101}%`,
            '--flake-size': `${2 + (index % 3)}px`,
            '--flake-duration': `${9 + (index % 5) * 2}s`,
            '--flake-delay': `${index * -0.72}s`,
            '--flake-drift': `${index % 2 ? 34 : -24}px`
          }} />
        ))}
      </div>
    </div>
  );
}

function Icon({ children }) {
  return <span className="christmas-icon" aria-hidden="true">{children}</span>;
}

function ParticipationPanel({ stage, setStage, participant, setParticipant, onLight }) {
  const [holding, setHolding] = useState(false);
  const holdTimer = useRef(null);

  function stopHolding() {
    setHolding(false);
    window.clearTimeout(holdTimer.current);
  }

  function startHolding() {
    if (holding) return;
    setHolding(true);
    holdTimer.current = window.setTimeout(() => {
      setHolding(false);
      onLight();
    }, 1600);
  }

  useEffect(() => () => window.clearTimeout(holdTimer.current), []);

  if (stage === 'closed') return null;

  return (
    <div className="christmas-panel-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) setStage('closed');
    }}>
      <section className="christmas-panel" role="dialog" aria-modal="true" aria-labelledby="participation-title">
        <button className="christmas-panel-close" type="button" onClick={() => setStage('closed')} aria-label="Fechar">×</button>
        <p className="christmas-kicker">Experiência demonstrativa</p>
        {stage === 'form' && (
          <>
            <div className="christmas-step"><span>1</span><i /><span>2</span></div>
            <h2 id="participation-title">Esta luz começa em ti.</h2>
            <p className="christmas-panel-copy">Os dados servem apenas para demonstrar a interface. Nada será enviado ou guardado.</p>
            <form onSubmit={(event) => { event.preventDefault(); setStage('ignite'); }}>
              <label>Como te devemos chamar?
                <input required value={participant.name} onChange={(event) => setParticipant({ ...participant, name: event.target.value })} placeholder="O teu nome" autoComplete="name" />
              </label>
              <label>E-mail
                <input required type="email" value={participant.email} onChange={(event) => setParticipant({ ...participant, email: event.target.value })} placeholder="nome@exemplo.pt" autoComplete="email" />
              </label>
              <label className="christmas-check"><input required type="checkbox" /><span>Li e aceito as regras desta demonstração.</span></label>
              <button className="christmas-primary-button" type="submit">Preparar a minha luz <span>→</span></button>
            </form>
          </>
        )}
        {stage === 'ignite' && (
          <div className="christmas-ignite-step">
            <div className="christmas-step"><span className="is-done">✓</span><i className="is-done" /><span>2</span></div>
            <p className="christmas-kicker">Luz 1.912</p>
            <h2 id="participation-title">{participant.name || 'Leceiro'}, chegou o teu momento.</h2>
            <p className="christmas-panel-copy">Mantém pressionado para entregar a tua luz ao Leça.</p>
            <button
              className={`christmas-hold-button${holding ? ' is-holding' : ''}`}
              type="button"
              onPointerDown={startHolding}
              onPointerUp={stopHolding}
              onPointerLeave={stopHolding}
              onPointerCancel={stopHolding}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onLight();
                }
              }}
            >
              <span className="christmas-hold-ring"><i /></span>
              <strong>{holding ? 'Continua…' : 'Mantém para acender'}</strong>
              <small>Enter para acender sem animação</small>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function Milestone({ name, onClose }) {
  return (
    <section className="christmas-milestone" role="dialog" aria-modal="true" aria-labelledby="milestone-title">
      <div className="christmas-milestone-particles" aria-hidden="true">
        {Array.from({ length: 24 }, (_, index) => <i key={index} style={{ '--particle': index }} />)}
      </div>
      <div className="christmas-milestone-content">
        <img src="/images/leca.png" alt="Símbolo do Leça Futebol Clube" />
        <p>{name || 'Leceiro'}, acendeste a luz que nos trouxe até aqui.</p>
        <strong className="christmas-year">1912</strong>
        <h2 id="milestone-title">O ano em que começou<br />a nossa luz.</h2>
        <div className="christmas-founder-line"><span /><i>114 anos de paixão leceira</i><span /></div>
        <p className="christmas-milestone-message">1.912 não é o limite. <strong>É o começo.</strong></p>
        <button type="button" onClick={onClose}>Ver a minha luz <span>→</span></button>
      </div>
    </section>
  );
}

function copyRenderedStyles(source, target) {
  const computed = window.getComputedStyle(source);
  for (const property of computed) target.style.setProperty(property, computed.getPropertyValue(property), computed.getPropertyPriority(property));
  Array.from(source.children).forEach((child, index) => copyRenderedStyles(child, target.children[index]));
}

async function collectPageStyles() {
  const fontStyles = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,600&family=Poppins:wght@400;500;600;700;800;900&display=swap');`;
  const decorationStyles = `
    .christmas-postcard::before { position:absolute; inset:15px; border:1px solid rgba(232,197,117,.45); content:''; }
    .christmas-postcard::after { position:absolute; z-index:0; top:11%; right:7%; width:40%; height:45%; content:''; opacity:.38; background-image:radial-gradient(circle,#f2d792 0 1px,transparent 1.5px),radial-gradient(circle,rgba(255,255,255,.72) 0 .7px,transparent 1.2px); background-position:0 0,13px 17px; background-size:34px 34px,27px 27px; mask-image:radial-gradient(circle,black,transparent 72%); }
    .postcard-top::before,.postcard-top::after { height:1px; flex:1; background:rgba(232,197,117,.35); content:''; }
    .christmas-postcard footer::before,.christmas-postcard footer::after { height:1px; flex:1; background:rgba(232,197,117,.28); content:''; }
    .christmas-prize-card::before { position:absolute; top:-80px; right:-70px; width:240px; height:240px; border:1px solid rgba(232,197,117,.14); border-radius:50%; content:''; box-shadow:0 0 0 28px rgba(232,197,117,.025),0 0 0 55px rgba(232,197,117,.018); }
  `;

  return `${fontStyles}\n${decorationStyles}`;
}

/* Mantém cada exportação visualmente idêntica ao componente renderizado. */
async function collectRenderedMarkup(element) {
  const bounds = element.getBoundingClientRect();
  const clone = element.cloneNode(true);
  copyRenderedStyles(element, clone);

  const originalImages = Array.from(element.querySelectorAll('img'));
  const clonedImages = Array.from(clone.querySelectorAll('img'));
  await Promise.all(originalImages.map(async (image, index) => {
    try {
      if (!image.complete) await image.decode();
      const imageCanvas = document.createElement('canvas');
      imageCanvas.width = image.naturalWidth;
      imageCanvas.height = image.naturalHeight;
      imageCanvas.getContext('2d').drawImage(image, 0, 0);
      clonedImages[index].src = imageCanvas.toDataURL('image/png');
    } catch {
      clonedImages[index].src = image.src;
    }
  }));

  clone.style.margin = '0';
  clone.style.width = `${bounds.width}px`;
  clone.style.height = `${bounds.height}px`;
  const css = (await collectPageStyles()).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const markup = new XMLSerializer().serializeToString(clone);
  return {
    bounds,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${bounds.width}" height="${bounds.height}" viewBox="0 0 ${bounds.width} ${bounds.height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><style>${css}</style>${markup}</div></foreignObject></svg>`
  };
}

async function downloadRenderedElement(element, filename) {
  if (!element) throw new Error('Elemento para exportação indisponível.');
  await document.fonts?.ready;
  const { svg } = await collectRenderedMarkup(element);
  const downloadUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  const link = document.createElement('a');
  link.download = filename;
  link.href = downloadUrl;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

function PostcardStudio({ participant, onDownload }) {
  const postcardRef = useRef(null);
  const [theme, setTheme] = useState('classic');
  const [signature, setSignature] = useState('Família Leceira');
  const selected = CARD_THEMES[theme];
  const [notice, setNotice] = useState('');

  async function downloadPostcard() {
    try {
      await downloadRenderedElement(postcardRef.current, 'postal-natal-leca-2026.svg');
      setNotice('Postal descarregado com sucesso. Já podes avançar.');
      onDownload();
    } catch (error) {
      console.error('Falha ao exportar o postal.', error);
      setNotice('Não foi possível descarregar o postal. Tenta novamente.');
    }
  }

  return (
    <section className="christmas-section christmas-studio" id="postal" aria-labelledby="studio-title">
      <div className="christmas-studio-grid">
        <div className="christmas-studio-intro">
          <div className="christmas-section-heading">
            <div><p className="christmas-kicker">O teu postal</p><h2 id="studio-title">Leva esta luz contigo.</h2></div>
            <p>Cria uma memória digital da tua participação e partilha-a com quem faz parte do teu Natal.</p>
          </div>
          <div className="christmas-controls">
            <fieldset>
              <legend>Escolhe um ambiente</legend>
              <div className="christmas-theme-options">
                {Object.entries(CARD_THEMES).map(([key, item]) => (
                  <button key={key} type="button" className={theme === key ? 'is-active' : ''} onClick={() => setTheme(key)}>
                    <span className={`theme-swatch ${item.className}`} /><strong>{item.label}</strong>
                  </button>
                ))}
              </div>
            </fieldset>
            <label>Assinatura do postal
              <input maxLength="42" value={signature} onChange={(event) => setSignature(event.target.value)} />
              <small>{signature.length}/42 caracteres</small>
            </label>
            <button className="christmas-primary-button" type="button" onClick={downloadPostcard}>Descarregar postal <span>↓</span></button>
            <p className="christmas-form-notice" role="status">{notice}</p>
          </div>
        </div>
        <div className="christmas-postcard-frame">
          <article ref={postcardRef} className={`christmas-postcard ${selected.className}`}>
            <div className="postcard-top"><span>LEÇA FUTEBOL CLUBE</span></div>
            <div className="postcard-greeting">
              <strong>FELIZ<br />NATAL</strong>
              <span>E UM</span>
              <em>BOM ANO<br /><b>2027</b></em>
            </div>
            <small>{selected.line}</small>
            <div className="postcard-identity"><img src="/images/leca.png" alt="" /><div><span>VEM VIVER O LEÇA CONNOSCO.</span><small>SÃO OS VOTOS DE</small><strong>{signature || participant.name || 'Família Leceira'}</strong></div></div>
            <footer>Uma cidade. Um clube. Um Natal Leceiro.</footer>
          </article>
        </div>
      </div>
    </section>
  );
}

function WishWall({ participant, completed, onComplete }) {
  const revealRef = useRef(null);
  const [wishes, setWishes] = useState(INITIAL_WISHES);
  const [starCount, setStarCount] = useState(INITIAL_WISHES.length);
  const [wish, setWish] = useState('');
  const [message, setMessage] = useState('');
  const [selectedWish, setSelectedWish] = useState(null);
  const visibleWishes = wishes.slice(0, Math.min(wishes.length, starCount));
  const ownStarIndices = visibleWishes.reduce((indices, item, index) => item.isOwn ? [...indices, index] : indices, []);
  const selectedEntry = selectedWish === null
    ? null
    : selectedWish < visibleWishes.length
      ? { ...visibleWishes[selectedWish], simulated: false }
      : selectedWish < starCount
        ? { text: '', author: '', simulated: true }
        : null;

  useEffect(() => {
    if (selectedWish === null) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!revealRef.current?.contains(event.target)) setSelectedWish(null);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [selectedWish]);

  function adjustStars(amount) {
    const nextCount = Math.min(5000, Math.max(0, starCount + amount));
    setStarCount(nextCount);
    if (selectedWish !== null && selectedWish >= nextCount) setSelectedWish(null);
  }

  function submitWish(event) {
    event.preventDefault();
    if (completed) return;
    const cleanWish = wish.trim();
    if (!cleanWish) return;
    const nextWishes = [{ text: cleanWish, author: participant.name || 'Leceiro', isOwn: true }, ...wishes];
    const nextStarCount = Math.max(starCount + 1, nextWishes.length);
    setWishes(nextWishes);
    setStarCount(nextStarCount);
    setSelectedWish(0);
    setWish('');
    setMessage('✓ Desejo inserido. A tua estrela está mais brilhante e a conclusão foi desbloqueada.');
    onComplete(nextStarCount);
  }

  return (
    <section className="christmas-wishes" id="desejos" aria-labelledby="wishes-title">
      <div className="christmas-wish-intro">
        <p className="christmas-kicker">Um céu feito de desejos</p>
        <h2 id="wishes-title">O que desejas para 2027?</h2>
        <p>Escreve algo para o Clube, para a vila ou para alguém que caminha contigo.</p>
        <form onSubmit={submitWish}>
          <label className="sr-only" htmlFor="wish-text">O teu desejo</label>
          <textarea id="wish-text" maxLength="200" value={wish} onChange={(event) => setWish(event.target.value)} placeholder="Em 2027, desejo que…" disabled={completed} />
          <div className="christmas-wish-meta"><span>{wish.length}/200</span><strong>✦ Em nome de {participant.name || 'Leceiro'}</strong></div>
          <button className="christmas-primary-button" type="submit" disabled={completed}>{completed ? 'Desejo entregue ✓' : 'Entregar ao céu'} {!completed && <span>↑</span>}</button>
          <p className="christmas-form-notice" role="status">{message}</p>
        </form>
      </div>
      <div className="christmas-wish-sky" aria-label="Desejos da comunidade">
        <WishStarsCanvas
          count={starCount}
          highlightedIndices={ownStarIndices}
          selectedIndex={selectedWish}
          onSelect={setSelectedWish}
        />
        <p className="christmas-sky-hint"><span>✦</span> Seleciona uma estrela para descobrir um desejo</p>
        <div className="christmas-test-controls christmas-star-test-controls" role="group" aria-label="Controlos de teste da contagem de estrelas">
          <em>Teste rápido</em>
          <button type="button" onClick={() => adjustStars(-100)} disabled={starCount === 0} aria-label="Retirar 100 estrelas">−100</button>
          <button type="button" onClick={() => adjustStars(-1)} disabled={starCount === 0} aria-label="Retirar uma estrela">−1</button>
          <button type="button" onClick={() => adjustStars(1)} disabled={starCount === 5000} aria-label="Adicionar uma estrela">+1</button>
          <button type="button" onClick={() => adjustStars(100)} disabled={starCount === 5000} aria-label="Adicionar 100 estrelas">+100</button>
          <output>{starCount.toLocaleString('pt-PT')} estrelas</output>
        </div>
        {starCount > 120 && <p className="christmas-adaptive-mode"><span /> Modo adaptativo · Canvas</p>}
        {selectedEntry && (
          <article ref={revealRef} className="christmas-wish-reveal" aria-live="polite" aria-label={selectedEntry.simulated ? 'Desejo simulado sem conteúdo' : undefined}>
            <button type="button" onClick={() => setSelectedWish(null)} aria-label="Fechar desejo">×</button>
            <span aria-hidden="true">✦</span>
            <p>{selectedEntry.text ? `“${selectedEntry.text}”` : '\u00A0'}</p>
            <small>{selectedEntry.author ? `— ${selectedEntry.author}` : '\u00A0'}</small>
          </article>
        )}
      </div>
    </section>
  );
}

function DrawResultsPage({ result, onReturn }) {
  return (
    <main className="christmas-page christmas-draw-page">
      <header className="christmas-header">
        <a href="/" className="christmas-brand" aria-label="Leça Futebol Clube — página inicial"><img src="/images/leca.png" alt="" /><span>LEÇA FUTEBOL CLUBE</span></a>
      </header>
      <section className="christmas-draw-screen" aria-labelledby="draw-title">
        <FestiveDecor />
        <div className="christmas-draw-screen-copy">
          <p className="christmas-kicker"><span /> Sorteio realizado · 25 de dezembro · 15h</p>
          <h1 id="draw-title">JÁ TEMOS<br /><em>VENCEDORES.</em></h1>
          <p>Os titulares dos números sorteados serão contactados em breve através do e-mail disponibilizado na participação.</p>
        </div>
        <div className="christmas-draw-winners" aria-label="Resultados do sorteio" aria-live="polite">
          <article>
            <span>01 · Luz vencedora</span>
            <strong>#{result.light.toLocaleString('pt-PT')}</strong>
            <p>Camisola oficial do Leça Futebol Clube</p>
          </article>
          <article>
            <span>02 · Estrela vencedora</span>
            <strong>#{result.star.toLocaleString('pt-PT')}</strong>
            <p>Hoodie versão jogador</p>
          </article>
        </div>
        <button className="christmas-draw-return" type="button" onClick={onReturn}>Voltar ao início da experiência <span>↺</span></button>
        <div className="christmas-season-ribbon" aria-hidden="true"><span>Leça Futebol Clube</span><i>✦</i><span>1912</span><i>✦</i><span>Leça da Palmeira</span></div>
      </section>
    </main>
  );
}

function JourneyIntro({ onStart, onToggleDraw }) {
  return (
    <section className="christmas-journey-intro" id="inicio" aria-labelledby="journey-title">
      <FestiveDecor />
      <div className="christmas-journey-intro-copy">
        <p className="christmas-kicker"><span /> Natal 2026 · Leça Futebol Clube</p>
        <p className="christmas-season-script">Boas Festas</p>
        <h1 id="journey-title">ESTE NATAL,<br /><em>O LEÇA BRILHA CONTIGO.</em></h1>
        <p>Cada leceiro deixa uma luz, leva uma memória e entrega um desejo ao universo leceiro. No final, a tua luz e a tua estrela dão-te duas oportunidades de ganhar.</p>
        <button className="christmas-primary-button" type="button" onClick={onStart}>Começar a experiência <span>→</span></button>
        <p className="christmas-demo-note"><span>●</span> Protótipo UI — nenhum dado é enviado</p>
        <button className="christmas-draw-mode-toggle" type="button" onClick={onToggleDraw}>Simular resultado do sorteio <span>→</span></button>
      </div>
      <div className="christmas-journey-map" aria-label="A experiência tem quatro passos">
        <article><Icon>01</Icon><div><h2>Acender</h2><p>Acende uma luz e recebe o teu número para o sorteio da camisola oficial.</p></div></article>
        <article><Icon>02</Icon><div><h2>Personalizar</h2><p>Cria o teu cartão de Boas Festas e descarrega-o para partilhar.</p></div></article>
        <article><Icon>03</Icon><div><h2>Desejar</h2><p>Entrega um desejo e recebe o número da tua estrela para o sorteio do hoodie.</p></div></article>
        <article><Icon>04</Icon><div><h2>Premiar</h2><p>No dia 25 de dezembro, às 15h, sorteamos uma camisola oficial e um hoodie versão jogador entre os números participantes.</p></div></article>
      </div>
      <div className="christmas-season-ribbon" aria-hidden="true"><span>Leça Futebol Clube</span><i>✦</i><span>1912</span><i>✦</i><span>Leça da Palmeira</span></div>
    </section>
  );
}

function ExperienceComplete({ participant, lightNumber, starNumber, onRestart }) {
  const lightCardRef = useRef(null);
  const starCardRef = useRef(null);
  const [downloadNotice, setDownloadNotice] = useState('');

  async function downloadCard(kind) {
    const isLight = kind === 'light';
    try {
      await downloadRenderedElement(
        isLight ? lightCardRef.current : starCardRef.current,
        isLight ? `cartao-luz-${lightNumber}-lfc.svg` : `cartao-estrela-${starNumber}-lfc.svg`
      );
      setDownloadNotice(`Cartão da ${isLight ? 'luz' : 'estrela'} descarregado com sucesso.`);
    } catch (error) {
      console.error('Falha ao exportar o cartão do sorteio.', error);
      setDownloadNotice(`Não foi possível descarregar o cartão da ${isLight ? 'luz' : 'estrela'}. Tenta novamente.`);
    }
  }

  return (
    <section className="christmas-experience-complete" id="conclusao" aria-labelledby="complete-title">
      <FestiveDecor />
      <div className="christmas-complete-copy">
        <p className="christmas-kicker"><span /> Participação concluída</p>
        <h1 id="complete-title">A tua experiência<br /><em>ficou completa.</em></h1>
        <p>{participant.name || 'Leceiro'}, guarda estes dois números. Cada um representa uma participação no respetivo sorteio, realizado no dia <strong>25 de dezembro, às 15h</strong>.</p>
        <div className="christmas-complete-date"><span>25</span><div>DEZEMBRO · 15H<br /><strong>DOIS SORTEIOS</strong></div></div>
        <button className="christmas-text-button" type="button" onClick={onRestart}>Recomeçar a experiência <span>↺</span></button>
      </div>
      <div className="christmas-prize-grid">
        <article ref={lightCardRef} className="christmas-prize-card">
          <div className="christmas-entry-number"><span>A TUA LUZ</span><strong>#{lightNumber.toLocaleString('pt-PT')}</strong></div>
          <div className="christmas-prize-participant"><strong>{participant.name || 'Leceiro'}</strong><span>{participant.email}</span></div>
          <p>1.º PRÉMIO</p>
          <h2>Camisola oficial do Leça Futebol Clube</h2>
          <small>A luz que acendeste dá-te acesso a este sorteio.</small>
          <button type="button" onClick={() => downloadCard('light')}>Descarregar cartão <span>↓</span></button>
        </article>
        <article ref={starCardRef} className="christmas-prize-card">
          <div className="christmas-entry-number"><span>A TUA ESTRELA</span><strong>#{starNumber.toLocaleString('pt-PT')}</strong></div>
          <div className="christmas-prize-participant"><strong>{participant.name || 'Leceiro'}</strong><span>{participant.email}</span></div>
          <p>2.º PRÉMIO</p>
          <h2>Hoodie versão jogador</h2>
          <small>A estrela que inseriste dá-te acesso a este sorteio.</small>
          <button type="button" onClick={() => downloadCard('star')}>Descarregar cartão <span>↓</span></button>
        </article>
      </div>
      <p className="christmas-complete-notice" role="status">{downloadNotice}</p>
      <div className="christmas-season-ribbon" aria-hidden="true"><span>Leça Futebol Clube</span><i>✦</i><span>1912</span><i>✦</i><span>Leça da Palmeira</span></div>
    </section>
  );
}

async function validateChristmasAccessCode(code) {
  const response = await fetch(`${CHRISTMAS_ACCESS_API_BASE}/api/AccessCode/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: code.trim().toUpperCase(),
      contextType: CHRISTMAS_ACCESS_CONTEXT_TYPE,
      contextId: CHRISTMAS_ACCESS_CONTEXT_ID
    })
  });

  if (response.ok) return { valid: true };

  let message = 'Código inválido. Por favor, tenta novamente.';
  try {
    const data = await response.json();
    const rawMessage = (data?.content?.message || data?.message || '').toLowerCase();
    message = CHRISTMAS_ACCESS_ERRORS[rawMessage] || message;
  } catch {
    // Mantém uma mensagem segura quando a API não devolve JSON.
  }
  return { valid: false, message };
}

function ChristmasAccessGate({ onAccess }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submitAccessCode(event) {
    event.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode) {
      setError('Introduz o código de acesso.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const result = await validateChristmasAccessCode(cleanCode);
      if (!result.valid) {
        setError(result.message);
        setCode('');
        return;
      }
      sessionStorage.setItem(CHRISTMAS_ACCESS_SESSION_KEY, '1');
      onAccess();
    } catch {
      setError('Erro de ligação. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="christmas-access-gate">
      <section className="christmas-access-card" aria-labelledby="christmas-access-title">
        <div className="christmas-access-heading">
          <img src="/images/leca.png" alt="Leça FC" className="christmas-access-logo" />
          <h1 id="christmas-access-title">Área Reservada</h1>
          <p>Introduz o teu código de acesso para entrar na área reservada do Universo Leça.</p>
        </div>
        <form className="christmas-access-form" onSubmit={submitAccessCode} noValidate>
          <label className="sr-only" htmlFor="christmas-access-code">Código de acesso</label>
          <input
            id="christmas-access-code"
            className="christmas-access-input"
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            maxLength="20"
            autoComplete="off"
            spellCheck="false"
            autoFocus
            aria-describedby={error ? 'christmas-access-error' : undefined}
            aria-invalid={Boolean(error)}
            placeholder="Código de acesso"
          />
          {error && <p id="christmas-access-error" className="christmas-access-error" role="alert">{error}</p>}
          <button className="christmas-access-submit" type="submit" disabled={loading}>{loading ? 'A verificar…' : 'Entrar'}</button>
        </form>
      </section>
    </main>
  );
}

export default function ChristmasPage() {
  const [accessGranted, setAccessGranted] = useState(() => {
    try {
      return sessionStorage.getItem(CHRISTMAS_ACCESS_SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [stage, setStage] = useState('closed');
  const [participant, setParticipant] = useState({ name: '', email: '' });
  const [complete, setComplete] = useState(false);
  const [milestone, setMilestone] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [lightCount, setLightCount] = useState(STARTING_LIGHTS);
  const [showLightDebug, setShowLightDebug] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [postcardDownloaded, setPostcardDownloaded] = useState(false);
  const [starNumber, setStarNumber] = useState(null);
  const [drawResult, setDrawResult] = useState({ published: false, light: 101, star: 5 });
  const [demoVersion, setDemoVersion] = useState(0);
  const touchStartX = useRef(null);

  const slideLabels = ['Início', 'Acender', 'Postal', 'Desejo', 'Conclusão'];
  const maxAccessibleSlide = starNumber ? 4 : postcardDownloaded ? 3 : complete ? 2 : 1;
  const currentStepComplete = activeSlide === 0 || activeSlide === 4 || (activeSlide === 1 && complete) || (activeSlide === 2 && postcardDownloaded) || (activeSlide === 3 && Boolean(starNumber));

  function goToSlide(index) {
    const nextSlide = Math.min(maxAccessibleSlide, slideLabels.length - 1, Math.max(0, index));
    setActiveSlide(nextSlide);
    const hashes = ['inicio', 'acender', 'postal', 'desejos', 'conclusao'];
    window.history.replaceState(null, '', `#${hashes[nextSlide]}`);
  }

  useEffect(() => {
    document.documentElement.lang = 'pt';
    document.body.dataset.designMode = 'christmas';
    document.body.dataset.page = 'christmas';
    let robotsMeta = document.querySelector('meta[name="robots"]');
    const previousRobotsContent = robotsMeta?.getAttribute('content') || null;
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.content = 'noindex, nofollow, noarchive';
    return () => {
      delete document.body.dataset.designMode;
      delete document.body.dataset.page;
      if (previousRobotsContent === null) robotsMeta.remove();
      else robotsMeta.content = previousRobotsContent;
    };
  }, []);

  useEffect(() => {
    document.title = accessGranted ? 'Acende a Luz do Leça · Natal 2026' : 'Acesso reservado · Universo Leça';
  }, [accessGranted]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLButtonElement) return;
      if (event.key === 'ArrowRight') goToSlide(activeSlide + 1);
      if (event.key === 'ArrowLeft') goToSlide(activeSlide - 1);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSlide, maxAccessibleSlide]);

  function lightUp() {
    const nextCount = Math.min(MAX_LIGHTS, lightCount + 1);
    setStage('closed');
    setComplete(true);
    setLightCount(nextCount);
    if (lightCount < FOUNDATION_LIGHTS && nextCount >= FOUNDATION_LIGHTS) {
      setMilestone(true);
      window.setTimeout(() => setShowMilestone(true), 800);
    }
  }

  function adjustLights(amount) {
    const nextCount = Math.min(MAX_LIGHTS, Math.max(0, lightCount + amount));
    const crossedMilestone = lightCount < FOUNDATION_LIGHTS && nextCount >= FOUNDATION_LIGHTS;
    setLightCount(nextCount);
    setMilestone(nextCount >= FOUNDATION_LIGHTS);
    if (nextCount < FOUNDATION_LIGHTS) setShowMilestone(false);
    if (crossedMilestone) window.setTimeout(() => setShowMilestone(true), 250);
  }

  function toggleDrawResults() {
    const showResults = !drawResult.published;
    setDrawResult((current) => ({ ...current, published: showResults }));
    window.history.replaceState(null, '', showResults ? '#resultados' : '#inicio');
    if (!showResults) setActiveSlide(0);
  }

  function resetDemo() {
    setStage('closed');
    setComplete(false);
    setMilestone(false);
    setShowMilestone(false);
    setLightCount(STARTING_LIGHTS);
    setParticipant({ name: '', email: '' });
    setPostcardDownloaded(false);
    setStarNumber(null);
    setDemoVersion((current) => current + 1);
    goToSlide(0);
  }

  if (!accessGranted) {
    return <ChristmasAccessGate onAccess={() => setAccessGranted(true)} />;
  }

  if (drawResult.published) {
    return <DrawResultsPage result={drawResult} onReturn={toggleDrawResults} />;
  }

  return (
    <main className={`christmas-page${milestone ? ' has-milestone' : ''}`}>
      <header className="christmas-header">
        <a href="/" className="christmas-brand" aria-label="Leça Futebol Clube — página inicial"><img src="/images/leca.png" alt="" /><span>LEÇA FUTEBOL CLUBE</span></a>
        <nav className="christmas-journey-nav" aria-label="Navegação da experiência">
          {slideLabels.map((label, index) => <button key={label} type="button" className={activeSlide === index ? 'is-active' : ''} disabled={index > maxAccessibleSlide} onClick={() => goToSlide(index)} aria-label={index > maxAccessibleSlide ? `${label} — bloqueado` : label}><span>{index === 0 ? 'I' : `0${index}`}</span>{label}</button>)}
        </nav>
      </header>

      <div
        className="christmas-carousel"
        role="region"
        aria-roledescription="carrossel"
        aria-label="Experiência de Natal do Leça"
        onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }}
        onTouchEnd={(event) => {
          if (touchStartX.current === null) return;
          const distance = touchStartX.current - event.changedTouches[0].clientX;
          if (Math.abs(distance) > 55) goToSlide(activeSlide + (distance > 0 ? 1 : -1));
          touchStartX.current = null;
        }}
      >
        <div className="christmas-carousel-track" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
          <div className="christmas-carousel-slide" aria-hidden={activeSlide !== 0} inert={activeSlide !== 0}>
            <JourneyIntro onStart={() => goToSlide(1)} onToggleDraw={toggleDrawResults} />
          </div>
          <div className="christmas-carousel-slide" aria-hidden={activeSlide !== 1} inert={activeSlide !== 1}>
      <section className="christmas-hero christmas-village-hero" id="acender" aria-labelledby="christmas-title">
        <FestiveDecor />
        <div
          className="christmas-village-scene"
          aria-label={lightCount < FOUNDATION_LIGHTS
            ? `${lightCount} de 1.912 luzes acesas na mensagem Feliz Natal`
            : `Mensagem Feliz Natal completa, seguida de E Bom Ano 2027; ${lightCount - FOUNDATION_LIGHTS} de 114 participações a iluminar o LFC`}
        >
          <ChristmasMessageLightsCanvas count={lightCount} milestone={milestone} />
          <div className={`christmas-new-year-reveal${milestone ? ' is-visible' : ''}`} aria-hidden={!milestone}>
            <span>E BOM ANO</span>
            <strong>2027</strong>
          </div>
        </div>
        <div className="christmas-hero-copy">
          <p className="christmas-kicker"><span /> Natal 2026 · Leça Futebol Clube</p>
          <p className="christmas-season-script">Boas Festas</p>
          <h1 id="christmas-title">ACENDE<br />A LUZ <em>DO LEÇA</em></h1>
          <p>Há coisas que não se embrulham. Sentem-se. Este Natal, cada leceiro acende uma parte de nós.</p>
          <div className="christmas-hero-actions">
            <button className="christmas-primary-button" type="button" onClick={() => setStage('form')} disabled={complete}>{complete ? `Luz ${lightCount.toLocaleString('pt-PT')} acesa ✓` : 'Acender a minha luz'} {!complete && <span>→</span>}</button>
          </div>
          <p className="christmas-demo-note"><span>●</span> Protótipo UI — nenhum dado é enviado</p>
        </div>

        {showLightDebug ? <div className="christmas-counter christmas-village-counter" aria-live="polite">
            <span>{lightCount === MAX_LIGHTS ? 'LFC totalmente iluminado' : lightCount >= FOUNDATION_LIGHTS ? 'A iluminar o LFC' : 'Luzes acesas'}</span>
            <strong>{lightCount.toLocaleString('pt-PT')}</strong>
            <small>{lightCount === MAX_LIGHTS
              ? '2.026 luzes · O Leça brilha por inteiro'
              : lightCount >= FOUNDATION_LIGHTS
                ? `${(MAX_LIGHTS - lightCount).toLocaleString('pt-PT')} luzes para completar o LFC`
                : lightCount === FOUNDATION_LIGHTS - 1
                  ? 'Falta uma luz para completar os votos de Natal'
                  : 'Cada luz aproxima-nos da mensagem completa'}</small>
            <div className="christmas-test-controls" role="group" aria-label="Controlos de teste da contagem de luzes">
              <em>Teste rápido</em>
              <button type="button" onClick={() => adjustLights(-100)} disabled={lightCount === 0} aria-label="Retirar 100 luzes">−100</button>
              <button type="button" onClick={() => adjustLights(-1)} disabled={lightCount === 0} aria-label="Retirar uma luz">−1</button>
              <button type="button" onClick={() => adjustLights(1)} disabled={lightCount === MAX_LIGHTS} aria-label="Adicionar uma luz">+1</button>
              <button type="button" onClick={() => adjustLights(100)} disabled={lightCount === MAX_LIGHTS} aria-label="Adicionar 100 luzes">+100</button>
            </div>
            <button className="christmas-debug-hide" type="button" onClick={() => setShowLightDebug(false)}>Ocultar debug</button>
        </div> : <button className="christmas-debug-restore" type="button" onClick={() => setShowLightDebug(true)}>Mostrar debug</button>}
        <div className="christmas-season-ribbon" aria-hidden="true"><span>Leça Futebol Clube</span><i>✦</i><span>1912</span><i>✦</i><span>Leça da Palmeira</span></div>
      </section>
          </div>
          <div className="christmas-carousel-slide" aria-hidden={activeSlide !== 2} inert={activeSlide !== 2}><PostcardStudio key={`postal-${demoVersion}`} participant={participant} onDownload={() => setPostcardDownloaded(true)} /></div>
          <div className="christmas-carousel-slide" aria-hidden={activeSlide !== 3} inert={activeSlide !== 3}><WishWall key={`desejo-${demoVersion}`} participant={participant} completed={Boolean(starNumber)} onComplete={setStarNumber} /></div>
          <div className="christmas-carousel-slide" aria-hidden={activeSlide !== 4} inert={activeSlide !== 4}><ExperienceComplete participant={participant} lightNumber={lightCount} starNumber={starNumber || 0} onRestart={resetDemo} /></div>
        </div>

        <nav className="christmas-carousel-controls" aria-label="Controlos do carrossel">
          <button type="button" onClick={() => goToSlide(activeSlide - 1)} disabled={activeSlide === 0} aria-label="Etapa anterior">←</button>
          <div className="christmas-carousel-progress" aria-live="polite">
            <span>{activeSlide === 0 ? 'INÍCIO' : activeSlide === 4 ? 'CONCLUSÃO' : `PASSO 0${activeSlide}`}</span>
            <strong>{slideLabels[activeSlide]}</strong>
            {!currentStepComplete && <small>Conclui este passo para avançar</small>}
            <i><b style={{ width: `${((activeSlide + 1) / slideLabels.length) * 100}%` }} /></i>
          </div>
          {activeSlide < slideLabels.length - 1
            ? <button type="button" onClick={() => goToSlide(activeSlide + 1)} disabled={!currentStepComplete} aria-label={currentStepComplete ? 'Etapa seguinte' : 'Conclui este passo para avançar'}>→</button>
            : <button type="button" onClick={resetDemo} aria-label="Recomeçar a experiência">↺</button>}
        </nav>
      </div>

      <ParticipationPanel stage={stage} setStage={setStage} participant={participant} setParticipant={setParticipant} onLight={lightUp} />
      {showMilestone && <Milestone name={participant.name} onClose={() => { setShowMilestone(false); document.querySelector('.christmas-village-scene')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} />}
    </main>
  );
}
