// À passer tel quel à mcp__playwright__browser_evaluate (paramètre « function »).
// Renvoie les défauts de mise en page visibles à la largeur courante.
// « largeur » doit valoir la largeur demandée : sinon le redimensionnement n'a pas pris (voir SKILL.md).
() => {
  const largeur = document.documentElement.clientWidth;
  const visible = (el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return s.visibility !== 'hidden' && s.display !== 'none' && r.width > 0 && r.height > 0;
  };
  const nom = (el) =>
    `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''} « ${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40)} »`;
  // Dans un conteneur qui défile ou rogne (carrousel) : dépasser l'écran y est normal.
  const dansUnDefilement = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      if (getComputedStyle(p).overflowX !== 'visible') return true;
    }
    return false;
  };

  // 1. Débordement horizontal de la page et éléments qui dépassent à droite.
  const debordement = document.documentElement.scrollWidth - largeur;
  const depassent = [...document.body.querySelectorAll('*')]
    .filter((el) => visible(el) && el.getBoundingClientRect().right > largeur + 1)
    .filter((el) => !el.closest('[aria-hidden="true"], dialog:not([open])'))
    .filter((el) => !dansUnDefilement(el))
    .slice(0, 10)
    .map((el) => `${nom(el)} : ${Math.round(el.getBoundingClientRect().right - largeur)} px`);

  // 2. Cibles cliquables de moins de 24 × 24 px (WCAG 2.2, critère 2.5.8). Exception « en ligne » :
  // seulement un lien pris dans une phrase (paragraphe, ou élément de liste qui a du texte autour).
  // L'exception d'espacement (cercle de 24 px sans autre cible) se vérifie à la main sur la capture.
  const dansUnePhrase = (el) => {
    if (el.tagName !== 'A' || getComputedStyle(el).display !== 'inline') return false;
    const bloc = el.closest('p, li');
    return !!bloc && (bloc.tagName === 'P' || bloc.textContent.trim() !== el.textContent.trim());
  };
  const petites = [...document.querySelectorAll('a[href], button, input, select, textarea, summary, [role="button"], [tabindex]:not([tabindex="-1"])')]
    .filter(visible)
    .filter((el) => !dansUnePhrase(el))
    .map((el) => [el, el.getBoundingClientRect()])
    .filter(([, r]) => r.width < 24 || r.height < 24)
    .slice(0, 15)
    .map(([el, r]) => `${nom(el)} : ${Math.round(r.width)} × ${Math.round(r.height)} px`);

  // 3. Images sans dimensions réservées (risque de CLS) ou plus larges que l'écran.
  const images = [...document.images]
    .filter(
      (img) =>
        visible(img) &&
        (!img.getAttribute('width') || !img.getAttribute('height') || img.getBoundingClientRect().width > largeur + 1),
    )
    .map((img) => (img.currentSrc || img.getAttribute('src') || '?').split('/').pop());

  return { largeur, debordement: debordement > 0 ? `${debordement} px` : 'aucun', depassent, petites, images };
}
