# Craie & Cobalt

Site vitrine de **Craie & Cobalt**, studio d'architecture intérieure **fictif** à Lyon : démo de portfolio de [Simon Dabin](https://github.com/FrenchSimon), développeur freelance.

**Démo :** https://craie-et-cobalt.vercel.app

Un site vitrine complet de 5 pages, au niveau d'un vrai client : accueil, prestations, réalisations (galerie filtrable et fiches projet), le studio et contact (formulaire en 3 étapes et plan d'accès), plus les mentions légales, le plan du site et une page 404.

- Studio, fondatrice, adresse, téléphone, réalisations et avis : **fictifs**. Le formulaire n'envoie rien.
- Le site n'est pas indexé (`noindex`), pour ne tromper personne qui chercherait une vraie architecte.

## Stack

- [Astro](https://astro.build) 7, en sortie 100 % statique, hébergé sur Vercel.
- CSS natif : les variables de la direction artistique sont dans `src/styles/`.
- Polices Archivo, Newsreader et IBM Plex Mono auto-hébergées (WOFF2, sous-ensemble latin, licence OFL) ; logo et noms du plan en tracés.
- Photos étalonnées par script (sharp), servies en AVIF et WebP en plusieurs tailles, différées sous la ligne de flottaison.
- Plan d'accès en SVG, dessiné à partir des données OpenStreetMap sans dépendance ajoutée.
- Aucun script tiers ; aucun style ni script en ligne, pour une CSP stricte (`vercel.json`).
- Versions figées (`package-lock.json`, `save-exact`), Node 24 (`.nvmrc`).

Choix détaillés : `docs/stack.md`.

## Qualité

Recette du 26/11/2026 (détail dans `docs/recette.md`) :

- **Accessibilité** (WCAG 2.2 AA, RGAA) : 0 violation axe sur 29 états, tout au clavier avec focus visible, testé avec VoiceOver, `prefers-reduced-motion` respecté.
- **Performance** : Lighthouse mobile 97 à 100 sur chaque page, LCP 1,1 à 2,5 s, CLS 0.
- **Responsive** : de 320 à 1920 px sans débordement ; Chrome, Firefox, Safari, iOS et Android.
- **Sécurité** : CSP stricte sans violation, HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy` ; aucun cookie ni traceur ; `npm audit` sans faille.

## Commandes

```sh
nvm use            # Node 24
npm install
npm run dev        # serveur de développement : http://localhost:4321
npm run build      # site statique dans dist/
npm run preview    # aperçu du build
npm run check      # contrôle des types et des composants Astro
npm run controler  # contrôles de dist/ et src/ avant une PR (après le build)
npm run photos     # étalonne les photos de contenu/photos/ vers src/assets/photos/
npm run plan       # dessine le plan d'accès (après npm run plan:extraire)
npm run icone      # icône d'écran d'accueil iOS tirée du favicon
```

## Organisation du code

- `src/pages/` : les 5 pages, les mentions légales, le plan du site, la 404 et le `sitemap.xml`.
- `src/layouts/Base.astro` : structure commune (`head`, lien d'évitement, bandeau démo, en-tête, pied de page).
- `src/components/` : composants communs, puis ceux de l'accueil, de Réalisations et de Contact.
- `src/data/` : menu, prestations, projets et image de partage, partagés entre les pages.
- `src/scripts/` : les petits scripts maison (menu mobile, démarche, comparatif, formulaire).
- `src/styles/` : variables de la direction artistique, base typographique, polices, animations.
- `scripts/` : étalonnage des photos, plan d'accès, logo, icône iOS et contrôles avant PR.

## Documentation (`docs/`)

- `docs/ROADMAP.md` : étapes du projet, livrables et décisions.
- `docs/textes.md` : textes de chaque page (validés).
- `docs/photos.md` : photos retenues, auteurs et sources.
- `docs/direction-artistique.md` : palette, typographies, logo et composants.
- `docs/stack.md` : stack retenue et ses choix.
- `docs/recette.md` : recette qualité (accessibilité, performance, responsive, sécurité, fiction).

## Droits d'utilisation

© 2026 Simon Dabin. Tous droits réservés, sauf :

- photos : [licence Unsplash](https://unsplash.com/license), auteurs et sources dans `docs/photos.md` ;
- plan d'accès : données © contributeurs [OpenStreetMap](https://www.openstreetmap.org/copyright) (licence ODbL) ;
- polices Archivo, Newsreader et IBM Plex Mono : licence SIL Open Font License, textes dans `src/assets/fonts/`.
