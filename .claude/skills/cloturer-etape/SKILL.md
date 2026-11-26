---
name: cloturer-etape
description: Clôture une étape ou sous-étape de docs/ROADMAP.md quand l'utilisateur valide son livrable présenté (« je valide », « c'est validé », « livrable validé ») - version de textes.md, direction artistique, cases de la roadmap, fiche et journal du portfolio, temps passé, commit docs. À utiliser à chaque validation de livrable, avant toute autre action ; ne démarre jamais l'étape suivante. Pas pour le choix d'une piste parmi plusieurs, une validation avec retouche (« ok, mais… »), ni un accord de procédure (« ok pour pousser »).
---

# Clôturer une étape validée

L'utilisateur vient de valider un livrable. Mettre à jour **tous** les suivis, dans cet ordre, puis s'arrêter. Ne rien faire de plus : l'étape suivante attend son propre feu vert (`AGENTS.md`, Workflow).

Si la validation est partielle (« ok, mais change X »), ne pas clôturer : faire la retouche, la présenter, attendre.

## 1. Textes (`docs/textes.md`), seulement si des textes ont été ajoutés ou modifiés

- En-tête (ligne 3) : passer `Version 1.N` à `Version 1.N+1`, mettre la date du jour (AAAA-MM-JJ) et ajouter `; v1.N+1 : <résumé en quelques mots>` à la fin de la parenthèse d'historique.
- Sous la section concernée, une note : `> v1.N+1, validé le JJ/MM/AAAA : <ce qui a été décidé>.`
- Reprendre **mot pour mot** les textes validés dans la conversation. Ne rien reformuler.

## 2. Direction artistique (`docs/direction-artistique.md`), seulement si un composant ou un style a été ajouté ou modifié

- Décrire le composant dans la liste des composants (dimensions, couleurs, états, comportement en mobile), avec « (ajouté le JJ/MM) » ou « (modifié le JJ/MM) ». Ce fichier fait foi : il doit décrire ce qui est livré.

## 3. Roadmap du dépôt (`docs/ROADMAP.md`)

- Liste de l'étape : passer `[ ]` à `[x]` et compléter la ligne avec ce qui a été réellement livré (choix retenus, fichier de textes et version).
- Tableau d'en-tête, colonne Statut : prolonger la mention « 🚧 en cours (… le JJ/MM) » ; quand toute l'étape est faite : `✅ validé le JJ/MM`.
- Une décision reportée ou un point à revoir va dans « Décisions ouvertes » (`- [ ] … (noté le JJ/MM)`).

## 4. Portfolio (hors du dépôt, ne pas committer ici)

- `~/Local Sites/portfolio/docs/demo-architecte.md` : à la ligne de l'étape (« Réalisation », « Recette qualité »…), ajouter `; <page ou livrable> (JJ/MM) : <résumé, choix retenu parmi N pistes, ce qui a été écarté>`. Cocher `[x]` seulement quand l'étape entière est finie.
- `~/Local Sites/portfolio/ROADMAP.md`, tableau « Journal des décisions » (en fin de fichier) : ajouter une ligne
  `| AAAA-MM-JJ | Craie & Cobalt : <livrable> validé (<détails>) | <raison du choix, ce qui a été essayé puis écarté> |`.
- Le portfolio est un autre dépôt : ne pas y committer sans que l'utilisateur le demande.

## 5. Temps passé (`docs/TEMPS-PASSE.md`, ignoré par Git)

Ajouter une ligne `| AAAA-MM-JJ | <étape> validée : <ce qui a été mis à jour> (HH h MM) | ~N min |`. Heure réelle via `date "+%H h %M"`, jamais estimée de mémoire. Ne jamais ajouter ce fichier à Git.

## 6. Commits (branche de l'étape, jamais `main`)

- Si l'étape a produit plusieurs commits `feat:` de retouches, proposer de les regrouper en un seul avant la PR (sans réécrire un historique déjà poussé sans accord).
- Un commit `docs:` atomique pour les fichiers du dépôt :
  `docs: textes de <page> (v1.N+1) et étape 5.X validée`, ou `docs: étape 5.X validée (roadmap)` sans changement de textes.
- Vérifier avant : `git status` ne contient ni `docs/TEMPS-PASSE.md`, ni capture, ni fichier temporaire.

## 7. Compte rendu, puis arrêt

Trois lignes au plus : ce qui a été mis à jour, l'étape suivante d'après la roadmap (sans la commencer), et la prochaine décision attendue (PR à ouvrir ? fusion ? nettoyage de branche ?). Ne pas pousser, ne pas ouvrir de PR, ne pas supprimer de branche sans demande explicite.
