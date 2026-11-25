/*
 * Prestations, carrousel du mobile : les cartes défilent au doigt (défilement natif, aimanté) ;
 * flèches et numéros font défiler jusqu'à une carte, la carte visible est repérée au défilement.
 * Rien ne défile tout seul. En bureau, la liste est un tableau et les commandes restent masquées.
 */

export {};

const comparatif = document.querySelector<HTMLElement>('.comparatif');
const liste = comparatif?.querySelector<HTMLElement>('.comparatif__liste');
const navigation = comparatif?.querySelector<HTMLElement>('.comparatif__navigation');

if (comparatif && liste && navigation) {
  const cartes = Array.from(liste.querySelectorAll<HTMLElement>('.carte-prestation'));
  const numeros = Array.from(navigation.querySelectorAll<HTMLButtonElement>('.comparatif__numero'));
  const [precedente, suivante] = Array.from(navigation.querySelectorAll<HTMLButtonElement>('.comparatif__fleche'));
  const mobile = window.matchMedia('(max-width: 899.98px)');
  const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)');
  let actuelle = 0;

  const marquer = (index: number) => {
    actuelle = index;
    numeros.forEach((numero, n) => {
      if (n === index) numero.setAttribute('aria-current', 'true');
      else numero.removeAttribute('aria-current');
    });
    precedente.disabled = index === 0;
    suivante.disabled = index === cartes.length - 1;
  };

  const aller = (index: number) => {
    const cible = Math.max(0, Math.min(cartes.length - 1, index));
    const decalage = cartes[cible].offsetLeft - cartes[0].offsetLeft;
    liste.scrollTo({ left: decalage, behavior: mouvementReduit.matches ? 'auto' : 'smooth' });
    marquer(cible);
  };

  // Carte visible : celle dont le bord gauche est le plus proche du début de la liste
  let attente = 0;
  liste.addEventListener('scroll', () => {
    cancelAnimationFrame(attente);
    attente = requestAnimationFrame(() => {
      const origine = cartes[0].offsetLeft;
      const proche = cartes.reduce(
        (meilleure, carte, index) =>
          Math.abs(carte.offsetLeft - origine - liste.scrollLeft) <
          Math.abs(cartes[meilleure].offsetLeft - origine - liste.scrollLeft)
            ? index
            : meilleure,
        0,
      );
      if (proche !== actuelle) marquer(proche);
    });
  });

  precedente.addEventListener('click', () => aller(actuelle - 1));
  suivante.addEventListener('click', () => aller(actuelle + 1));
  numeros.forEach((numero, index) => numero.addEventListener('click', () => aller(index)));

  // Commandes affichées en mobile seulement ; liste atteignable au clavier quand elle défile
  const adapter = () => {
    navigation.hidden = !mobile.matches;
    if (mobile.matches) {
      liste.tabIndex = 0;
      liste.setAttribute('aria-labelledby', 'titre-comparatif');
    } else {
      liste.removeAttribute('tabindex');
      liste.removeAttribute('aria-labelledby');
    }
  };
  mobile.addEventListener('change', adapter);
  adapter();
  marquer(0);
}
