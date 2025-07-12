// src/types/signalement.ts

/**
 * Les types de signalement possibles côté front
 */
export enum TypeSignalement {
  FICHIER_ENDOMMAGE = 'fichierEndommage',
  ILLEGALE          = 'illégale',
  PROBLEMATIQUE     = 'problématique',
}

/**
 * Type utilitaire pour faciliter l’usage dans les formulaires
 */
export const signalementOptions: { label: string; value: TypeSignalement }[] = [
  { label: 'Fichier endommagé',    value: TypeSignalement.FICHIER_ENDOMMAGE },
  { label: 'Contenu illégal',      value: TypeSignalement.ILLEGALE },
  { label: 'Problématique',        value: TypeSignalement.PROBLEMATIQUE },
];
