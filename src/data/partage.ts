import { getImage } from 'astro:assets';
import photo from '../assets/photos/canut-1-accroche.jpg';

/** Image de partage (Open Graph et JSON-LD) : la cuisine de l'appartement canut, premier projet,
    recadrée au format conseillé (1,91:1), en JPEG, le seul format lu par tous les réseaux et messageries. */
export const imagePartage = await getImage({
  src: photo,
  width: 1200,
  height: 630,
  fit: 'cover',
  position: 'center',
  format: 'jpg',
  quality: 80,
});

/** Texte alternatif de la photo, repris de la fiche du projet. */
export const altPartage = 'Cuisine blanche ouverte sous la mezzanine, sous de hauts plafonds';
