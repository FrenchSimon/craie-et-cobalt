/* Menu mobile (sous 900 px) : le bouton ouvre la navigation en plein écran, bandeau démo compris,
   Échap la referme. Pendant l'ouverture, le reste de la page est inerte (ni focus ni lecture).
   Module ES (export vide) : ses constantes ne sont pas globales. */

export {};

const bouton = document.querySelector<HTMLButtonElement>('.en-tete__bouton-menu');
const menu = document.getElementById('menu');
const enTete = document.querySelector<HTMLElement>('.en-tete');
const horsMenu = document.querySelectorAll<HTMLElement>('main, footer');
const bureau = window.matchMedia('(min-width: 900px)');

function basculer(ouvrir: boolean) {
  if (!bouton || !menu) return;
  bouton.setAttribute('aria-expanded', String(ouvrir));
  bouton.setAttribute('aria-label', ouvrir ? 'Fermer le menu' : 'Ouvrir le menu');
  menu.classList.toggle('menu--ouvert', ouvrir);
  enTete?.classList.toggle('en-tete--menu-ouvert', ouvrir);
  horsMenu.forEach((element) => (element.inert = ouvrir));
}

if (bouton && menu) {
  bouton.addEventListener('click', () => {
    basculer(bouton.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', (evenement) => {
    if (evenement.key === 'Escape' && menu.classList.contains('menu--ouvert')) {
      basculer(false);
      bouton.focus();
    }
  });

  // Passage en bureau : le menu redevient une ligne, l'état mobile est remis à zéro.
  bureau.addEventListener('change', () => {
    if (bureau.matches) basculer(false);
  });
}
