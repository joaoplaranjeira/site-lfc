'use strict';

// ── Session guard ──────────────────────────────────────────────────────────
if (sessionStorage.getItem('museu_access_granted') !== '1') {
  window.location.replace('museu.html');
}

// ── Helpers ────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escAttr(str) {
  return escHtml(str).replace(/"/g, '&quot;');
}

// ── Sub-renderers ──────────────────────────────────────────────────────────

function renderGallery(block) {
  if (!block.gallery || !block.gallery.length) return '';
  return `
    <div class="gallery-section fade-in delay-2">
      <div class="gallery-label">${escHtml(block.galleryLabel || 'Galeria')}</div>
      <div class="gallery-grid">
        ${block.gallery.map(img => `
          <div class="gallery-thumb" onclick="openLightbox(this)">
            <img src="${escAttr(img.src)}" alt="${escAttr(img.alt)}" data-caption="${escAttr(img.caption || '')}" loading="lazy" />
          </div>`).join('')}
      </div>
    </div>`;
}

function renderHighlight(h) {
  if (!h) return '';

  if (h.type === 'person') {
    return `
      <div class="highlight-card">
        <img src="${escAttr(h.image)}" alt="${escAttr(h.name)}" />
        <div>
          <strong>${escHtml(h.name)}</strong>
          <p>${escHtml(h.caption)}</p>
        </div>
      </div>`;
  }

  if (h.type === 'squad') {
    const rowsHtml = h.rows.map((row, i) => `
      <p style="font-size:0.75rem;color:rgba(255,255,255,0.4);margin-bottom:0.3rem;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;${i > 0 ? 'margin-top:0.5rem;' : ''}">${escHtml(row.label)}</p>
      <p>${escHtml(row.text)}</p>`).join('');
    return `
      <div class="highlight-card" style="background:rgba(255,220,50,0.07);border-color:rgba(255,220,50,0.2);">
        <div>${rowsHtml}</div>
      </div>`;
  }

  return '';
}

function renderMiniTimeline(items) {
  if (!items || !items.length) return '';
  return `
    <div class="mini-timeline">
      ${items.map(item => `
        <div class="mini-tl-item">
          <div class="mini-tl-left"><div class="mini-tl-dot"></div><div class="mini-tl-line"></div></div>
          <div class="mini-tl-content">
            <div class="year">${escHtml(item.year)}</div>
            <div class="label">${escHtml(item.label)}</div>
          </div>
        </div>`).join('')}
    </div>`;
}

function renderBlock(block, isLast) {
  const periodAttr = block.periodStyle === 'extra'
    ? ' style="background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.15);color:rgba(255,255,255,0.55);"'
    : '';
  const articleAttr = block.articleStyle ? ` style="${escAttr(block.articleStyle)}"` : '';
  const gridClass   = block.layout === 'reverse' ? 'block-grid reverse' : 'block-grid';

  const paragraphsHtml = (block.paragraphs || []).map((p, i) =>
    i === 0 ? `<p>${escHtml(p)}</p>` : `<p style="margin-top:1rem">${escHtml(p)}</p>`
  ).join('');

  const extraHtml = block.miniTimeline
    ? renderMiniTimeline(block.miniTimeline)
    : renderHighlight(block.highlight);

  const separator = isLast ? '' : '<div class="block-sep"></div>';

  return `
  <article id="${escAttr(block.id)}"${articleAttr}>
    <div class="timeline-block">
      <div class="block-period fade-in"${periodAttr}>
        <i class="fa-solid fa-circle-dot" style="font-size:0.6em"></i> ${escHtml(block.period)}
      </div>
      <div class="${gridClass}">
        <div class="hero-img-wrap fade-in" onclick="openLightbox(this)">
          <img src="${escAttr(block.heroImage.src)}" alt="${escAttr(block.heroImage.alt)}" data-caption="${escAttr(block.heroImage.caption || '')}" loading="lazy" />
          <div class="img-zoom-hint"><i class="fa-solid fa-magnifying-glass-plus"></i> Ver</div>
        </div>
        <div class="block-content fade-in delay-1">
          <h2>${escHtml(block.title)}</h2>
          ${paragraphsHtml}
          ${extraHtml}
        </div>
      </div>
      ${renderGallery(block)}
    </div>
  </article>
  ${separator}`;
}

// ── Main render ────────────────────────────────────────────────────────────

function renderTimeline() {
  // Nav buttons
  document.getElementById('nav-items').innerHTML = TIMELINE_BLOCKS.map(b =>
    `<a href="#${escAttr(b.id)}" class="nav-btn">${escHtml(b.period)}</a>`
  ).join('');

  // Timeline blocks
  document.getElementById('timeline-container').innerHTML = TIMELINE_BLOCKS.map((b, i) =>
    renderBlock(b, i === TIMELINE_BLOCKS.length - 1)
  ).join('');
}

// ── Lightbox ──────────────────────────────────────────────────────────────
let lbImages = [];
let lbIndex  = 0;

function openLightbox(el) {
  const img = el.tagName === 'IMG' ? el : el.querySelector('img');
  if (!img) return;
  const block   = el.closest('article') || document;
  const allImgs = Array.from(block.querySelectorAll('[onclick^="openLightbox"] img'));
  lbImages  = allImgs.map(i => ({ src: i.src, alt: i.alt, caption: i.dataset.caption || '' }));
  lbIndex   = allImgs.indexOf(img);
  if (lbIndex === -1) lbIndex = 0;
  renderLb();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function lbNav(dir) {
  lbIndex = (lbIndex + dir + lbImages.length) % lbImages.length;
  renderLb();
}

function renderLb() {
  const { src, alt, caption } = lbImages[lbIndex];
  const lbImg = document.getElementById('lb-img');
  lbImg.src = src;
  lbImg.alt = alt;
  const lbCap = document.getElementById('lb-caption');
  lbCap.textContent = caption || '';
  lbCap.style.display = caption ? '' : 'none';
}

// ── Observers ─────────────────────────────────────────────────────────────

function initObservers() {
  // Fade-in on scroll
  const fadeEls = document.querySelectorAll('.fade-in');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        fadeObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  fadeEls.forEach(el => fadeObserver.observe(el));

  // Active nav highlight
  const navBtns = document.querySelectorAll('.nav-btn');
  const blocks  = document.querySelectorAll('article[id]');
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navBtns.forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('href') === '#' + id);
        });
        const activeBtn = document.querySelector(`.nav-btn[href="#${id}"]`);
        if (activeBtn) activeBtn.scrollIntoView({ inline: 'nearest', behavior: 'smooth' });
      }
    });
  }, { threshold: 0.35 });
  blocks.forEach(b => navObserver.observe(b));
}

// ── Init ──────────────────────────────────────────────────────────────────

document.getElementById('year').textContent = new Date().getFullYear();

renderTimeline();
initObservers();

// Lightbox events
document.getElementById('lightbox').addEventListener('click', function (e) {
  if (e.target === this) closeLightbox();
});
document.addEventListener('keydown', function (e) {
  const lb = document.getElementById('lightbox');
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  lbNav(-1);
  if (e.key === 'ArrowRight') lbNav(1);
});

// Subtle parallax on hero background
const heroBg = document.getElementById('hero-bg');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y < window.innerHeight) {
    heroBg.style.transform = `scale(1.08) translateY(${y * 0.18}px)`;
  }
}, { passive: true });
