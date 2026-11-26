---
name: controles-pr
description: Contrôles qualité et sécurité obligatoires avant d'ouvrir ou de mettre à jour une pull request sur Craie & Cobalt (check, build, audit, CSP, structure, SEO, images, liens, code source), puis rédaction de la PR. À utiliser dès qu'une PR est envisagée, que l'utilisateur demande « ouvre la PR », « on pousse », « prépare la PR », ou avant la recette de l'étape 6.
---

# Contrôles avant PR

Tout doit passer **avant** de proposer le push. Ne jamais pousser ni ouvrir la PR sans demande explicite (`AGENTS.md`, Git et GitHub).

## 1. Lancer les contrôles, dans cet ordre

```bash
npm run check                    # types Astro : 0 erreur, 0 avertissement
npm run build                    # dist/ à jour, obligatoire avant le contrôle suivant
npm run controler                # scripts/controler.mjs : dist/*.html et src/
npm audit --audit-level=high     # aucune faille haute ni critique
```

`npm run controler` vérifie sans dépendance :
- **CSP** : aucun `<script>` en ligne (hors JSON-LD), `<style>`, `style=` ni `on*=` ;
- **structure** : un seul `h1`, `<main>`, lien d'évitement, bandeau « Studio fictif », `aria-current="page"` sur les liens vers la page courante ;
- **SEO** : `title` et `meta description` présents et uniques, `noindex`, canonique égale à l'URL courte (aucune sur la 404) ;
- **images** : `alt`, `width` et `height` ;
- **liens** `target="_blank"` en `rel="noopener noreferrer"` ;
- **source** : ni `innerHTML` / `outerHTML` / `insertAdjacentHTML`, ni `TODO` / `FIXME`, ni `console.log`.

Une erreur bloque la PR : la corriger (commit `fix:`) ou, si elle relève d'une étape à venir de la roadmap, la signaler à l'utilisateur sans la corriger d'office. Les avertissements se listent dans le compte rendu.

## 2. Vérifications à la main (non couvertes par le script)

- `git status` propre ; aucun fichier de `.playwright-mcp/`, `docs/TEMPS-PASSE.md`, capture, `.env` ni fichier temporaire dans les commits (`git diff main --stat`).
- Commits atomiques en Conventional Commits français ; branche `feat/<nom>` ou `docs/<nom>`, jamais `main`.
- Textes affichés identiques à `docs/textes.md` (aucun texte nouveau sans accord).
- Si la PR touche une page : rendu vérifié avec le skill `captures-responsive` (au moins 390 et 1440 px), captures gardées en local.
- `README` toujours exact si la PR change la stack, les commandes ou la démo.

## 3. Rédiger la PR (après accord pour pousser)

Titre en Conventional Commits français. Corps :

```markdown
## Ce qui change
- <puces courtes, du point de vue du visiteur puis du code>

## Comment vérifier
1. `npm ci && npm run build && npm run preview`
2. <pages à ouvrir, actions au clavier, largeurs à tester>
3. `npm run check && npm run controler && npm audit --audit-level=high`

## Contrôles
- check : ✓ · build : ✓ · controler : ✓ (N avertissements : …) · audit : ✓
```

Terminer le corps par la ligne d'attribution demandée par le système. Pas de captures dans la PR. Créer avec `gh pr create --body-file - <<'EOF'`. Après fusion, **proposer** le nettoyage de la branche sans l'exécuter (jamais `--delete-branch`).
