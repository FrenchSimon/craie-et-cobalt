/* Menu mobile (sous 900 px) : le bouton déroule la navigation sous l'en-tête, Échap la referme.
   Module ES (export vide) : ses constantes ne sont pas globales. */

export {};

const bouton = document.querySelector<HTMLButtonElement>('.en-tete__bouton-menu');
const menu = document.getElementById('menu');
const bureau = window.matchMedia('(min-width: 900px)');

function basculer(ouvrir: boolean) {
  if (!bouton || !menu) return;
  bouton.setAttribute('aria-expanded', String(ouvrir));
  bouton.setAttribute('aria-label', ouvrir ? 'Fermer le menu' : 'Ouvrir le menu');
  menu.classList.toggle('menu--ouvert', ouvrir);
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
