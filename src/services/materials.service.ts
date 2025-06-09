// src/services/materials.service.ts

import { baseService } from "./base.service";

export interface Material {
  id: number;
  nom: string;
  description?: string;
  coutParGramme: number; // Correspond exactement au backend
  estDisponible: boolean;
  dateCreation?: string;
  dateMiseAJour?: string;
  // Propriétés calculées pour l'affichage
  prixParGramme?: number; // Alias pour la compatibilité
  couleur?: string; // Optionnel si pas dans le backend
}

export interface MaterialsResponse {
  success: boolean;
  data?: Material[];
  message?: string;
  count?: number;
}

export const materialsService = {
  // Récupération de tous les matériaux (PUBLIC maintenant)
  async getAllMaterials(): Promise<MaterialsResponse> {
    const response = await baseService.request<MaterialsResponse>('/api/materiaux/all', {
      method: 'GET',
    });
    
    // Transformation des données pour compatibilité frontend
    if (response.data) {
      response.data = response.data.map(material => ({
        ...material,
        prixParGramme: material.coutParGramme, // Alias pour compatibilité
        couleur: material.couleur || 'Standard' // Valeur par défaut si pas de couleur
      }));
    }
    
    return response;
  },

  // Récupération des matériaux disponibles uniquement (PUBLIC)
  async getAvailableMaterials(): Promise<MaterialsResponse> {
    const response = await baseService.request<MaterialsResponse>('/api/materiaux/available', {
      method: 'GET',
    });
    
    // Transformation des données pour compatibilité frontend
    if (response.data) {
      response.data = response.data.map(material => ({
        ...material,
        prixParGramme: material.coutParGramme,
        couleur: material.couleur || 'Standard'
      }));
    }
    
    return response;
  },

  // Récupération d'un matériau par ID (PUBLIC)
  async getMaterialById(materialId: number): Promise<{ success: boolean; data?: Material; message?: string }> {
    const response = await baseService.request(`/api/materiaux/${materialId}`, {
      method: 'GET',
    });
    
    // Transformation pour compatibilité
    if (response.data) {
      response.data = {
        ...response.data,
        prixParGramme: response.data.coutParGramme,
        couleur: response.data.couleur || 'Standard'
      };
    }
    
    return response;
  },

  // Méthode générique pour compatibilité (utilise maintenant getAllMaterials)
  async getMaterials(): Promise<MaterialsResponse> {
    return this.getAllMaterials();
  },

  // MÉTHODES ADMIN (nécessitent authentification)
  
  // Créer un nouveau matériau
  async createMaterial(materialData: {
    nom: string;
    description: string;
    coutParGramme: number;
    estDisponible?: boolean;
  }): Promise<{ success: boolean; data?: Material; message?: string }> {
    return baseService.request('/api/materiaux/admin/create', {
      method: 'POST',
      body: materialData,
    });
  },

  // Mettre à jour un matériau
  async updateMaterial(
    materialId: number, 
    materialData: Partial<{
      nom: string;
      description: string;
      coutParGramme: number;
      estDisponible: boolean;
    }>
  ): Promise<{ success: boolean; data?: Material; message?: string }> {
    return baseService.request(`/api/materiaux/admin/${materialId}`, {
      method: 'PUT',
      body: materialData,
    });
  },

  // Supprimer un matériau
  async deleteMaterial(materialId: number): Promise<{ success: boolean; message?: string }> {
    return baseService.request(`/api/materiaux/admin/${materialId}`, {
      method: 'DELETE',
    });
  },

  // MÉTHODES UTILITAIRES
  
  // Calcul du prix estimé pour un modèle
  calculateEstimatedPrice(material: Material, size: number, estimatedWeight: number = 50): number {
    // Utiliser coutParGramme ou prixParGramme selon disponibilité
    const prixUnitaire = material.coutParGramme || material.prixParGramme || 0;
    
    // Calcul: prix par gramme * poids estimé * facteur de taille
    const sizeMultiplier = size / 100; // Convertir le pourcentage en multiplicateur
    const estimatedCost = prixUnitaire * estimatedWeight * sizeMultiplier;
    
    // Arrondir à 2 décimales
    return Math.round(estimatedCost * 100) / 100;
  },

  // Validation des données de matériau
  validateMaterialData(materialId: number, size: number): { isValid: boolean; error?: string } {
    if (!materialId || materialId <= 0) {
      return { isValid: false, error: "Veuillez sélectionner un matériau valide." };
    }

    if (!size || size < 10 || size > 1000) {
      return { isValid: false, error: "La taille doit être comprise entre 10% et 1000%." };
    }

    return { isValid: true };
  },

  // Validation des données pour création/modification (admin)
  validateMaterialCreationData(data: {
    nom?: string;
    description?: string;
    coutParGramme?: number;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.nom || data.nom.trim().length < 2) {
      errors.push("Le nom du matériau doit contenir au moins 2 caractères.");
    }

    if (!data.description || data.description.trim().length < 10) {
      errors.push("La description doit contenir au moins 10 caractères.");
    }

    if (!data.coutParGramme || data.coutParGramme <= 0) {
      errors.push("Le coût par gramme doit être supérieur à 0.");
    }

    if (data.coutParGramme && data.coutParGramme > 10) {
      errors.push("Le coût par gramme semble trop élevé (max: 10€/g).");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Formatage du prix pour l'affichage
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  },

  // Obtenir les types de matériaux disponibles
  getAvailableTypes(materials: Material[]): string[] {
    const types = materials
      .filter(m => m.estDisponible)
      .map(m => m.nom)
      .filter((type, index, arr) => arr.indexOf(type) === index);
    
    return types.sort();
  },

  // Obtenir les couleurs disponibles (si présentes)
  getAvailableColors(materials: Material[]): string[] {
    const colors = materials
      .filter(m => m.estDisponible && m.couleur)
      .map(m => m.couleur!)
      .filter((color, index, arr) => arr.indexOf(color) === index);
    
    return colors.sort();
  },

  // Filtrer les matériaux par type
  filterByType(materials: Material[], type: string): Material[] {
    return materials.filter(m => 
      m.nom.toLowerCase().includes(type.toLowerCase()) && m.estDisponible
    );
  },

  // Filtrer les matériaux par couleur (si disponible)
  filterByColor(materials: Material[], color: string): Material[] {
    return materials.filter(m => 
      m.couleur?.toLowerCase() === color.toLowerCase() && m.estDisponible
    );
  },

  // Obtenir le matériau le moins cher
  getCheapestMaterial(materials: Material[]): Material | null {
    const availableMaterials = materials.filter(m => m.estDisponible);
    if (availableMaterials.length === 0) return null;

    return availableMaterials.reduce((cheapest, current) => {
      const currentPrice = current.coutParGramme || current.prixParGramme || 0;
      const cheapestPrice = cheapest.coutParGramme || cheapest.prixParGramme || 0;
      return currentPrice < cheapestPrice ? current : cheapest;
    });
  },

  // Obtenir les matériaux recommandés (critères de qualité/prix)
  getRecommendedMaterials(materials: Material[]): Material[] {
    const availableMaterials = materials.filter(m => m.estDisponible);
    
    // Recommander PLA et PETG s'ils sont disponibles
    const recommended = availableMaterials.filter(m => 
      m.nom.toLowerCase().includes('pla') || 
      m.nom.toLowerCase().includes('petg')
    );

    // Si pas de matériaux spécifiques, retourner les 3 moins chers
    if (recommended.length === 0) {
      return availableMaterials
        .sort((a, b) => {
          const priceA = a.coutParGramme || a.prixParGramme || 0;
          const priceB = b.coutParGramme || b.prixParGramme || 0;
          return priceA - priceB;
        })
        .slice(0, 3);
    }

    return recommended;
  }
};
