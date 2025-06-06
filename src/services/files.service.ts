// src/services/files.service.ts
import { baseService } from './base.service';

export interface FileUploadResponse {
  success: boolean;
  message?: string;
  data?: {
    id: number;
    nomOriginal: string;
    cheminFichier: string;
    format: string;
    tailleFichier: number;
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
  };
}

export interface FilesResponse {
  success: boolean;
  message?: string;
  data?: UserFile[];
}

export const filesService = {
  // Upload d'un fichier 3D
  async uploadFile3D(formData: FormData): Promise<FileUploadResponse> {
    const response = await fetch(`${baseService.getBaseUrl()}/api/files/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData, // FormData n'a pas besoin de Content-Type header
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur réseau' }));
      throw new Error(errorData.message || 'Erreur lors de l\'upload');
    }

    return response.json();
  },

  // Récupération des fichiers de l'utilisateur
  async getUserFiles(): Promise<FilesResponse> {
    return baseService.request<FilesResponse>('/api/files/my-files', {
      method: 'GET',
    });
  },

  // Récupération d'un fichier spécifique
  async getUserFileById(fileId: number): Promise<{ success: boolean; data?: UserFile; message?: string }> {
    return baseService.request(`/api/files/my-files/${fileId}`, {
      method: 'GET',
    });
  },

  // Suppression d'un fichier
  async deleteUserFile(fileId: number): Promise<{ success: boolean; message?: string }> {
    return baseService.request(`/api/files/my-files/${fileId}`, {
      method: 'DELETE',
    });
  },

  // Mise à jour des informations d'un fichier
  async updateUserFile(fileId: number, data: {
    materiauId?: number;
    taille?: number;
    description?: string;
  }): Promise<{ success: boolean; message?: string }> {
    return baseService.request(`/api/files/my-files/${fileId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
};