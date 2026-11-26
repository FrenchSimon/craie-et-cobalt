// À passer tel quel à mcp__playwright__browser_evaluate (paramètre « function »).
// Renvoie les défauts de mise en page visibles à la largeur courante.
() => {
  const largeur = document.documentElement.clientWidth;
  const visible = (el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return s.visibility !== 'hidden' && s.display !== 'none' && r.width > 0 && r.height > 0;
  };
  const nom = (el) =>
    `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''} « ${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40)} »`;

  // 1. Débordement horizontal de la page et éléments qui dépassent à droite.
  const debordement = document.documentElement.scrollWidth - largeur;
  const depassent = [...document.body.querySelectorAll('*')]
    .filter((el) => visible(el) && el.getBoundingClientRect().right > largeur + 1)
    .filter((el) => !el.closest('[aria-hidden="true"], dialog:not([open])'))
    .filter((el) => getComputedStyle(el.parentElement).overflowX === 'visible')
    .slice(0, 10)
    .map((el) => `${nom(el)} : ${Math.round(el.getBoundingClientRect().right - largeur)} px`);

  // 2. Cibles cliquables de moins de 24 × 24 px (WCAG 2.2, critère 2.5.8), hors liens dans un texte courant.
  const petites = [...document.querySelectorAll('a[href], button, input, select, textarea, summary, [role="button"], [tabindex]:not([tabindex="-1"])')]
    .filter(visible)
    .filter((el) => !(el.tagName === 'A' && el.closest('p, li') && getComputedStyle(el).display === 'inline'))
    .map((el) => [el, el.getBoundingClientRect()])
    .filter(([, r]) => r.width < 24 || r.height < 24)
    .slice(0, 15)
    .map(([el, r]) => `${nom(el)} : ${Math.round(r.width)} × ${Math.round(r.height)} px`);

  // 3. Images sans dimensions réservées (risque de CLS) ou plus larges que l'écran.
  const images = [...document.images]
    .filter((img) => visible(img) && (!img.getAttribute('width') || img.getBoundingClientRect().width > largeur + 1))
    .map((img) => img.currentSrc.split('/').pop());

  return { largeur, debordement: debordement > 0 ? `${debordement} px` : 'aucun', depassent, petites, images };
}
