/*
 * Démarche de l'accueil : onglets (motif « Tabs » de l'APG du W3C, activation automatique).
 * Flèches du clavier, Début et Fin entre les onglets ; en mobile, flèches à l'écran et glisser
 * sur le croquis. Rien ne défile tout seul.
 */

export {};

const demarche = document.querySelector<HTMLElement>('.demarche');

if (demarche) {
  const liste = demarche.querySelector<HTMLElement>('[role="tablist"]');
  const onglets = Array.from(demarche.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const legendeNom = demarche.querySelector('.demarche__legende .demarche__nom');
  const legendeTexte = demarche.querySelector('.demarche__legende .demarche__texte');
  const croquis = demarche.querySelector<HTMLElement>('.demarche__croquis');
  const bureau = window.matchMedia('(min-width: 900px)');
  let actuel = 0;

  const choisir = (index: number, focus = false) => {
    actuel = (index + onglets.length) % onglets.length;
    onglets.forEach((onglet, n) => {
      const actif = n === actuel;
      onglet.setAttribute('aria-selected', String(actif));
      onglet.tabIndex = actif ? 0 : -1;
      const panneau = document.getElementById(onglet.getAttribute('aria-controls') ?? '');
      if (panneau) panneau.hidden = !actif;
    });

    // Légende du mobile : copie du nom et du texte de l'onglet actif
    const onglet = onglets[actuel];
    if (legendeNom) legendeNom.textContent = onglet.querySelector('.demarche__nom')?.textContent ?? '';
    if (legendeTexte) legendeTexte.textContent = onglet.querySelector('.demarche__texte')?.textContent ?? '';
    if (focus) onglet.focus();
  };

  const touches: Record<string, (index: number) => number> = {
    ArrowDown: (index) => index + 1,
    ArrowRight: (index) => index + 1,
    ArrowUp: (index) => index - 1,
    ArrowLeft: (index) => index - 1,
    Home: () => 0,
    End: () => onglets.length - 1,
  };

  onglets.forEach((onglet, index) => {
    onglet.addEventListener('click', () => choisir(index));
    onglet.addEventListener('keydown', (evenement) => {
      const cible = touches[evenement.key];
      if (!cible) return;
      evenement.preventDefault();
      choisir(cible(index), true);
    });
  });

  demarche.querySelectorAll<HTMLButtonElement>('.demarche__fleche').forEach((fleche) => {
    fleche.addEventListener('click', () => choisir(actuel + Number(fleche.dataset.sens)));
  });

  // Glisser d'au moins 40 px sur le croquis : étape suivante ou précédente
  let depart: number | null = null;
  croquis?.addEventListener('pointerdown', (evenement) => {
    depart = evenement.clientX;
  });
  croquis?.addEventListener('pointerup', (evenement) => {
    if (depart === null) return;
    const ecart = evenement.clientX - depart;
    if (Math.abs(ecart) > 40) choisir(actuel + (ecart < 0 ? 1 : -1));
    depart = null;
  });
  croquis?.addEventListener('pointercancel', () => {
    depart = null;
  });

  // Croquis masqués : chargés dès que le premier l'est (section atteinte), pour qu'un changement
  // d'étape ne montre jamais de blanc. Un croquis masqué et différé ne se chargerait qu'une fois affiché.
  const images = Array.from(demarche.querySelectorAll<HTMLImageElement>('.demarche__panneau img'));
  const precharger = () => images.forEach((image) => (image.loading = 'eager'));
  if (images[0]?.complete && images[0].naturalWidth > 0) precharger();
  else images[0]?.addEventListener('load', precharger, { once: true });

  // Onglets verticaux en bureau, en ligne dans le carrousel du mobile
  const orienter = () => liste?.setAttribute('aria-orientation', bureau.matches ? 'vertical' : 'horizontal');
  bureau.addEventListener('change', orienter);
  orienter();
}
