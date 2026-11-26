/**
 * Contrôles automatiques avant chaque PR (AGENTS.md, « Qualité » et « Sécurité »).
 * Lit le site construit (dist/*.html) et le code source (src/), sans aucune dépendance.
 *
 * - CSP : aucun script ni style en ligne, aucun attribut style= ni gestionnaire on*= ;
 * - structure : un seul h1, lien d'évitement, bandeau « Studio fictif », aria-current="page" sur les liens
 *   vers la page courante (erreur dans l'en-tête, avertissement ailleurs) ;
 * - SEO : title et meta description présents et uniques, noindex, lien canonique cohérent avec l'URL ;
 * - images : width, height et alt sur chaque img ;
 * - liens : target="_blank" toujours avec rel="noopener noreferrer" ;
 * - source : ni innerHTML / outerHTML / insertAdjacentHTML, ni TODO / FIXME, ni console.log.
 *
 * Usage : npm run build, puis npm run controler (code de sortie 1 en cas d'erreur).
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(racine, 'dist');
const site = 'https://craie-et-cobalt.vercel.app';

const erreurs = [];
const avertissements = [];
const signaler = (fichier, message) => erreurs.push(`${fichier} : ${message}`);
const avertir = (fichier, message) => avertissements.push(`${fichier} : ${message}`);

/** Valeur d'un attribut dans une balise ouvrante, ou null. */
const attribut = (balise, nom) => balise.match(new RegExp(`\\s${nom}="([^"]*)"`))?.[1] ?? null;

/** Fichiers d'un dossier, récursivement, filtrés par extension. */
async function lister(dossier, extensions) {
  const entrees = await readdir(dossier, { withFileTypes: true, recursive: true });
  return entrees
    .filter((e) => e.isFile() && extensions.includes(path.extname(e.name)))
    .map((e) => path.join(e.parentPath, e.name));
}

let pages;
try {
  pages = (await readdir(dist)).filter((f) => f.endsWith('.html'));
} catch {
  console.error('dist/ introuvable : lancer « npm run build » d’abord.');
  process.exit(1);
}

const titres = new Map();
const descriptions = new Map();

for (const page of pages) {
  const html = await readFile(path.join(dist, page), 'utf8');
  const est404 = page === '404.html';

  // CSP : scripts externes ou JSON-LD seulement, styles en fichiers.
  for (const [balise] of html.matchAll(/<script\b[^>]*>/g)) {
    if (!attribut(balise, 'src') && attribut(balise, 'type') !== 'application/ld+json') {
      signaler(page, 'script en ligne (interdit par la CSP)');
    }
  }
  if (/<style\b/.test(html)) signaler(page, 'balise <style> en ligne (interdite par la CSP)');
  if (/\sstyle="/.test(html)) signaler(page, 'attribut style= (interdit par la CSP)');
  if (/\son[a-z]+="/.test(html)) signaler(page, 'gestionnaire on*= en ligne (interdit par la CSP)');

  // Structure commune.
  const h1 = html.match(/<h1\b/g)?.length ?? 0;
  if (h1 !== 1) signaler(page, `${h1} h1 au lieu d'un seul`);
  if (!/<main\b/.test(html)) signaler(page, 'pas de <main>');
  if (!/href="#[^"]+"[^>]*>[^<]*(Aller|contenu)/i.test(html)) signaler(page, "lien d'évitement introuvable");
  if (!html.includes('Studio fictif')) signaler(page, 'bandeau « Studio fictif » absent');
  // Liens vers la page courante : aria-current="page" attendu.
  const chemin = page === 'index.html' ? '/' : `/${page.replace(/\.html$/, '')}`;
  const entete = html.match(/<header\b[\s\S]*?<\/header>/)?.[0] ?? '';
  for (const [balise] of html.matchAll(/<a\b[^>]*>/g)) {
    if (attribut(balise, 'href') !== chemin || attribut(balise, 'aria-current') === 'page') continue;
    if (entete.includes(balise)) signaler(page, `lien vers ${chemin} sans aria-current="page" dans l'en-tête`);
    else avertir(page, `lien vers ${chemin} sans aria-current="page" (hors en-tête)`);
  }

  // SEO.
  const titre = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim();
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1]?.trim();
  if (!titre) signaler(page, '<title> absent');
  else titres.set(titre, [...(titres.get(titre) ?? []), page]);
  if (!description) signaler(page, 'meta description absente');
  else descriptions.set(description, [...(descriptions.get(description) ?? []), page]);
  if (!/<meta name="robots" content="[^"]*noindex/.test(html)) signaler(page, 'noindex absent');

  const canonique = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  if (!est404) {
    const attendu = page === 'index.html' ? `${site}/` : `${site}/${page.replace(/\.html$/, '')}`;
    if (!canonique) signaler(page, 'lien canonique absent');
    else if (canonique !== attendu) signaler(page, `lien canonique ${canonique} au lieu de ${attendu}`);
  } else if (canonique) {
    signaler(page, 'la page 404 ne doit pas avoir de lien canonique');
  }

  // Images.
  for (const [balise] of html.matchAll(/<img\b[^>]*>/g)) {
    const nom = attribut(balise, 'src') ?? '?';
    if (attribut(balise, 'alt') === null) signaler(page, `img sans alt (${nom})`);
    if (!attribut(balise, 'width') || !attribut(balise, 'height')) signaler(page, `img sans width/height (${nom})`);
  }

  // Liens ouverts dans un nouvel onglet.
  for (const [balise] of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    const rel = attribut(balise, 'rel') ?? '';
    if (!rel.includes('noopener') || !rel.includes('noreferrer')) {
      signaler(page, `lien sans rel="noopener noreferrer" (${attribut(balise, 'href')})`);
    }
  }
}

for (const [valeurs, nom] of [[titres, 'title'], [descriptions, 'meta description']]) {
  for (const [texte, fichiers] of valeurs) {
    if (fichiers.length > 1) signaler(fichiers.join(', '), `${nom} en double : « ${texte} »`);
  }
}

// Code source.
for (const fichier of await lister(path.join(racine, 'src'), ['.astro', '.ts', '.js', '.mjs', '.css'])) {
  const relatif = path.relative(racine, fichier);
  const lignes = (await readFile(fichier, 'utf8')).split('\n');
  lignes.forEach((ligne, i) => {
    const ou = `${relatif}:${i + 1}`;
    if (/\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML\s*\(/.test(ligne)) signaler(ou, 'injection de HTML (utiliser textContent)');
    if (/\b(TODO|FIXME|XXX)\b/.test(ligne)) signaler(ou, 'TODO oublié');
    if (/console\.(log|debug)\s*\(/.test(ligne)) signaler(ou, 'console.log oublié');
  });
}

if (avertissements.length) {
  console.warn(`⚠ ${avertissements.length} avertissement(s) :\n- ${avertissements.join('\n- ')}`);
}
if (erreurs.length) {
  console.error(`✗ ${erreurs.length} problème(s) :\n- ${erreurs.join('\n- ')}`);
  process.exit(1);
}
console.log(`✓ ${pages.length} pages et le code source conformes.`);
