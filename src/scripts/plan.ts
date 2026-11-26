/*
 * Plan d'accès (Contact) : l'aperçu ouvre le grand plan dans une fenêtre (<dialog> modal).
 * - Focus piégé et Échap fournis par le <dialog> natif ; clic sur le fond pour fermer ;
 *   focus rendu au lien de l'aperçu.
 * - Sur petit écran, le grand plan défile : il s'ouvre centré sur le repère du studio.
 * - Sans JavaScript, le lien ouvre le grand plan seul (fichier SVG).
 */

export {};

const ouvrir = document.querySelector<HTMLAnchorElement>('[data-plan-ouvrir]');
const fenetre = document.querySelector<HTMLDialogElement>('[data-plan-grand]');

if (ouvrir && fenetre) {
  const cadre = fenetre.querySelector<HTMLElement>('[data-plan-cadre]')!;
  const image = cadre.querySelector('img')!;
  const fermer = fenetre.querySelector<HTMLButtonElement>('[data-plan-fermer]')!;

  /* Centre la zone visible sur le studio, un peu à sa droite pour montrer son nom et celui du métro
     (sans effet quand le plan tient dans la fenêtre) */
  const centrer = () => {
    const x = Number(fenetre.dataset.repereX) * cadre.scrollWidth + Math.min(40, cadre.clientWidth / 4);
    const y = Number(fenetre.dataset.repereY) * cadre.scrollHeight;
    cadre.scrollTo(x - cadre.clientWidth / 2, y - cadre.clientHeight / 2);
  };

  ouvrir.addEventListener('click', (evenement) => {
    evenement.preventDefault();
    fenetre.showModal();
    fermer.focus();
    // L'image est différée : elle se charge à l'ouverture ; ses dimensions sont réservées, mais on recentre une fois chargée
    centrer();
    if (!image.complete) image.addEventListener('load', centrer, { once: true });
  });

  fermer.addEventListener('click', () => fenetre.close());

  // Clic sur le fond assombri (hors de la fenêtre) : la cible est alors le <dialog> lui-même
  fenetre.addEventListener('click', (evenement) => {
    if (evenement.target === fenetre) fenetre.close();
  });

  fenetre.addEventListener('close', () => ouvrir.focus());
}
