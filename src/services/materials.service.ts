// src/services/materials.service.ts
import { baseService } from "./base.service";

export interface Material {
  id: number;
  nom: string;
  description: string;
  prixParGramme: string; // ✅ STRING comme dans votre API
  densite: string; // ✅ STRING comme dans votre API
  facteurRemplissageDefaut: number;
  coefficientSupports: string; // ✅ STRING comme dans votre API
  perteMateriau: string; // ✅ STRING comme dans votre API
  couleur: string;
  type: 'PLA' | 'ABS' | 'PETG' | 'TPU' | 'WOOD' | 'CARBON' | 'METAL' | 'RESIN';
  estDisponible: boolean;
  temperatureImpression: number;
  temperatureLit: number | null; // ✅ NULL possible
  necessiteSupports: boolean;
  tauxRemplissageRecommande: number;
  difficulteImpression: 'facile' | 'moyen' | 'difficile';
  notes: string | null; // ✅ NULL possible
  dateCreation: string; // ✅ DATE STRING ISO
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
  description?: string;
  prixParGramme: number;
  densite?: number;
  facteurRemplissageDefaut?: number;
  coefficientSupports?: number;
  perteMateriau?: number;
  couleur?: string;
  type: 'PLA' | 'ABS' | 'PETG' | 'TPU' | 'WOOD' | 'CARBON' | 'METAL' | 'RESIN';
  estDisponible?: boolean;
  temperatureImpression?: number;
  temperatureLit?: number;
  necessiteSupports?: boolean;
  tauxRemplissageRecommande?: number;
  difficulteImpression?: 'facile' | 'moyen' | 'difficile';
  notes?: string;
}

export interface UpdateMaterialData extends Partial<CreateMaterialData> {}

export interface MaterialActionResponse {
  success: boolean;
  message?: string;
  data?: Material;
}

export const materialsService = {
  // ✅ ROUTES PUBLIQUES
  
  /**
   * Récupérer les matériaux disponibles seulement
   */
  async getAvailableMaterials(): Promise<Material[]> {
    try {
      // console.log('🔄 Récupération des matériaux disponibles...');
      
      const response = await baseService.request<MaterialsResponse>('/materiaux/available', {
        method: 'GET',
      });
      
      if (response.success && response.data) {
        // console.log('✅ Matériaux disponibles chargés:', response.data.length);
        return response.data;
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
      // console.log('🔄 Récupération de tous les matériaux...');
      
      const response = await baseService.request<MaterialsResponse>('/materiaux/all', {
        method: 'GET',
      });
      
      if (response.success && response.data) {
        // console.log('✅ Tous les matériaux chargés:', response.data.length);
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ Erreur getAllMaterials:', error);
      throw new Error(error.message || 'Impossible de charger tous les matériaux');
    }
  },

  /**
   * Récupérer un matériau spécifique par son ID
   */
  async getMaterialById(id: number): Promise<Material | null> {
    try {
      // console.log('🔄 Récupération du matériau ID:', id);
      
      const response = await baseService.request<SingleMaterialResponse>(`/materiaux/${id}`, {
        method: 'GET',
      });
      
      if (response.success && response.data) {
        // console.log('✅ Matériau chargé:', response.data);
        return response.data;
      }
      
      return null;
    } catch (error: any) {
      console.error('❌ Erreur getMaterialById:', error);
      throw new Error(error.message || 'Impossible de charger ce matériau');
    }
  },

  /**
   * Rechercher des matériaux par nom ou description
   */
  async searchMaterials(query: string): Promise<Material[]> {
    try {
      // console.log('🔄 Recherche de matériaux:', query);
      
      const response = await baseService.request<MaterialsResponse>(`/materiaux/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
      });
      
      if (response.success && response.data) {
        // console.log('✅ Matériaux trouvés:', response.data.length);
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ Erreur searchMaterials:', error);
      throw new Error(error.message || 'Erreur lors de la recherche');
    }
  },

  /**
   * Récupérer les matériaux par type
   */
  async getMaterialsByType(type: string): Promise<Material[]> {
    try {
      // console.log('🔄 Récupération des matériaux par type:', type);
      
      const response = await baseService.request<MaterialsResponse>(`/materiaux/type/${type}`, {
        method: 'GET',
      });
      
      if (response.success && response.data) {
        // console.log('✅ Matériaux par type chargés:', response.data.length);
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('❌ Erreur getMaterialsByType:', error);
      throw new Error(error.message || 'Impossible de charger les matériaux par type');
    }
  },

  // ✅ ROUTES ADMIN (nécessitent authentification + rôle owner)
  
  /**
   * Créer un nouveau matériau (Admin seulement)
   */
  async createMaterial(data: CreateMaterialData): Promise<MaterialActionResponse> {
    try {
      // console.log('🔄 Création d\'un nouveau matériau:', data);
      
      const response = await baseService.request<MaterialActionResponse>('/materiaux/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      // console.log('✅ Matériau créé:', response);
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
      // console.log('🔄 Mise à jour du matériau ID:', id, data);
      
      const response = await baseService.request<MaterialActionResponse>(`/materiaux/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      // console.log('✅ Matériau mis à jour:', response);
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
      // console.log('🔄 Suppression du matériau ID:', id);
      
      const response = await baseService.request<MaterialActionResponse>(`/materiaux/admin/${id}`, {
        method: 'DELETE',
      });
      
      // console.log('✅ Matériau supprimé:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Erreur deleteMaterial:', error);
      return {
        success: false,
        message: error.message || 'Erreur lors de la suppression du matériau'
      };
    }
  },

  // ✅ UTILITAIRES DE CONVERSION

  /**
   * Convertir le prix string en number
   */
  getPrixParGramme(material: Material): number {
    const prix = parseFloat(material.prixParGramme);
    return isNaN(prix) ? 0 : prix;
  },

  /**
   * Convertir la densité string en number
   */
  getDensite(material: Material): number {
    const densite = parseFloat(material.densite);
    return isNaN(densite) ? 1 : densite;
  },

  /**
   * Convertir coefficient supports string en number
   */
  getCoefficientSupports(material: Material): number {
    const coeff = parseFloat(material.coefficientSupports);
    return isNaN(coeff) ? 1 : coeff;
  },

  /**
   * Convertir perte matériau string en number
   */
  getPerteMateriauNumber(material: Material): number {
    const perte = parseFloat(material.perteMateriau);
    return isNaN(perte) ? 1 : perte;
  },

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
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(numPrice);
  },

  /**
   * Calculer le coût pour un poids donné
   */
  calculateCostForWeight(material: Material, weightInGrams: number): number {
    const prixParGramme = this.getPrixParGramme(material);
    const perteMateriau = this.getPerteMateriauNumber(material);
    
    return prixParGramme * weightInGrams * perteMateriau;
  },

  /**
   * Calculer le poids de matière nécessaire
   */
  calculateMaterialWeight(
    material: Material, 
    volumeCm3: number, 
    fillRate: number = 0.2, 
    withSupports: boolean = false
  ): number {
    const densite = this.getDensite(material);
    const coeffSupports = withSupports ? this.getCoefficientSupports(material) : 1;
    const perteMateriau = this.getPerteMateriauNumber(material);
    
    // Poids = Volume × Densité × Taux de remplissage × Coefficient supports × Perte matériau
    return volumeCm3 * densite * fillRate * coeffSupports * perteMateriau;
  },

  /**
   * Calculer le prix total pour une quantité donnée
   */
  calculateTotalPrice(material: Material, quantityInGrams: number): number {
    const pricePerGram = this.getPrixParGramme(material);
    return pricePerGram * quantityInGrams;
  },

  /**
   * Formater le prix total
   */
  formatTotalPrice(material: Material, quantityInGrams: number): string {
    const total = this.calculateTotalPrice(material, quantityInGrams);
    return this.formatPrice(total);
  },

  // ✅ UTILITAIRES DE FILTRAGE ET RECHERCHE

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
  },

  /**
   * Rechercher dans une liste de matériaux
   */
  searchInMaterials(materials: Material[], query: string): Material[] {
    if (!query.trim()) return materials;
    
    const searchLower = query.toLowerCase();
    return materials.filter(material => 
      material.nom.toLowerCase().includes(searchLower) ||
      material.description.toLowerCase().includes(searchLower) ||
      material.type.toLowerCase().includes(searchLower) ||
      material.couleur.toLowerCase().includes(searchLower)
    );
  },

  /**
   * Trier les matériaux
   */
  sortMaterials(materials: Material[], sortBy: 'nom' | 'prix' | 'type' | 'disponibilite' = 'nom'): Material[] {
    return [...materials].sort((a, b) => {
      switch (sortBy) {
        case 'nom':
          return a.nom.localeCompare(b.nom);
        case 'prix':
          return this.getPrixParGramme(a) - this.getPrixParGramme(b);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'disponibilite':
          return Number(b.estDisponible) - Number(a.estDisponible);
        default:
          return 0;
      }
    });
  },

  /**
   * Grouper les matériaux par type
   */
  groupMaterialsByType(materials: Material[]): Record<string, Material[]> {
    return materials.reduce((acc, material) => {
      const type = material.type || 'Autre';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(material);
      return acc;
    }, {} as Record<string, Material[]>);
  },

  /**
   * Grouper les matériaux par couleur
   */
  groupMaterialsByColor(materials: Material[]): Record<string, Material[]> {
    return materials.reduce((acc, material) => {
      const color = material.couleur || 'Inconnue';
      if (!acc[color]) {
        acc[color] = [];
      }
      acc[color].push(material);
      return acc;
    }, {} as Record<string, Material[]>);
  },

  /**
   * Obtenir les types uniques
   */
  getUniqueTypes(materials: Material[]): string[] {
    const types = materials.map(m => m.type).filter(Boolean);
    return [...new Set(types)].sort();
  },

  /**
   * Obtenir les couleurs uniques
   */
  getUniqueColors(materials: Material[]): string[] {
    const colors = materials.map(m => m.couleur).filter(Boolean);
    return [...new Set(colors)].sort();
  },

  /**
   * Obtenir les statistiques des matériaux
   */
  getMaterialsStats(materials: Material[]) {
    const total = materials.length;
    const available = materials.filter(m => m.estDisponible).length;
    const unavailable = total - available;
    
    const prices = materials.map(m => this.getPrixParGramme(m)).filter(p => p > 0);
    const priceRange = prices.length > 0 ? {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((sum, p) => sum + p, 0) / prices.length
    } : { min: 0, max: 0, avg: 0 };

    const typeDistribution = materials.reduce((acc, material) => {
      const type = material.type || 'Autre';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const difficultyDistribution = materials.reduce((acc, material) => {
      const difficulty = material.difficulteImpression || 'moyen';
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      available,
      unavailable,
      priceRange: {
        min: this.formatPrice(priceRange.min),
        max: this.formatPrice(priceRange.max),
        avg: this.formatPrice(priceRange.avg)
      },
      typeDistribution,
      difficultyDistribution,
      averagePrice: priceRange.avg
    };
  }
};
