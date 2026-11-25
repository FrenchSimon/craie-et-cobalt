/**
 * Logo « Craie & Cobalt » vectorisé (docs/direction-artistique.md) : lettres converties en tracés,
 * aucune police à charger pour l'afficher.
 *
 * - Nom en minuscules, Archivo 300, largeur 112 %, approche +0,015 em, esperluette cobalt.
 * - Logo complet : le nom et, dessous, « ARCHITECTURE INTÉRIEURE · LYON » en IBM Plex Mono 500.
 * - Favicon : esperluette Archivo 500 (plus lisible que le 300 en 16 px), craie sur carré cobalt.
 *
 * Archivo en graisse 300 n'est pas dans les polices du site (400 à 600) : il faut la police
 * variable d'origine, Archivo[wdth,wght].ttf (licence OFL, dépôt github.com/google/fonts,
 * dossier ofl/archivo), à télécharger à part. La légende se sert de la police mono du site.
 *
 * Lecture des polices : fontkitten, déjà installé avec Astro (pas de dépendance de plus).
 * Il ne gère pas le crénage, sans effet visible sur ce nom.
 *
 * Usage : node scripts/logo.mjs <chemin vers Archivo[wdth,wght].ttf>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { create } from 'fontkitten';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sortie = path.join(racine, 'contenu/logo');
const polices = path.join(racine, 'src/assets/fonts');

const cheminArchivo = process.argv[2];
if (!cheminArchivo) {
  console.error('Usage : node scripts/logo.mjs <chemin vers Archivo[wdth,wght].ttf>');
  process.exit(1);
}

const ouvrir = (chemin) => create(readFileSync(chemin));
const archivo = ouvrir(cheminArchivo);
const nomPolice = archivo.getVariation({ wght: 300, wdth: 112 });
const faviconPolice = archivo.getVariation({ wght: 500, wdth: 112 });
const mono = ouvrir(path.join(polices, 'ibm-plex-mono-latin-500-normal.woff2'));

const GRAPHITE = '#1E2229';
const COBALT = '#1D3FAE';
const CRAIE = '#F4F2ED';

const r = (n) => Math.round(n * 100) / 100;

/** Compose un texte en tracés : ligne de base à `y`, approche en em ; renvoie les tracés par caractère et la largeur. */
function composer(police, texte, taille, approche, x0 = 0, y = 0) {
  const echelle = taille / police.unitsPerEm;
  let x = x0;
  const morceaux = [];
  for (const caractere of texte) {
    const glyphe = police.glyphForCodePoint(caractere.codePointAt(0));
    morceaux.push({ caractere, d: glyphe.path.scale(echelle, -echelle).translate(x, y).toSVG() });
    x += glyphe.advanceWidth * echelle + approche * taille;
  }
  return { morceaux, largeur: x - x0 - approche * taille };
}

// Nom : 44 px, ligne de base à la hauteur des capitales (le haut du « C » touche le bord).
const TAILLE = 44;
const hauteurCap = (nomPolice.capHeight / nomPolice.unitsPerEm) * TAILLE;
const nom = composer(nomPolice, 'Craie & Cobalt', TAILLE, 0.015, 0, hauteurCap);
const largeur = nom.largeur;

const tracesNom = (couleur, couleurEsperluette) => {
  const lettres = nom.morceaux
    .filter((m) => m.caractere !== '&' && m.caractere !== ' ')
    .map((m) => m.d)
    .join('');
  const esperluette = nom.morceaux.find((m) => m.caractere === '&').d;
  return `<path fill="${couleur}" d="${lettres}"/><path fill="${couleurEsperluette}" d="${esperluette}"/>`;
};

// Légende du logo complet, centrée sous le nom.
function legende(y, couleur) {
  const texte = 'ARCHITECTURE INTÉRIEURE · LYON';
  const essai = composer(mono, texte, 11, 0.16);
  const ligne = composer(mono, texte, 11, 0.16, (largeur - essai.largeur) / 2, y);
  return `<path fill="${couleur}" d="${ligne.morceaux.map((m) => m.d).join('')}"/>`;
}

const svg = (hauteur, corps, titre) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(largeur)} ${r(hauteur)}" width="${r(largeur)}" height="${r(hauteur)}" role="img" aria-label="${titre}"><title>${titre}</title>${corps}</svg>\n`;

const TITRE_COMPLET = 'Craie &amp; Cobalt, architecture intérieure à Lyon';

// Logo complet : légende 22 px sous la ligne de base du nom.
const yLegende = hauteurCap + 22;
const hauteurComplet = yLegende + 2;
writeFileSync(path.join(sortie, 'logo.svg'), svg(hauteurComplet, tracesNom(GRAPHITE, COBALT) + legende(yLegende, COBALT), TITRE_COMPLET));
writeFileSync(path.join(sortie, 'logo-craie.svg'), svg(hauteurComplet, tracesNom(CRAIE, CRAIE) + legende(yLegende, CRAIE), TITRE_COMPLET));

// Mot-symbole de l'en-tête : le nom seul (pas de jambage descendant dans « Craie & Cobalt »).
writeFileSync(path.join(sortie, 'mot-symbole.svg'), svg(hauteurCap + 1, tracesNom(GRAPHITE, COBALT), 'Craie &amp; Cobalt'));

// Favicon : esperluette centrée sur un carré cobalt de 64 px aux coins arrondis.
const glyphe = faviconPolice.glyphForCodePoint('&'.codePointAt(0));
const echelle = 46 / faviconPolice.unitsPerEm;
const boite = glyphe.path.bbox;
const dx = 32 - ((boite.minX + boite.maxX) / 2) * echelle;
const dy = 32 + ((boite.minY + boite.maxY) / 2) * echelle;
const esperluette = glyphe.path.scale(echelle, -echelle).translate(dx, dy).toSVG();
writeFileSync(
  path.join(sortie, 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="${COBALT}"/><path fill="${CRAIE}" d="${esperluette}"/></svg>\n`,
);

console.log(`Logo écrit dans contenu/logo/ (largeur ${r(largeur)}, hauteur des capitales ${r(hauteurCap)}).`);
