---
name: demarrer-etape
description: Démarre une étape ou sous-étape de docs/ROADMAP.md sur Craie & Cobalt quand l'utilisateur donne le feu vert (« go 5.12 », « on attaque les animations », « passe à l'étape suivante ») - vérifie que la précédente est validée, crée la branche depuis main à jour, note l'heure de début dans TEMPS-PASSE.md et rappelle le périmètre. Pas pour reprendre une étape déjà commencée, ni pour clôturer (cloturer-etape).
---

# Démarrer une étape

L'utilisateur donne le feu vert pour une étape. Préparer le terrain, puis faire l'étape elle-même. Règle d'`AGENTS.md` : **ne jamais commencer une étape avant que la précédente soit validée.**

## 1. Vérifier que l'étape peut commencer

- Dans `docs/ROADMAP.md`, la sous-étape précédente est cochée `[x]`. Sinon : le dire, rappeler ce qui reste à valider, et s'arrêter.
- L'étape demandée n'est pas déjà commencée (case `[ ]`, aucune branche du même nom : `git branch -a`). Si elle l'est, la reprendre sans recréer de branche.

## 2. Préparer la branche

- `git status` propre ; sinon, demander quoi faire des changements en cours.
- Partir de `main` à jour : `git switch main && git pull`. Si l'utilisateur veut enchaîner sur une branche non fusionnée, partir de celle-ci et le noter.
- Créer la branche : `feat/<nom>` pour une page ou un composant, `fix/<nom>`, `docs/<nom>` ou `chore/<nom>` sinon (noms courts, en français, sans accents).

## 3. Chronométrer

Noter l'heure réelle de début (`date "+%H h %M"`, jamais estimée). La ligne de `docs/TEMPS-PASSE.md` (ignoré par Git, jamais commité) s'écrit au premier livrable présenté :
`| AAAA-MM-JJ | Étape 5.X <nom> : <ce qui a été fait>, <contrôles>, N commit(s) (HH h MM – HH h MM) | ~N min |`

## 4. Rappeler le périmètre, puis faire l'étape

En deux ou trois lignes : la ligne de la roadmap, les sources qui font foi (`docs/textes.md`, `docs/direction-artistique.md`, `docs/stack.md`) et ce qui demandera un accord (texte nouveau, choix de design). Chercher d'abord si Pistil & Ronce (`~/Local Sites/pistil-et-ronce/`) a déjà le composant : le reprendre et l'adapter plutôt que repartir de zéro.

Ensuite seulement, réaliser l'étape (commits atomiques), vérifier le rendu avec `captures-responsive`, présenter le livrable et attendre la validation.
