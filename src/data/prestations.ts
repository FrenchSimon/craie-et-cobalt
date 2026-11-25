/*
 * Les 4 prestations, écrites une seule fois (docs/textes.md) : version courte pour l'accueil,
 * détail (pour qui, inclus, honoraires) pour la page Prestations.
 */

export type NomPicto = 'visite' | 'conception' | 'chantier' | 'pro';

export interface Prestation {
  /** Ancre de la prestation sur la page Prestations. */
  id: string;
  picto: NomPicto;
  titre: string;
  /** Accueil : texte et tarif courts. */
  texte: string;
  tarif: string;
  /** Page Prestations : détail. */
  pourQui: string;
  inclus: string[];
  /** « Prix » pour la visite-conseil, « Honoraires » pour les autres. */
  intituleHonoraires: 'Prix' | 'Honoraires';
  /** Montant mis en avant (chiffre clé), suivi du reste de la phrase. */
  montant?: string;
  honoraires: string;
}

export const prestations: Prestation[] = [
  {
    id: 'visite-conseil',
    picto: 'visite',
    titre: 'Visite-conseil',
    texte: 'Deux heures chez vous pour poser les bonnes questions et repartir avec des pistes concrètes.',
    tarif: '250 €',
    pourQui: 'vous hésitez, vous voulez un regard extérieur avant de vous lancer.',
    inclus: [
      '2 heures sur place',
      'analyse des volumes, de la lumière et des circulations',
      "pistes d'aménagement, de couleurs et de matériaux",
      'compte rendu écrit sous une semaine.',
    ],
    intituleHonoraires: 'Prix',
    montant: '250 €',
    honoraires: '— déduits si vous confiez ensuite la conception au studio.',
  },
  {
    id: 'conception-complete',
    picto: 'conception',
    titre: 'Conception complète',
    texte: 'Plans, vues 3D, matériaux et mobilier : votre projet dessiné dans le moindre détail.',
    tarif: 'Forfait selon la surface',
    pourQui: "rénovation d'un appartement ou d'une maison, d'une pièce à l'ensemble du logement.",
    inclus: [
      'relevé des lieux',
      'esquisses',
      'plans détaillés et vues 3D',
      'choix des matériaux, des luminaires et du mobilier',
      'dossier de consultation des artisans',
      "deux séries d'ajustements.",
    ],
    intituleHonoraires: 'Honoraires',
    honoraires: 'forfait fixé selon la surface et la complexité du projet, annoncé dans le devis.',
  },
  {
    id: 'suivi-de-chantier',
    picto: 'chantier',
    titre: 'Suivi de chantier',
    texte: 'Les artisans coordonnés, le planning tenu, une seule interlocutrice.',
    tarif: 'Pourcentage des travaux',
    pourQui: "vous n'avez ni le temps ni l'envie de coordonner les travaux.",
    inclus: [
      'sélection des artisans partenaires et comparaison des devis',
      'planning',
      'visite de chantier chaque semaine',
      'suivi du budget',
      'réception des travaux et levée des réserves.',
    ],
    intituleHonoraires: 'Honoraires',
    honoraires: 'pourcentage du montant des travaux, annoncé dans le devis.',
  },
  {
    id: 'lieux-professionnels',
    picto: 'pro',
    titre: 'Lieux professionnels',
    texte: 'Boutiques, bureaux, restaurants : un espace qui sert votre activité et votre image.',
    tarif: 'Sur devis',
    pourQui: 'boutiques, cafés et restaurants, bureaux, cabinets.',
    inclus: [
      'étude de vos flux (clients, équipe, stock)',
      'conception à votre image',
      "respect des normes d'accessibilité des lieux recevant du public",
      'planning compatible avec votre activité.',
    ],
    intituleHonoraires: 'Honoraires',
    honoraires: 'sur devis.',
  },
];
