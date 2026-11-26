# Direction artistique — Craie & Cobalt

> Version 1 — 2026-11-25 · Statut : **validé le 25/11**
> **Ce fichier est la référence** pour la réalisation : couleurs, polices, tailles, composants et comportements sont ici. Les planches et maquettes du canevas (privé) et le prototype HTML (`contenu/prototype/`, local, ignoré par Git) ont servi à décider ; en cas d'écart, ce fichier l'emporte.

## Pour l'agent qui réalise le site

- Respecter `AGENTS.md` (étapes, validation, Git, sécurité, qualité) ; l'avancement est dans `docs/ROADMAP.md`.
- Textes : **uniquement** `docs/textes.md` (dernière version validée), mot pour mot. Photos : `contenu/photos/` (originaux locaux) et `docs/photos.md` (auteurs, textes alternatifs).
- Fichiers de la direction artistique versionnés : logo et favicon dans `contenu/logo/`, croquis au crayon dans `contenu/croquis/`.
- Toutes les couleurs, polices et tailles ci-dessous deviennent des variables CSS (noms entre parenthèses) ; aucune autre couleur dans le site.

## Ambiance

Le carnet d'une architecte d'intérieur : papier craie, mine graphite, cotes à l'encre bleue. Contemporain et graphique, angles droits, beaucoup de blanc. **Une seule couleur vive, le cobalt**, qui signale ce qui se clique ou se mesure. Le dessin (croquis au crayon, lignes de cote, pictogrammes au trait) fait le lien entre le métier et l'interface.

## Logo et favicon

Revu le 25/11 à la réalisation de l'accueil : l'ancien logo (capitales en Archivo 600, largeur 125 %, sur une ligne de cote) était trop épais pour un site plutôt fin. Variante B retenue parmi 5.

| Fichier (`contenu/logo/`) | Usage |
|---|---|
| `logo.svg` | Logo complet : « Craie & Cobalt » et, dessous, « ARCHITECTURE INTÉRIEURE · LYON » en cobalt ; esperluette cobalt |
| `logo-craie.svg` | Même logo tout en craie, sur fond cobalt ou graphite |
| `mot-symbole.svg` | Version de l'en-tête : le nom seul |
| `favicon.svg` | Esperluette craie sur carré cobalt à coins arrondis (seule exception aux angles droits) |

- Lettres en tracés (aucune police à charger), produites par `node scripts/logo.mjs <Archivo[wdth,wght].ttf>`. Nom en minuscules, Archivo **300**, largeur 112 % (celle des titres), +0,015 em, **sans ligne de cote** ; légende en IBM Plex Mono 500 ; favicon en Archivo 500, plus lisible que le 300 en 16 px.
- Zone de protection : la hauteur du « C » tout autour. Jamais déformé, jamais posé sur une photo.
- Dans l'en-tête : mot-symbole de 226 px de large (200 px sous 900 px), lien vers l'accueil (`aria-label="Craie & Cobalt, accueil"`).

## Palette

Contrastes WCAG 2.2 calculés (luminance relative).

| Nom (variable) | Hex | Rôle | Contraste sur craie |
|---|---|---|---|
| Craie (`--craie`) | `#F4F2ED` | Fond de page | — |
| Craie claire (`--craie-claire`) | `#FBFAF7` | Cartes, champs, avis, panneau de fiche | — |
| Filet (`--filet`) | `#D6D3CB` | Filets, séparateurs | 1,3:1 · décor seulement |
| Gris cote (`--gris`) | `#5B616B` | Texte secondaire, étiquettes, légendes, bords de champ | 5,6:1 ✔ |
| Graphite (`--graphite`) | `#1E2229` | Texte, titres, liens, bandeau, appel à l'action, pied de page, focus | 14,3:1 ✔ AAA |
| Cobalt (`--cobalt`) | `#1D3FAE` | Boutons, filtres, cotes, numéros, pictogrammes, esperluette | 7,9:1 ✔ AAA |
| Brique (`--brique`) | `#A3361F` | Erreurs de formulaire uniquement | 6,0:1 ✔ |

Associations texte / fond :

| Texte \ fond | craie | craie claire | graphite | cobalt |
|---|---|---|---|---|
| graphite | 14,3 ✔ | 15,3 ✔ | — | ✗ |
| gris cote | 5,6 ✔ | 6,0 ✔ | ✗ | ✗ |
| cobalt | 7,9 ✔ | 8,5 ✔ | ✗ | — |
| brique | 6,0 ✔ | 6,3 ✔ | ✗ | ✗ |
| craie | — | — | 14,3 ✔ | 7,9 ✔ |
| gris clair `#C9CBD0` | — | — | 9,8 ✔ | — |

Règles :
1. **Un seul accent, le cobalt**, jamais en décoration. Sur fond cobalt, tout passe en craie.
2. **Jamais de gris cote sur filet** (4,2:1).
3. **La brique ne sert qu'aux erreurs**, toujours avec une icône et un message relié au champ (`aria-describedby`) : la couleur n'est jamais le seul indice. Champ en erreur : bord brique 2 px.
4. Fond graphite (appel à l'action, pied de page) : texte craie, texte secondaire en gris clair `#C9CBD0` (`--gris-clair`), filet `#3A3F48`.
5. Survol d'un filtre non actif : fond `#E3E7F4` (cobalt dessus : 7,2:1).
6. Aucune ombre, aucun dégradé, angles droits partout (sauf le favicon).

## Typographies (OFL, WOFF2 auto-hébergées, sous-ensemble latin avec accents français, `font-display: swap`)

| Rôle | Police (variable) | Graisses · axes |
|---|---|---|
| Titres, interface, chiffres | Archivo (`--titre`) | 400 (titres), 500 (interface, chiffres), 600 (noms en gras) · largeur 112 % |
| Texte courant, chapeaux, avis | Newsreader (`--texte`) | 400, 600 · romain seulement |
| Étiquettes, numéros, intitulés de fiche | IBM Plex Mono (`--mono`) | 500 |

Poids mesuré des trois familles en sous-ensemble : **151 Ko**. Pas d'italique (un fichier de plus) : avis et mentions de démo en romain.

| Style | Police · taille / interligne | Remarque |
|---|---|---|
| H1 | Archivo 400 · `clamp(40px, 4.4vw, 64px)` / 1,04, −0,01 em | `text-wrap: balance` |
| H2 | Archivo 400 · `clamp(30px, 2.8vw, 40px)` / 1,08 | |
| H3, titre de carte | Archivo 400 · 24 / 1,2 | |
| Chapeau | Newsreader 400 · 21–22 / 1,5 | 32 em de large au plus ; gris cote sur l'accueil |
| Texte | Newsreader 400 · 19 / 1,55 (18 sous 900 px) | 68 caractères par ligne au plus ; gras en 600 |
| Interface (menu, boutons, liens) | Archivo 500 · 15, +0,02 em | classe `ui` |
| Chiffre clé | Archivo 500 · 20–22 | surface, durée, budget, tarifs |
| Étiquette, surtitre | IBM Plex Mono 500 · 12, capitales, +0,16 em | gris cote, ou cobalt pour les surtitres |
| Intitulé de fiche (`dt`) | IBM Plex Mono 500 · 11, capitales, +0,14 em | gris cote |
| Numéro (01, 02…) | IBM Plex Mono 500 · 13, +0,16 em | cobalt |

## Grille, espacements, traits

- Conteneur : 1 280 px de contenu, marges `clamp(20px, 5.5vw, 80px)` (`--marge`). Gouttière 24 px.
- Pas : 8 · 16 · 24 · 32 · 48 · 72 px. Sections : `padding-block: clamp(96px, 11vw, 160px)` (élargi le 25/11 à la réalisation de l'accueil), sans trait entre elles (filet retiré le 25/11 : l'espace suffit à les séparer).
- **Point de rupture unique : 900 px** (menu replié, grilles sur une colonne, onglets et fiches en carrousel).
- Traits : 1 px pour les contours de boutons et les filets, ainsi que pour le soulignement du lien fictif, du lien du bandeau et des liens du pied de page (affinés le 25/11) ; encadré de survol des cartes en 1 px ; 2 px pour les autres soulignés et le focus. **Ligne de cote** (trait de 1 px entre deux bornes de 1,5 × 10–12 px) pour le logo et les légendes.
- Cibles tactiles : 44 × 44 px au moins (boutons, flèches, numéros, filtres).

## Images

### Croquis (`contenu/croquis/`)

Croquis au crayon (trait graphite tremblé par un filtre SVG `feTurbulence`, hachures, cotes en cobalt), dessinés pour le site :

| Fichier | Usage | Texte alternatif |
|---|---|---|
| `croquis-haussmann.svg` (720 × 680) | Image de l'accroche de l'accueil, prioritaire (LCP) | « Croquis au crayon de la salle à manger haussmannienne : moulures, cheminée, lustre, parquet en point de Hongrie » |
| `salle-1-releve.svg` … `salle-4-livraison.svg` (640 × 440) | Démarche : la même pièce en 4 états (relevé, esquisse, chantier, livraison) | `alt=""` : l'onglet voisin donne déjà le nom et le texte de l'étape |

Légende de l'accroche en ligne de cote : « CROQUIS · HAUSSMANNIEN, AINAY — 140 m² ».

### Photos et étalonnage

Les 12 photos reçoivent un étalonnage commun, appliqué par script (`sharp`) à l'étape 5 : blancs ramenés vers la craie, noirs levés vers le graphite, couleurs vives calmées sauf les bleus. Le cobalt reste ainsi la seule couleur vive.

| Réglage | Photos | Valeurs |
|---|---|---|
| **C · Cobalt seul** | Les 10 photos de réalisations | `modulate({ saturation: 0.9 })`, puis `linear([0.918, 0.898, 0.855], [16, 18, 22])`, puis désaturation sélective : facteur `0.55 + 0.45 × poids bleu`, où le poids vaut 1 pour une teinte entre 205° et 245°, 0 hors de 185°–265°, avec une transition linéaire de 20° (pixels presque gris ignorés : écart max − min < 8) |
| **A · Craie** | `fondatrice-portrait.jpg`, `studio-atelier.jpg` | `modulate({ saturation: 0.9 })`, puis `linear([0.918, 0.898, 0.855], [16, 18, 22])` (C ternissait la peau) |

- Le script de la planche (`contenu/prototype/outils/etalonnage.mjs`, local) contient la fonction de désaturation sélective à reprendre.
- Format des cartes et vignettes : 4:3, `object-fit: cover`. Dans la fiche : proportions d'origine en bureau, 4:3 en mobile.
- Rappel de l'étape 5 : effacer le titre « Louis Vuitton » sur la photo de la boutique.

## Composants

États communs : survol en cobalt, **focus clavier : contour graphite 2 px décalé de 3 px** (craie sur fond graphite), transitions de 150 ms désactivées avec `prefers-reduced-motion`.

**Animations** (ajoutées le 26/11, `src/styles/animations.css`) : opacité et déplacement seulement, aucune avec `prefers-reduced-motion`. Ligne de cote de l'accroche : au chargement, les deux traits se tracent depuis la légende vers l'extérieur (0,9 s après 0,2 s), puis la légende apparaît en fondu ; titre et croquis jamais masqués. Flèche « → » des boutons : avance de 4 px au survol (250 ms). Menu mobile : fondu et montée de 16 px à l'ouverture (250 ms). Cartes projet, prestations, avis, principes et infos du studio : montée de 16 px en fondu à leur entrée à l'écran (liée au défilement, rien sans ce support). Galerie : fondu des projets affichés à chaque filtre (400 ms), jamais au chargement. Courbe commune `cubic-bezier(0.22, 1, 0.36, 1)`.

- **Bandeau démo** (toutes les pages, tout en haut) : fond graphite, Archivo 400 13 px, texte craie ; « Voir le code ↗ » souligné ; au survol, la flèche se décale de 2 px vers le haut et la droite sans changement de couleur (immobile si mouvement réduit) ; nouvel onglet annoncé (« (nouvel onglet) » caché).
- **Bouton haut de page** (toutes les pages, ajouté le 26/11) : carré 48 × 48 px fixé en bas à droite (écart `clamp(20px, 3vw, 32px)` et zones sûres), fond craie claire, contour et flèche au trait cobalt 1,5 px ; au survol, plein cobalt, flèche craie. Apparaît en fondu après 60 % d'écran de défilement. Focus : contour graphite 2 px bordé de craie (visible sur le pied de page graphite). Sous 1500 px, le pied de page lui réserve sa hauteur sous la ligne légale.
- **Lien d'évitement** « Aller au contenu » : visible au premier Tab, fond graphite.
- **En-tête** : 88 px de haut, filet dessous ; mot-symbole à gauche ; menu (Prestations · Réalisations · Le studio) et bouton « Parlons de votre projet » (40 px). Page courante : `aria-current="page"`, souligné graphite 2 px décalé de 8 px. Sous 900 px : bouton menu 48 × 48 (contour graphite 1 px, « Ouvrir le menu » / « Fermer le menu », `aria-expanded`), menu en plein écran, bandeau démo compris (l'en-tête entier passe en couche fixe, page dessous inerte et sans défilement), Échap le referme (modifié le 25/11).
- **Boutons** (revus le 25/11 à la réalisation de l'accueil) : 46 px de haut, 0 22 px, contour 1 px, angles droits. Trois niveaux : **principal plein** (cobalt, texte craie ; sur fond graphite : craie, texte graphite), **secondaire au contour** (graphite ; sur fond graphite : craie), puis le lien souligné. Au survol, le plein se vide (contour seul) et le contour se remplit. Les liens secondaires d'une section (« Voir les réalisations », « Toutes les réalisations », « Le détail des prestations ») sont des boutons secondaires, avec la flèche « → ». En-tête : « Parlons de votre projet » plein, au contour sur la page Contact.
- **Lien** (variante B validée) : texte graphite souligné graphite 2 px, décalé de 6 px ; survol : texte et souligné cobalt. Flèche « → » pour les liens qui mènent ailleurs. Lien fictif désactivé (« Lire tous nos avis sur Google ↗ ») : même aspect, sans survol, suivi de l'étiquette « FICTIF » (Plex Mono 10 px, cadre gris cote 1 px).
- **Surtitre** : étiquette cobalt, sans ligne de cote devant (retirée le 25/11 à la réalisation de l'accueil).
- **Carte projet** (accueil et Réalisations) : photo 4:3 ; étiquette « Type · Lieu » ; titre (H3 sur l'accueil, H2 sur Réalisations) ; **fiche technique** : filet dessus, deux colonnes Surface | Durée séparées par un filet vertical, intitulé Plex Mono 11 px, chiffre Archivo 500 22 px. Sur l'accueil, toute la carte est un lien vers `realisations#<projet>` ; au survol, titre cobalt et encadré cobalt 1 px autour de la carte (décalé de 10 px), sans zoom de l'image. Sur Réalisations, même survol : le bouton « Voir la fiche + » (lien souligné, nom complété pour les lecteurs d'écran : « Voir la fiche : Appartement canut ») couvre toute la carte (ajouté le 25/11). Grille de Réalisations : titres à 24 px comme sur l'accueil, lignes alignées d'une carte à l'autre (sous-grille), 3 colonnes dès 1200 px, 2 de 900 à 1199 px, 1 en dessous. Liens secondaires d'une section (« Toutes les réalisations », « Le détail des prestations ») en fin de section, centrés avec le bouton (modifié le 25/11).
- **Prestations (accueil)** : section sur fond graphite (titre et lien craie, surtitre gris clair, bouton variante craie ; validé le 25/11 pour casser le rythme), 4 cartes en 2 × 2 (1 colonne sous 900 px), fond craie claire, sans bordure ; pictogramme au trait cobalt 1,5 px (56 px, angles vifs : loupe, équerre et crayon, carnet coché, devanture), numéro 01–04, titre, texte, puis filet et ligne « HONORAIRES » + tarif court. Bouton « Demander un devis » centré dessous.
- **Démarche (accueil)** : croquis à gauche (7/12), liste des 4 étapes à droite (5/12) en **onglets** (`tablist` vertical, flèches du clavier, Début/Fin) ; l'onglet actif a un trait cobalt à gauche et déplie son texte. Sous 900 px : **carrousel manuel** (flèche, numéros 01–04 soulignés, flèche ; glisser sur le croquis ; légende de l'étape sous le croquis), jamais automatique. Bouton « Commencer par une visite-conseil ».
- **Avis** : 3 cartes craie claire, guillemet « » en cobalt (Newsreader 600, 56 px), citation Newsreader 21 px, filet puis auteur (Archivo 14 px, nom en 600). Dessous : « Avis fictifs. » et le lien Google fictif.
- **Appel à l'action** : bande graphite, H2 craie, texte gris clair, bouton principal plein craie ; espace du bas réduit (`clamp(48px, 5vw, 72px)`), le pied de page graphite prenant la suite. Sur l'accueil seulement. Dès 900 px, l'appel à l'action et le pied de page partagent une grille de 12 colonnes : le bouton s'aligne sur la colonne « Studio » (modifié le 26/11).
- **Pied de page** (refait le 26/11, piste G choisie parmi 8, sur fond graphite) : Archivo 14 px / 1,6, grille de 12 colonnes : mot-symbole en craie, esperluette cobalt (lien vers l'accueil, 200 à 300 px), et « Architecture intérieure à Lyon » en gris clair sur 6 colonnes ; « STUDIO » (coordonnées « (fictifs) », horaires) puis « PAGES » (menu et Contact, souligné au survol) sur 3 chacune (inversées le 26/11), intitulés en étiquette gris clair. Sous un filet sombre : mentions légales, réseaux fictifs en gris clair, © à droite. Liens de 24 px de haut à la souris, **44 px au tactile** ou sous 900 px, sans écart entre eux. Sous 900 px, mot-symbole sur toute la largeur, studio et pages côte à côte ; sous 600 px, studio sur toute la largeur, pages dessous.
- **Filtres** (Réalisations) : boutons accolés, contour cobalt 1 px, 44 px ; actif : fond cobalt, texte craie (`aria-pressed`) ; résultat annoncé en `aria-live` (« 6 projets affichés »), en étiquette juste à droite des filtres (dessous en mobile ; modifié le 25/11).
- **Fiche projet (Réalisations) : panneau latéral** (organisation B validée le 25/11) : la grille ne bouge pas ; « Voir la fiche + » ouvre un `<dialog>` modal (`showModal`) à droite, 620 px de large, fond craie claire, filet à gauche, fond de page assombri (graphite 50 %), entrée en glissé de 40 px. Haut : « PROJET 01 SUR 06 » et bouton fermer 44 × 44 (croix, « Fermer la fiche »). Corps défilant : étiquette, H2, fiche Surface | Durée des travaux | Budget travaux (3 colonnes entre deux filets), texte, photos les unes sous les autres, bouton « Parlons de votre projet ». Pied : « ← Projet précédent » et « Projet suivant → » (parmi les projets **affichés** par le filtre ; le repère « 0x sur 0y » compte aussi les projets affichés). Au passage d'un projet à l'autre, le panneau reste en place : repère et contenu entrent en fondu avec un glissé de 200 px du côté où l'on va (650 ms, arrivée très ralentie : `cubic-bezier(0.22, 1, 0.36, 1)`, choisi sur téléphone parmi 32, 96 et 200 px), le focus reste sur le bouton utilisé (ajouté le 25/11). Focus sur le bouton fermer à l'ouverture, Échap et clic sur le fond ferment, focus rendu au bouton d'ouverture. L'adresse `realisations#canut` ouvre la fiche (liens de l'accueil). Filtres et commandes affichés par le script ; sans JavaScript, chaque fiche s'affiche sous sa carte (ajouté le 25/11). Sous 900 px : plein écran, fiche en 2 colonnes, filtres sur toute la largeur, **photos en carrousel** (une photo 4:3, flèches, numéros 01–03 soulignés, glisser, compteur « Photo 1 sur 3 » lu par les lecteurs d'écran), remis à la première photo à chaque ouverture.
- **Le studio** (ajouté le 26/11) : en tête, titre et présentation de Margaux à gauche (7/12, texte calé en bas), portrait 4:5 à droite (5/12, image principale chargée en priorité) ; en mobile : titre, portrait, texte. « La démarche » sur fond graphite : photo de l'atelier recadrée en 4:5 à gauche (4:3 en mobile), 4 principes à droite, numéro 01–04 gris clair, titre Archivo 500 22 px, texte gris clair, filets sombres entre eux. Puis artisans et zone d'intervention en deux colonnes sous un filet, bouton « Parlons de votre projet » centré et mention « Studio fictif » en gris cote. Pas d'appel à l'action en bande graphite (réservé à l'accueil).
- **Champs de formulaire** : fond craie claire, bord gris cote 1 px (graphite au survol), 48 px de haut, libellé Archivo 500 15 px au-dessus, « (facultatif) » en gris cote ; focus : bord cobalt 2 px et contour ; erreur : bord brique 2 px, icône carrée « ! » et message brique sous le champ ; liste à chevron dessiné (liste ouverte aux couleurs de la palette dans Chrome) ; surface avec l'unité « m² » dans le champ ; message après envoi en `aria-live`, fond craie claire et filet cobalt 2 px à gauche.
- **Contact** (ajouté le 26/11) : formulaire **en 3 étapes** (Votre projet · En quelques mots · Vos coordonnées) sur 8/12, coordonnées fictives à droite (4/12) sous un filet, intitulé « COORDONNÉES » en étiquette ; en mobile, coordonnées d'abord. Avancement en 3 segments de 2 px (cobalt jusqu'à l'étape en cours, filet ensuite), puis repère « ÉTAPE 1 SUR 3 » en surtitre et titre d'étape (Archivo 28–34 px). Type de projet en **tuiles** (boutons radio, 64 px, contour gris cote ; survol cobalt pâle ; cochée : plein cobalt, texte craie ; erreur : contours brique). Champs en 2 colonnes (1 sous 600 px), alignés en sous-grille (libellé calé en bas, champ, erreur) même quand un libellé passe sur deux lignes. « Retour » au contour graphite à gauche, « Continuer » ou « Envoyer ma demande » plein cobalt à droite (pleine largeur sous 600 px). Étape suivante en fondu avec un glissé de 12 px ; focus sur son titre. Sans JavaScript : 3 étapes à la suite, sans avancement ni Continuer/Retour.
- **Plan d'accès** (Contact, ajouté le 26/11) : sous les coordonnées (4/12) en bureau, juste après elles en mobile (avant le formulaire, dans l'ordre du code). Plan SVG dessiné par `scripts/plan/` depuis OpenStreetMap, aux couleurs de la palette seulement : fond craie, bâtiments en aplat filet, rues craie claire (largeur selon leur rang), eau cobalt pâle `#E3E7F4`, parcs hachurés en gris clair, montées (escaliers) en pointillé gris cote ; noms en IBM Plex Mono 500 capitales, gris cote sur liseré craie claire (convertis en tracés : aucune police à charger) ; stations en rond graphite à « M » craie, nom en graphite ; **seul élément cobalt : le studio** (carré plein dans un carré au filet, nom « CRAIE & COBALT ») et le nom du Rhône ; échelle en ligne de cote et flèche du nord. Aperçu serré (studio, métro C, rue de Belfort) dans un cadre filet ; survol : encadré cobalt décalé de 8 px et pastille « Agrandir le plan ⤢ » (32 px, contour graphite, pleine cobalt au survol) en bas à droite. Clic : grand plan (Croix-Rousse au Rhône, 5 stations, 34 rues) dans un `<dialog>` presque plein écran (barre « PLAN D'ACCÈS » en étiquette et bouton fermer carré 44 px au contour cobalt, fond assombri, fondu de 200 ms coupé en mouvement réduit) ; en bureau le plan tient dans la fenêtre ; sous 900 px, plein écran, le plan remplit la hauteur (640 px au moins), défile et s'ouvre centré sur le studio. Légende « Plan illustratif, adresse fictive. » et crédit OpenStreetMap souligné en gris cote, 13 px.

## Maquettes

- Canevas (privé) : planche de style (fondations, composants, liens, étalonnage), maquettes de l'accueil et de Réalisations en 1440 et 390 px, avec la fiche ouverte. Les planches « composants » antérieures au 25/11 montrent encore l'ancienne fiche dépliable : ce fichier les remplace.
- Prototype HTML (local) : `contenu/prototype/index.html` et `realisations.html`, servis par `python3 -m http.server` depuis ce dossier.

## Repris de Pistil & Ronce, fait sur mesure

Point ouvert de l'offre : base commune adaptée ou design sur mesure.

| Repris tel quel ou presque | Fait sur mesure |
|---|---|
| Structure de ce document et des règles (un seul accent, brique réservée aux erreurs, contrastes en tableau) | Logo, favicon, palette, choix et réglages des polices |
| Marges, rythme des sections, point de rupture unique à 900 px | Croquis au crayon calculés en SVG (accroche, 4 états de la démarche) |
| Principe de l'étalonnage commun par script `sharp` | Étalonnage sélectif « cobalt seul » (nouvelle fonction de désaturation par teinte) |
| Bandeau démo, lien d'évitement, mentions « fictif » | Pictogrammes au trait des prestations, ligne de cote comme motif |
| Méthode : pistes sur le canevas, puis prototype HTML contrôlé en 1440 et 390 px | Composants : fiche technique, onglets/carrousel de la démarche, panneau latéral des fiches, carrousels |

Bilan provisoire : le **socle** (règles, accessibilité, gabarit de mise en page, outillage) se reprend ; **l'identité et les composants** sont faits sur mesure. Temps de l'étape : environ **2 h 30** de travail effectif (estimation de la roadmap : 1,5 jour), dont une grande part en allers-retours de choix sur les variantes.
