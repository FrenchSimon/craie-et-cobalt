/*
 * Plan d'accès de la page Contact, étape 2 : tracé SVG des données de `donnees.json`
 * aux couleurs de la direction artistique. Repris de Pistil & Ronce (scripts/plan/dessiner.mjs),
 * avec deux différences :
 *  - projection de Mercator écrite ici (quelques lignes) : `d3-geo` n'est plus une dépendance ;
 *  - noms de rues convertis en tracés avec fontkitten (déjà installé avec Astro), comme le logo :
 *    le SVG est servi tel quel en <img>, sans police à charger ni image matricielle.
 *
 * `npm run plan` écrit dans `src/assets/plan/` :
 *  - `plan-apercu.svg` : cadre serré autour du studio et du métro, affiché dans la page ;
 *  - `plan.svg` : de la Croix-Rousse au Rhône, affiché en grand au clic ;
 *  - `plans.json` : dimensions de chaque plan et position du studio, lues par le composant.
 * Rien de ce script n'est servi aux visiteurs. Données © contributeurs OpenStreetMap (ODbL).
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { create } from 'fontkitten';

/* Couleurs de la DA (docs/direction-artistique.md), aucune autre */
const C = {
  craie: '#F4F2ED',
  craieClaire: '#FBFAF7',
  filet: '#D6D3CB',
  grisClair: '#C9CBD0',
  gris: '#5B616B',
  graphite: '#1E2229',
  cobalt: '#1D3FAE',
  cobaltPale: '#E3E7F4',
};

/* L'adresse est fictive (12 rue des Tisseuses n'existe pas) : repère posé au cœur d'un îlot du plateau,
   sur aucune rue nommée, à environ 5 minutes à pied de la station Croix-Rousse */
const STUDIO = [4.8355, 45.7763];
const STATION = 'Croix-Rousse';

/* Cadres (sud, ouest, nord, est) et taille en unités du SVG */
const RENDUS = [
  {
    fichier: 'plan-apercu.svg',
    cadre: [45.7727, 4.8287, 45.7790, 4.8392],
    largeur: 1000,
    texte: 40,
    largeurRues: 1.5,
    etiquettesMax: 4,
    rectitude: 0.95,
    tailleRues: 0.6,
    /* Aperçu : seulement les grands axes, pour se repérer d'un coup d'œil */
    rues: ['Boulevard de la Croix-Rousse', 'Grande Rue de la Croix-Rousse', 'Rue de Belfort', 'Boulevard des Canuts', "Rue d'Austerlitz", 'Rue du Mail'],
    stations: [STATION],
    echelle: 100,
  },
  {
    fichier: 'plan.svg',
    cadre: [45.7674, 4.8155, 45.7805, 4.8475],
    largeur: 2400,
    texte: 36,
    largeurRues: 1,
    etiquettesMax: 34,
    stations: ['Croix-Rousse', 'Hénon', 'Croix-Paquet', 'Hôtel de Ville - Louis Pradel', 'Foch'],
    echelle: 200,
  },
];

/* Largeur des rues (avant multiplication par le réglage du rendu) */
const LARGEUR_RUE = {
  motorway: 14, trunk: 14, primary: 12, secondary: 11, tertiary: 8.5, unclassified: 6,
  residential: 6, living_street: 5.5, pedestrian: 5.5,
};
const RUES_ETIQUETEES = ['primary', 'secondary', 'tertiary', 'pedestrian', 'residential', 'living_street', 'unclassified'];

const { elements } = JSON.parse(await readFile(new URL('./donnees.json', import.meta.url), 'utf8'));
const mono = create(await readFile(new URL('../../src/assets/fonts/ibm-plex-mono-latin-500-normal.woff2', import.meta.url)));

/* --- Géométrie --- */

const memePoint = (a, b) => a[0] === b[0] && a[1] === b[1];

/* Reconstitue les anneaux d'un multipolygone à partir de ses chemins (bout à bout) */
function assemblerAnneaux(chemins) {
  const restants = chemins.map((chemin) => [...chemin]);
  const anneaux = [];
  while (restants.length) {
    const anneau = restants.shift();
    let prolonge = true;
    while (!memePoint(anneau[0], anneau.at(-1)) && prolonge) {
      prolonge = false;
      for (let i = 0; i < restants.length; i++) {
        const chemin = restants[i];
        if (memePoint(chemin[0], anneau.at(-1))) anneau.push(...chemin.slice(1));
        else if (memePoint(chemin.at(-1), anneau.at(-1))) anneau.push(...chemin.reverse().slice(1));
        else continue;
        restants.splice(i, 1);
        prolonge = true;
        break;
      }
    }
    if (anneau.length > 3) anneaux.push(anneau);
  }
  return anneaux;
}

/* Aboute les tronçons d'une même rue */
function abouter(chemins) {
  const restants = chemins.map((c) => [...c]);
  const chaines = [];
  while (restants.length) {
    let chaine = restants.shift();
    for (let sens = 0; sens < 2; sens++) {
      let i;
      while ((i = restants.findIndex((c) => memePoint(c[0], chaine.at(-1)) || memePoint(c.at(-1), chaine.at(-1)))) !== -1) {
        const [suite] = restants.splice(i, 1);
        chaine.push(...(memePoint(suite[0], chaine.at(-1)) ? suite : suite.reverse()).slice(1));
      }
      chaine = chaine.reverse();
    }
    chaines.push(chaine);
  }
  return chaines;
}

const longueur = (points) => points.slice(1).reduce((somme, p, i) => somme + Math.hypot(p[0] - points[i][0], p[1] - points[i][1]), 0);

function echantillonner(points, pas) {
  const echantillons = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [a, b] = [points[i], points[i + 1]];
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / pas));
    for (let k = 0; k < n; k++) echantillons.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
  }
  echantillons.push(points.at(-1));
  return echantillons;
}

/* --- Texte en tracés (Plex Mono 500, capitales espacées comme les étiquettes du site) --- */

function composer(texte, taille, approche = 0.08) {
  const echelle = taille / mono.unitsPerEm;
  let x = 0;
  const tracés = [];
  for (const caractere of texte) {
    const glyphe = mono.glyphForCodePoint(caractere.codePointAt(0));
    tracés.push(glyphe.path.scale(echelle, -echelle).translate(x, 0).toSVG());
    x += glyphe.advanceWidth * echelle + approche * taille;
  }
  const largeur = x - approche * taille;
  /* Hauteur des capitales, pour centrer le texte sur sa ligne */
  const cap = (mono.capHeight / mono.unitsPerEm) * taille;
  return { d: tracés.join(''), largeur, cap };
}

const r1 = (n) => Math.round(n * 10) / 10;

/* Simplification de Douglas-Peucker (points projetés) : allège le SVG sans changer le dessin à l'œil */
function simplifier(points, tolerance) {
  if (points.length < 3) return points;
  const [a, b] = [points[0], points.at(-1)];
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const norme = Math.hypot(dx, dy) || 1;
  let indice = 0;
  let max = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const distance = memePoint(a, b)
      ? Math.hypot(points[i][0] - a[0], points[i][1] - a[1])
      : Math.abs(dy * points[i][0] - dx * points[i][1] + b[0] * a[1] - b[1] * a[0]) / norme;
    if (distance > max) [indice, max] = [i, distance];
  }
  if (max <= tolerance) return [a, b];
  return [...simplifier(points.slice(0, indice + 1), tolerance).slice(0, -1), ...simplifier(points.slice(indice), tolerance)];
}

const aire = (points) => Math.abs(points.slice(1).reduce((s, p, i) => s + (points[i][0] * p[1] - p[0] * points[i][1]), 0)) / 2;

/* Tracé d'un texte centré sur (x, y), tourné de `angle` degrés, avec un liseré pour se détacher du plan */
function texte(contenu, x, y, { taille, angle = 0, couleur = C.gris, lisere = C.craie, ancre = 'milieu', approche } = {}) {
  const { d, largeur, cap } = composer(contenu, taille, approche);
  const dx = ancre === 'debut' ? 0 : ancre === 'fin' ? -largeur : -largeur / 2;
  const transformation = `translate(${r1(x)} ${r1(y)})${angle ? ` rotate(${r1(angle)})` : ''} translate(${r1(dx)} ${r1(cap / 2)})`;
  const contour = lisere ? ` stroke="${lisere}" stroke-width="${r1(taille * 0.22)}" stroke-linejoin="round" paint-order="stroke"` : '';
  return { svg: `<path transform="${transformation}" d="${d}" fill="${couleur}"${contour}/>`, largeur };
}

/* --- Rendu --- */

function rendre({ cadre, largeur: LARGEUR, texte: TAILLE, largeurRues, etiquettesMax, rues: choisies, rectitude = 0.985, tailleRues = 0.72, stations, echelle }) {
  const [sud, ouest, nord, est] = cadre;
  const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  const k = LARGEUR / (((est - ouest) * Math.PI) / 180);
  const HAUTEUR = Math.round(k * (merc(nord) - merc(sud)));
  const projeter = ([lon, lat]) => [((lon - ouest) * Math.PI * k) / 180, k * (merc(nord) - merc(lat))];
  /* Coordonnées entières : à l'écran, une unité vaut moins d'un pixel */
  const chemin = (points, ferme = false) => {
    const projetes = simplifier(points.map(projeter), 0.9).map((p) => p.map(Math.round));
    if (ferme && (projetes.length < 4 || aire(projetes) < 40)) return '';
    if (projetes.length < 2) return '';
    const relatifs = projetes.slice(1).map((p, i) => `${p[0] - projetes[i][0]} ${p[1] - projetes[i][1]}`);
    return `M${projetes[0].join(' ')}l${relatifs.join(' ')}${ferme ? 'z' : ''}`;
  };
  const visible = (points, marge = 0.15) => {
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const mx = (est - ouest) * marge;
    const my = (nord - sud) * marge;
    return Math.max(...xs) > ouest - mx && Math.min(...xs) < est + mx && Math.max(...ys) > sud - my && Math.min(...ys) < nord + my;
  };

  const couches = { eau: [], parc: [], bati: [], montees: [], rues: [], surfaces: [] };
  const nommees = [];
  const points = [];

  for (const element of elements) {
    const { tags } = element;
    if (element.type === 'node') {
      if (tags.station === 'subway' && stations.includes(tags.name)) points.push({ nom: tags.name, position: element.position });
      continue;
    }
    if (element.type === 'relation') {
      const exterieurs = assemblerAnneaux(element.membres.filter((m) => m.role === 'outer').map((m) => m.geometrie)).filter((a) => visible(a));
      if (!exterieurs.length) continue;
      const interieurs = assemblerAnneaux(element.membres.filter((m) => m.role === 'inner').map((m) => m.geometrie)).filter((a) => visible(a));
      const d = [...exterieurs, ...interieurs].map((a) => chemin(a, true)).join('');
      (tags.natural === 'water' ? couches.eau : couches.parc).push(d);
      continue;
    }
    const geometrie = element.geometrie;
    if (!visible(geometrie)) continue;
    if (tags.tunnel && tags.tunnel !== 'no') continue;
    if (tags.natural === 'water') {
      if (tags.water !== 'fountain') couches.eau.push(chemin(geometrie, true));
    } else if (tags.leisure || tags.landuse || tags.natural) couches.parc.push(chemin(geometrie, true));
    else if (tags.building) couches.bati.push(chemin(geometrie, true));
    else if (tags.highway === 'steps' || tags.highway === 'footway') {
      if (tags.highway === 'steps') couches.montees.push(chemin(geometrie));
    } else if (tags.highway) {
      if (tags.area === 'yes') {
        couches.surfaces.push(chemin(geometrie, true));
        continue;
      }
      couches.rues.push({ d: chemin(geometrie), largeur: (LARGEUR_RUE[tags.highway] ?? 5) * largeurRues * (LARGEUR / 1000) });
      if (tags.name && RUES_ETIQUETEES.includes(tags.highway) && !/^(Pont|Tunnel)/.test(tags.name)) {
        nommees.push({ nom: tags.name, classe: tags.highway, geometrie });
      }
    }
  }

  /* Zones réservées (x, y, rayon) : le repère du studio, son nom, les stations et la légende */
  const studio = projeter(STUDIO);
  const zones = [];
  const reserver = (x, y, rayon) => zones.push([x, y, rayon]);
  const libre = (pts) => pts.every(([x, y]) => zones.every(([zx, zy, r]) => Math.hypot(x - zx, y - zy) > r));
  const dansLeCadre = ([x, y]) => x > TAILLE * 1.5 && x < LARGEUR - TAILLE * 1.5 && y > TAILLE * 1.5 && y < HAUTEUR - TAILLE * 1.5;

  const marques = [];
  const etiquettesFixes = [];

  /* Studio : carré cobalt sur la pointe, encadré d'un filet décalé (comme l'encadré des cartes au survol) */
  const cote = TAILLE * 0.9;
  marques.push(
    `<g transform="translate(${r1(studio[0])} ${r1(studio[1])})">` +
      `<rect x="${r1(-cote)}" y="${r1(-cote)}" width="${r1(cote * 2)}" height="${r1(cote * 2)}" fill="none" stroke="${C.cobalt}" stroke-width="${r1(TAILLE * 0.08)}"/>` +
      `<rect x="${r1(-cote * 0.55)}" y="${r1(-cote * 0.55)}" width="${r1(cote * 1.1)}" height="${r1(cote * 1.1)}" fill="${C.cobalt}"/>` +
      `</g>`,
  );
  /* Nom à droite du repère, ou à gauche s'il sortirait du cadre */
  const tailleStudio = TAILLE * 1.05;
  const largeurStudio = composer('CRAIE & COBALT', tailleStudio).largeur;
  const aDroite = studio[0] + cote * 1.6 + largeurStudio < LARGEUR - TAILLE;
  const xStudio = aDroite ? studio[0] + cote * 1.6 : studio[0] - cote * 1.6;
  etiquettesFixes.push(texte('CRAIE & COBALT', xStudio, studio[1], { taille: tailleStudio, couleur: C.cobalt, ancre: aDroite ? 'debut' : 'fin' }).svg);
  const [gauche, droite] = aDroite ? [studio[0] - cote * 1.5, xStudio + largeurStudio] : [xStudio - largeurStudio, studio[0] + cote * 1.5];
  for (let x = gauche - TAILLE; x < droite + TAILLE; x += TAILLE * 0.6) reserver(x, studio[1], cote * 1.6);

  /* Stations de métro : rond graphite et « M » craie ; nom à droite */
  const rayon = TAILLE * 0.62;
  for (const { nom, position } of points) {
    const [x, y] = projeter(position);
    if (!dansLeCadre([x, y])) continue;
    const m = composer('M', TAILLE * 0.78, 0);
    marques.push(
      `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(rayon)}" fill="${C.graphite}" stroke="${C.craie}" stroke-width="${r1(TAILLE * 0.12)}"/>` +
        `<path transform="translate(${r1(x - m.largeur / 2)} ${r1(y + m.cap / 2)})" d="${m.d}" fill="${C.craie}"/>`,
    );
    const libelle = nom === STATION ? `MÉTRO C · ${nom.toUpperCase()}` : nom.replace(' - Louis Pradel', '').toUpperCase();
    const etiquette = texte(libelle, x + rayon * 1.6, y, { taille: TAILLE * 0.9, couleur: C.graphite, ancre: 'debut' });
    etiquettesFixes.push(etiquette.svg);
    for (let xx = x - rayon; xx < x + rayon * 1.6 + etiquette.largeur + TAILLE; xx += TAILLE * 0.6) reserver(xx, y, rayon * 1.6);
  }

  /* Échelle graphique en bas à gauche, dessinée comme une ligne de cote */
  const metres = (k * Math.PI) / 180 / (111320 * Math.cos((((sud + nord) / 2) * Math.PI) / 180)) * echelle;
  const ex = TAILLE * 1.6;
  const ey = HAUTEUR - TAILLE * 1.6;
  const tic = TAILLE * 0.4;
  marques.push(
    `<g stroke="${C.graphite}" stroke-width="${r1(TAILLE * 0.08)}" fill="none">` +
      `<path d="M${r1(ex)} ${r1(ey)}H${r1(ex + metres)}M${r1(ex)} ${r1(ey - tic)}V${r1(ey + tic)}M${r1(ex + metres)} ${r1(ey - tic)}V${r1(ey + tic)}"/></g>`,
  );
  etiquettesFixes.push(texte(`${echelle} M`, ex + metres / 2, ey - TAILLE * 0.75, { taille: TAILLE * 0.8, couleur: C.graphite }).svg);
  for (let x = 0; x < ex + metres + TAILLE * 2; x += TAILLE * 0.6) reserver(x, ey, TAILLE * 2);

  /* Nord : flèche fine et « N », en haut à droite */
  const nx = LARGEUR - TAILLE * 1.8;
  const ny = TAILLE * 1.6;
  marques.push(
    `<path d="M${r1(nx)} ${r1(ny + TAILLE * 2.2)}V${r1(ny + TAILLE * 0.9)}M${r1(nx - TAILLE * 0.35)} ${r1(ny + TAILLE * 1.35)}L${r1(nx)} ${r1(ny + TAILLE * 0.9)}L${r1(nx + TAILLE * 0.35)} ${r1(ny + TAILLE * 1.35)}" stroke="${C.graphite}" stroke-width="${r1(TAILLE * 0.08)}" fill="none"/>`,
  );
  etiquettesFixes.push(texte('N', nx, ny + TAILLE * 0.2, { taille: TAILLE * 0.85, couleur: C.graphite }).svg);
  reserver(nx, ny + TAILLE, TAILLE * 2);

  /* Noms des rivières, posés à la main au milieu de leur lit quand il est dans le cadre */
  const rivieres = [
    { nom: 'SAÔNE', position: [4.8215, 45.7676], angle: 6 },
    { nom: 'RHÔNE', position: [4.8409, 45.7752], angle: -65 },
  ];
  for (const { nom, position, angle } of rivieres) {
    const [x, y] = projeter(position);
    if (!dansLeCadre([x, y])) continue;
    const riviere = texte(nom, x, y, { taille: TAILLE * 1.1, couleur: C.cobalt, lisere: null, angle, approche: 0.45 });
    etiquettesFixes.push(riviere.svg);
    const [cos, sin] = [Math.cos((angle * Math.PI) / 180), Math.sin((angle * Math.PI) / 180)];
    for (let t = -riviere.largeur / 2; t <= riviere.largeur / 2; t += TAILLE * 0.6) reserver(x + t * cos, y + t * sin, TAILLE * 1.4);
  }

  /* Noms de rues : portion la plus droite et la plus centrale, sans chevauchement */
  const PAS = 4;
  const rues = new Map();
  for (const { nom, classe, geometrie } of nommees) {
    if (choisies && !choisies.includes(nom)) continue;
    const rue = rues.get(nom) ?? { nom, classe, chemins: [] };
    if (RUES_ETIQUETEES.indexOf(classe) < RUES_ETIQUETEES.indexOf(rue.classe)) rue.classe = classe;
    rue.chemins.push(geometrie);
    rues.set(nom, rue);
  }

  function placer(rue, largeurTexte) {
    const fenetre = Math.ceil((largeurTexte + TAILLE) / PAS);
    let meilleure = null;
    for (const chaine of abouter(rue.chemins)) {
      const projetee = chaine.map(projeter);
      const portions = [[]];
      for (const p of projetee) {
        if (dansLeCadre(p)) portions.at(-1).push(p);
        else if (portions.at(-1).length) portions.push([]);
      }
      for (const portion of portions.filter((p) => p.length > 1)) {
        const echantillons = echantillonner(portion, PAS);
        for (let debut = 0; debut + fenetre < echantillons.length; debut += 2) {
          const morceau = echantillons.slice(debut, debut + fenetre + 1);
          const corde = Math.hypot(morceau.at(-1)[0] - morceau[0][0], morceau.at(-1)[1] - morceau[0][1]);
          if (corde / longueur(morceau) < rectitude || !libre(morceau)) continue;
          const ecart = Math.abs(debut + fenetre / 2 - echantillons.length / 2);
          if (!meilleure || ecart < meilleure.ecart) meilleure = { morceau, ecart };
        }
      }
    }
    return meilleure?.morceau ?? null;
  }

  const etiquettesRues = [];
  const triees = [...rues.values()].sort(
    (a, b) => RUES_ETIQUETEES.indexOf(a.classe) - RUES_ETIQUETEES.indexOf(b.classe)
      || longueur(b.chemins.flat().map(projeter)) - longueur(a.chemins.flat().map(projeter)),
  );
  const tailleRue = TAILLE * tailleRues;
  for (const rue of triees) {
    const libelle = rue.nom.toUpperCase();
    const { largeur } = composer(libelle, tailleRue);
    const morceau = placer(rue, largeur);
    if (!morceau) continue;
    const [a, b] = [morceau[0], morceau.at(-1)];
    let angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    if (angle > 90) angle -= 180;
    if (angle < -90) angle += 180;
    echantillonner(morceau, 8).forEach(([x, y]) => reserver(x, y, TAILLE * 1.1));
    etiquettesRues.push(texte(libelle, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, { taille: tailleRue, angle, lisere: C.craieClaire }).svg);
    if (etiquettesRues.length >= etiquettesMax) break;
  }

  const hachures = TAILLE * 0.45;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGEUR}" height="${HAUTEUR}" viewBox="0 0 ${LARGEUR} ${HAUTEUR}">
<defs><pattern id="h" width="${r1(hachures)}" height="${r1(hachures)}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V${r1(hachures)}" stroke="${C.grisClair}" stroke-width="${r1(TAILLE * 0.06)}"/></pattern></defs>
<rect width="100%" height="100%" fill="${C.craie}"/>
<path fill="url(#h)" d="${couches.parc.join('')}"/>
<path fill="${C.cobaltPale}" d="${couches.eau.join('')}"/>
<path fill="${C.filet}" d="${couches.bati.join('')}"/>
<path fill="${C.craieClaire}" d="${couches.surfaces.join('')}"/>
<g fill="none" stroke="${C.craieClaire}" stroke-linecap="round" stroke-linejoin="round">${[...Map.groupBy(couches.rues, (rue) => r1(rue.largeur))]
    .sort(([a], [b]) => a - b)
    .map(([largeur, rues]) => `<path stroke-width="${largeur}" d="${rues.map((rue) => rue.d).join('')}"/>`)
    .join('')}</g>
<path fill="none" stroke="${C.gris}" stroke-width="${r1(TAILLE * 0.07)}" stroke-dasharray="${r1(TAILLE * 0.1)} ${r1(TAILLE * 0.18)}" stroke-linecap="round" d="${couches.montees.join('')}"/>
<g>${etiquettesRues.join('')}</g>
<g>${marques.join('')}${etiquettesFixes.join('')}</g>
</svg>
`;
  /* Position du studio en fraction du plan : le grand plan défile jusqu’à lui sur petit écran */
  const repere = { x: Number((studio[0] / LARGEUR).toFixed(4)), y: Number((studio[1] / HAUTEUR).toFixed(4)) };
  return { svg, LARGEUR, HAUTEUR, repere, etiquettes: etiquettesRues.length };
}

const sortie = new URL('../../src/assets/plan/', import.meta.url);
await mkdir(sortie, { recursive: true });
const plans = {};
for (const rendu of RENDUS) {
  const { svg, LARGEUR, HAUTEUR, repere, etiquettes } = rendre(rendu);
  await writeFile(new URL(rendu.fichier, sortie), svg);
  plans[rendu.fichier] = { largeur: LARGEUR, hauteur: HAUTEUR, repere };
  console.log(`${rendu.fichier} : ${LARGEUR} × ${HAUTEUR}, ${etiquettes} noms de rues, ${Math.round(svg.length / 1024)} Ko`);
}
/* Dimensions et repère de chaque plan, lus par le composant (attributs width, height et data-) */
await writeFile(new URL('plans.json', sortie), `${JSON.stringify(plans, null, 2)}\n`);
