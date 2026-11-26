/*
 * Plan d'accès de la page Contact, étape 1 : extraction unique des données OpenStreetMap
 * (API Overpass) du plateau et des pentes de la Croix-Rousse (Lyon 4e et 1er), entre Saône et Rhône.
 * Repris de Pistil & Ronce (scripts/plan/extraire.mjs), emprise et éléments adaptés.
 *
 * Lancé une fois à la main (`npm run plan:extraire`) ; le résultat, réduit aux seules
 * géométries et étiquettes utiles, est versionné dans `scripts/plan/donnees.json`.
 * Données © contributeurs OpenStreetMap, licence ODbL.
 */
import { writeFile } from 'node:fs/promises';

/* Sud, ouest, nord, est */
export const EMPRISE = [45.764, 4.812, 45.784, 4.85];

const requete = `
[out:json][timeout:120][bbox:${EMPRISE.join(',')}];
(
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|living_street|pedestrian|steps)$"];
  way["building"];
  way["natural"="water"];
  relation["natural"="water"];
  way["leisure"~"^(park|garden)$"];
  relation["leisure"="park"];
  way["landuse"~"^(grass|forest)$"];
  node["station"="subway"];
  node["railway"="station"]["subway"="yes"];
);
out geom;
`;

const ETIQUETTES_GARDEES = ['highway', 'building', 'natural', 'water', 'leisure', 'landuse', 'name', 'area', 'tunnel', 'layer', 'station', 'railway', 'subway', 'line', 'network'];

const reponse = await fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'plan-statique-demo/1.0' },
  body: new URLSearchParams({ data: requete }),
});
if (!reponse.ok) throw new Error(`Overpass : ${reponse.status} ${reponse.statusText}`);
const { elements } = await reponse.json();

const arrondir = ({ lat, lon }) => [Number(lon.toFixed(6)), Number(lat.toFixed(6))];
const garder = (tags = {}) => Object.fromEntries(Object.entries(tags).filter(([cle]) => ETIQUETTES_GARDEES.includes(cle)));

const elementsReduits = elements.map((element) => {
  const tags = garder(element.tags);
  if (element.type === 'node') return { type: 'node', tags, position: arrondir(element) };
  if (element.type === 'way') return { type: 'way', tags, geometrie: element.geometry.map(arrondir) };
  return {
    type: 'relation',
    tags,
    membres: element.members
      .filter((membre) => membre.type === 'way' && membre.geometry)
      .map((membre) => ({ role: membre.role, geometrie: membre.geometry.map(arrondir) })),
  };
});

await writeFile(
  new URL('./donnees.json', import.meta.url),
  JSON.stringify({ emprise: EMPRISE, source: '© contributeurs OpenStreetMap (ODbL)', elements: elementsReduits }),
);
console.log(`${elementsReduits.length} éléments enregistrés dans scripts/plan/donnees.json`);
