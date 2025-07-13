// src/services/filesClient.service.ts
import { baseService } from "./base.service";

// ✅ Interface pour la réponse backend (ce que le serveur envoie)
interface BackendFilesResponse {
  success: boolean;
  data: any[];           // ← Backend envoie "data"
  count: number;
  utilisateurId: number;
  message?: string;
}

// ✅ Interface pour les données d'upload - CORRIGÉE
export interface FileClientUploadData {
  fichier: File;           // ✅ CORRECTION : "fichier" au lieu de "file"
  scaling: number;
  description: string;
  materiauId: number;      // ✅ CORRECTION : "materiauId" au lieu de "idMatériau"
  nomPersonnalise?: string; // ✅ CORRECTION : "nomPersonnalise" au lieu de "nom"
  pays: string;
}

// ✅ Interface pour la réponse d'upload - CORRIGÉE
export interface FileClientUploadResponse {
  success: boolean;
  message: string;
  data: {
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
    estVerifie: boolean;
    commentaireVerification: string | null;
    dateVerification: string | null;
    fichier3D: {
      nomFichier: string;
      format: string;
      tailleFichier: string;
      dateCreation: string;
    };
    materiau: {
      nom: string;
      type: string;
      couleur: string;
      prixParGramme: string;
    };
  };
}

// ✅ Interface pour les données de fichier client - CORRIGÉE
export interface FileClientData {
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
  estVerifie: boolean;
  commentaireVerification: string | null;
  dateVerification: string | null;
  fichier3D?: {
    nomFichier: string;
    format: string;
    tailleFichier: string;
    dateCreation: string;
  };
  materiau?: {
    nom: string;
    type: string;
    couleur: string;
    prixParGramme: string;
  };
}

// ✅ Interface pour la réponse des fichiers
export interface FileClientListResponse {
  success: boolean;
  files: FileClientData[];
  count: number;
  message?: string;
}

// ✅ Interface pour les actions sur fichiers
export interface FileClientActionResponse {
  success: boolean;
  message: string;
  data?: any;
}

// ✅ Interface pour la mise à jour du statut
export interface UpdateFileClientVerificationData {
  estVerifie: boolean;
  commentaireVerification?: string;
}

export const filesClientService = {
  // ✅ CORRECTION : Upload avec les bons noms de champs
  async uploadFileClient(
    uploadData: FileClientUploadData,
    onProgress?: (progress: number) => void
  ): Promise<FileClientUploadResponse> {
    try {
      // // console.log('📤 Début upload fichier client vers /api/modele3DClient/upload:', {
      //   fileName: uploadData.fichier.name,
      //   fileSize: uploadData.fichier.size,
      //   scaling: uploadData.scaling,
      //   description: uploadData.description,
      //   materialId: uploadData.materiauId,
      //   customName: uploadData.nomPersonnalise,
      //   country: uploadData.pays
      // });

      // ✅ Créer le FormData avec les BONS noms de champs
      const formData = new FormData();
      formData.append('file', uploadData.fichier);
      formData.append('scaling', uploadData.scaling.toString()); // ✅ CORRECTION
      formData.append('description', uploadData.description);
      formData.append('materiauId', uploadData.materiauId.toString()); // ✅ CORRECTION
      formData.append('pays', uploadData.pays);
      
      // ✅ AJOUT : Nom personnalisé (optionnel)
      if (uploadData.nomPersonnalise && uploadData.nomPersonnalise.trim()) {
        formData.append('nomPersonnalise', uploadData.nomPersonnalise.trim()); // ✅ CORRECTION
      }

      // ✅ Debug du FormData complet
      // console.log('📋 Contenu du FormData:');
      for (const [key, value] of formData.entries()) {
        // console.log(`  ${key}:`, value);
      }

      // ✅ Utiliser la route correcte
      const response = await baseService.request<FileClientUploadResponse>(
        '/modele3DClient/upload', // ✅ CORRECTION : Route cohérente
        {
          method: 'POST',
          body: formData,
          headers: {
            // Ne pas définir Content-Type pour FormData (boundary automatique)
          }
        },
        onProgress
      );

      // console.log('✅ Upload réussi - Réponse complète:', response);
      
      // ✅ CORRECTION : Accès sécurisé aux données
      if (response.success && response.data) {
        // console.log('📊 Données du modèle créé:', {
        //   modeleId: response.data.id,
        //   nom: response.data.nom,
        //   materiau: response.data.materiau?.nom,
        //   taille: response.data.taille,
        //   statut: response.data.statut,
        //   prix: response.data.prix
        // });
      }

      return response;
      
    } catch (error: any) {
      console.error('❌ Erreur upload fichier client:', error);
      
      // ✅ Gestion spécifique des erreurs d'upload
      if (error.message.includes('401')) {
        throw new Error('Vous devez être connecté pour uploader un fichier');
      } else if (error.message.includes('413')) {
        throw new Error('Le fichier est trop volumineux');
      } else if (error.message.includes('415')) {
        throw new Error('Format de fichier non supporté');
      } else if (error.message.includes('400')) {
        throw new Error('Données d\'upload invalides');
      }
      
      throw error;
    }
  },

  // ✅ Récupérer tous les fichiers clients - CORRIGÉ
  async getFilesClient(showAll: boolean = false): Promise<FileClientListResponse> {
    try {
      // console.log('🔄 Récupération des fichiers client...');
      
      // ✅ Route avec paramètre showAll
      const endpoint = showAll ? '/modele3DClient?showAll=true' : '/modele3DClient/my-models';
      
      // ✅ Récupérer la réponse backend brute
      const backendResponse = await baseService.get<BackendFilesResponse>(endpoint);
      
      // console.log('📡 Réponse backend brute:', backendResponse);
      // console.log('🔍 backendResponse.success:', backendResponse.success);
      // console.log('🔍 backendResponse.data:', backendResponse.data);
      // console.log('🔍 Array.isArray(backendResponse.data):', Array.isArray(backendResponse.data));
      
      // ✅ Validation
      if (!backendResponse || !backendResponse.success) {
        throw new Error('Réponse invalide du serveur');
      }
      
      if (!Array.isArray(backendResponse.data)) {
        throw new Error('Format de données invalide - data n\'est pas un tableau');
      }
      
      // ✅ TRANSFORMATION : data → files (C'EST LE POINT CLÉ !)
      const transformedResponse: FileClientListResponse = {
        success: backendResponse.success,
        files: backendResponse.data,        // ✅ data devient files
        count: backendResponse.count,
        message: backendResponse.message
      };
      
      // console.log('✅ Réponse transformée pour le hook:', transformedResponse);
      // console.log(`📋 ${transformedResponse.files.length} fichiers transformés`);
      
      return transformedResponse;
      
    } catch (error) {
      console.error('❌ Erreur getFilesClient:', error);
      throw error;
    }
  },

  // ✅ Récupérer un fichier client par ID - CORRIGÉ
  async getFileClientById(id: number): Promise<FileClientData | null> {
    try {
      // console.log('🔄 Récupération du fichier client ID:', id);
      
      const response = await baseService.get<{
        success: boolean;
        data: FileClientData; // ✅ CORRECTION : "data" au lieu de "file"
      }>(`/modele3DClient/${id}`);

      // console.log('✅ Fichier client récupéré:', response);
      return response.data; // ✅ CORRECTION
      
    } catch (error: any) {
      console.error('❌ Erreur getFileClientById:', error);
      return null;
    }
  },

  // ✅ Supprimer un fichier client
  async deleteFileClient(id: number): Promise<FileClientActionResponse> {
    try {
      const response = await baseService.delete<FileClientActionResponse>(`/modele3DClient/${id}`);
      return response;
    } catch (error) {
      console.error('❌ Erreur deleteFileClient:', error);
      throw error;
    }
  },

  // ✅ Mise à jour du statut de vérification
  async updateFileClientVerificationStatus(
    id: number, 
    data: UpdateFileClientVerificationData
  ): Promise<FileClientActionResponse> {
    try {
      // console.log('🔄 Mise à jour statut vérification fichier ID:', id, data);
      
      const response = await baseService.put<FileClientActionResponse>(`/modele3DClient/${id}/verification`, data);

      // console.log('✅ Statut de vérification mis à jour:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ Erreur updateFileClientVerificationStatus:', error);
      throw error;
    }
  },

  // ✅ Utilitaires
  getFileIcon(filename?: string | null): string {
    // ✅ Protection contre undefined/null
    if (!filename || typeof filename !== 'string') {
      console.warn('⚠️ getFileIcon reçu:', filename);
      return 'fas fa-file';
    }
    
    const extension = filename.split('.').pop()?.toLowerCase();
    
    const iconMap: { [key: string]: string } = {
      'stl': 'fas fa-cube',
      'obj': 'fas fa-shapes',
      'ply': 'fas fa-gem',
      '3mf': 'fas fa-layer-group',
      'amf': 'fas fa-boxes',
    };
    
    return iconMap[extension || ''] || 'fas fa-file';
  },

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  isValid3DFile(filename: string): boolean {
    const validExtensions = ['stl', 'obj', 'ply', '3mf', 'amf'];
    const extension = filename.split('.').pop()?.toLowerCase();
    return validExtensions.includes(extension || '');
  },

  formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  }
};
