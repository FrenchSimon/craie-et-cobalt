# Roadmap — Craie & Cobalt

Objectif : un site vitrine complet de 5 pages en ligne en **2 à 3 semaines** (≈ 10 à 15 jours de travail), au niveau d'un vrai client. On mesure le temps gagné en reprenant le socle de Pistil & Ronce.
Règle : chaque étape se termine par un livrable que je valide avant de passer à la suivante. Le temps est noté dans `docs/TEMPS-PASSE.md` (local, hors du dépôt).

| # | Étape | Livrable à valider | Estimation | Statut |
|---|---|---|---|---|
| 1 | Textes | `docs/textes.md` | 0,5 j | ✅ validé le 25/11 (PR #1) |
| 2 | Photos | Planche de sélection + `docs/photos.md` | 1 j | ✅ validé le 25/11 (12 photos Unsplash) |
| 3 | Direction artistique | Planche de style + maquettes de l'accueil et de Réalisations | 1,5 j | ✅ validé le 25/11 (`docs/direction-artistique.md`) |
| 4 | Stack | Proposition argumentée (`docs/stack.md`) | 0,25 j | ✅ validé le 25/11 (`docs/stack.md`) |
| 5 | Réalisation | Site complet en local | 5 j | 🚧 en cours (socle, photos et accueil validés le 25/11) |
| 6 | Recette qualité | Rapport a11y, perf, SEO, sécurité, responsive | 1 j | ⏳ à venir |
| 7 | Mise en ligne | URL Vercel de production | 0,25 j | ⏳ à venir |
| 8 | Étude de cas | Fiche portfolio à jour | — | ⏳ à venir |

## 2. Photos — `docs/photos`

- [x] Lister les besoins : accroche de l'accueil (1, format large), 6 projets (1 à 3 photos du résultat chacun, dont les 3 réalisations phares), portrait ou image de la fondatrice (1), atelier du studio (1), image de partage Open Graph (1).
- [x] Chercher sur Unsplash / Pexels une série cohérente (lumière, tons, style contemporain et graphique) : 2 ou 3 candidates par emplacement.
- [x] Vérifier que les photos collent aux textes (canut à poutres et mezzanine, haussmannien à moulures, maison des années 30 à verrière, boutique, bureaux) et qu'aucune ne montre l'enseigne ou le logo d'une vraie entreprise.
- [x] Noter auteur, source et URL dans `docs/photos.md`. Adapter les textes alternatifs (accord requis, texte validé).
- [x] **Livrable :** planche contact des choix, puis originaux dans `contenu/photos/` après validation (non versionnés).

## 3. Direction artistique — `docs/direction-artistique`

- [x] Ambiance : 2 ou 3 pistes courtes (mots-clés, références de style, pas de copie d'un vrai studio). Piste de départ : blanc craie, un seul accent bleu cobalt.
- [x] Palette avec contrastes AA vérifiés pour chaque paire texte/fond, en particulier cobalt sur blanc et l'inverse.
- [x] Typographies libres et auto-hébergeables (titre + texte), avec sous-ensembles latins.
- [x] Logo typographique « Craie & Cobalt » et favicon (vectorisés dans `contenu/logo/`).
- [x] Composants : boutons, liens, champs, cartes de projet, filtres, fiche dépliable, bandeau démo, états de focus.
- [x] Étalonnage commun des photos : 2 ou 3 réglages (blancs, noirs, saturation) accordés à la palette, sur une planche avant/après des 12 photos ; le cobalt reste la seule couleur vive.
- [x] **Livrable :** planche de style + maquettes de l'accueil et de la page Réalisations, en mobile et en bureau.
- [x] Mesurer ce qui est repris de Pistil & Ronce et ce qui est fait sur mesure (point ouvert de l'offre : niveau de design).

## 4. Stack — `docs/stack.md`

- [x] Évaluer en premier la reprise du socle Pistil & Ronce (Astro 7, versions figées, Node 24) : ce qui se réutilise tel quel, ce qui change pour 5 pages.
- [x] Points à trancher en même temps : mise en page commune et navigation entre pages, pipeline d'images (AVIF/WebP, `srcset`), galerie filtrable et fiches dépliables sans dépendance, `sitemap.xml`.

## 5. Réalisation — `feat/<page>`, un commit par section

1. [x] **Socle :** projet, polices, variables de style, mise en page commune, lien d'évitement, bandeau démo, en-tête et navigation (`aria-current="page"`), pied de page.
2. [x] **Photos :** étalonnage validé appliqué aux 12 photos par script (repris de Pistil & Ronce), titre « Louis Vuitton » effacé sur la photo de la boutique, export AVIF/WebP en plusieurs tailles.
3. [x] **Accueil :** accroche (image LCP prioritaire, non différée), 3 réalisations phares, prestations en bref, démarche, avis (« Avis fictifs (démo) »), appel à l'action.
4. [ ] **Prestations :** 4 prestations, honoraires, appel à l'action.
5. [ ] **Réalisations :** galerie filtrable (`aria-pressed`, résultat annoncé en `aria-live`), fiches dépliables au clavier, images différées, poids de la page surveillé.
6. [ ] **Le studio :** fondatrice, démarche, artisans partenaires, zone d'intervention.
7. [ ] **Contact :** formulaire accessible, validation, erreurs reliées aux champs, message de démo annoncé (`aria-live`), aucun envoi.
8. [ ] **Mentions légales et confidentialité.**
9. [ ] **Plan du site** (`/plan-du-site`) : liste de toutes les pages et des 6 fiches projet, lien dans le pied de page (second système de navigation, critère 12.1 du RGAA). Ses textes (title, description, titre, intitulé du lien) sont à ajouter à `textes.md` après accord.
10. [ ] **Page 404.**
11. [ ] **Bouton haut de page :** sur toutes les pages, lien vers le haut (`#haut`, utilisable sans JavaScript), visible au clavier avec focus net, cible de 44 × 44 px au moins, sans masquer de contenu en mobile ; défilement doux désactivé avec `prefers-reduced-motion`. Son intitulé est à ajouter à `textes.md` après accord.
12. [ ] **Animations :** discrètes, en CSS, désactivées avec `prefers-reduced-motion`, sans effet sur le LCP ni le CLS.
13. [ ] **SEO :** `title` et `meta description` par page, Open Graph et image de partage, liens canoniques, `sitemap.xml`, JSON-LD `ProfessionalService`, `noindex`.
14. [ ] **Sécurité :** `vercel.json` avec les en-têtes HTTP (CSP stricte sans `unsafe-inline`, HSTS, `X-Robots-Tag: noindex`, cache des fichiers à empreinte), testés en local.

Une PR par lot cohérent (socle, pages, finitions), sans captures : elles restent en local.

## 6. Recette qualité

- [ ] **Accessibilité :** navigation au clavier complète sur les 5 pages, plan du site à jour, axe sans erreur, contrastes.
- [ ] **Lecteur d'écran :** VoiceOver sur macOS avec Safari : navigation, filtres de la galerie, fiches dépliables, formulaire.
- [ ] **Performance :** Lighthouse mobile ≥ 95 sur chaque page, LCP < 2,5 s, INP < 200 ms, CLS < 0,1 ; poids de la page Réalisations.
- [ ] **Responsive :** 320, 375, 768, 1024, 1440 et 1920 px, sans débordement.
- [ ] **Navigateurs :** Chrome, Firefox, Safari, iOS, Android.
- [ ] **Sécurité :** `npm audit` propre, A+ sur securityheaders.com en production.
- [ ] **Fiction :** relire que rien ne renvoie à un vrai studio (liens, données structurées, photos).
- [ ] **Livrable :** tableau des résultats dans `docs/recette.md`, résumé dans la PR.

## 7. Mise en ligne

- [ ] Projet Vercel relié au dépôt, prévisualisation sur chaque PR, production sur `main`.
- [ ] Vérifier en production : en-têtes HTTP, `noindex`, image de partage (aperçu Open Graph), Lighthouse.
- [ ] `README` complet (but, stack, captures, lien vers la démo).
- [ ] Ajouter le lien du site et du code dans le portfolio (`docs/projets.md`).

## 8. Étude de cas

- [ ] Temps total par étape (`docs/TEMPS-PASSE.md`) comparé à la promesse de 2 à 3 semaines et à Pistil & Ronce (détail interne, hors du dépôt).
- [ ] Bilan du niveau de design : base commune adaptée ou sur mesure.
- [ ] Mettre à jour `demo-architecte.md` et le journal de `ROADMAP.md` du portfolio.

## Décisions ouvertes

- [x] Fiches projet : photos du résultat seulement, l'avant raconté par le texte (décidé le 25/11).
- [x] Image de la fondatrice : portrait de face, pris sur une banque d'images ; la page précise que le studio est fictif (décidé le 25/11).
- [x] Fiches projet : panneau latéral (`<dialog>`) dans la page Réalisations, ouvrable par l'adresse `realisations#<projet>` (décidé le 25/11).
- [x] Adresse du site : sous-domaine Vercel `craie-et-cobalt.vercel.app`, comme Pistil & Ronce (décidé le 25/11).
