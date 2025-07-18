// ✅ Interface pour le fichier 3D
interface Fichier3D {
  nomFichier: string;
  format: string;
  tailleFichier: string;
  dateCreation: string;
}

// ✅ Interface pour le matériau
interface Materiau {
  nom: string;
  type: string;
  couleur: string;
  prixParGramme: string;
}

// Ajout des types pour pricing
export interface PricingAnalyse {
  materiauNom: string;
  prixParGramme: number;
  volume: number;
  tauxRemplissage: number;
  necessiteSupports: boolean;
  poidsMatiere: number;
}

export interface PricingBreakdown {
  coutMatiere: number;
  coutSupports: number;
  coutElectricite: number;
  coutUsureMachine: number;
  coutTotalMatiere: number;
  coutExpedition: number;
  expeditionDetails: {
    coutBase: number;
    assurance: number;
    suivi: number;
    methodeExpedition: string;
    destination: string;
    poids: number;
    facteurInternational: number;
  };
  coutBase: number;
  margeImprimeur: number;
  margePlateforme: number;
  prixHT: number;
  tva: number;
  prixTTC: number;
}

export interface Pricing {
  coutMateriau: number;
  coutExpedition: number;
  prixHT: number;
  prixTTC: number;
  analyse: PricingAnalyse;
  breakdown: PricingBreakdown;
}

// ✅ Interface principale pour le modèle 3D client
export interface Modele3DClient {
  id: number;
  fichier3dId: number;
  materiauId: number;
  utilisateurId: number;
  nom: string;
  description: string;
  volume: string;
  poidsMatiere: string;
  longueur: string;
  largeur: string;
  hauteur: string;
  estImprimable: boolean;
  surfaceExterne: string;
  tauxRemplissage: number;
  necessiteSupports: boolean;
  coutMateriau: string;
  coutExpedition: string;
  coutMain: string | null;
  taille: string;
  prix: string;
  statut: string;
  commentaire: string | null;
  dateValidation: string | null;
  dateCreation: string;
  dateModification: string;
  estVerifie: boolean | string;
  commentaireVerification: string | null;
  dateVerification: string | null;
  fichier3D: Fichier3D;
  materiau: Materiau;
  // Ajout du pricing
  pricing?: Pricing;
}

// ✅ Interface pour la pagination
interface Pagination {
  limit: number;
  offset: number;
  total: number;
}

// ✅ Interface pour la réponse du serveur
export interface FileClientListResponse {
  success: boolean;
  data: Modele3DClient[];
  total: number;
  pagination: Pagination;
  message?: string;
}

// ✅ Interface pour l'upload
export interface FileClientUploadProps {
  onUploadSuccess?: (response: FileClientListResponse) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
  acceptedFormats?: string[];
  maxSizeMB?: number;
}

// ✅ Interface pour la réponse de suppression
export interface FileClientDeleteResponse {
  success: boolean;
  message?: string;
}