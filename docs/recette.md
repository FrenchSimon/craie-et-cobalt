# Recette qualité — Craie & Cobalt

> Étape 6 de la roadmap. Recette du 26/11/2026 sur le site construit (`npm run build`), servi en local avec les en-têtes, les redirections (`cleanUrls`, `trailingSlash`) et la page 404 de `vercel.json`, et la compression Brotli, comme sur Vercel.
> Outils : axe-core 4.14, Lighthouse 13.6, Playwright avec Google Chrome 150. Captures de 320 à 1920 px en local (`.playwright-mcp/recette/`, hors du dépôt).
> Pages : accueil, Prestations, Réalisations, Le studio, Contact, Mentions légales, Plan du site et 404.

## Synthèse

| Domaine | Critère | Résultat | Statut |
|---|---|---|---|
| Accessibilité | axe (WCAG 2.0, 2.1, 2.2 AA et bonnes pratiques), 29 états : 8 pages à 1440 et 390 px, menu mobile ouvert, galerie filtrée, fiche projet ouverte, formulaire en erreur (étapes 1 et 3) et envoyé, plan agrandi | 0 violation (2 corrigées) | ✅ |
| Accessibilité | Lighthouse | 100 sur les 7 pages mesurées | ✅ |
| Accessibilité | Clavier : ordre, focus visible, élément focalisé à l'écran | Premier arrêt « Aller au contenu » partout, 12 à 29 arrêts par page, focus visible partout (tuiles du formulaire comprises), aucun piège | ✅ |
| Accessibilité | Composants au clavier | Fiche projet : Entrée ouvre (focus sur « Fermer la fiche », adresse `#canut`), Échap ferme et rend le focus à la carte. Filtres : Espace bascule `aria-pressed`, « 4 projets affichés » annoncé. Plan : Entrée ouvre, Échap ferme et rend le focus. Menu mobile : page inerte à l'ouverture, Échap referme et rend le focus au bouton | ✅ |
| Accessibilité | Contrastes | axe sans erreur ; seuls « incomplets » : les flèches décoratives « → » et « ← » (`aria-hidden`), sans texte posé sur une photo | ✅ |
| Accessibilité | Formulaire | Erreurs reliées aux champs (`aria-describedby`, `aria-invalid`), focus sur le premier champ en erreur, message de démo annoncé (`role="status"`) | ✅ |
| Accessibilité | `prefers-reduced-motion` | Défilement instantané ; seule animation restante : l'apparition du bouton haut de page, en `steps(1)` (sans fondu) ; aucun contenu laissé invisible | ✅ |
| Accessibilité | Plan du site | Les 6 autres pages et les 6 fiches projet | ✅ |
| Accessibilité | VoiceOver (macOS, Safari) | Testé à la main : navigation, filtres de la galerie, fiches projet, formulaire | ✅ |
| Performance | Lighthouse mobile (2 passes par page, 5 pour Le studio) | Accueil 100 · 100 ; Prestations 99 · 98 ; Réalisations 99 · 99 ; Le studio 97 à 99 ; Contact 100 · 100 ; Mentions légales 100 · 100 ; Plan du site 100 | ✅ |
| Performance | LCP mobile | 1,1 à 1,9 s ; Le studio 1,8 à 2,5 s (médiane 2,3 s, portrait prioritaire de 33 Ko) | ✅ |
| Performance | CLS, TBT (mobile) | CLS 0 partout ; TBT 0 à 140 ms | ✅ |
| Performance | Lighthouse bureau | 96 à 100 ; LCP 0,5 à 1,3 s ; CLS 0,027 au plus (Réalisations) | ✅ |
| Performance | Poids en mobile | Réalisations 253 Ko (4 photos au chargement, les autres différées) ; accueil 222 Ko ; autres pages 146 à 200 Ko | ✅ |
| SEO | Lighthouse | 66 à 69 : seul l'audit « page indexable » échoue, à cause du `noindex` voulu | ✅ |
| Responsive | 320, 375, 768, 1024, 1440, 1920 px, 8 pages (48 captures) | Aucun débordement horizontal (52 px à 320 px avant correction), cibles ≥ 24 px, images toutes dimensionnées et chargées | ✅ |
| Navigateurs | Chrome | Testé | ✅ |
| Navigateurs | Firefox, Safari, iOS, Android | Testés à la main (Playwright ne prend plus en charge Firefox ni WebKit sous macOS 12) | ✅ |
| Sécurité | `npm audit` | 0 faille | ✅ |
| Sécurité | CSP stricte | Aucune violation ni erreur JavaScript sur les 8 pages, à 1440 et 390 px, ni pendant les parcours au clavier (fiche, filtres, plan, menu) | ✅ |
| Sécurité | Liens externes | Tous en `rel="noopener noreferrer"` | ✅ |
| Sécurité | Note securityheaders.com (production) | À mesurer après la mise en ligne (étape 7) | ⏳ |
| Fiction | Données structurées, liens, coordonnées | Téléphone du bloc 04 65 71 réservé à la fiction, `craie-et-cobalt.fr` non enregistré, rue des Tisseuses absente des données OpenStreetMap du plan, JSON-LD signalé comme fictif (`disambiguatingDescription`), ni e-mail, ni réseaux, ni GPS ; liens externes limités aux crédits (photographes, OpenStreetMap), à l'hébergeur, à la CNIL et au code sur GitHub | ✅ |

## Corrections faites pendant la recette

1. **Bouton « Revenir en haut » hors repère** (axe `region`, dès qu'il apparaît au défilement) : placé dans le pied de page ; sa position reste fixe.
2. **Nom des onglets de la démarche** (accueil, axe `label-content-name-mismatch`, critère 2.5.3) : le nom se limitait au numéro et à l'étape alors que l'onglet actif affiche aussi son texte ; il reprend désormais tout le texte visible.
3. **Pied de page trop large à 320 px** (critère 1.4.10) : les 11 écarts de la grille à 12 colonnes dépassaient l'écran, la page défilait de 52 px à l'horizontale ; le pied de page passe sur une colonne sous 600 px.
4. **Flèches du carrousel de la démarche écrasées** (accueil, mobile) : les numéros gardaient la grille du bureau (64 px) et réduisaient les flèches à 2 px de large à 320 px, 28 px à 390 px ; les numéros se resserrent (39 px à 320 px), les flèches gardent leurs 44 px.

## Points relevés, sans correction

- **Feuilles de style bloquantes** (~260 ms estimés en mobile) : les intégrer dans la page imposerait `unsafe-inline` ou des empreintes dans la CSP. Le score mobile reste ≥ 95, on garde la CSP stricte (même choix que Pistil & Ronce).
- **LCP du studio près du seuil** dans 1 passe sur 5 (2,55 s en simulation 4G lente) : le portrait est déjà prioritaire et léger (33 Ko). À confirmer sur l'URL de production (étape 7).
- **Page 404** : Lighthouse refuse de mesurer une page servie en 404 ; elle passe axe, le clavier et le responsive.
- **Lien « vercel.com » des mentions légales haut de 18 px** : lien pris dans une ligne de texte, exempté par le critère 2.5.8 (taille des cibles).
- **Mesures locales** : plus favorables que le réseau réel. À confirmer sur l'URL de production (étape 7).
