# Craie & Cobalt

Toujours répondre en français (messages, synthèses, commentaires, docs, commits). Le site est en français uniquement.

## Contexte du projet

Site vitrine **complet (5 pages)** d'une architecte d'intérieur **fictive** à Lyon, Margaux Delorme, fondatrice du studio Craie & Cobalt. Deuxième démo du portfolio de Simon Dabin, développeur freelance.

- **But :** prouver l'offre « site vitrine complet » (950 € + 49 €/mois) auprès des PME, et trancher deux points de l'offre : le **délai** (« 2 à 3 semaines, à confirmer ») et le **niveau de design** (base commune adaptée ou sur mesure).
- **Style visé :** contemporain et graphique, haut de gamme.
- **Pages :** Accueil, Prestations, Réalisations, Le studio, Contact (+ mentions légales et 404, hors compte).
- **Suivi :** fiche du projet dans `~/Local Sites/portfolio/docs/demo-architecte.md` (cocher ses cases à la fin de chaque étape) ; décisions importantes dans le journal de `~/Local Sites/portfolio/ROADMAP.md`.
- **Contenu validé :** `docs/textes.md` (v1.0, validé le 25/11). Ne pas modifier un texte validé sans mon accord.

### Tout est fictif, et doit le rester

- Adresse dans Lyon : rue inexistante, à vérifier à l'étape des textes. Téléphone : numéro réservé par l'ARCEP à la fiction (plage en 04, à vérifier).
- E-mail, Instagram, LinkedIn et avis fictifs : liens externes désactivés, avis marqués « Avis fictifs (démo) ».
- Bandeau « Studio fictif — Site réalisé par Simon Dabin » sur toutes les pages, avec le lien « Voir le code ».
- Le formulaire n'envoie rien : il affiche un message de démo.
- Ne jamais reprendre le nom, le logo ou les réalisations d'une vraie architecte d'intérieur. Les projets présentés sont fictifs, même si les photos montrent de vrais intérieurs.

### Photos

- Uniquement Unsplash ou Pexels ; noter auteur, source et URL de chacune dans `docs/photos.md`.
- Optimiser comme pour un vrai client : AVIF/WebP, plusieurs tailles, dimensions explicites.

## Workflow de travail

- Avancer **étape par étape**, dans l'ordre de la fiche : textes → photos → direction artistique → stack → réalisation → recette qualité → mise en ligne.
- **Ne jamais commencer une étape avant que j'aie validé la précédente.** Présenter chaque livrable, puis attendre ma validation.
- **Chronométrer :** noter le temps de chaque session dans `docs/TEMPS-PASSE.md`, fichier local ignoré par Git : le temps passé ne doit pas être public. But : confirmer le délai de 2 à 3 semaines de l'offre.
- Me rappeler brièvement l'étape en cours, la prochaine action à valider et les blocages éventuels.

## Stack

- **À décider** à l'étape « Stack », par une proposition argumentée que je valide : site statique, rapide, sans CMS, hébergé sur Vercel. Évaluer en premier la reprise d'un socle existant de Simon (Astro 7, versions figées, Node 24), pour mesurer le temps gagné.
- Ne pas se fier à sa mémoire pour les API des outils : consulter la documentation de la version installée.

## Git et GitHub

- Commits **atomiques** (un changement cohérent), au format **Conventional Commits** en français : `feat: ajoute la page Prestations`, `fix:`, `docs:`, `chore:`, `style:`.
- `main` reste toujours déployable ; chaque étape se fait sur une branche `feat/<nom>` ou `docs/<nom>`.
- Créer des branches et commiter **en local sans me demander**. **Ne jamais pousser sans que je le demande.**
- Fusion dans `main` uniquement par **pull request**, **après mon accord**. La PR dit ce qui change et comment le vérifier. Les captures servent à vérifier le rendu en local (`.playwright-mcp/`, ignoré par Git) : jamais sur le dépôt distant, ni dans les PR.
- **Ne jamais supprimer une branche** (locale ou distante) sans mon accord, même après une fusion : pas de `--delete-branch`. Proposer le nettoyage et attendre ma réponse.
- **Le dépôt est public et sert de vitrine pour des clients potentiels :** il doit rester propre et lisible.
  - Le `README` présente le projet : but, stack, captures, lien vers la démo.
  - Les messages de commit et les descriptions de PR sont soignés.
  - Aucun fichier temporaire, brouillon ou capture de test n'est versionné.
  - Pas de code commenté ni de `TODO` oublié.
  - Les branches fusionnées sont supprimées, après mon accord.

## Sécurité

- Jamais de secret dans le dépôt (`.env`, clés, jetons) ; `.env` et `.env*.local` sont ignorés par Git.
- Aucun script tiers (analytics, widgets, CDN) : tout est auto-hébergé. Sinon, version figée et `integrity` (SRI).
- En-têtes HTTP via `vercel.json` : CSP stricte (`default-src 'self'`, pas d'`unsafe-inline` si possible, `frame-ancestors 'none'`), HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restrictive. Viser A+ sur securityheaders.com.
- Dépendances minimales et à jour : `npm audit` sans faille haute ou critique avant chaque PR.
- Formulaire : aucun envoi ni stockage, aucune donnée injectée dans le DOM via `innerHTML`.
- Liens externes éventuels en `rel="noopener noreferrer"`.

## Qualité (avant chaque PR qui touche au site)

### Accessibilité (WCAG 2.2 AA / RGAA)

- HTML sémantique : un seul `h1` par page, titres hiérarchisés, landmarks (`header`, `nav`, `main`, `footer`), lien d'évitement.
- Navigation entre pages : page courante signalée (`aria-current="page"`), même ordre de menu partout.
- Tout au clavier, focus toujours visible. Cibles tactiles ≥ 24 × 24 px.
- Contrastes AA : 4,5:1 pour le texte, 3:1 pour le grand texte et les éléments d'interface. Vérifier en particulier le bleu cobalt sur blanc et l'inverse.
- Textes alternatifs pertinents, `alt=""` pour les images décoratives.
- Galerie filtrable et fiches projet dépliables : boutons de filtre annoncés (`aria-pressed`), résultat du filtre annoncé (`aria-live`), dépliage au clavier.
- Formulaire : `label` sur chaque champ, erreurs explicites reliées au champ, confirmation annoncée (`aria-live`).
- Animations discrètes, qui respectent `prefers-reduced-motion`.

### Performance

- Lighthouse ≥ 95 sur mobile, sur chacune des pages. LCP < 2,5 s, INP < 200 ms, CLS < 0,1.
- Polices auto-hébergées, `font-display: swap`, sous-ensembles.
- Images responsives (`srcset`, AVIF/WebP), chargement différé sous la ligne de flottaison. Attention au poids de la page Réalisations.

### SEO, responsive et légal

- `title` et `meta description` uniques par page, repris de `docs/textes.md` ; Open Graph avec image de partage ; données structurées schema.org adaptées (type à choisir à l'étape des textes) avec les infos fictives.
- `sitemap.xml` et URL courtes et lisibles, même si la démo reste en `noindex`.
- `noindex` : la démo ne doit pas tromper un internaute qui cherche une vraie architecte d'intérieur.
- Mobile d'abord, testé de 320 à 1920 px, sur Chrome, Firefox, Safari (+ iOS et Android).
- Mentions légales et confidentialité adaptées à une démo : éditeur Simon Dabin, hébergeur, aucune donnée collectée.
- Aucun cookie ni traceur, donc pas de bandeau cookies.
