import { useEffect, useRef, useState } from 'react';
import './christmas.css';

const STARTING_LIGHTS = 1911;

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

function LightsCanvas({ count, complete, milestone }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d');
    const logo = new Image();
    let frame = 0;
    let stopped = false;
    let points = [];
    const animatePoints = !window.matchMedia('(prefers-reduced-motion: reduce)').matches && count <= 1000;

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

      const logoSize = Math.min(width, height) * 0.82;
      const logoX = (width - logoSize) / 2;
      const logoY = (height - logoSize) / 2;
      context.save();
      context.globalAlpha = milestone ? 0.42 : 0.12;
      context.filter = milestone ? `drop-shadow(0 0 ${28 * ratio}px rgba(235,195,105,.55))` : 'none';
      context.drawImage(logo, logoX, logoY, logoSize, logoSize);
      context.restore();

      const radiusBase = count <= 100 ? 3.2 : count <= 500 ? 2.1 : count <= 1000 ? 1.5 : count <= 2000 ? 1.04 : 0.78;
      points.forEach((point, index) => {
        const x = logoX + point.x * logoSize;
        const y = logoY + point.y * logoSize;
        const pulse = animatePoints && index < 420 ? 0.78 + Math.sin(time / 800 + point.phase) * 0.22 : 0.9;
        const radius = (index === points.length - 1 && complete ? Math.max(4.8, radiusBase * 2.4) : radiusBase) * ratio;
        context.beginPath();
        context.fillStyle = point.warm ? `rgba(247,211,124,${pulse})` : `rgba(221,255,241,${pulse})`;
        context.shadowColor = point.warm ? '#f6ce70' : '#64e5b7';
        context.shadowBlur = count <= 1000 ? (index % 5 === 0 ? 7 : 2) * ratio : 0;
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      });

      if (animatePoints) frame = window.requestAnimationFrame(draw);
    };

    logo.onload = () => {
      const sample = document.createElement('canvas');
      sample.width = 500;
      sample.height = 500;
      const sampleContext = sample.getContext('2d', { willReadFrequently: true });
      sampleContext.drawImage(logo, 0, 0, 500, 500);
      const pixels = sampleContext.getImageData(0, 0, 500, 500).data;
      const random = seededRandom(1912);
      let attempts = 0;
      while (points.length < count && attempts < Math.max(3000, count * 30)) {
        attempts += 1;
        const x = Math.floor(38 + random() * 424);
        const y = Math.floor(24 + random() * 452);
        const index = (y * 500 + x) * 4;
        if (pixels[index + 3] > 185 && (pixels[index] + pixels[index + 1] + pixels[index + 2]) < 730) {
          points.push({ x: x / 500, y: y / 500, warm: random() > 0.74, phase: random() * Math.PI * 2 });
        }
      }
      draw();
    };
    logo.src = '/images/leca.png';
    return () => {
      stopped = true;
      window.cancelAnimationFrame(frame);
    };
  }, [complete, count, milestone]);

  return <canvas ref={canvasRef} className="christmas-lights-canvas" aria-hidden="true" />;
}

function WishStarsCanvas({ count }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d');
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
      const random = seededRandom(2027);
      const radius = (count < 80 ? 1.8 : count < 500 ? 1.25 : count < 1500 ? 0.9 : 0.62) * ratio;

      for (let index = 0; index < count; index += 1) {
        const x = (0.04 + random() * 0.92) * width;
        const y = (0.08 + random() * 0.86) * height;
        const phase = random() * Math.PI * 2;
        const warm = random() > 0.72;
        const pulse = animate ? 0.38 + (Math.sin(time / 850 + phase) + 1) * 0.26 : 0.62 + random() * 0.28;
        context.beginPath();
        context.fillStyle = warm ? `rgba(244,211,126,${pulse})` : `rgba(225,255,245,${pulse})`;
        context.arc(x, y, radius, 0, Math.PI * 2);
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
  }, [count]);

  return <canvas ref={canvasRef} className="christmas-wish-stars-canvas" aria-hidden="true" />;
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

function PostcardStudio({ participant }) {
  const [theme, setTheme] = useState('classic');
  const [signature, setSignature] = useState('Família Leceira');
  const selected = CARD_THEMES[theme];
  const [notice, setNotice] = useState('');

  function downloadPostcard() {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const context = canvas.getContext('2d');
    const colors = theme === 'classic' ? ['#031b17', '#08715b'] : theme === 'football' ? ['#032e24', '#010807'] : ['#061b27', '#08715b'];
    const gradient = context.createLinearGradient(0, 0, 1080, 1350);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1080, 1350);
    context.strokeStyle = 'rgba(244,214,143,.65)';
    context.lineWidth = 3;
    context.strokeRect(54, 54, 972, 1242);
    const decorationRandom = seededRandom(2027);
    for (let index = 0; index < 18; index += 1) {
      context.beginPath();
      context.fillStyle = index % 4 === 0 ? 'rgba(242,215,146,.8)' : 'rgba(255,255,255,.38)';
      context.arc(740 + decorationRandom() * 250, 120 + decorationRandom() * 520, index % 4 === 0 ? 4 : 2, 0, Math.PI * 2);
      context.fill();
    }
    context.fillStyle = '#f2d792';
    context.font = '700 22px Poppins, sans-serif';
    context.textAlign = 'left';
    context.fillText('NATAL 2026 · LEÇA DA PALMEIRA', 110, 150);
    context.fillStyle = '#ffffff';
    context.font = '900 116px Poppins, sans-serif';
    context.fillText('FELIZ', 105, 315);
    context.fillText('NATAL', 105, 425);
    context.font = '900 62px Poppins, sans-serif';
    context.fillText('E UM', 110, 515);
    context.fillStyle = '#f2d792';
    context.font = 'italic 600 88px Cormorant Garamond, Georgia, serif';
    context.fillText('BOM', 315, 515);
    context.font = 'italic 600 142px Cormorant Garamond, Georgia, serif';
    context.fillText('2027', 105, 650);
    context.font = '600 24px Poppins, sans-serif';
    context.fillStyle = 'rgba(255,255,255,.82)';
    context.fillText(selected.line, 110, 720);

    const logo = new Image();
    logo.onload = () => {
      context.drawImage(logo, 110, 820, 180, 180);
      context.fillStyle = '#f2d792';
      context.font = '700 22px Poppins, sans-serif';
      context.fillText('ACENDE A LUZ DO LEÇA', 340, 860);
      context.font = '600 19px Poppins, sans-serif';
      context.fillText('LUZ 1.912', 340, 905);
      context.fillStyle = '#ffffff';
      context.font = '600 32px Poppins, sans-serif';
      context.fillText(signature || participant.name || 'Família Leceira', 340, 960);
      context.strokeStyle = 'rgba(242,215,146,.32)';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(110, 1115);
      context.lineTo(970, 1115);
      context.stroke();
      context.font = '500 22px Poppins, sans-serif';
      context.fillStyle = 'rgba(255,255,255,.66)';
      context.fillText('Uma luz. Um clube. Um Natal leceiro.', 110, 1185);
      const link = document.createElement('a');
      link.download = 'postal-natal-leca-2026.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      setNotice('Postal descarregado com sucesso.');
    };
    logo.src = '/images/leca.png';
  }

  return (
    <section className="christmas-section christmas-studio" id="postal" aria-labelledby="studio-title">
      <div className="christmas-section-heading">
        <div><p className="christmas-kicker">O teu postal</p><h2 id="studio-title">Leva esta luz contigo.</h2></div>
        <p>Cria uma memória digital da tua participação e partilha-a com quem faz parte do teu Natal.</p>
      </div>
      <div className="christmas-studio-grid">
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
        <div className="christmas-postcard-frame">
          <article className={`christmas-postcard ${selected.className}`}>
            <div className="postcard-top"><span>NATAL 2026 · LEÇA DA PALMEIRA</span><i /></div>
            <div className="postcard-greeting">
              <strong>FELIZ<br />NATAL</strong>
              <div><b>E UM</b><em>BOM</em></div>
              <em className="postcard-year">2027</em>
            </div>
            <small>{selected.line}</small>
            <div className="postcard-identity"><img src="/images/leca.png" alt="" /><div><span>ACENDE A LUZ DO LEÇA</span><small>LUZ 1.912</small><strong>{signature || participant.name || 'Família Leceira'}</strong></div></div>
            <footer>Uma luz. Um clube. Um Natal leceiro.</footer>
          </article>
        </div>
      </div>
    </section>
  );
}

function WishWall({ participant }) {
  const [wishes, setWishes] = useState(INITIAL_WISHES);
  const [starCount, setStarCount] = useState(INITIAL_WISHES.length);
  const [wish, setWish] = useState('');
  const [named, setNamed] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedWish, setSelectedWish] = useState(null);
  const starPositions = [
    [14, 20], [72, 16], [43, 33], [84, 48], [22, 58], [58, 68],
    [9, 79], [91, 82], [37, 88], [65, 42], [52, 13], [76, 73]
  ];
  const visibleWishes = wishes.slice(0, Math.min(wishes.length, starCount));
  const simulatedStars = Math.max(0, starCount - visibleWishes.length);

  function adjustStars(amount) {
    const nextCount = Math.min(5000, Math.max(0, starCount + amount));
    setStarCount(nextCount);
    if (selectedWish !== null && selectedWish >= Math.min(wishes.length, nextCount)) setSelectedWish(null);
  }

  function submitWish(event) {
    event.preventDefault();
    const cleanWish = wish.trim();
    if (!cleanWish) return;
    const nextWishes = [{ text: cleanWish, author: named ? participant.name || 'Leceiro' : 'Anónimo' }, ...wishes];
    setWishes(nextWishes);
    setStarCount((current) => Math.max(current + 1, nextWishes.length));
    setSelectedWish(0);
    setWish('');
    setMessage('O teu desejo entrou no mural de demonstração.');
  }

  return (
    <section className="christmas-wishes" id="desejos" aria-labelledby="wishes-title">
      <div className="christmas-wish-intro">
        <p className="christmas-kicker">Um céu feito de desejos</p>
        <h2 id="wishes-title">O que desejas para 2027?</h2>
        <p>Escreve algo para o Clube, para a vila ou para alguém que caminha contigo.</p>
        <form onSubmit={submitWish}>
          <label className="sr-only" htmlFor="wish-text">O teu desejo</label>
          <textarea id="wish-text" maxLength="200" value={wish} onChange={(event) => setWish(event.target.value)} placeholder="Em 2027, desejo que…" />
          <div className="christmas-wish-meta"><span>{wish.length}/200</span><label><input type="checkbox" checked={named} onChange={(event) => setNamed(event.target.checked)} /> Mostrar o meu nome</label></div>
          <button className="christmas-primary-button" type="submit">Entregar ao céu <span>↑</span></button>
          <p className="christmas-form-notice" role="status">{message}</p>
        </form>
      </div>
      <div className="christmas-wish-sky" aria-label="Desejos da comunidade">
        <WishStarsCanvas count={simulatedStars} />
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
        {visibleWishes.map((item, index) => {
          const [x, y] = starPositions[index % starPositions.length];
          return (
            <button
              key={`${item.text}-${index}`}
              className={`christmas-wish-star${selectedWish === index ? ' is-selected' : ''}`}
              type="button"
              style={{ '--star-x': `${x}%`, '--star-y': `${y}%`, '--star-delay': `${index * -0.43}s`, '--star-size': `${18 + (index % 3) * 5}px` }}
              onClick={() => setSelectedWish(index)}
              aria-label={`Ler o desejo da estrela ${index + 1}`}
              aria-pressed={selectedWish === index}
            >
              <span aria-hidden="true">✦</span>
            </button>
          );
        })}
        {selectedWish !== null && visibleWishes[selectedWish] && (
          <article className="christmas-wish-reveal" aria-live="polite">
            <button type="button" onClick={() => setSelectedWish(null)} aria-label="Fechar desejo">×</button>
            <span aria-hidden="true">✦</span>
            <p>“{visibleWishes[selectedWish].text}”</p>
            <small>— {visibleWishes[selectedWish].author}</small>
          </article>
        )}
      </div>
    </section>
  );
}

export default function ChristmasPage() {
  const [stage, setStage] = useState('closed');
  const [participant, setParticipant] = useState({ name: '', email: '' });
  const [complete, setComplete] = useState(false);
  const [milestone, setMilestone] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [lightCount, setLightCount] = useState(STARTING_LIGHTS);

  useEffect(() => {
    document.title = 'Acende a Luz do Leça · Natal 2026';
    document.documentElement.lang = 'pt';
    document.body.dataset.designMode = 'christmas';
    document.body.dataset.page = 'christmas';
    return () => {
      delete document.body.dataset.designMode;
      delete document.body.dataset.page;
    };
  }, []);

  function lightUp() {
    const nextCount = Math.min(5000, lightCount + 1);
    setStage('closed');
    setComplete(true);
    setLightCount(nextCount);
    if (lightCount < 1912 && nextCount >= 1912) {
      setMilestone(true);
      window.setTimeout(() => setShowMilestone(true), 800);
    }
  }

  function adjustLights(amount) {
    const nextCount = Math.min(5000, Math.max(0, lightCount + amount));
    const crossedMilestone = lightCount < 1912 && nextCount >= 1912;
    setLightCount(nextCount);
    setMilestone(nextCount >= 1912);
    if (nextCount < 1912) setShowMilestone(false);
    if (crossedMilestone) window.setTimeout(() => setShowMilestone(true), 250);
  }

  function resetDemo() {
    setStage('closed');
    setComplete(false);
    setMilestone(false);
    setShowMilestone(false);
    setLightCount(STARTING_LIGHTS);
    setParticipant({ name: '', email: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <main className={`christmas-page${milestone ? ' has-milestone' : ''}`}>
      <header className="christmas-header">
        <a href="/" className="christmas-brand" aria-label="Universo Leça FC — página inicial"><img src="/images/leca.png" alt="" /><span>UNIVERSO<br /><strong>LEÇA FC</strong></span></a>
        <nav aria-label="Navegação da campanha"><a href="#postal">Postal</a><a href="#desejos">Desejos</a><button type="button" onClick={() => setStage('form')}>Acender a minha luz</button></nav>
      </header>

      <section className="christmas-hero" aria-labelledby="christmas-title">
        <FestiveDecor />
        <Skyline />
        <div className="christmas-hero-copy">
          <p className="christmas-kicker"><span /> Natal 2026 · Leça da Palmeira</p>
          <p className="christmas-season-script">Boas Festas</p>
          <h1 id="christmas-title">ACENDE<br />A LUZ <em>DO LEÇA</em></h1>
          <p>Há coisas que não se embrulham. Sentem-se. Este Natal, cada leceiro acende uma parte de nós.</p>
          <div className="christmas-hero-actions">
            <button className="christmas-primary-button" type="button" onClick={() => setStage('form')}>{complete ? 'Ver a minha luz' : 'Acender a minha luz'} <span>→</span></button>
            <a href="#como-funciona">Descobrir a experiência <span>↓</span></a>
          </div>
          <p className="christmas-demo-note"><span>●</span> Protótipo UI — nenhum dado é enviado</p>
        </div>

        <div className="christmas-emblem-stage" aria-label={`${lightCount} luzes acesas no símbolo do Leça Futebol Clube`}>
          <div className="christmas-emblem-halo" />
          <LightsCanvas count={lightCount} complete={complete} milestone={milestone} />
          <div className="christmas-counter" aria-live="polite">
            <span>{lightCount >= 1912 ? 'Marco fundador alcançado' : 'Luzes acesas'}</span>
            <strong>{lightCount.toLocaleString('pt-PT')}</strong>
            <small>{lightCount >= 1912 ? '1912 · Para sempre o nosso começo' : lightCount === 1911 ? 'Falta uma luz para fazer história' : 'Cada luz aproxima-nos do marco fundador'}</small>
            <div className="christmas-test-controls" role="group" aria-label="Controlos de teste da contagem de luzes">
              <em>Teste rápido</em>
              <button type="button" onClick={() => adjustLights(-100)} disabled={lightCount === 0} aria-label="Retirar 100 luzes">−100</button>
              <button type="button" onClick={() => adjustLights(-1)} disabled={lightCount === 0} aria-label="Retirar uma luz">−1</button>
              <button type="button" onClick={() => adjustLights(1)} disabled={lightCount === 5000} aria-label="Adicionar uma luz">+1</button>
              <button type="button" onClick={() => adjustLights(100)} disabled={lightCount === 5000} aria-label="Adicionar 100 luzes">+100</button>
            </div>
          </div>
        </div>
        <div className="christmas-season-ribbon" aria-hidden="true"><span>Boas Festas</span><i>✦</i><span>Leça da Palmeira</span><i>✦</i><span>Desde 1912</span><i>✦</i><span>Um clube, milhares de luzes</span></div>
      </section>

      <section className="christmas-how" id="como-funciona" aria-labelledby="how-title">
        <div className="christmas-section-heading"><div><p className="christmas-kicker">Uma luz. Uma história.</p><h2 id="how-title">O símbolo somos todos nós.</h2></div><p>Cada participação ocupa um lugar único no emblema. Individualmente somos um ponto de luz; juntos, damos forma ao Leça.</p></div>
        <div className="christmas-how-grid">
          <article><Icon>01</Icon><h3>Acende</h3><p>Entrega uma luz ao símbolo através de um pequeno gesto.</p></article>
          <article><Icon>02</Icon><h3>Personaliza</h3><p>Cria o teu postal e deixa um desejo para o novo ano.</p></article>
          <article><Icon>03</Icon><h3>Partilha</h3><p>Leva contigo a memória do lugar que ocupas no Clube.</p></article>
        </div>
      </section>

      <section className="christmas-1912-story" aria-labelledby="story-title">
        <div className="christmas-story-year">1912</div>
        <div><p className="christmas-kicker">O marco fundador</p><h2 id="story-title">Quando a luz 1.912 se acende, o tempo pára.</h2><p>O símbolo ilumina-se por completo e revela o ano em que esta história começou. Porque 1.912 nunca será um limite — será sempre o nosso ponto de partida.</p><button type="button" onClick={() => { setParticipant({ name: 'Leceiro', email: '' }); setComplete(true); setMilestone(true); setLightCount(1912); setShowMilestone(true); }}>Rever o momento 1912 <span>↗</span></button></div>
      </section>

      <PostcardStudio participant={participant} />
      <WishWall participant={participant} />

      <footer className="christmas-footer">
        <div><img src="/images/leca.png" alt="" /><p><strong>Leça Futebol Clube</strong><br />Uma vila. Um símbolo. Milhares de luzes.</p></div>
        <p>Experiência conceptual · Natal 2026</p>
        <button type="button" onClick={resetDemo}>Recomeçar demonstração</button>
      </footer>

      <ParticipationPanel stage={stage} setStage={setStage} participant={participant} setParticipant={setParticipant} onLight={lightUp} />
      {showMilestone && <Milestone name={participant.name} onClose={() => { setShowMilestone(false); document.querySelector('.christmas-emblem-stage')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} />}
    </main>
  );
}
