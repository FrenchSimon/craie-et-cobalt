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
- **Navigateur « already in use »** : une autre session Claude Code utilise le même profil Chrome de Playwright MCP. Ne pas tuer le processus. Le remède durable est l'option `--isolated` dans la configuration MCP de l'utilisateur (`~/.claude.json`, serveur `playwright`), qui donne un profil temporaire à chaque session ; si elle manque, le dire à l'utilisateur et demander s'il faut l'ajouter (puis redémarrer les sessions). En attendant, faire sans navigateur ce qui peut l'être (build, `npm run controler`), noter dans le compte rendu que les captures restent à faire, et demander quand reprendre.

## 2. Pour chaque page et chaque largeur

**Mode rapide** (pendant une étape) : pour **chaque** page touchée, les points 1 à 4 ci-dessous aux deux largeurs, sans exception ; le passage au clavier du § 3 dès que la branche touche `src/components/`, `src/scripts/` ou `src/styles/`. **Mode complet** (recette) : tout, sur toutes les pages. Tout point non fait est listé dans le compte rendu avec sa raison : ne jamais en sauter un en silence.

Largeurs (× hauteur) : **320 × 640, 375 × 812, 768 × 1024, 1024 × 768, 1440 × 900, 1920 × 1080**. Pour une vérification rapide pendant une étape : 390 × 844 et 1440 × 900.

1. `browser_resize`, puis `browser_navigate`.
2. `browser_evaluate` avec le contenu de `mesures.js` (dans ce dossier, tel quel, commentaires compris) : il renvoie la largeur réelle, le débordement horizontal, les éléments qui dépassent (hors carrousels et zones qui défilent), les cibles de moins de 24 × 24 px (hors liens pris dans une phrase) et les images sans dimensions. **Si `largeur` ne vaut pas la largeur demandée**, le redimensionnement n'a pas pris (vu après une reprise de session) : `browser_close`, puis `browser_resize` et `browser_navigate` de nouveau. Une capture qui expire plusieurs fois se règle de la même façon.
   L'exception d'espacement du critère 2.5.8 (petite cible isolée dans un cercle de 24 px) n'est pas calculée : la vérifier sur la capture avant de signaler un défaut.
3. **Capture pleine page en mouvement réduit** : `browser_emulate_media` avec `reducedMotion: "reduce"`, recharger, puis `browser_take_screenshot` (`fullPage: true`). Sans cela, les éléments qui apparaissent au défilement (`animation-timeline: view()` dans `src/styles/animations.css` : cartes, prestations, avis, principes, infos) restent invisibles sur la capture, car elle ne fait pas défiler la page : ce n'est pas un défaut. **Regarder** la capture : texte coupé, éléments qui se chevauchent, photo déformée, menu illisible, bandeau démo absent. Remettre `reducedMotion: null` ensuite.
4. **Apparition au défilement** (mouvement normal, une seule largeur suffit) : recharger, puis faire défiler jusqu'en bas et vérifier que tout élément animé finit visible :
   `async () => { for (let y = 0; y <= document.documentElement.scrollHeight; y += innerHeight / 2) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); } await new Promise((r) => setTimeout(r, 300)); return [...document.querySelectorAll('.carte-projet, .prestation, .avis__carte, .principe, .info')].filter((el) => el.offsetParent && getComputedStyle(el).opacity !== '1').map((el) => el.className); }`
   Attendu : `[]`. Si la liste des sélecteurs animés change dans `animations.css`, mettre ce script à jour.

## 3. Une fois par page (à 1440 px puis à 390 px)

- **Clavier** : appuyer sur Tab une dizaine de fois depuis le haut. Le premier arrêt est le lien d'évitement « Aller au contenu ». Contrôler ensuite que chaque élément focalisé a un contour visible : `() => { const el = document.activeElement; const s = getComputedStyle(el); return [el.tagName, el.textContent.trim().slice(0,30), s.outlineStyle, s.outlineWidth, s.outlineColor]; }` après chaque Tab. Le menu mobile, les filtres, les fiches et le formulaire doivent s'ouvrir à Entrée ou Espace et se fermer à Échap.
- **Mouvement réduit** : `browser_emulate_media` avec `reducedMotion: "reduce"`, recharger, faire défiler jusqu'en bas, puis lister **toutes** les animations, quelle que soit leur chronologie (temps, défilement de la page `ScrollTimeline`, entrée à l'écran `ViewTimeline`) :
  `() => ({ scroll: getComputedStyle(document.documentElement).scrollBehavior, animations: document.getAnimations().map((a) => ({ nom: a.animationName ?? a.transitionProperty, chronologie: a.timeline?.constructor.name ?? 'aucune', cible: a.effect?.target?.className, fonction: a.effect?.target ? getComputedStyle(a.effect.target).animationTimingFunction : null })) })`
  Attendu : `scroll: "auto"` et une liste vide, **sauf** l'apparition du bouton haut de page (`retour-haut-apparition`, `ScrollTimeline`), tolérée parce qu'elle passe en `step-end` (apparition sans fondu) : vérifier que sa fonction vaut `step-end`. Toute autre animation, y compris en `ViewTimeline`, est un défaut. Remettre `reducedMotion: null` ensuite.

## 4. Compte rendu

Un tableau page × largeur (✓, défaut constaté, ou « non fait : raison »), puis la liste des défauts avec leur page, leur largeur et l'élément fautif. Donner le chemin complet des captures à regarder, sans les recopier dans la conversation. Ne rien corriger d'office si le défaut relève d'une autre étape : le signaler.
