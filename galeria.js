/**
 * galeria.js — Lógica da página de galeria fotográfica genérica
 *
 * Lê o parâmetro `id` da URL (ex: galeria.html?id=jogo-estrelas-2026)
 * e carrega a configuração correspondente de `galerias-data.js`.
 *
 * As imagens de cada secção são obtidas via endpoint público de listagem por tag:
 *   https://res.cloudinary.com/{cloudName}/image/list/{tag}.json
 * Requer "Resource list" ativo: Cloudinary > Settings > Security.
 */

(function () {
  'use strict';

  // ─── Cloudinary helpers ────────────────────────────────────────────────────

  function cloudinaryUrl(cloudName, publicId, transformation) {
    const base = `https://res.cloudinary.com/${cloudName}/image/upload`;
    return transformation
      ? `${base}/${transformation}/${publicId}`
      : `${base}/${publicId}`;
  }

  function thumbnailUrl(cloudName, publicId) {
    return cloudinaryUrl(cloudName, publicId, 'c_fill,w_600,h_450,q_auto,f_auto');
  }

  function fullUrl(cloudName, publicId) {
    return cloudinaryUrl(cloudName, publicId, 'q_auto,f_auto');
  }

  /**
   * Obtém a lista de imagens de uma tag no Cloudinary.
   * Requer "Resource list" ativo: Cloudinary > Settings > Security.
   * Devolve array de { publicId, alt } ordenado por public_id.
   */
  async function fetchImagesByTag(cloudName, tag, sectionTitle) {
    const url = `https://res.cloudinary.com/${cloudName}/image/list/${encodeURIComponent(tag)}.json`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro ${response.status} ao carregar imagens com a tag "${tag}". Verifica se "Resource list" está ativo nas definições de segurança do Cloudinary.`);
    }
    const data = await response.json();
    const resources = data.resources || [];
    resources.sort((a, b) => a.public_id.localeCompare(b.public_id));
    return resources.map(r => ({ publicId: r.public_id, alt: sectionTitle }));
  }

  // ─── Lightbox state ────────────────────────────────────────────────────────

  let lightboxImages = [];   // flat list of { src, alt } for the active section
  let lightboxIndex  = 0;

  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightbox-img');
  const lightboxCap   = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev  = document.getElementById('lightbox-prev');
  const lightboxNext  = document.getElementById('lightbox-next');

  function openLightbox(images, index) {
    lightboxImages = images;
    lightboxIndex  = index;
    showLightboxImage();
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  function showLightboxImage() {
    const item = lightboxImages[lightboxIndex];
    if (!item) return;
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    lightboxCap.textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
    lightboxPrev.style.visibility = lightboxIndex > 0 ? 'visible' : 'hidden';
    lightboxNext.style.visibility = lightboxIndex < lightboxImages.length - 1 ? 'visible' : 'hidden';
  }

  function prevImage() {
    if (lightboxIndex > 0) { lightboxIndex--; showLightboxImage(); }
  }

  function nextImage() {
    if (lightboxIndex < lightboxImages.length - 1) { lightboxIndex++; showLightboxImage(); }
  }

  // Lightbox event handlers
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', prevImage);
  lightboxNext.addEventListener('click', nextImage);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (lightbox.classList.contains('hidden')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   prevImage();
    if (e.key === 'ArrowRight')  nextImage();
  });

  // ─── Rendering ────────────────────────────────────────────────────────────

  function renderTabs(sections, activeId) {
    return sections.map(s => {
      const isActive = s.id === activeId;
      const cls = isActive ? 'gallery-tab-active' : 'gallery-tab-inactive';
      return `
        <button id="tab-${s.id}" class="${cls}" onclick="switchSection('${s.id}')" style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.5rem 1.25rem;border-radius:9999px;font-size:0.85rem;font-weight:700;letter-spacing:0.03em;cursor:pointer;transition:all 0.2s;">
          <i class="fa-solid ${s.icon || 'fa-images'}"></i>${s.title}
          <span id="tab-count-${s.id}" style="opacity:0.6;font-size:0.75rem;">…</span>
        </button>`;
    }).join('');
  }

  /** Esqueleto de loading renderizado antes das imagens aparecerem */
  function renderSectionSkeleton(section) {
    return `
      <div id="panel-${section.id}" class="gallery-panel">
        <div id="loading-${section.id}" class="text-center py-12">
          <i class="fa-solid fa-spinner fa-spin text-2xl mb-3" style="color:rgba(5,107,87,0.7);"></i>
          <p style="color:rgba(255,255,255,0.35);font-size:0.85rem;">A carregar fotografias...</p>
        </div>
        <div id="grid-${section.id}"></div>
        <div id="error-${section.id}" class="hidden text-center py-8">
          <i class="fa-solid fa-circle-exclamation text-2xl mb-3" style="color:rgba(255,100,100,0.6);"></i>
          <p id="error-msg-${section.id}" style="color:rgba(255,120,120,0.8);font-size:0.85rem;"></p>
        </div>
      </div>`;
  }

  // ─── Section switching (tabs) ──────────────────────────────────────────────

  let gallerySections = [];

  window.switchSection = function (sectionId) {
    gallerySections.forEach(s => {
      const panel = document.getElementById(`panel-${s.id}`);
      const tab   = document.getElementById(`tab-${s.id}`);
      if (!panel || !tab) return;

      if (s.id === sectionId) {
        panel.classList.remove('hidden');
        tab.className = 'gallery-tab-active';
        tab.style.cssText = 'display:inline-flex;align-items:center;gap:0.5rem;padding:0.5rem 1.25rem;border-radius:9999px;font-size:0.85rem;font-weight:700;letter-spacing:0.03em;cursor:pointer;transition:all 0.2s;';
      } else {
        panel.classList.add('hidden');
        tab.className = 'gallery-tab-inactive';
        tab.style.cssText = 'display:inline-flex;align-items:center;gap:0.5rem;padding:0.5rem 1.25rem;border-radius:9999px;font-size:0.85rem;font-weight:700;letter-spacing:0.03em;cursor:pointer;transition:all 0.2s;';
      }
    });
  };

  // ─── Per-section image cache (populated after fetch) ───────────────────────
  // sectionImagesCache[sectionId] = [{ publicId, alt }, ...]
  const sectionImagesCache = {};

  // ─── Click delegation for gallery items ───────────────────────────────────

  document.getElementById('sections-container').addEventListener('click', function (e) {
    const item = e.target.closest('.gallery-item');
    if (!item) return;

    const sectionId = item.dataset.section;
    const index     = parseInt(item.dataset.index, 10);
    const images    = sectionImagesCache[sectionId] || [];
    if (!images.length) return;

    const cloudName = document.getElementById('gallery-content').dataset.cloudName;
    const fullImages = images.map(img => ({
      src: fullUrl(cloudName, img.publicId),
      alt: img.alt
    }));

    openLightbox(fullImages, index);
  });

  document.getElementById('sections-container').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      const item = e.target.closest('.gallery-item');
      if (item) item.click();
    }
  });

  // ─── Page initialisation ──────────────────────────────────────────────────

  function showError(message) {
    document.getElementById('gallery-loading').classList.add('hidden');
    document.getElementById('gallery-error-text').textContent = message;
    document.getElementById('gallery-error').classList.remove('hidden');
  }

  /** Carrega imagens de uma secção via tag Cloudinary e atualiza o DOM */
  async function loadSection(section, cloudName) {
    const loadingEl  = document.getElementById(`loading-${section.id}`);
    const gridEl     = document.getElementById(`grid-${section.id}`);
    const errorEl    = document.getElementById(`error-${section.id}`);
    const errorMsgEl = document.getElementById(`error-msg-${section.id}`);
    const tabCountEl = document.getElementById(`tab-count-${section.id}`);
    const countEl    = document.getElementById(`count-${section.id}`);

    try {
      const images = await fetchImagesByTag(cloudName, section.tag, section.title);
      sectionImagesCache[section.id] = images;

      if (loadingEl) loadingEl.classList.add('hidden');

      const count = images.length;
      const countLabel = `${count} foto${count !== 1 ? 's' : ''}`;
      if (tabCountEl) tabCountEl.textContent = `(${count})`;
      if (countEl)    countEl.textContent = countLabel;

      if (gridEl) {
        if (count === 0) {
          gridEl.innerHTML = `
            <div class="text-center py-12">
              <i class="fa-solid fa-images text-3xl mb-3" style="color:rgba(255,255,255,0.15);"></i>
              <p style="color:rgba(255,255,255,0.3);font-size:0.85rem;">Fotografias em breve</p>
            </div>`;
        } else {
          const items = images.map((img, idx) => {
            const thumb = thumbnailUrl(cloudName, img.publicId);
            return `
              <div class="gallery-item" data-section="${section.id}" data-index="${idx}" tabindex="0" role="button" aria-label="Ver ${img.alt}">
                <img src="${thumb}" alt="${img.alt}" loading="lazy" />
                <div class="overlay">
                  <i class="fa-solid fa-magnifying-glass-plus text-white text-3xl"></i>
                </div>
              </div>`;
          }).join('');
          gridEl.innerHTML = `<div class="gallery-grid" data-section="${section.id}">${items}</div>`;
        }
      }
    } catch (err) {
      if (loadingEl)  loadingEl.classList.add('hidden');
      if (errorEl)    errorEl.classList.remove('hidden');
      if (errorMsgEl) errorMsgEl.textContent = err.message;
      if (tabCountEl) tabCountEl.textContent = '(!)';
      console.error(`Erro ao carregar secção "${section.id}":`, err);
    }
  }

  async function init() {
    const params    = new URLSearchParams(window.location.search);
    const galleryId = params.get('id');

    if (!galleryId) {
      showError('Nenhuma galeria especificada.');
      return;
    }

    const config = (typeof galeriasData !== 'undefined') && galeriasData[galleryId];

    if (!config) {
      showError(`Galeria "${galleryId}" não encontrada.`);
      return;
    }

    const cloudName = config.cloudinary?.cloudName;
    if (!cloudName || cloudName === 'CLOUD_NAME') {
      showError('Configuração do Cloudinary em falta. Preenche o cloudName em galerias-data.js.');
      return;
    }

    document.title = `${config.title} — Galeria Leça FC`;
    document.getElementById('gallery-title').textContent    = config.title;
    document.getElementById('gallery-subtitle').textContent = config.subtitle || '';
    const headerTitle = document.getElementById('header-title');
    if (headerTitle) headerTitle.textContent = config.title;

    const sections = config.sections || [];
    gallerySections = sections;

    const contentEl   = document.getElementById('gallery-content');
    const tabsEl      = document.getElementById('section-tabs');
    const containerEl = document.getElementById('sections-container');

    contentEl.dataset.cloudName = cloudName;

    const isOnlySection = sections.length === 1;

    if (!isOnlySection) {
      tabsEl.innerHTML = renderTabs(sections, sections[0].id);
      tabsEl.classList.remove('hidden');
    }

    // Renderizar skeletons imediatamente
    containerEl.innerHTML = sections.map(s => renderSectionSkeleton(s)).join('');

    // Injetar cabeçalho de secção e ocultar painéis não-activos
    sections.forEach((section, i) => {
      const panel = document.getElementById(`panel-${section.id}`);
      if (!panel) return;

      if (!isOnlySection) {
        const header = document.createElement('div');
        header.style.cssText = 'display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;';
        header.innerHTML = `
          <i class="fa-solid ${section.icon || 'fa-images'}" style="color:#5ecfb1;font-size:1.1rem;"></i>
          <h2 style="font-size:1.15rem;font-weight:800;color:#fff;letter-spacing:0.01em;">${section.title}</h2>
          <span id="count-${section.id}" style="color:rgba(255,255,255,0.3);font-size:0.8rem;">…</span>`;
        panel.insertBefore(header, panel.firstChild);

        // Ocultar todos os painéis exceto o primeiro
        if (i > 0) panel.classList.add('hidden');
      }
    });

    // Mostrar estrutura imediatamente (os grids preenchem-se à medida que carregam)
    document.getElementById('gallery-loading').classList.add('hidden');
    contentEl.classList.remove('hidden');

    // Carregar todas as secções em paralelo
    await Promise.all(sections.map(section => loadSection(section, cloudName)));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
