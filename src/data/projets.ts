/*
 * Les 6 réalisations fictives (docs/textes.md, § 3), écrites une seule fois :
 * accueil (3 réalisations phares), page Réalisations (grille, filtres, fiches) et plan du site.
 */

import type { ImageMetadata } from 'astro';
import canutCuisine from '../assets/photos/canut-1-accroche.jpg';
import canutMezzanine from '../assets/photos/canut-2-mezzanine.jpg';
import haussmannien from '../assets/photos/haussmannien-1.jpg';
import maisonCuisine from '../assets/photos/maison-1-cuisine.jpg';
import maisonVerriere from '../assets/photos/maison-2-verriere.jpg';
import studioSejour from '../assets/photos/studio-1-sejour.jpg';
import studioCuisine from '../assets/photos/studio-2-cuisine.jpg';
import studioNuit from '../assets/photos/studio-3-nuit.jpg';
import boutique from '../assets/photos/boutique-1.jpg';
import bureaux from '../assets/photos/bureaux-1.jpg';

export type Categorie = 'Particuliers' | 'Professionnels';

export interface PhotoProjet {
  src: ImageMetadata;
  alt: string;
}

export interface Projet {
  /** Ancre de la fiche : /realisations#<id> */
  id: string;
  categorie: Categorie;
  titre: string;
  lieu: string;
  surface: string;
  duree: string;
  budget: string;
  texte: string;
  photos: PhotoProjet[];
  /** Carte de l'accueil : titre et lieu courts (docs/textes.md, § 1). */
  phare?: { titre: string; lieu: string };
}

export const projets: Projet[] = [
  {
    id: 'canut',
    categorie: 'Particuliers',
    titre: 'Appartement canut',
    lieu: 'Croix-Rousse, Lyon 4e',
    surface: '95 m²',
    duree: '4 mois',
    budget: '110 000 €',
    texte:
      'Plafonds de 4 mètres, mezzanine d\'origine et poutres conservées. Une cuisine ouverte sous la mezzanine, une chambre suspendue au-dessus, et la lumière des grandes fenêtres jusqu\'au fond de l\'appartement.',
    photos: [
      { src: canutCuisine, alt: 'Cuisine blanche ouverte sous la mezzanine, sous de hauts plafonds' },
      { src: canutMezzanine, alt: 'Séjour sous la chambre en mezzanine, éclairé par une fenêtre cintrée' },
    ],
    phare: { titre: 'Appartement canut', lieu: 'Croix-Rousse' },
  },
  {
    id: 'haussmannien',
    categorie: 'Particuliers',
    titre: 'Haussmannien, Ainay',
    lieu: 'Lyon 2e',
    surface: '140 m²',
    duree: '5 mois',
    budget: '160 000 €',
    texte:
      'Moulures et parquet en point de Hongrie restaurés, salle de bains repensée dans une ancienne lingerie, et une enfilade de pièces rendue à sa lumière.',
    photos: [{ src: haussmannien, alt: 'Salle à manger aux moulures restaurées et au parquet en point de Hongrie' }],
    phare: { titre: 'Haussmannien, Ainay', lieu: 'Ainay' },
  },
  {
    id: 'maison',
    categorie: 'Particuliers',
    titre: 'Maison des années 30',
    lieu: 'Caluire-et-Cuire',
    surface: '60 m² rénovés',
    duree: '3 mois',
    budget: '75 000 €',
    texte:
      'Une cloison abattue entre la cuisine et le séjour, un îlot en chêne, et une verrière d\'atelier qui ouvre sur le jardin.',
    photos: [
      { src: maisonCuisine, alt: 'Cuisine ouverte sur le séjour, îlot en bois clair' },
      { src: maisonVerriere, alt: 'Verrière d\'atelier à cadre noir' },
    ],
  },
  {
    id: 'studio',
    categorie: 'Particuliers',
    titre: 'Studio locatif',
    lieu: 'Guillotière, Lyon 7e',
    surface: '28 m²',
    duree: '6 semaines',
    budget: '32 000 €',
    texte:
      'Chaque centimètre compte : lit escamotable, cuisine en linéaire, rangements du sol au plafond. Loué en dix jours.',
    photos: [
      { src: studioSejour, alt: 'Pièce de vie blanche, îlot gris et vases bleu cobalt' },
      { src: studioCuisine, alt: 'Cuisine en linéaire grise et tabourets orange' },
      { src: studioNuit, alt: 'Coin nuit, deux cercles bleus au mur' },
    ],
  },
  {
    id: 'boutique',
    categorie: 'Professionnels',
    titre: 'Boutique de prêt-à-porter',
    lieu: 'Lyon 2e',
    surface: '70 m²',
    duree: '5 semaines',
    budget: '48 000 €',
    texte:
      'Un parcours client en boucle, des cabines plus grandes, et un comptoir en terrazzo qui est devenu la signature du lieu. Travaux réalisés en août, boutique fermée deux semaines seulement.',
    photos: [{ src: boutique, alt: 'Boutique blanche, étagères flottantes et portant de tee-shirts écrus' }],
  },
  {
    id: 'bureaux',
    categorie: 'Professionnels',
    titre: 'Bureaux d\'un cabinet de conseil',
    lieu: 'Part-Dieu, Lyon 3e',
    surface: '220 m²',
    duree: '2 mois',
    budget: '140 000 €',
    texte:
      'Plateau ouvert, quatre salles de réunion vitrées, cabines téléphoniques et une cuisine où l\'équipe a envie de déjeuner.',
    photos: [{ src: bureaux, alt: 'Salles de réunion vitrées encadrées de chêne' }],
    phare: { titre: 'Bureaux, Part-Dieu', lieu: 'Part-Dieu' },
  },
];

/** Les 3 réalisations phares de l'accueil, dans l'ordre du tableau. */
export const phares = projets.filter((projet) => projet.phare);
