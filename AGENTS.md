# Craie & Cobalt

Toujours répondre en français (messages, synthèses, commentaires, docs, commits). Le site est en français uniquement.

## Projet

Site vitrine **complet (5 pages)** de Craie & Cobalt, studio **fictif** de Margaux Delorme, architecte d'intérieur à Lyon. Deuxième démo du portfolio de Simon Dabin : prouver l'offre « site vitrine complet » et trancher son **délai** (2 à 3 semaines) et son **niveau de design** (base commune adaptée ou sur mesure). Style : contemporain, graphique, haut de gamme.

- **Étapes et avancement :** `docs/ROADMAP.md`. Contexte et décisions : fiche `~/Local Sites/portfolio/docs/demo-architecte.md` (cocher ses cases à chaque étape) et journal de `~/Local Sites/portfolio/ROADMAP.md`.
- **Textes validés :** `docs/textes.md` (v1.0). Ne pas les modifier sans mon accord.
- **Tout reste fictif :** coordonnées, réseaux, réalisations et avis (marqués « Avis fictifs ») ; liens externes désactivés ; bandeau « Studio fictif — Site réalisé par Simon Dabin » + « Voir le code » sur toutes les pages ; formulaire de démo qui n'envoie rien. Jamais le nom, le logo ou les réalisations d'un vrai studio.
- **Photos :** Unsplash ou Pexels uniquement, créditées dans `docs/photos.md` ; AVIF/WebP, plusieurs tailles, dimensions explicites.

## Workflow

- **Étape par étape**, dans l'ordre de la roadmap. **Ne jamais commencer une étape avant que j'aie validé la précédente** : présenter le livrable, puis attendre.
- **Chronométrer** chaque session dans `docs/TEMPS-PASSE.md` (ignoré par Git : le temps passé ne doit pas être public).
- Me rappeler brièvement l'étape en cours, la prochaine action à valider et les blocages.
- **Stack** à proposer à son étape (statique, sans CMS, Vercel), en évaluant d'abord la reprise du socle Pistil & Ronce (Astro 7, versions figées, Node 24). Vérifier les API dans la documentation de la version installée, pas de mémoire.

## Git et GitHub

- Commits **atomiques**, **Conventional Commits** en français (`feat:`, `fix:`, `docs:`, `chore:`, `style:`).
- `main` toujours déployable ; une branche `feat/<nom>` ou `docs/<nom>` par étape. Branches et commits en local sans demander ; **ne jamais pousser sans que je le demande**.
- Fusion par **pull request**, **après mon accord** ; la PR dit ce qui change et comment le vérifier. Captures en local seulement (`.playwright-mcp/`), jamais dans le dépôt ni les PR.
- **Ne jamais supprimer une branche** sans mon accord (pas de `--delete-branch`) : proposer le nettoyage après fusion.
- **Dépôt public, vitrine pour des clients :** `README` à jour (but, stack, captures, démo), messages soignés, aucun fichier temporaire, code commenté ni `TODO` oublié.

## Sécurité

- Aucun secret dans le dépôt (`.env`, `.env*.local` ignorés).
- Aucun script tiers : tout est auto-hébergé (sinon version figée + SRI).
- En-têtes via `vercel.json` : CSP stricte (`default-src 'self'`, sans `unsafe-inline` si possible, `frame-ancestors 'none'`), HSTS, `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restrictive. Viser A+ sur securityheaders.com.
- Dépendances minimales ; `npm audit` sans faille haute ou critique avant chaque PR.
- Formulaire : ni envoi ni stockage, jamais d'`innerHTML`. Liens externes en `rel="noopener noreferrer"`.

## Qualité (avant chaque PR qui touche au site)

La liste détaillée est à l'étape 6 de la roadmap. Exigences :

- **Accessibilité WCAG 2.2 AA / RGAA :** HTML sémantique (un `h1`, landmarks, lien d'évitement), `aria-current="page"` et même menu partout, tout au clavier avec focus visible, cibles ≥ 24 × 24 px, contrastes 4,5:1 et 3:1 (cobalt sur blanc et l'inverse), `alt` pertinents ou vides. Galerie : filtres en `aria-pressed`, résultat en `aria-live`, fiches dépliables au clavier. Formulaire : `label`, erreurs reliées au champ, confirmation en `aria-live`. Animations discrètes, `prefers-reduced-motion` respecté.
- **Performance :** Lighthouse mobile ≥ 95 sur chaque page, LCP < 2,5 s, INP < 200 ms, CLS < 0,1. Polices auto-hébergées en sous-ensembles, `font-display: swap`. Images en `srcset`, différées sous la ligne de flottaison ; surveiller le poids de Réalisations.
- **SEO et légal :** `title` et `meta description` uniques (repris de `textes.md`), Open Graph, JSON-LD `ProfessionalService` fictif, `sitemap.xml`, URL courtes, `noindex` (ne pas tromper qui cherche une vraie architecte). Mentions légales de démo (éditeur Simon Dabin, hébergeur, aucune donnée collectée). Aucun cookie ni traceur.
- **Responsive :** mobile d'abord, de 320 à 1920 px ; Chrome, Firefox, Safari, iOS, Android.
