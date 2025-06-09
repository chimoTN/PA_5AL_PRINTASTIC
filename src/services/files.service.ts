// src/services/files.service.ts

import { baseService } from "./base.service";

export interface FileUploadResponse {
  success: boolean;
  message?: string;
  data?: {
    modele?: {
      id: number;
      fichier3dId: number;
      materiauId: number;
      taille: number;
      prix: number;
      estVerifie: boolean;
      fichier3d: {
        id: number;
        cheminFichier: string;
        format: string;
        tailleFichier: number;
        nomOriginal: string;
      };
      materiau: {
        id: number;
        nom: string;
        couleur: string;
        prixParGramme: number;
      };
    };
    prixEstime?: number;
    statut?: string;
  };
}

export interface UserFile {
  id: number;
  nomOriginal: string;
  format: string;
  tailleFichier: number;
  statut: 'en_attente' | 'valide' | 'rejete';
  type: 'produit' | 'modele_client' | null;
  dateCreation: string;
  raisonRejet?: string;
  modeleClient?: {
    id: number;
    materiauId: number;
    materiau: {
      nom: string;
      couleur: string;
      prixParGramme: number;
    };
    taille: number;
    prix: number;
    estVerifie: boolean;
    description?: string;
    dateVerification?: string;
    commentaireVerification?: string;
  };
}

export interface FilesResponse {
  success: boolean;
  message?: string;
  data?: UserFile[];
  count?: number;
}

export interface ClientModelUploadData {
  file3d: File;
  materiauId: number;
  taille: number;
  description?: string;
}

export interface FileStats {
  nombreFichiers: number;
  nombreProduits: number;
  nombreModelesClients: number;
  tailleTotaleMo: number;
  tailleTotaleOctets: number;
}

export const filesService = {
  // Upload d'un fichier 3D produit (propriétaire)
  async uploadFile3D(formData: FormData): Promise<FileUploadResponse> {
    const response = await fetch(`${baseService.getBaseUrl()}/api/files/upload/owner`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur réseau' }));
      throw new Error(errorData.message || 'Erreur lors de l\'upload');
    }

    return response.json();
  },

  // Upload d'un modèle 3D client
  async uploadClientModel(data: ClientModelUploadData): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file3d', data.file3d);
    formData.append('materiauId', data.materiauId.toString());
    formData.append('taille', data.taille.toString());
    
    if (data.description) {
      formData.append('description', data.description);
    }

    const response = await fetch(`${baseService.getBaseUrl()}/api/modele3d-client/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur réseau' }));
      throw new Error(errorData.message || 'Erreur lors de l\'upload du modèle');
    }

    return response.json();
  },

  // Upload générique (pour compatibilité avec l'existant)
  async uploadFile(formData: FormData, isClientModel: boolean = false): Promise<FileUploadResponse> {
    const endpoint = isClientModel ? '/api/files/upload/client' : '/api/files/upload/owner';
    
    const response = await fetch(`${baseService.getBaseUrl()}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur réseau' }));
      throw new Error(errorData.message || 'Erreur lors de l\'upload');
    }

    return response.json();
  },

  // Récupération des modèles 3D du client connecté
  async getMyClientModels(): Promise<FilesResponse> {
    return baseService.request<FilesResponse>('/api/modele3d-client/my-models', {
      method: 'GET',
    });
  },

  // Récupération des fichiers de l'utilisateur (méthode existante maintenue)
  async getUserFiles(): Promise<FilesResponse> {
    return baseService.request<FilesResponse>('/api/files/my-files', {
      method: 'GET',
    });
  },

  // NOUVELLES MÉTHODES POUR LE SYSTÈME DE GESTION DES FICHIERS

  // Récupérer tous les fichiers de l'utilisateur connecté
  async getMyFiles(): Promise<UserFile[]> {
    const response = await baseService.request<{ 
      success: boolean; 
      data: UserFile[];
      message?: string;
    }>('/files/my-files', {
      method: 'GET',
    });
    return response.data || [];
  },

  // Récupérer un fichier par son ID
  async getFileById(id: number): Promise<UserFile> {
    const response = await baseService.request<{ 
      success: boolean; 
      data: UserFile;
      message?: string;
    }>(`/files/${id}`, {
      method: 'GET',
    });
    return response.data;
  },

  // Supprimer un fichier
  async deleteFile(id: number): Promise<void> {
    await baseService.request(`/files/${id}`, {
      method: 'DELETE',
    });
  },

  // Télécharger un fichier
  async downloadFile(id: number, filename: string): Promise<void> {
    try {
      const response = await fetch(`${baseService.getBaseUrl()}/files/${id}/download`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur réseau' }));
        throw new Error(errorData.message || 'Erreur lors du téléchargement');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      throw error;
    }
  },

  // Récupérer les statistiques des fichiers
  async getFileStats(): Promise<FileStats> {
    const response = await baseService.request<{
      success: boolean;
      data: FileStats;
      message?: string;
    }>('/files/stats', {
      method: 'GET',
    });
    return response.data;
  },

  // MÉTHODES UTILITAIRES

  // Formater la taille d'un fichier
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Obtenir l'icône appropriée selon le format de fichier
  getFileIcon(format: string): string {
    const iconMap: { [key: string]: string } = {
      'stl': 'fas fa-cube',
      'obj': 'fas fa-shapes',
      'ply': 'fas fa-project-diagram',
      '3mf': 'fas fa-layer-group',
      'amf': 'fas fa-bezier-curve',
      'gcode': 'fas fa-cogs',
      'step': 'fas fa-drafting-compass',
      'iges': 'fas fa-vector-square',
      'x3d': 'fas fa-cube',
      'dae': 'fas fa-cubes'
    };
    return iconMap[format.toLowerCase()] || 'fas fa-file-alt';
  },

  // Obtenir la couleur selon le type de fichier
  getFileTypeColor(type: string | null): string {
    switch (type) {
      case 'produit':
        return '#00b894';
      case 'modele_client':
        return '#0984e3';
      default:
        return '#6c5ce7';
    }
  },

  // Formater une date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Aujourd\'hui';
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  },

  // Valider le format de fichier
  isValidFileFormat(filename: string): boolean {
    const validExtensions = ['.stl', '.obj', '.ply', '.3mf', '.amf', '.gcode', '.step', '.iges', '.x3d', '.dae'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return validExtensions.includes(extension);
  },

  // Obtenir l'extension d'un fichier
  getFileExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
  }
};