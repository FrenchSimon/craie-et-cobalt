# Stack — Craie & Cobalt

> Étape 4. Version 1 — 2026-11-25 · Statut : **validé le 25/11/2026**
>
> Critères (`AGENTS.md`) : site statique, sans CMS, hébergé sur Vercel ; aucun script tiers ; CSP stricte sans `unsafe-inline` ; images AVIF/WebP en plusieurs tailles ; dépendances minimales. Point de départ imposé : évaluer la reprise du socle de Pistil & Ronce. Versions relevées sur npm le 25/11/2026, options vérifiées dans les types d'Astro 7.4.13 installé.

## Recommandation : reprendre le socle de Pistil & Ronce

**Astro 7.4.13 en sortie 100 % statique, CSS natif, quelques petits scripts maison, Vercel.** La comparaison avec Eleventy et HTML + Vite, faite pour Pistil & Ronce (`pistil-et-ronce/docs/stack.md`), reste valable et penche encore plus vers Astro pour 5 pages : mise en page commune, composants réutilisés d'une page à l'autre et pipeline d'images sont natifs. Le socle a tenu sa recette (0 violation axe, CSP stricte sans violation, Lighthouse mobile ≥ 95) : le reprendre est la façon la plus sûre de tenir 2 à 3 semaines, et c'est précisément ce que la démo doit mesurer.

## Ce qui se reprend, ce qui change

| Élément de Pistil & Ronce | Sort dans Craie & Cobalt |
|---|---|
| `astro.config.mjs` : `compressHTML: true`, `inlineStylesheets: 'never'`, `assetsInlineLimit: 0` (CSP) | **Repris tel quel**, plus `site`, `trailingSlash` et `build.format` (voir § URL) |
| `vercel.json` : CSP, HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP, `X-Robots-Tag: noindex`, cache `immutable` de `/_astro/` | **Repris tel quel**, plus `cleanUrls` et `trailingSlash: false` |
| `.npmrc` (`save-exact`, `engine-strict`), `.nvmrc` 24, `engines.node: 24.x` | **Déjà en place** |
| Versions figées : `astro` 7.4.13, `@astrojs/check` 0.9.12, `typescript` 6.0.3, `sharp` 0.35.5, `playwright` 1.65.1 | **Reprises.** TypeScript 7.0.2 est sorti, mais `@astrojs/check` 0.9.12 n'accepte que les versions 5 et 6 : on reste en 6.0.3 |
| `Base.astro`, `LienEvitement`, `BandeauDemo`, `LienSortant` / `FlecheSortante` | **Repris**, restylés avec les variables de la DA ; `Base` reçoit en plus le titre, la description et l'image de partage de chaque page |
| `EnTete`, `PiedDePage` | **Adaptés** : menu de 5 pages au lieu d'ancres, `aria-current="page"` |
| Formulaire de `Contact.astro` (champs sans `name`, `method="dialog"`, erreurs reliées, `textContent`) | **Logique reprise**, sans le calendrier sur mesure (pas de date ici) |
| `scripts/etalonner-photos.mjs` | **Adapté** : réglages C et A de la DA, désaturation sélective du prototype (`contenu/prototype/outils/etalonnage.mjs`) |
| `scripts/icone-ios.mjs` (icône PNG depuis le favicon SVG, avec Playwright) | **Repris tel quel** |
| `mentions-legales.astro`, `404.astro` | **Structure reprise**, textes de `textes.md` |
| Plan OpenStreetMap (`scripts/plan/`, `d3-geo`), calendrier, saisons, champ fleuri | **Abandonnés** : `d3-geo` sort des dépendances (plan repris le 26/11 sans `d3-geo`, voir en fin de fichier) |
| — | **Nouveau :** 4 pages de plus, données des 6 projets, onglets et carrousels, filtres, fiche en `<dialog>`, croquis SVG, `sitemap.xml` |

## Points à trancher

### 1. Mise en page commune et navigation

- **Un gabarit unique** `src/layouts/Base.astro` : `lang="fr"`, `<head>` (titre, description, canonique, Open Graph, `noindex`, JSON-LD), lien d'évitement, bandeau démo, en-tête, `<main id="contenu">`, pied de page. Chaque page ne fournit que son contenu et ses métadonnées.
- **Menu identique partout**, écrit une seule fois dans un tableau (`src/data/navigation.ts`) ; `aria-current="page"` calculé d'après `Astro.url.pathname`.
- **Menu mobile (sous 900 px)** : bouton « Menu » en `aria-expanded` qui ouvre la liste, Échap pour fermer, une quinzaine de lignes de script. Sans JS, la liste reste visible : rien n'est inaccessible.
- **Plan du site** (`/plan-du-site`, lien dans le pied de page) : toutes les pages et les 6 fiches projet, généré depuis les mêmes tableaux que le menu et les projets. C'est le second système de navigation demandé par le RGAA (critère 12.1).
- **Pas de transitions entre pages ni de préchargement** (`ClientRouter`, `prefetch`) : du JS en plus pour 5 pages statiques déjà rapides.

### 2. URL courtes

`/`, `/prestations`, `/realisations`, `/studio`, `/contact`, `/mentions-legales`, `/plan-du-site`, sans barre finale. Côté Astro : `trailingSlash: 'never'` et `build.format: 'file'` (`dist/realisations.html`). Côté Vercel : `cleanUrls: true` et `trailingSlash: false`, qui servent `/realisations` et redirigent `/realisations.html`. Les liens de l'accueil vers une fiche pointent sur `/realisations#canut` (décision de l'étape 3).

### 3. Contenu des projets

Les 6 projets alimentent l'accueil (3 réalisations phares) et Réalisations (grille, filtres, fiches). **Un seul fichier de données typé** `src/data/projets.ts` (identifiant d'ancre, catégorie, titre, surface, durée, budget, textes, photos importées, `alt`), repris de `textes.md`. Les collections de contenu d'Astro (Markdown) seraient plus lourdes pour 6 fiches courtes ; elles restent la voie naturelle si un blog arrive un jour.

### 4. Pipeline d'images

- **Photos :** les originaux (3 000 px, 15 Mo) restent hors de Git dans `contenu/photos/`. `npm run photos` (sharp) les étalonne, efface le titre du livre sur la photo de la boutique (zone recadrée ou recouverte par un échantillon voisin, dans le même script) et écrit des **masters de 1 600 px au plus** dans `src/assets/photos/`, que Vercel doit trouver dans le dépôt pour construire le site. 1 600 px suffisent : la plus grande photo affichée est celle de la fiche (620 px de large, donc 1 240 px en écran haute densité). **Poids estimé : 3 à 4 Mo versionnés, à confirmer après le script ; j'ai besoin de ton accord avant de les committer** (règle des binaires lourds).
- **Affichage :** `<Picture formats={['avif', 'webp']}>` d'`astro:assets`, repli JPEG, `widths` et `sizes` calés sur la grille (cartes 4:3 en `object-fit: cover`, fiche en proportions d'origine). `width`/`height` écrits par Astro (CLS nul). Tout en `loading="lazy"` sauf l'image principale de chaque page.
- **Croquis et logo (SVG) :** servis tels quels en `<img>` (le croquis de l'accroche fait 50 Ko, sans `style` ni `<style>`, donc compatible avec la CSP). L'accroche de l'accueil est un croquis : c'est lui l'image LCP, en `fetchpriority="high"`. **Risque :** le filtre `feTurbulence` (trait tremblé) peut être lent à dessiner sur un téléphone d'entrée de gamme. Mesure au socle ; si le LCP dépasse 2,5 s, le script exporte le croquis en AVIF (Playwright, déjà là) et le SVG reste la source.
- **Poids de Réalisations :** 6 cartes différées en AVIF ; les photos des fiches ne sont chargées qu'à l'ouverture (`loading="lazy"` dans un `<dialog>` fermé). Budget visé : moins de 500 Ko au premier affichage, vérifié à la recette.

### 5. Composants interactifs, sans dépendance

Tout en HTML natif et petits modules TypeScript, que la build d'Astro sert en fichiers externes (vérifié sur Pistil & Ronce : CSP respectée). Aucun `innerHTML`. Le prototype de l'étape 3 tient en 130 lignes de JS pour l'ensemble.

| Composant | Base native | Script |
|---|---|---|
| Filtres de Réalisations | `<button aria-pressed>`, compteur en `aria-live="polite"` | Masque les cartes (`hidden`), met à jour le compteur et l'ordre précédent/suivant des fiches |
| Fiche projet | `<dialog>` + `showModal()` : focus piégé, Échap et fond inerte fournis par le navigateur | Ouverture par le bouton ou l'ancre `#canut`, fermeture au clic sur le fond, focus rendu, adresse mise à jour |
| Onglets de la démarche | `role="tablist"` vertical, `tab` / `tabpanel` | Flèches, Début, Fin ; sous 900 px, devient le carrousel |
| Carrousels (démarche, photos de la fiche) | Boutons et numéros réels, compteur lu par les lecteurs d'écran | **Un seul module commun** : flèches, numéros, glisser (Pointer Events), jamais automatique |
| Formulaire | `label`, `required`, `aria-describedby`, `aria-invalid` | Repris de Pistil & Ronce |

Sans JS, une petite feuille de style chargée dans `<noscript>` masque les filtres (les 6 projets restent visibles), affiche le contenu des fiches à la suite de la grille et la démarche en liste : rien n'est perdu. Animations en CSS seulement, coupées par `prefers-reduced-motion`.

### 6. `sitemap.xml`

**Un point d'accès maison** `src/pages/sitemap.xml.ts` (une quinzaine de lignes, lit le tableau de navigation) plutôt que `@astrojs/sitemap` 3.7.6 : une dépendance de moins pour 7 adresses. Le sitemap et le `noindex` ne se contredisent pas : le sitemap aide un robot à trouver les pages, le `noindex` lui dit de ne pas les indexer. Pas de blocage dans `robots.txt` (un robot bloqué ne lirait pas le `noindex`) ; `robots.txt` se contente d'indiquer l'adresse du sitemap.

### 7. Polices

Archivo (500, 600, axe de largeur), Newsreader (400, 600), IBM Plex Mono (500) : fichiers variables WOFF2 en sous-ensemble latin, **151 Ko** mesurés à l'étape 3, copiés dans `src/assets/fonts/` avec leurs licences OFL. `@font-face` écrits à la main dans `src/styles/polices.css` (le composant `<Font>` d'Astro écrit un `<style>` en ligne, bloqué par la CSP : vérifié sur Pistil & Ronce). `font-display: swap`, préchargement d'Archivo seulement (titre de l'accroche).

## Vérification par critère

- **Sécurité :** aucun serveur, aucune donnée, aucun script tiers. CSP identique à Pistil & Ronce (aucune source externe à ajouter : pas de carte, pas de vidéo). Contrôle après chaque build : aucune balise `<script>` ni `<style>` en ligne dans `dist/` hors JSON-LD, aucun attribut `style`. `npm audit` avant chaque PR.
- **Accessibilité :** Astro n'ajoute aucun balisage ; les patrons ARIA ci-dessus sont ceux de l'APG du W3C. Recette avec axe et VoiceOver (étape 6).
- **Performance :** zéro JS hors des composants interactifs, chargé seulement sur les pages qui en ont besoin. CSS en fichiers (≈ 150 ms bloquants mesurés sur Pistil & Ronce, Lighthouse resté ≥ 95).
- **SEO :** `title`, `description`, canonique et Open Graph par page via `Base` ; JSON-LD `ProfessionalService` fictif ; `noindex` en balise et en en-tête ; `site: 'https://craie-et-cobalt.vercel.app'` (décidé le 25/11).
- **Maintenance :** comme Pistil & Ronce, un site figé : versions exactes, Node 24 (support jusqu'en avril 2028), aucune mise à jour prévue ; plan B `vercel deploy --prebuilt` si une construction tardive échoue.

## Dépendances

| Paquet | Version | Rôle |
|---|---|---|
| `astro` | 7.4.13 | Seule dépendance de production (rien n'est envoyé au visiteur hors du HTML, du CSS et des scripts maison) |
| `@astrojs/check`, `typescript` | 0.9.12, 6.0.3 | `astro check` avant chaque PR |
| `sharp` | 0.35.5 | Étalonnage des photos (Astro l'utilise aussi au build) |
| `playwright` | 1.65.1 | Icône iOS, captures locales, recette responsive ; Chrome installé (`channel: 'chrome'`, macOS 12) |
| `@axe-core/playwright` | 4.14.1 | Audit d'accessibilité à la recette |

Six paquets directs, comme Pistil & Ronce : `d3-geo` (plan) sort, `@axe-core/playwright` entre.

## Décisions du 25/11

1. Reprise du socle de Pistil & Ronce telle que décrite : **validée**.
2. URL sans barre finale (`/realisations`, `/realisations#canut`) : **validées**.
3. Masters étalonnés de 1 600 px versionnés dans `src/assets/photos/` (environ 3 à 4 Mo) : **accordé**.
4. Adresse `craie-et-cobalt.vercel.app` : **validée**.
5. Ajout d'une page **Plan du site**, textes à proposer.

## Plan d'accès (ajouté le 26/11, étape 5.13)

Le plan OpenStreetMap de Pistil & Ronce revient, **sans `d3-geo` ni Playwright** : la projection de Mercator (quelques lignes) est écrite dans `scripts/plan/dessiner.mjs`, et les noms de rues sont convertis en tracés avec `fontkitten`, déjà installé avec Astro (comme le logo). Le résultat est un SVG servi tel quel en `<img>` (net à toutes les tailles, compatible avec la CSP), et non une image matricielle. `npm run plan:extraire` (API Overpass) écrit `scripts/plan/donnees.json`, ignoré par Git (3,8 Mo) ; `npm run plan` écrit `src/assets/plan/plan-apercu.svg` (≈ 45 Ko compressé), `plan.svg` (≈ 160 Ko compressé, chargé seulement à l'ouverture de la fenêtre) et `plans.json` (dimensions, position du studio), versionnés. Aucune dépendance ajoutée.
