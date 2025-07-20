// 📁 src/services/filesClient.service.ts - VERSION CORRIGÉE
import { baseService } from "./base.service";
import { 
  FileClientListResponse, 
  FileClientDeleteResponse, 
  Modele3DClient 
} from '../types/FileClientData';

// ✅ Types spécifiques au service (non exposés)
interface BackendFilesResponse {
  success: boolean;
  data: Modele3DClient[];
  total: number;
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
  message?: string;
}

interface FileClientUploadData {
  fichier: File;
  scaling: number;
  description: string;
  materiauId: number;
  nomPersonnalise?: string;
  pays: string;
  necessiteSupports?: boolean;
}

export interface FileClientUploadResponse {
  success: boolean;
  message?: string;
  data?: any;
}

interface UpdateFileClientVerificationData {
  estVerifie: boolean;
  commentaireVerification?: string;
}

// ✅ Helper pour gérer les erreurs d'authentification
const handleAuthError = (error: any, method: string): never => {
  console.log(`🔒 Erreur 401 détectée dans filesClient.${method}:`, error.message);
  
  // ✅ Émettre un événement global pour useAuth
  window.dispatchEvent(new CustomEvent('authError', {
    detail: { 
      status: 401, 
      message: error.message,
      service: 'filesClient',
      method: method
    }
  }));
  
  throw new Error('Session expirée. Redirection en cours...');
};

// ✅ Helper pour vérifier les erreurs 401
const checkAuthError = (error: any, method: string): void => {
  if (error.message?.includes('401') || 
      error.message?.includes('Non authentifié') ||
      error.message?.includes('Unauthorized')) {
    handleAuthError(error, method);
  }
};

export const filesClientService = {
  // ✅ Upload d'un fichier client - VERSION CORRIGÉE
  async uploadFileClient(
    uploadData: FileClientUploadData,
    onProgress?: (progress: number) => void
  ): Promise<FileClientUploadResponse> {
    try {
      console.log('🔄 Début upload fichier client:', {
        fileName: uploadData.fichier.name,
        fileSize: `${(uploadData.fichier.size / 1024 / 1024).toFixed(2)}MB`,
        scaling: uploadData.scaling,
        materiauId: uploadData.materiauId
      });

      // ✅ VALIDATION PRÉALABLE
      if (!uploadData.fichier) {
        throw new Error('Aucun fichier fourni');
      }

      if (uploadData.fichier.size > 200 * 1024 * 1024) { // 200MB max
        throw new Error('Fichier trop volumineux (maximum 200MB)');
      }

      // ✅ CRÉATION DU FORM DATA
      const formData = new FormData();
      formData.append('file', uploadData.fichier);
      formData.append('materiauId', uploadData.materiauId.toString());
      formData.append('scaling', uploadData.scaling.toString());
      formData.append('description', uploadData.description || '');
      formData.append('pays', uploadData.pays || 'France');
      
      // ✅ Ajouter le nom personnalisé s'il est fourni
      if (uploadData.nomPersonnalise) {
        formData.append('nomPersonnalise', uploadData.nomPersonnalise);
      }

      // ✅ AJOUTER LES PARAMÈTRES OPTIONNELS
      if (uploadData.necessiteSupports !== undefined) {
        formData.append('necessiteSupports', uploadData.necessiteSupports.toString());
      }

      console.log('📦 FormData créé avec:', {
        file: uploadData.fichier.name,
        materiauId: uploadData.materiauId,
        scaling: uploadData.scaling,
        description: uploadData.description?.substring(0, 50) + '...',
        pays: uploadData.pays,
        nomPersonnalise: uploadData.nomPersonnalise
      });

      // ✅ UPLOAD AVEC GESTION D'ERREUR AMÉLIORÉE
      const response = await baseService.request<FileClientUploadResponse>(
        '/modele3DClient/upload',
        {
          method: 'POST',
          body: formData
        },
        onProgress
      );

      console.log('✅ Upload réussi:', response);

      if (response.success) {
        return {
          success: true,
          message: response.message || 'Fichier uploadé avec succès',
          data: response.data
        };
      } else {
        throw new Error(response.message || 'Échec de l\'upload');
      }

    } catch (error: any) {
      console.error('❌ Erreur upload fichier client:', error);
      
      // ✅ GESTION D'ERREUR DÉTAILLÉE
      let errorMessage = 'Erreur lors de l\'upload';
      
      if (error.message) {
        if (error.message.includes('session') || error.message.includes('401')) {
          errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
        } else if (error.message.includes('413')) {
          errorMessage = 'Fichier trop volumineux. Taille maximum: 200MB.';
        } else if (error.message.includes('415')) {
          errorMessage = 'Format de fichier non supporté. Formats acceptés: STL, OBJ, PLY, 3MF, AMF.';
        } else if (error.message.includes('422')) {
          errorMessage = 'Données invalides. Vérifiez vos paramètres.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else if (error.message.includes('ENOENT')) {
          errorMessage = 'Erreur de stockage. Veuillez réessayer.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // ✅ Récupérer tous les fichiers clients - VERSION CORRIGÉE
  async getFilesClient(showAll: boolean = false): Promise<FileClientListResponse> {
    try {
      console.log('📂 Début getFilesClient, showAll:', showAll);
      
      const endpoint = showAll 
        ? '/modele3DClient?showAll=true' 
        : '/modele3DClient/my-models';
      
      const backendResponse = await baseService.get<BackendFilesResponse>(endpoint);
      
      if (!backendResponse?.success) {
        throw new Error('Réponse invalide du serveur');
      }
      
      if (!Array.isArray(backendResponse.data)) {
        console.warn('⚠️ Format de données invalide, utilisation d\'un tableau vide');
        backendResponse.data = [];
      }
      
      // ✅ Transformation selon l'interface centralisée
      const transformedResponse: FileClientListResponse = {
        success: backendResponse.success,
        data: backendResponse.data,
        total: backendResponse.total,
        pagination: backendResponse.pagination,
        message: backendResponse.message
      };
      
      console.log('✅ Fichiers récupérés:', transformedResponse.data.length);
      return transformedResponse;
      
    } catch (error: any) {
      console.error('❌ Erreur getFilesClient:', error);
      
      // ✅ IMMÉDIAT : Vérifier les erreurs 401
      checkAuthError(error, 'getFilesClient');
      
      throw error;
    }
  },

  // ✅ Récupérer un fichier client par ID - VERSION CORRIGÉE
  async getFileClientById(id: number): Promise<Modele3DClient | null> {
    try {
      console.log('🔍 Début getFileClientById, id:', id);
      
      const response = await baseService.get<{
        success: boolean;
        data: Modele3DClient;
      }>(`/modele3DClient/${id}`);

      console.log('✅ Fichier récupéré par ID:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Erreur getFileClientById:', error);
      
      // ✅ IMMÉDIAT : Vérifier les erreurs 401
      checkAuthError(error, 'getFileClientById');
      
      return null;
    }
  },

  // ✅ Supprimer un fichier client - VERSION CORRIGÉE
  async deleteFileClient(id: number): Promise<FileClientDeleteResponse> {
    try {
      console.log('🗑️ Début deleteFileClient, id:', id);
      
      const response = await baseService.delete<FileClientDeleteResponse>(`/modele3DClient/${id}`);
      
      console.log('✅ Fichier supprimé:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ Erreur deleteFileClient:', error);
      
      // ✅ IMMÉDIAT : Vérifier les erreurs 401
      checkAuthError(error, 'deleteFileClient');
      
      throw error;
    }
  },

  // ✅ Mise à jour du statut de vérification - VERSION CORRIGÉE
  async updateFileClientVerificationStatus(
    id: number, 
    data: UpdateFileClientVerificationData
  ): Promise<FileClientDeleteResponse> {
    try {
      console.log('✅ Début updateFileClientVerificationStatus, id:', id, 'data:', data);
      
      const response = await baseService.put<FileClientDeleteResponse>(
        `/modele3DClient/${id}/verification`, 
        data
      );

      console.log('✅ Statut de vérification mis à jour:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ Erreur updateFileClientVerificationStatus:', error);
      
      // ✅ IMMÉDIAT : Vérifier les erreurs 401
      checkAuthError(error, 'updateFileClientVerificationStatus');
      
      throw error;
    }
  },

  // ✅ Utilitaires - INCHANGÉS
  getFileIcon(filename?: string | null): string {
    if (!filename || typeof filename !== 'string') {
      return 'fas fa-file';
    }
    
    const extension = filename.split('.').pop()?.toLowerCase();
    
    const iconMap: Record<string, string> = {
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

// ✅ Export des types spécifiques si nécessaire
export type { FileClientUploadData, UpdateFileClientVerificationData };