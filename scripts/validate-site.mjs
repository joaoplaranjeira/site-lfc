import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';

const root = process.cwd();
const pagesDirectory = join(root, 'legacy-pages');
const pages = readdirSync(pagesDirectory).filter((file) => file.endsWith('.html')).sort();
const reactRoutes = new Set(['candidaturas']);
const failures = [];
const apiReferences = new Set();

function isExternal(reference) {
  return /^(?:[a-z]+:|\/\/|#|data:|mailto:|tel:|javascript:)/i.test(reference);
}

function localTarget(page, reference) {
  let clean = reference.split('#')[0].split('?')[0];
  if (!clean || isExternal(clean)) return null;
  try {
    clean = decodeURIComponent(clean);
  } catch {
    failures.push(`${page}: URL local inválido: ${reference}`);
    return null;
  }
  if (clean.endsWith('.html')) return join(pagesDirectory, clean.replace(/^\//, ''));
  const cleanRoute = clean.replace(/^\//, '');
  if (reactRoutes.has(cleanRoute)) return null;
  if (clean === '/' || pages.includes(`${cleanRoute}.html`)) {
    return join(pagesDirectory, clean === '/' ? 'index.html' : `${cleanRoute}.html`);
  }
  return normalize(join(root, dirname(page) === '.' ? '' : dirname(page), clean.replace(/^\//, '')));
}

for (const page of pages) {
  const html = readFileSync(join(pagesDirectory, page), 'utf8');
  const references = [...html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1]);
  for (const reference of references) {
    const target = localTarget(page, reference);
    if (target && !existsSync(target)) failures.push(`${page}: recurso inexistente: ${reference}`);
  }
}

const integrationSources = [
  ...readdirSync(root).filter((name) => extname(name) === '.js').map((name) => join(root, name)),
  ...pages.map((name) => join(pagesDirectory, name))
];

for (const file of integrationSources) {
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(/(?:https?:\/\/[^'"`\s]+|\/api\/[A-Za-z0-9_?&=/${}.:-]+)/g)) {
    apiReferences.add(match[0]);
  }
}

if (!pages.includes('index.html')) failures.push('A rota principal index.html não existe.');
if (pages.length < 20) failures.push(`Foram encontradas apenas ${pages.length} páginas; o inventário esperado é multipágina.`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validação concluída: ${pages.length} páginas, referências locais válidas e ${apiReferences.size} referências de API inventariadas.`);
}
