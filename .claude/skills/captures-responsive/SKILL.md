---
name: captures-responsive
description: Vérifie le rendu de Craie & Cobalt dans un vrai navigateur (Playwright MCP) - captures locales, débordements horizontaux, cibles de moins de 24 px, focus visible au clavier, prefers-reduced-motion. Mode rapide (390 et 1440 px, pages touchées) avant de présenter un livrable ou d'ouvrir une PR ; mode complet (320 à 1920 px, toutes les pages) pour la recette (étape 6). Pas pour Lighthouse, ni pour des captures destinées au portfolio.
---

# Captures et contrôles responsive

## 1. Préparer

- `npm run build`, puis `npx astro preview status` : Astro 7 garde un serveur de prévisualisation **en tâche de fond**. S'il tourne, réutiliser son port (il sert `dist/`, donc le dernier build) ; sinon `npx astro preview --background`, et `npx astro preview stop` à la fin si on l'a lancé soi-même.
- Pages : chaque fichier de `dist/*.html` (`/`, `/prestations`, `/realisations`, `/studio`, `/contact`, `/mentions-legales`, `/plan-du-site`, et une adresse inconnue pour la 404). Pour les fiches projet : `/realisations#<id>` (identifiants dans `src/data/projets.ts`).
- Par défaut, ne contrôler que les pages touchées par la branche (`git diff main --stat`) ; toutes les pages pour la recette.
- Captures **uniquement** dans `.playwright-mcp/<branche>/` (ignoré par Git), nommées `<page>-<largeur>.png`. Vider d'abord ce sous-dossier ; ne jamais ajouter de capture au dépôt ni à une PR.
- Si le navigateur Playwright est « already in use » (autre session), ne pas tuer le processus : le signaler et demander à l'utilisateur.

## 2. Pour chaque page et chaque largeur

Largeurs (× hauteur) : **320 × 640, 375 × 812, 768 × 1024, 1024 × 768, 1440 × 900, 1920 × 1080**. Pour une vérification rapide pendant une étape : 390 × 844 et 1440 × 900.

1. `browser_resize`, puis `browser_navigate`.
2. `browser_evaluate` avec le contenu de `mesures.js` (dans ce dossier, tel quel, commentaires compris) : il renvoie la largeur réelle, le débordement horizontal, les éléments qui dépassent (hors carrousels et zones qui défilent), les cibles de moins de 24 × 24 px (hors liens pris dans une phrase) et les images sans dimensions. **Si `largeur` ne vaut pas la largeur demandée**, le redimensionnement n'a pas pris (vu après une reprise de session) : `browser_close`, puis `browser_resize` et `browser_navigate` de nouveau. Une capture qui expire plusieurs fois se règle de la même façon.
   L'exception d'espacement du critère 2.5.8 (petite cible isolée dans un cercle de 24 px) n'est pas calculée : la vérifier sur la capture avant de signaler un défaut.
3. `browser_take_screenshot` (`fullPage: true`) et **regarder** la capture : texte coupé, éléments qui se chevauchent, photo déformée, menu illisible, bandeau démo absent.

## 3. Une fois par page (à 1440 px puis à 390 px)

- **Clavier** : appuyer sur Tab une dizaine de fois depuis le haut. Le premier arrêt est le lien d'évitement « Aller au contenu ». Contrôler ensuite que chaque élément focalisé a un contour visible : `() => { const el = document.activeElement; const s = getComputedStyle(el); return [el.tagName, el.textContent.trim().slice(0,30), s.outlineStyle, s.outlineWidth, s.outlineColor]; }` après chaque Tab. Le menu mobile, les filtres, les fiches et le formulaire doivent s'ouvrir à Entrée ou Espace et se fermer à Échap.
- **Mouvement réduit** : `browser_emulate_media` avec `reducedMotion: "reduce"`, recharger, vérifier qu'aucune animation ni défilement doux ne subsiste, puis remettre `null` :
  `() => ({ scroll: getComputedStyle(document.documentElement).scrollBehavior, animations: document.getAnimations().filter((a) => a.timeline?.constructor.name !== 'ScrollTimeline' && a.playState === 'running').map((a) => a.animationName ?? a.transitionProperty) })`
  Attendu : `scroll: "auto"` et aucune animation. Les animations liées au défilement (`ScrollTimeline`, comme l'apparition du bouton haut de page) ne bougent pas seules : elles sont ignorées, mais doivent passer en `step-end` avec le mouvement réduit.

## 4. Compte rendu

Un tableau page × largeur (✓ ou défaut constaté), puis la liste des défauts avec leur page, leur largeur et l'élément fautif. Donner le chemin complet des captures à regarder, sans les recopier dans la conversation. Ne rien corriger d'office si le défaut relève d'une autre étape : le signaler.
