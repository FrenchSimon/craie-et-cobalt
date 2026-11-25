/**
 * Étalonnage commun des photos (docs/direction-artistique.md, validé le 25/11) :
 * - C « Cobalt seul » (photos de réalisations) : saturation 0,9, blancs ramenés vers la craie,
 *   noirs levés vers le graphite, puis couleurs vives désaturées sauf les bleus ;
 * - A « Craie » (portrait et atelier de la fondatrice) : même courbe, sans la désaturation
 *   sélective, qui ternissait la peau.
 * Sur la photo de la boutique, le titre d'un livre (nom d'une marque réelle) est effacé avant tout.
 *
 * Les originaux de contenu/photos/ (3 000 px, hors de Git) restent intacts ; les masters
 * étalonnés de 1 600 px au plus sont écrits dans src/assets/photos/, d'où Astro produit
 * les versions AVIF et WebP de chaque taille.
 *
 * Usage : npm run photos
 */
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(racine, 'contenu/photos');
const destination = path.join(racine, 'src/assets/photos');

// Plus grande photo affichée : 620 px de large dans la fiche, soit 1 240 px en haute densité.
const COTE_MAX = 1600;

// Courbe commune, par canal (R, V, B) : sortie = entrée × gain + décalage.
// Blanc 255 → environ (250, 247, 240), proche de la craie ; noir 0 → (16, 18, 22), proche du graphite.
const COURBE = { saturation: 0.9, gain: [0.918, 0.898, 0.855], decalage: [16, 18, 22] };

// Réglage A pour ces deux photos, C pour toutes les autres.
const REGLAGE_A = ['fondatrice-portrait.jpg', 'studio-atelier.jpg'];

// Zones à effacer, en pixels de l'original : bande du texte, entre deux bords unis.
const EFFACEMENTS = {
  // Tranche du livre posé sur le tabouret : « Louis Vuitton » gravé en brun foncé.
  'boutique-1.jpg': [{ x0: 1478, x1: 2045, y0: 2788, y1: 2868 }],
};

/**
 * Efface une bande de texte : chaque colonne reçoit un dégradé entre la couleur du bord
 * au-dessus et celle du bord en dessous (moyennes lissées sur 25 px), plus un léger grain.
 */
function effacer(donnees, largeur, zone) {
  const { x0, x1, y0, y1 } = zone;
  const valeur = (x, y, c) => donnees[(y * largeur + x) * 3 + c];
  const moyenne = (x, lignes, c) => lignes.reduce((somme, y) => somme + valeur(x, y, c), 0) / lignes.length;
  const lisser = (f) => {
    const resultat = [];
    for (let x = x0; x <= x1; x++) {
      let somme = 0;
      for (let k = -12; k <= 12; k++) somme += f(Math.min(x1, Math.max(x0, x + k)));
      resultat.push(somme / 25);
    }
    return resultat;
  };
  // Grain pseudo-aléatoire à graine fixe : le résultat est identique à chaque exécution.
  let graine = 7;
  const alea = () => (graine = (graine * 16807) % 2147483647) / 2147483647;

  const dessus = [y0 - 4, y0 - 3, y0 - 2];
  const dessous = [y1 + 2, y1 + 3, y1 + 4];
  for (let c = 0; c < 3; c++) {
    const haut = lisser((x) => moyenne(x, dessus, c));
    const bas = lisser((x) => moyenne(x, dessous, c));
    for (let y = y0; y <= y1; y++) {
      const t = (y - y0) / (y1 - y0);
      for (let x = x0; x <= x1; x++) {
        const i = x - x0;
        const teinte = haut[i] * (1 - t) + bas[i] * t + (alea() - 0.5) * 5;
        // Borné à 0–255 : un tableau d'octets ferait boucler une valeur hors limites.
        donnees[(y * largeur + x) * 3 + c] = Math.max(0, Math.min(255, Math.round(teinte)));
      }
    }
  }
}

/**
 * Désaturation sélective (réglage C) : les bleus gardent leur saturation, le reste est calmé.
 * Poids « bleu » : 1 pour une teinte entre 205° et 245°, 0 hors de 185°–265°, transition linéaire
 * de 20° ; facteur de saturation 0,55 + 0,45 × poids. Pixels presque gris (écart < 8) inchangés.
 */
function garderLesBleus(donnees) {
  for (let i = 0; i < donnees.length; i += 3) {
    const r = donnees[i];
    const v = donnees[i + 1];
    const b = donnees[i + 2];
    const max = Math.max(r, v, b);
    const ecart = max - Math.min(r, v, b);
    if (ecart < 8) continue;
    let teinte;
    if (max === r) teinte = ((v - b) / ecart) % 6;
    else if (max === v) teinte = (b - r) / ecart + 2;
    else teinte = (r - v) / ecart + 4;
    teinte = (teinte * 60 + 360) % 360;
    const bleu = Math.max(0, Math.min(1, (teinte - 185) / 20, (265 - teinte) / 20));
    const facteur = 0.55 + 0.45 * bleu;
    const gris = 0.299 * r + 0.587 * v + 0.114 * b;
    donnees[i] = gris + (r - gris) * facteur;
    donnees[i + 1] = gris + (v - gris) * facteur;
    donnees[i + 2] = gris + (b - gris) * facteur;
  }
}

/** Lit une image en pixels bruts RVB. */
async function pixels(image) {
  const { data, info } = await image.removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, largeur: info.width, hauteur: info.height };
}

const brut = ({ data, largeur, hauteur }) => sharp(data, { raw: { width: largeur, height: hauteur, channels: 3 } });

await mkdir(destination, { recursive: true });
const photos = (await readdir(source)).filter((nom) => nom.endsWith('.jpg')).sort();

for (const nom of photos) {
  let image = sharp(path.join(source, nom)).rotate();

  if (EFFACEMENTS[nom]) {
    const original = await pixels(image);
    for (const zone of EFFACEMENTS[nom]) effacer(original.data, original.largeur, zone);
    image = brut(original);
  }

  image = image
    .resize({ width: COTE_MAX, height: COTE_MAX, fit: 'inside', withoutEnlargement: true })
    .modulate({ saturation: COURBE.saturation })
    .linear(COURBE.gain, COURBE.decalage);

  const reglageC = !REGLAGE_A.includes(nom);
  if (reglageC) {
    const etalonnee = await pixels(image);
    garderLesBleus(etalonnee.data);
    image = brut(etalonnee);
  }

  const { width, height, size } = await image
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(path.join(destination, nom));
  console.log(`${nom} : ${reglageC ? 'C' : 'A'}, ${width} × ${height}, ${Math.round(size / 1024)} Ko`);
}
