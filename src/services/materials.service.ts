// src/services/materials.service.ts
import { baseService } from "./base.service";

export interface Material {
  id: number;
  nom: string;
  description: string;
  coutParGramme: string; // String dans l'API
  estDisponible: boolean;
  dateCreation: string | null;
  // Propriétés calculées pour compatibilité
  prixParGramme?: number;
}

export interface MaterialsResponse {
  success: boolean;
  data: Material[];
  count: number;
  message?: string;
}

export interface SingleMaterialResponse {
  success: boolean;
  data: Material;
  message?: string;
}

export interface CreateMaterialData {
  nom: string;
  description: string;
  coutParGramme: number;
  estDisponible?: boolean;
}

export interface UpdateMaterialData extends Partial<CreateMaterialData> {}

export interface MaterialActionResponse {
  success: boolean;
  message?: string;
  data?: Material;
}

export const materialsService = {
  // ✅ Routes publiques
  
  /**
   * Récupérer les matériaux disponibles seulement
   */
  async getAvailableMaterials(): Promise<Material[]> {
    try {
      console.log('🔄 Récupération des matériaux disponibles...');
      
      const response = await baseService.request<MaterialsResponse>('/materiaux/available', {
        method: 'GET',
      });
      
      if (response.success && response.data) {
        const materials = response.data.map(material => ({
          ...material,
          prixParGramme: parseFloat(material.coutParGramme)
        }));
        
        console.log('✅ Matériaux disponibles chargés:', materials.length);
        return materials;
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ Erreur getAvailableMaterials:', error);
      throw new Error(error.message || 'Impossible de charger les matériaux disponibles');
    }
  },

  /**
   * Récupérer tous les matériaux (disponibles et non disponibles)
   */
  async getAllMaterials(): Promise<Material[]> {
    try {
      console.log('🔄 Récupération de tous les matériaux...');
      
      const response = await baseService.request<MaterialsResponse>('/materiaux/all', {
        method: 'GET',
      });
      
      if (response.success && response.data) {
        const materials = response.data.map(material => ({
          ...material,
          prixParGramme: parseFloat(material.coutParGramme)
        }));
        
        console.log('✅ Tous les matériaux chargés:', materials.length);
        return materials;
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ Erreur getAllMaterials:', error);
      throw new Error(error.message || 'Impossible de charger les matériaux');
    }
  },

  /**
   * Récupérer un matériau spécifique par son ID
   */
  async getMaterialById(id: number): Promise<Material | null> {
    try {
      console.log('🔄 Récupération du matériau ID:', id);
      
      const response = await baseService.request<SingleMaterialResponse>(`/materiaux/${id}`, {
        method: 'GET',
      });
      
      if (response.success && response.data) {
        const material = {
          ...response.data,
          prixParGramme: parseFloat(response.data.coutParGramme)
        };
        
        console.log('✅ Matériau chargé:', material);
        return material;
      }
      
      return null;
    } catch (error: any) {
      console.error('❌ Erreur getMaterialById:', error);
      throw new Error(error.message || 'Impossible de charger ce matériau');
    }
  },

  // ✅ Routes admin (nécessitent authentification + rôle owner)
  
  /**
   * Créer un nouveau matériau (Admin seulement)
   */
  async createMaterial(data: CreateMaterialData): Promise<MaterialActionResponse> {
    try {
      console.log('🔄 Création d\'un nouveau matériau:', data);
      
      const response = await baseService.request<MaterialActionResponse>('/materiaux/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      console.log('✅ Matériau créé:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Erreur createMaterial:', error);
      return {
        success: false,
        message: error.message || 'Erreur lors de la création du matériau'
      };
    }
  },

  /**
   * Mettre à jour un matériau existant (Admin seulement)
   */
  async updateMaterial(id: number, data: UpdateMaterialData): Promise<MaterialActionResponse> {
    try {
      console.log('🔄 Mise à jour du matériau ID:', id, data);
      
      const response = await baseService.request<MaterialActionResponse>(`/materiaux/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      console.log('✅ Matériau mis à jour:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Erreur updateMaterial:', error);
      return {
        success: false,
        message: error.message || 'Erreur lors de la mise à jour du matériau'
      };
    }
  },

  /**
   * Supprimer un matériau (Admin seulement)
   */
  async deleteMaterial(id: number): Promise<MaterialActionResponse> {
    try {
      console.log('🔄 Suppression du matériau ID:', id);
      
      const response = await baseService.request<MaterialActionResponse>(`/materiaux/admin/${id}`, {
        method: 'DELETE',
      });
      
      console.log('✅ Matériau supprimé:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Erreur deleteMaterial:', error);
      return {
        success: false,
        message: error.message || 'Erreur lors de la suppression du matériau'
      };
    }
  },

  // ✅ Utilitaires

  /**
   * Formater le prix (gestion string et number)
   */
  formatPrice(price: number | string | undefined): string {
    let numPrice: number;
    
    if (typeof price === 'string') {
      numPrice = parseFloat(price);
    } else if (typeof price === 'number') {
      numPrice = price;
    } else {
      numPrice = 0;
    }
    
    if (isNaN(numPrice)) {
      numPrice = 0;
    }
    
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(numPrice);
  },

  /**
   * Calculer le prix total pour une quantité donnée
   */
  calculateTotalPrice(material: Material, quantityInGrams: number): number {
    const pricePerGram = parseFloat(material.coutParGramme);
    return pricePerGram * quantityInGrams;
  },

  /**
   * Formater le prix total
   */
  formatTotalPrice(material: Material, quantityInGrams: number): string {
    const total = this.calculateTotalPrice(material, quantityInGrams);
    return this.formatPrice(total);
  },

  /**
   * Vérifier si un matériau est disponible
   */
  isMaterialAvailable(material: Material): boolean {
    return material.estDisponible === true;
  },

  /**
   * Filtrer les matériaux disponibles
   */
  filterAvailableMaterials(materials: Material[]): Material[] {
    return materials.filter(material => this.isMaterialAvailable(material));
  }
};