// src/services/materials.service.ts
import { baseService } from './base.service';

export interface Material {
  id: number;
  nom: string;
  couleur: string;
  prixParGramme: number;
  description?: string;
  disponible: boolean;
}

export interface MaterialsResponse {
  success: boolean;
  data?: Material[];
  message?: string;
}

export const materialsService = {
  // Récupération de tous les matériaux
  async getMaterials(): Promise<MaterialsResponse> {
    return baseService.request<MaterialsResponse>('/api/materials', {
      method: 'GET',
    });
  },

  // Récupération des matériaux disponibles uniquement
  async getAvailableMaterials(): Promise<MaterialsResponse> {
    return baseService.request<MaterialsResponse>('/api/materials/available', {
      method: 'GET',
    });
  },

  // Récupération d'un matériau par ID
  async getMaterialById(materialId: number): Promise<{ success: boolean; data?: Material; message?: string }> {
    return baseService.request(`/api/materials/${materialId}`, {
      method: 'GET',
    });
  }
};