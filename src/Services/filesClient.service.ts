// 📁 src/services/filesClient.service.ts
import { baseService } from "./base.service";
import { 
  FileClientListResponse, 
  FileClientDeleteResponse, 
  FileClientUploadProps,
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
}

interface FileClientUploadResponse {
  success: boolean;
  message: string;
  data: Modele3DClient;
}

interface UpdateFileClientVerificationData {
  estVerifie: boolean;
  commentaireVerification?: string;
}

export const filesClientService = {
  // ✅ Upload d'un fichier client
  async uploadFileClient(
    uploadData: FileClientUploadData,
    onProgress?: (progress: number) => void
  ): Promise<FileClientUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', uploadData.fichier);
      formData.append('scaling', uploadData.scaling.toString());
      formData.append('description', uploadData.description);
      formData.append('materiauId', uploadData.materiauId.toString());
      formData.append('pays', uploadData.pays);
      
      if (uploadData.nomPersonnalise?.trim()) {
        formData.append('nomPersonnalise', uploadData.nomPersonnalise.trim());
      }

      const response = await baseService.request<FileClientUploadResponse>(
        '/modele3DClient/upload',
        {
          method: 'POST',
          body: formData,
          headers: {}
        },
        onProgress
      );

      return response;
      
    } catch (error: any) {
      console.error('❌ Erreur upload fichier client:', error);
      
      const errorMessages: Record<string, string> = {
        '401': 'Vous devez être connecté pour uploader un fichier',
        '413': 'Le fichier est trop volumineux',
        '415': 'Format de fichier non supporté',
        '400': 'Données d\'upload invalides'
      };
      
      const errorCode = Object.keys(errorMessages).find(code => 
        error.message.includes(code)
      );
      
      if (errorCode) {
        throw new Error(errorMessages[errorCode]);
      }
      
      throw error;
    }
  },

  // ✅ Récupérer tous les fichiers clients
  async getFilesClient(showAll: boolean = false): Promise<FileClientListResponse> {
    try {
      const endpoint = showAll 
        ? '/modele3DClient?showAll=true' 
        : '/modele3DClient/my-models';
      
      const backendResponse = await baseService.get<BackendFilesResponse>(endpoint);
      
      if (!backendResponse?.success) {
        throw new Error('Réponse invalide du serveur');
      }
      
      if (!Array.isArray(backendResponse.data)) {
        throw new Error('Format de données invalide - data n\'est pas un tableau');
      }
      
      // ✅ Transformation selon l'interface centralisée
      const transformedResponse: FileClientListResponse = {
        success: backendResponse.success,
        data: backendResponse.data,
        total: backendResponse.total,
        pagination: backendResponse.pagination,
        message: backendResponse.message
      };
      
      return transformedResponse;
      
    } catch (error) {
      console.error('❌ Erreur getFilesClient:', error);
      throw error;
    }
  },

  // ✅ Récupérer un fichier client par ID
  async getFileClientById(id: number): Promise<Modele3DClient | null> {
    try {
      const response = await baseService.get<{
        success: boolean;
        data: Modele3DClient;
      }>(`/modele3DClient/${id}`);

      return response.data;
      
    } catch (error: any) {
      console.error('❌ Erreur getFileClientById:', error);
      return null;
    }
  },

  // ✅ Supprimer un fichier client
  async deleteFileClient(id: number): Promise<FileClientDeleteResponse> {
    try {
      const response = await baseService.delete<FileClientDeleteResponse>(`/modele3DClient/${id}`);
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
  ): Promise<FileClientDeleteResponse> {
    try {
      const response = await baseService.put<FileClientDeleteResponse>(
        `/modele3DClient/${id}/verification`, 
        data
      );

      return response;
      
    } catch (error: any) {
      console.error('❌ Erreur updateFileClientVerificationStatus:', error);
      throw error;
    }
  },

  // ✅ Utilitaires
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