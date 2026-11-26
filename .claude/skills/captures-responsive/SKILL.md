---
name: captures-responsive
description: Vérifie le rendu de Craie & Cobalt dans un vrai navigateur (Playwright MCP) aux largeurs 320, 375, 768, 1024, 1440 et 1920 px - captures locales, débordements horizontaux, cibles de moins de 24 px, focus visible au clavier, prefers-reduced-motion. À utiliser après chaque modification visible d'une page, avant de présenter un livrable ou d'ouvrir une PR, et pour la partie responsive de la recette (étape 6).
---

# Captures et contrôles responsive

## 1. Préparer

- `npm run build`, puis `npx astro preview status` : Astro 7 garde un serveur de prévisualisation **en tâche de fond**. S'il tourne, réutiliser son port (il sert `dist/`, donc le dernier build) ; sinon `npx astro preview --background`, et `npx astro preview stop` à la fin si on l'a lancé soi-même.
- Pages : chaque fichier de `dist/*.html` (`/`, `/prestations`, `/realisations`, `/studio`, `/contact`, `/mentions-legales`, `/plan-du-site`, et une adresse inconnue pour la 404). Pour les fiches projet : `/realisations#<id>` (identifiants dans `src/data/projets.ts`).
- Par défaut, ne contrôler que les pages touchées par la branche (`git diff main --stat`) ; toutes les pages pour la recette.
- Captures **uniquement** dans `.playwright-mcp/<branche>/` (ignoré par Git), nommées `<page>-<largeur>.png`. Vider d'abord ce sous-dossier ; ne jamais ajouter de capture au dépôt ni à une PR.
- Si le navigateur Playwright est « already in use » (autre session), ne pas tuer le processus : le signaler et demander à l'utilisateur.

## 2. Pour chaque page et chaque largeur

Largeurs : **320, 375, 768, 1024, 1440, 1920** (hauteur 900). Pour une vérification rapide pendant une étape : 390 et 1440.

1. `browser_resize`, puis `browser_navigate`.
2. `browser_evaluate` avec le contenu de `mesures.js` (dans ce dossier) : il renvoie le débordement horizontal, les éléments qui dépassent, les cibles de moins de 24 × 24 px et les images sans dimensions.
3. `browser_take_screenshot` (`fullPage: true`) et **regarder** la capture : texte coupé, éléments qui se chevauchent, photo déformée, menu illisible, bandeau démo absent.

## 3. Une fois par page (à 1440 px puis à 390 px)

- **Clavier** : appuyer sur Tab une dizaine de fois depuis le haut. Le premier arrêt est le lien d'évitement « Aller au contenu ». Contrôler ensuite que chaque élément focalisé a un contour visible : `() => { const el = document.activeElement; const s = getComputedStyle(el); return [el.tagName, el.textContent.trim().slice(0,30), s.outlineStyle, s.outlineWidth, s.outlineColor]; }` après chaque Tab. Le menu mobile, les filtres, les fiches et le formulaire doivent s'ouvrir à Entrée ou Espace et se fermer à Échap.
- **Mouvement réduit** : `browser_emulate_media` avec `reducedMotion: "reduce"`, recharger, vérifier qu'aucune animation ni défilement doux ne subsiste (`getAnimations().length` sur `document`), puis remettre `null`.

## 4. Compte rendu

Un tableau page × largeur (✓ ou défaut constaté), puis la liste des défauts avec leur page, leur largeur et l'élément fautif. Donner le chemin complet des captures à regarder, sans les recopier dans la conversation. Ne rien corriger d'office si le défaut relève d'une autre étape : le signaler.
