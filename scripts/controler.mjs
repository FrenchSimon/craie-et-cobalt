/**
 * Contrôles automatiques avant chaque PR (AGENTS.md, « Qualité » et « Sécurité »).
 * Lit le site construit (dist/, récursivement) et le code source (src/), sans aucune dépendance.
 *
 * - pages : au moins PAGES_MIN pages construites (sinon le build a changé de format) ;
 * - CSP et tiers : aucun script ni style en ligne (hors JSON-LD), aucun attribut style= ni
 *   gestionnaire on*=, aucun script, feuille de style ou police servi par un autre domaine ;
 * - structure : lang="fr", un seul h1, <main>, lien d'évitement en premier vers #contenu,
 *   cible de chaque ancre présente, bandeau « Studio fictif » avec « Voir le code »,
 *   aria-current="page" sur les liens vers la page courante (erreur dans l'en-tête et les <nav>,
 *   avertissement ailleurs) ;
 * - SEO : title et meta description présents et uniques, noindex, lien canonique cohérent avec
 *   l'URL (aucun sur la 404), JSON-LD lisible ;
 * - images : width, height et alt sur chaque img ;
 * - liens : domaines externes autorisés seulement (fiction), target="_blank" toujours avec
 *   rel="noopener noreferrer" ;
 * - source : ni innerHTML / outerHTML / insertAdjacentHTML / set:html (hors JSON-LD),
 *   ni TODO / FIXME, ni console.log.
 *
 * Erreurs connues, prévues à une étape de la roadmap : scripts/controler-exceptions.json
 * (message exact et étape). Elles sont listées à part et ne font pas échouer le contrôle ;
 * une exception qui ne se produit plus est signalée pour être retirée.
 *
 * Usage : npm run build, puis npm run controler (code de sortie 1 en cas d'erreur).
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(racine, 'dist');
const site = 'https://craie-et-cobalt.vercel.app';

/** 7 pages et la 404 : moins, c'est que le build n'a pas produit ce qu'on attend. */
const PAGES_MIN = 8;

/** Seuls domaines vers lesquels un lien peut pointer : code, crédits, hébergeur, CNIL. */
const DOMAINES_AUTORISES = ['craie-et-cobalt.vercel.app', 'github.com', 'unsplash.com', 'vercel.com', 'www.cnil.fr'];

const erreurs = [];
const avertissements = [];
const signaler = (fichier, message) => erreurs.push(`${fichier} : ${message}`);
const avertir = (fichier, message) => avertissements.push(`${fichier} : ${message}`);

/** Valeur d'un attribut dans une balise ouvrante (guillemets doubles ou simples), ou null. */
const attribut = (balise, nom) => balise.match(new RegExp(`\\s${nom}=(["'])(.*?)\\1`))?.[2] ?? null;

/** Adresse servie par le site lui-même (chemin relatif ou absolu, pas « //autre-domaine »). */
const estLocale = (url) => url.startsWith('/') && !url.startsWith('//');

/** Fichiers d'un dossier, récursivement, filtrés par extension. */
async function lister(dossier, extensions) {
  const entrees = await readdir(dossier, { withFileTypes: true, recursive: true });
  return entrees
    .filter((e) => e.isFile() && extensions.includes(path.extname(e.name)))
    .map((e) => path.join(e.parentPath, e.name));
}

let pages;
try {
  pages = (await lister(dist, ['.html'])).map((f) => path.relative(dist, f).split(path.sep).join('/'));
} catch {
  console.error('dist/ introuvable : lancer « npm run build » d’abord.');
  process.exit(1);
}
if (pages.length < PAGES_MIN) {
  signaler('dist', `${pages.length} page(s) construite(s) au lieu de ${PAGES_MIN} au moins`);
}

const titres = new Map();
const descriptions = new Map();

for (const page of pages) {
  const html = await readFile(path.join(dist, page), 'utf8');
  const est404 = page === '404.html';
  // contact.html et contact/index.html → /contact ; index.html → /
  const chemin = `/${page.replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '')}`;

  // CSP : scripts locaux ou JSON-LD seulement, styles en fichiers, rien d'un autre domaine.
  for (const [balise] of html.matchAll(/<script\b[^>]*>/g)) {
    const src = attribut(balise, 'src');
    if (src === null && attribut(balise, 'type') !== 'application/ld+json') {
      signaler(page, 'script en ligne (interdit par la CSP)');
    } else if (src !== null && !estLocale(src)) {
      signaler(page, `script tiers (${src})`);
    }
  }
  for (const [balise] of html.matchAll(/<link\b[^>]*>/g)) {
    const rel = attribut(balise, 'rel') ?? '';
    const href = attribut(balise, 'href') ?? '';
    if (/stylesheet|preload|modulepreload|icon/.test(rel) && !estLocale(href)) {
      signaler(page, `ressource tierce (${rel} ${href})`);
    }
  }
  if (/<style\b/.test(html)) signaler(page, 'balise <style> en ligne (interdite par la CSP)');
  if (/\sstyle=["']/.test(html)) signaler(page, 'attribut style= (interdit par la CSP)');
  if (/\son[a-z]+=["']/.test(html)) signaler(page, 'gestionnaire on*= en ligne (interdit par la CSP)');

  // JSON-LD : doit se lire, avec un type.
  for (const [, contenu] of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const donnees = JSON.parse(contenu);
      if (!donnees['@type']) signaler(page, 'JSON-LD sans @type');
    } catch {
      signaler(page, 'JSON-LD illisible');
    }
  }

  // Structure commune.
  if (attribut(html.match(/<html\b[^>]*>/)?.[0] ?? '', 'lang') !== 'fr') signaler(page, 'lang="fr" absent de <html>');
  const h1 = html.match(/<h1\b/g)?.length ?? 0;
  if (h1 !== 1) signaler(page, `${h1} h1 au lieu d'un seul`);
  if (!/<main\b/.test(html)) signaler(page, 'pas de <main>');

  const corps = html.slice(html.search(/<body\b/));
  const premierLien = corps.match(/<a\b[^>]*>/)?.[0] ?? '';
  if (attribut(premierLien, 'href') !== '#contenu') signaler(page, "le premier lien n'est pas le lien d'évitement vers #contenu");
  const ids = new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map(([, id]) => id));
  for (const [, cible] of html.matchAll(/<a\b[^>]*\shref=["']#([^"']+)["']/g)) {
    if (!ids.has(cible)) signaler(page, `ancre #${cible} sans élément cible`);
  }

  // Texte du bandeau sans balises : « Voir le <span>code</span> » doit se lire « Voir le code ».
  const bandeau = (html.match(/<[a-z]+ class="bandeau-demo[\s\S]*?<\/p>/)?.[0] ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
  if (!bandeau.includes('Studio fictif') || !bandeau.includes('Voir le code')) {
    signaler(page, 'bandeau « Studio fictif — … Voir le code » absent ou incomplet');
  }

  // Liens vers la page courante : aria-current="page" attendu (obligatoire dans l'en-tête et les menus).
  const navigations = [...html.matchAll(/<(header|nav)\b[\s\S]*?<\/\1>/g)].map(([bloc]) => bloc).join('');
  for (const [balise] of html.matchAll(/<a\b[^>]*>/g)) {
    if (attribut(balise, 'href') !== chemin || attribut(balise, 'aria-current') === 'page') continue;
    if (navigations.includes(balise)) signaler(page, `lien vers ${chemin} sans aria-current="page" dans un menu`);
    else avertir(page, `lien vers ${chemin} sans aria-current="page" (hors menu)`);
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
    const attendu = `${site}${chemin}`;
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

  // Liens externes : domaines autorisés, et nouvel onglet toujours en noopener noreferrer.
  for (const [balise] of html.matchAll(/<a\b[^>]*>/g)) {
    const href = attribut(balise, 'href') ?? '';
    if (/^https?:\/\//.test(href) && !DOMAINES_AUTORISES.includes(new URL(href).hostname)) {
      signaler(page, `lien vers un domaine non autorisé (${href})`);
    }
    if (attribut(balise, 'target') === '_blank') {
      const rel = attribut(balise, 'rel') ?? '';
      if (!rel.includes('noopener') || !rel.includes('noreferrer')) {
        signaler(page, `lien sans rel="noopener noreferrer" (${href})`);
      }
    }
  }
}

for (const [valeurs, nom] of [[titres, 'title'], [descriptions, 'meta description']]) {
  for (const [texte, fichiers] of valeurs) {
    if (fichiers.length > 1) signaler(fichiers.join(', '), `${nom} en double : « ${texte} »`);
  }
}

// Feuilles de style construites : aucune police ni image servie par un autre domaine.
for (const fichier of await lister(dist, ['.css'])) {
  for (const [, url] of (await readFile(fichier, 'utf8')).matchAll(/url\(\s*["']?(https?:|\/\/)/g)) {
    signaler(path.relative(racine, fichier), `ressource tierce dans une feuille de style (${url}…)`);
  }
}

// Code source.
for (const fichier of await lister(path.join(racine, 'src'), ['.astro', '.ts', '.js', '.mjs', '.css'])) {
  const relatif = path.relative(racine, fichier);
  const lignes = (await readFile(fichier, 'utf8')).split('\n');
  lignes.forEach((ligne, i) => {
    const ou = `${relatif}:${i + 1}`;
    if (/\.(innerHTML|outerHTML)\s*\+?=|insertAdjacentHTML\s*\(/.test(ligne)) signaler(ou, 'injection de HTML (utiliser textContent)');
    // set:html : permis seulement pour sérialiser le JSON-LD
    if (/set:html=/.test(ligne) && !/JSON\.stringify/.test(ligne)) signaler(ou, 'set:html hors JSON-LD (injection de HTML)');
    if (/\b(TODO|FIXME|XXX)\b/.test(ligne)) signaler(ou, 'TODO oublié');
    if (/console\.(log|debug)\s*\(/.test(ligne)) signaler(ou, 'console.log oublié');
  });
}

// Erreurs connues, prévues à une étape de la roadmap.
const exceptions = JSON.parse(await readFile(path.join(racine, 'scripts/controler-exceptions.json'), 'utf8'));
const connues = erreurs.filter((e) => exceptions.some((x) => x.message === e));
const nouvelles = erreurs.filter((e) => !connues.includes(e));
for (const x of exceptions) {
  if (!erreurs.includes(x.message)) avertir('controler-exceptions.json', `exception à retirer, l'erreur a disparu : « ${x.message} »`);
}

if (avertissements.length) {
  console.warn(`⚠ ${avertissements.length} avertissement(s) :\n- ${avertissements.join('\n- ')}`);
}
if (connues.length) {
  const etape = (e) => exceptions.find((x) => x.message === e).etape;
  console.warn(`… ${connues.length} erreur(s) connue(s), prévue(s) à la roadmap :\n- ${connues.map((e) => `${e} (étape ${etape(e)})`).join('\n- ')}`);
}
if (nouvelles.length) {
  console.error(`✗ ${nouvelles.length} problème(s) :\n- ${nouvelles.join('\n- ')}`);
  process.exit(1);
}
console.log(`✓ ${pages.length} pages et le code source conformes.`);
