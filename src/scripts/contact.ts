/*
 * Contact : formulaire de démo en 3 étapes (validation reprise de Pistil & Ronce).
 * - Une étape à la fois : « Continuer » vérifie l'étape avant de passer à la suivante, « Retour » revient
 *   sans rien vérifier. Le focus va au titre de l'étape (« Étape 2 sur 3 · En quelques mots »).
 *   Sans script, les 3 étapes restent affichées les unes sous les autres.
 * - Les messages du site remplacent les bulles du navigateur. Chaque erreur est reliée à son champ
 *   (aria-describedby, aria-invalid) ; le focus va au premier champ en erreur. Une erreur n'apparaît
 *   qu'après une tentative, puis se met à jour pendant la saisie.
 * - Rien n'est envoyé ni conservé : à l'envoi, le formulaire est vidé, revient à la première étape
 *   et le message de démo est annoncé (aria-live).
 * - Textes de docs/textes.md § 5, insérés en textContent (jamais d'innerHTML).
 */

export {};

const MESSAGE_DEMO = "Démo : ce message n'a pas été envoyé. Sur un vrai site, le studio le recevrait par e-mail.";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Numéro français : 10 chiffres commençant par 0, ou +33 suivi de 9 chiffres (espaces, points et tirets permis)
const TELEPHONE = /^(?:0\d{9}|\+33\d{9})$/;

type Regle = (valeur: string) => string;

/** Règles par identifiant de champ (pour les tuiles : l'identifiant de la première). */
const regles: Record<string, Regle> = {
  'contact-type': (valeur) => (valeur ? '' : 'Choisissez un type de projet.'),
  'contact-message': (valeur) => (valeur ? '' : 'Décrivez votre projet en quelques mots.'),
  'contact-nom': (valeur) => (valeur ? '' : 'Indiquez votre nom.'),
  'contact-email': (valeur) => {
    if (!valeur) return 'Indiquez votre e-mail.';
    return EMAIL.test(valeur) ? '' : "Vérifiez l'e-mail (nom@exemple.fr).";
  },
  'contact-telephone': (valeur) => {
    if (!valeur) return '';
    return TELEPHONE.test(valeur.replace(/[\s.-]/g, '')) ? '' : 'Vérifiez le numéro (10 chiffres).';
  },
};

const formulaire = document.querySelector<HTMLFormElement>('[data-formulaire-demo]');

if (formulaire) {
  formulaire.noValidate = true;

  const etapes = Array.from(formulaire.querySelectorAll<HTMLFieldSetElement>('[data-etape]'));
  const segments = Array.from(formulaire.querySelectorAll<HTMLLIElement>('[data-progression] li'));
  const statut = formulaire.querySelector<HTMLElement>('[data-statut]');
  let courante = 0;

  /** Tuiles du type de projet : le groupe et ses boutons radio. */
  const groupe = formulaire.querySelector<HTMLFieldSetElement>('[data-groupe="contact-type"]');
  const radios = groupe ? Array.from(groupe.querySelectorAll<HTMLInputElement>('input[type="radio"]')) : [];

  const valeurDe = (id: string): string => {
    if (id === 'contact-type') return radios.find((radio) => radio.checked)?.value ?? '';
    const champ = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
    return champ?.value.trim() ?? '';
  };

  /** Affiche ou efface l'erreur d'un champ ; renvoie vrai si le champ est valide. */
  const verifier = (id: string): boolean => {
    const erreur = document.getElementById(`${id}-erreur`);
    const texte = erreur?.querySelector('[data-message]');
    if (!erreur || !texte) return true;

    const message = regles[id](valeurDe(id));
    texte.textContent = message;
    erreur.hidden = !message;

    if (id === 'contact-type') {
      // Groupe de boutons radio : l'erreur est décrite sur chaque bouton, le bord brique sur les tuiles
      groupe?.toggleAttribute('data-erreur', Boolean(message));
      for (const radio of radios) {
        if (message) radio.setAttribute('aria-describedby', erreur.id);
        else radio.removeAttribute('aria-describedby');
      }
      return !message;
    }

    const champ = document.getElementById(id);
    if (message) {
      champ?.setAttribute('aria-describedby', erreur.id);
      champ?.setAttribute('aria-invalid', 'true');
    } else {
      champ?.removeAttribute('aria-describedby');
      champ?.removeAttribute('aria-invalid');
    }
    return !message;
  };

  /** Identifiants des champs vérifiés dans une étape, dans l'ordre de la page. */
  const champsDe = (etape: HTMLFieldSetElement): string[] =>
    Object.keys(regles).filter((id) => etape.contains(document.getElementById(id)));

  /** Vérifie l'étape ; en cas d'erreur, place le focus sur le premier champ fautif. */
  const verifierEtape = (index: number): boolean => {
    const invalides = champsDe(etapes[index]).filter((id) => !verifier(id));
    if (invalides.length === 0) return true;
    const premier = invalides[0];
    const cible = premier === 'contact-type' ? radios[0] : document.getElementById(premier);
    cible?.focus();
    return false;
  };

  const afficher = (index: number, focus = true) => {
    courante = index;
    etapes.forEach((etape, i) => {
      etape.hidden = i !== index;
    });
    segments.forEach((segment, i) => segment.toggleAttribute('data-faite', i <= index));

    const etape = etapes[index];
    // Relance l'animation d'apparition
    etape.classList.remove('etape--entree');
    void etape.offsetWidth;
    etape.classList.add('etape--entree');
    if (focus) etape.querySelector<HTMLElement>('.etape__tete')?.focus();
  };

  // Le script prend la main : avancement et boutons Continuer et Retour affichés, une étape à la fois
  formulaire.querySelector<HTMLElement>('[data-progression]')?.removeAttribute('hidden');
  for (const bouton of formulaire.querySelectorAll<HTMLButtonElement>('[data-suivant], [data-precedent]')) {
    bouton.hidden = false;
  }
  afficher(0, false);
  etapes[0].classList.remove('etape--entree');

  formulaire.addEventListener('click', (evenement) => {
    const bouton = evenement.target instanceof Element ? evenement.target.closest('button') : null;
    if (!bouton) return;
    if (bouton.hasAttribute('data-precedent')) {
      afficher(courante - 1);
    } else if (bouton.hasAttribute('data-suivant') && verifierEtape(courante)) {
      if (statut) statut.textContent = '';
      afficher(courante + 1);
    }
  });

  // Erreur affichée : mise à jour pendant la saisie (input) et au choix d'une tuile (change)
  for (const type of ['input', 'change']) {
    formulaire.addEventListener(type, (evenement) => {
      const cible = evenement.target as HTMLElement;
      const estTuile = cible instanceof HTMLInputElement && cible.type === 'radio';
      const id = estTuile ? 'contact-type' : cible.id;
      const enErreur = estTuile ? groupe?.hasAttribute('data-erreur') : cible.hasAttribute('aria-invalid');
      if (regles[id] && enErreur) verifier(id);
    });
  }

  formulaire.addEventListener('submit', (evenement) => {
    evenement.preventDefault();

    // Entrée dans un champ avant la dernière étape : même effet que « Continuer »
    if (courante < etapes.length - 1) {
      if (verifierEtape(courante)) afficher(courante + 1);
      return;
    }

    // Dernière étape : tout est revérifié (une étape précédente a pu être vidée après un retour)
    for (let index = 0; index < etapes.length; index += 1) {
      if (!champsDe(etapes[index]).every((id) => verifier(id))) {
        afficher(index, false);
        verifierEtape(index);
        return;
      }
    }

    // Aucun envoi ni stockage : formulaire vidé, retour à la première étape, message de démo annoncé.
    formulaire.reset();
    afficher(0, false);
    if (statut) {
      statut.textContent = MESSAGE_DEMO;
      statut.focus();
    }
  });
}
