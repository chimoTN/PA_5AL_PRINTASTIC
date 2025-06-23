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


// ✅ Interface pour les données d'upload
export interface FileClientUploadData {
  file: File;
  scaling: number;
  description: string;
  idMatériau: number;
}

// ✅ Interface pour la réponse d'upload
export interface FileClientUploadResponse {
  success: boolean;
  message: string;
  data: {
    modele: {
      id: number;
      fichier3dId: number;
      materiauId: number;
      utilisateurId: number;
      taille: string;
      prix: number | null;
      estVerifie: boolean;
      commentaireVerification: string | null;
      dateVerification: string | null;
      dateCreation: string;
      fichier3D: {
        id: number;
        cheminFichier: string;
        format: string;
        tailleFichier: number;
        type: string | null;
        dateCreation: string;
        derniereVerification: string;
      };
      materiau: {
        id: number;
        nom: string;
        description: string;
        coutParGramme: string;
        estDisponible: boolean;
        dateCreation: string | null;
      };
    };
    prixEstime: number | null;
    statut: string;
  };
}

// ✅ Interface pour les données de fichier client
export interface FileClientData {
  id: number;
  nomFichier: string;
  cheminFichier: string;
  taille: number;
  dateUpload: string;
  idUtilisateur: number;
  scaling: number;
  description: string;
  idMatériau: number;
  statut?: string;
  estVérifié?: boolean;
  commentaireVérification?: string;
  dateVérification?: string;
  // Propriétés calculées
  formatFichier?: string;
  tailleFormatée?: string;
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
  commentaireVérification?: string;
}

export const filesClientService = {
  // ✅ CORRECTION : Upload avec méthode request corrigée
  async uploadFileClient(
    uploadData: FileClientUploadData,
    onProgress?: (progress: number) => void
  ): Promise<FileClientUploadResponse> {
    try {
      console.log('📤 Début upload fichier client vers /api/modele3DClient/upload:', {
        fileName: uploadData.file.name,
        fileSize: uploadData.file.size,
        scaling: uploadData.scaling,
        description: uploadData.description,
        materialId: uploadData.idMatériau
      });

      // ✅ Créer le FormData avec les bons noms de champs
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('taille', uploadData.scaling.toString());
      formData.append('description', uploadData.description);
      formData.append('materiauId', uploadData.idMatériau.toString());

      // ✅ Debug du FormData
      console.log('📋 Contenu du FormData:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      // ✅ CORRECTION : Utiliser la route exacte
      const response = await baseService.request<FileClientUploadResponse>(
        '/modele3DClient/upload', // L'URL finale sera: http://localhost:3000/api/modele3DClient/upload
        {
          method: 'POST',
          body: formData,
          // ✅ Headers spécifiques pour l'upload de fichier
          headers: {
            // Ne pas définir Content-Type pour FormData (boundary automatique)
          }
        },
        onProgress
      );

      console.log('✅ Upload réussi - Réponse complète:', response);
      console.log('📊 Données du modèle créé:', {
        modeleId: response.data.modele.id,
        fichier3dId: response.data.modele.fichier3dId,
        materiau: response.data.modele.materiau.nom,
        taille: response.data.modele.taille,
        statut: response.data.statut,
        prixEstime: response.data.prixEstime
      });

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

  // ✅ Récupérer tous les fichiers clients de l'utilisateur
  // ✅ CORRECTION : Récupérer tous les fichiers clients de l'utilisateur
  async getFilesClient(): Promise<FileClientListResponse> {
    try {
      console.log('🔄 Récupération des fichiers client...');
      
      // ✅ Récupérer la réponse backend brute
      const backendResponse = await baseService.get<BackendFilesResponse>('/modele3DClient/my-models');
      
      console.log('📡 Réponse backend brute:', backendResponse);
      console.log('🔍 backendResponse.success:', backendResponse.success);
      console.log('🔍 backendResponse.data:', backendResponse.data);
      console.log('🔍 Array.isArray(backendResponse.data):', Array.isArray(backendResponse.data));
      
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
      
      console.log('✅ Réponse transformée pour le hook:', transformedResponse);
      console.log(`📋 ${transformedResponse.files.length} fichiers transformés`);
      
      return transformedResponse;
      
    } catch (error) {
      console.error('❌ Erreur getFilesClient:', error);
      throw error;
    }
  },


  // ✅ Récupérer un fichier client par ID
  async getFileClientById(id: number): Promise<FileClientData | null> {
    try {
      console.log('🔄 Récupération du fichier client ID:', id);
      
      const response = await baseService.get<{
        success: boolean;
        file: FileClientData;
      }>(`/modele3DClient/${id}`);

      console.log('✅ Fichier client récupéré:', response);
      return response.file;
      
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
      console.log('🔄 Mise à jour statut vérification fichier ID:', id, data);
      
      const response = await baseService.put<FileClientActionResponse>(`/modele3DClient/${id}/verification`, data);

      console.log('✅ Statut de vérification mis à jour:', response);
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
