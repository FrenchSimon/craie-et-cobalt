/* Menu principal, écrit une seule fois : en-tête, et plus tard plan du site et sitemap. */

export interface Lien {
  href: string;
  texte: string;
}

export const menu: Lien[] = [
  { href: '/prestations', texte: 'Prestations' },
  { href: '/realisations', texte: 'Réalisations' },
  { href: '/studio', texte: 'Le studio' },
];

export const contact: Lien = { href: '/contact', texte: 'Parlons de votre projet' };

/** Chemin sans barre finale ni extension, pour comparer l'adresse courante aux liens du menu. */
export function cheminNormalise(chemin: string): string {
  const sansExtension = chemin.replace(/\.html$/, '').replace(/\/index$/, '/');
  return sansExtension.length > 1 ? sansExtension.replace(/\/$/, '') : '/';
}
