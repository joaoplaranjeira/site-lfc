import { useEffect, useLayoutEffect, useState } from 'react';
import ApplicationsPage from './applications/ApplicationsPage.jsx';

const pageModules = import.meta.glob('../legacy-pages/*.html', {
  query: '?raw',
  import: 'default'
});

const pageLoaders = Object.fromEntries(
  Object.entries(pageModules).map(([path, load]) => [path.split('/').pop(), load])
);

function requestedPageName() {
  let pathname;
  try {
    pathname = decodeURIComponent(window.location.pathname);
  } catch {
    return null;
  }

  if (pathname === '/' || pathname === '') return 'index.html';
  const segments = pathname.replace(/^\/+|\/+$/g, '').split('/');
  if (segments.length !== 1) return null;
  const [leaf] = segments;
  if (!leaf || leaf.includes('/') || leaf.includes('\\')) return null;

  if (leaf.endsWith('.html')) {
    const cleanLeaf = leaf === 'index.html' ? '' : leaf.slice(0, -5);
    const cleanPath = cleanLeaf ? `/${cleanLeaf}` : '/';
    window.history.replaceState(
      window.history.state,
      '',
      `${cleanPath}${window.location.search}${window.location.hash}`
    );
    return leaf;
  }

  return `${leaf}.html`;
}

function parsePage(html) {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const scripts = [...parsed.querySelectorAll('script')].map((script) => ({
    src: script.getAttribute('src'),
    code: script.textContent,
    async: script.hasAttribute('async'),
    defer: script.hasAttribute('defer'),
    type: script.getAttribute('type'),
    crossOrigin: script.getAttribute('crossorigin'),
    referrerPolicy: script.getAttribute('referrerpolicy')
  }));
  parsed.querySelectorAll('script').forEach((script) => script.remove());

  return {
    title: parsed.title,
    lang: parsed.documentElement.lang || 'pt',
    bodyHtml: parsed.body.innerHTML,
    bodyAttributes: [...parsed.body.attributes].map(({ name, value }) => [name, value]),
    headNodes: [...parsed.head.children]
      .filter((node) => ['LINK', 'META', 'STYLE'].includes(node.tagName))
      .filter((node) => node.tagName !== 'META' || !node.hasAttribute('charset'))
      .map((node) => node.outerHTML),
    scripts
  };
}

function copyScriptAttributes(target, descriptor) {
  if (descriptor.type) target.type = descriptor.type;
  if (descriptor.crossOrigin) target.crossOrigin = descriptor.crossOrigin;
  if (descriptor.referrerPolicy) target.referrerPolicy = descriptor.referrerPolicy;
}

function appendScript(descriptor) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.dataset.reactLegacyScript = 'true';
    copyScriptAttributes(script, descriptor);

    if (!descriptor.src) {
      script.textContent = descriptor.code;
      document.body.appendChild(script);
      resolve();
      return;
    }

    script.src = descriptor.src;
    script.async = descriptor.async;
    script.defer = descriptor.defer;
    script.onload = resolve;
    script.onerror = () => {
      console.error(`Não foi possível carregar o script: ${descriptor.src}`);
      resolve();
    };
    document.body.appendChild(script);

    // Scripts async mantêm a semântica original e não bloqueiam os restantes.
    if (descriptor.async) resolve();
  });
}

function LegacyPage({ page }) {
  const [stylesReady, setStylesReady] = useState(false);

  useLayoutEffect(() => {
    let active = true;
    document.title = page.title;
    document.documentElement.lang = page.lang;
    setStylesReady(false);

    [...document.body.attributes].forEach(({ name }) => {
      if (!['data-vite-dev-id'].includes(name)) document.body.removeAttribute(name);
    });
    page.bodyAttributes.forEach(([name, value]) => document.body.setAttribute(name, value));

    const headTemplate = document.createElement('template');
    headTemplate.innerHTML = page.headNodes.join('');
    const installedHeadNodes = [...headTemplate.content.children];
    const stylesheets = installedHeadNodes.filter(
      (node) => node.tagName === 'LINK' && node.rel.toLowerCase() === 'stylesheet'
    );
    let pendingStylesheets = stylesheets.length;

    function stylesheetSettled() {
      pendingStylesheets -= 1;
      if (active && pendingStylesheets <= 0) setStylesReady(true);
    }

    stylesheets.forEach((stylesheet) => {
      stylesheet.addEventListener('load', stylesheetSettled, { once: true });
      stylesheet.addEventListener('error', stylesheetSettled, { once: true });
    });

    installedHeadNodes.forEach((node) => {
      node.dataset.reactLegacyHead = 'true';
      document.head.appendChild(node);
    });

    if (!stylesheets.length) setStylesReady(true);

    const revealFallback = window.setTimeout(() => {
      if (active) setStylesReady(true);
    }, 5000);

    return () => {
      active = false;
      window.clearTimeout(revealFallback);
      installedHeadNodes.forEach((node) => node.remove());
    };
  }, [page]);

  useEffect(() => {
    let cancelled = false;

    async function bootLegacyPage() {
      for (const script of page.scripts) {
        if (cancelled) return;
        await appendScript(script);
      }
      if (!cancelled) document.dispatchEvent(new Event('DOMContentLoaded'));
    }

    bootLegacyPage();
    return () => {
      cancelled = true;
      document.querySelectorAll('[data-react-legacy-script="true"]').forEach((node) => node.remove());
    };
  }, [page]);

  return (
    <>
      {!stylesReady && <LoadingPage />}
      <div
        className={`legacy-page-root${stylesReady ? '' : ' is-preparing'}`}
        aria-hidden={!stylesReady}
        dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
      />
    </>
  );
}

function NotFound({ pageName }) {
  return (
    <main className="react-not-found">
      <img src="/images/leca.png" alt="Leça FC" />
      <p>Erro 404</p>
      <h1>Página não encontrada</h1>
      <p>A página {pageName ? `“${pageName}”` : 'pedida'} não existe.</p>
      <a href="/">Voltar ao início</a>
    </main>
  );
}

function LoadingPage() {
  return (
    <main className="app-shell-loading" role="status" aria-label="A carregar página">
      <span className="app-shell-loading__mark" aria-hidden="true" />
      <span>A carregar…</span>
    </main>
  );
}

export default function App() {
  const [pageName] = useState(requestedPageName);
  const isApplicationsPage = pageName === 'candidaturas.html';
  const loader = pageName ? pageLoaders[pageName] : null;
  const [page, setPage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (isApplicationsPage || !loader) return undefined;

    loader()
      .then((html) => {
        if (!cancelled) setPage(parsePage(html));
      })
      .catch((error) => {
        console.error(`Não foi possível carregar a página ${pageName}.`, error);
      });

    return () => { cancelled = true; };
  }, [isApplicationsPage, loader, pageName]);

  if (isApplicationsPage) return <ApplicationsPage />;
  if (!loader) return <NotFound pageName={pageName} />;
  return page ? <LegacyPage page={page} /> : <LoadingPage />;
}
