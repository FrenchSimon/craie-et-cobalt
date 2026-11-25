/*
 * Réalisations : galerie filtrable et fiches en panneau latéral (<dialog> modal).
 * - Filtres en aria-pressed, nombre de projets affichés annoncé (aria-live).
 * - Fiche : focus piégé et Échap fournis par le <dialog> natif ; clic sur le fond pour fermer ;
 *   focus rendu au bouton de la carte ; précédent et suivant parmi les projets affichés.
 * - L'adresse suit la fiche ouverte (/realisations#canut), et l'ouvre au chargement.
 * - Mobile : photos de la fiche en carrousel (flèches, numéros, glisser), jamais automatique.
 */

export {};

const galerie = document.querySelector<HTMLElement>('.galerie');

if (galerie) {
  const projets = Array.from(galerie.querySelectorAll<HTMLLIElement>('.galerie__projet'));
  const zoneFiltres = galerie.querySelector<HTMLElement>('.galerie__filtres');
  const filtres = Array.from(galerie.querySelectorAll<HTMLButtonElement>('[data-filtre]'));
  const annonce = galerie.querySelector<HTMLElement>('.galerie__annonce');
  const deuxChiffres = (nombre: number) => String(nombre).padStart(2, '0');

  const visibles = () => projets.filter((projet) => !projet.hidden);
  const ficheDe = (projet: HTMLLIElement) => projet.querySelector<HTMLDialogElement>('dialog.fiche')!;
  const boutonDe = (projet: HTMLLIElement) => projet.querySelector<HTMLButtonElement>('[data-ouvre]')!;

  // Adresse de la page sans fiche, pour la rétablir à la fermeture
  const adresseSansFiche = () => location.pathname + location.search;

  /* Carrousel des photos (mobile seulement : en bureau, le CSS montre toutes les photos) */
  const preparerCarrousel = (fiche: HTMLDialogElement) => {
    const images = Array.from(fiche.querySelectorAll<HTMLElement>('.fiche__image'));
    const carrousel = fiche.querySelector<HTMLElement>('.fiche__carrousel');
    if (!carrousel || images.length < 2) return () => {};

    const numeros = Array.from(carrousel.querySelectorAll<HTMLButtonElement>('.fiche__numero'));
    const compteur = carrousel.querySelector<HTMLElement>('.fiche__compteur')!;
    let actuelle = 0;

    const afficher = (index: number) => {
      actuelle = (index + images.length) % images.length;
      images.forEach((image, n) => image.classList.toggle('fiche__image--actuelle', n === actuelle));
      numeros.forEach((numero, n) => {
        if (n === actuelle) numero.setAttribute('aria-current', 'true');
        else numero.removeAttribute('aria-current');
      });
      const texte = `Photo ${actuelle + 1} sur ${images.length}`;
      if (compteur.textContent !== texte) compteur.textContent = texte;
    };

    carrousel.querySelectorAll<HTMLButtonElement>('[data-photo]').forEach((fleche) => {
      fleche.addEventListener('click', () => afficher(actuelle + Number(fleche.dataset.photo)));
    });
    numeros.forEach((numero, index) => numero.addEventListener('click', () => afficher(index)));

    // Glisser d'au moins 40 px sur la photo : photo suivante ou précédente
    const zone = fiche.querySelector<HTMLElement>('.fiche__images')!;
    let depart: number | null = null;
    zone.addEventListener('dragstart', (evenement) => evenement.preventDefault());
    zone.addEventListener('pointerdown', (evenement) => {
      depart = evenement.clientX;
    });
    zone.addEventListener('pointerup', (evenement) => {
      if (depart === null) return;
      const ecart = evenement.clientX - depart;
      if (Math.abs(ecart) > 40) afficher(actuelle + (ecart < 0 ? 1 : -1));
      depart = null;
    });
    zone.addEventListener('pointercancel', () => {
      depart = null;
    });

    return () => afficher(0);
  };

  // Remise du carrousel à la première photo, par fiche
  const remises = new Map<HTMLDialogElement, () => void>();

  const ouvrir = (projet: HTMLLIElement) => {
    const fiche = ficheDe(projet);
    remises.get(fiche)?.();
    fiche.querySelector<HTMLElement>('.fiche__corps')!.scrollTop = 0;
    fiche.showModal();
    // Focus sur le bouton fermer, premier élément de la fiche
    fiche.querySelector<HTMLButtonElement>('.fiche__fermer')!.focus();
    history.replaceState(null, '', `#${projet.id}`);
  };

  projets.forEach((projet) => {
    const fiche = ficheDe(projet);
    remises.set(fiche, preparerCarrousel(fiche));

    boutonDe(projet).addEventListener('click', () => ouvrir(projet));
    fiche.querySelector('.fiche__fermer')!.addEventListener('click', () => fiche.close());

    // Clic sur le fond assombri (hors du panneau) : la cible est alors le <dialog> lui-même
    fiche.addEventListener('click', (evenement) => {
      if (evenement.target === fiche) fiche.close();
    });

    // Projet précédent ou suivant parmi ceux que le filtre affiche
    fiche.querySelectorAll<HTMLButtonElement>('[data-sens]').forEach((bouton) => {
      bouton.addEventListener('click', () => {
        const liste = visibles();
        const voisin = liste[(liste.indexOf(projet) + Number(bouton.dataset.sens) + liste.length) % liste.length];
        fiche.close();
        ouvrir(voisin);
      });
    });

    // Fermeture définitive (aucune autre fiche ouverte) : focus sur le bouton de la carte du
    // dernier projet consulté, adresse sans fiche
    fiche.addEventListener('close', () => {
      if (galerie.querySelector('dialog.fiche[open]')) return;
      boutonDe(projet).focus();
      history.replaceState(null, '', adresseSansFiche());
    });
  });

  /* Repère « Projet 01 sur 06 » et navigation, recalculés selon les projets affichés */
  const numeroter = () => {
    const liste = visibles();
    liste.forEach((projet, index) => {
      const fiche = ficheDe(projet);
      fiche.querySelector('.fiche__repere')!.textContent = `Projet ${deuxChiffres(index + 1)} sur ${deuxChiffres(liste.length)}`;
      fiche.querySelector<HTMLElement>('.fiche__navigation')!.hidden = liste.length < 2;
    });
  };

  filtres.forEach((bouton) => {
    bouton.addEventListener('click', () => {
      const valeur = bouton.dataset.filtre;
      filtres.forEach((filtre) => filtre.setAttribute('aria-pressed', String(filtre === bouton)));
      projets.forEach((projet) => {
        projet.hidden = valeur !== 'tous' && projet.dataset.categorie !== valeur;
      });
      numeroter();
      const nombre = visibles().length;
      if (annonce) annonce.textContent = `${nombre} ${nombre > 1 ? 'projets affichés' : 'projet affiché'}`;
    });
  });

  if (zoneFiltres) zoneFiltres.hidden = false;

  // Ouverture directe par l'adresse (/realisations#canut), depuis les cartes de l'accueil,
  // au chargement ou quand seule l'ancre change
  const ouvrirSelonAdresse = () => {
    const cible = projets.find((projet) => `#${projet.id}` === location.hash && !projet.hidden);
    if (cible && !galerie.querySelector('dialog.fiche[open]')) ouvrir(cible);
  };
  window.addEventListener('hashchange', ouvrirSelonAdresse);
  ouvrirSelonAdresse();
}
