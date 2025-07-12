// src/hooks/useMaterials.ts
import { useState, useEffect, useCallback } from 'react';
import { Material, materialsService } from '../services/materials.service';

export const useMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Charger les matériaux disponibles
  const loadMaterials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement des matériaux...');
      const availableMaterials = await materialsService.getAvailableMaterials();
      
      setMaterials(availableMaterials);
      console.log('✅ Matériaux chargés:', availableMaterials.length);
      
    } catch (err: any) {
      console.error('❌ Erreur chargement matériaux:', err);
      setError(err.message || 'Erreur lors du chargement des matériaux');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Charger tous les matériaux (disponibles et non disponibles)
  const loadAllMaterials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement de tous les matériaux...');
      const allMaterials = await materialsService.getAllMaterials();
      
      setMaterials(allMaterials);
      console.log('✅ Tous les matériaux chargés:', allMaterials.length);
      
    } catch (err: any) {
      console.error('❌ Erreur chargement tous matériaux:', err);
      setError(err.message || 'Erreur lors du chargement de tous les matériaux');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Recharger les matériaux
  const refetch = useCallback(async () => {
    await loadMaterials();
  }, [loadMaterials]);

  // ✅ Obtenir un matériau par ID
  const getMaterialById = useCallback((id: number): Material | undefined => {
    return materials.find(material => material.id === id);
  }, [materials]);

  // ✅ Obtenir les matériaux disponibles uniquement
  const getAvailableMaterials = useCallback((): Material[] => {
    return materials.filter(material => material.estDisponible);
  }, [materials]);

  // ✅ Fonction pour obtenir le prix (utilise le service)
  const getPrixParGramme = useCallback((material: Material): number => {
    return materialsService.getPrixParGramme(material);
  }, []);

  // ✅ Obtenir la densité (utilise le service)
  const getDensite = useCallback((material: Material): number => {
    return materialsService.getDensite(material);
  }, []);

  // ✅ Formater le prix d'un matériau (utilise le service)
  const formatPrice = useCallback((prix: number | string): string => {
    return materialsService.formatPrice(prix);
  }, []);

  // ✅ Calculer le coût pour un poids donné
  const calculateCostForWeight = useCallback((materialId: number, weightInGrams: number): number => {
    const material = getMaterialById(materialId);
    if (!material) return 0;
    
    return materialsService.calculateCostForWeight(material, weightInGrams);
  }, [getMaterialById]);

  // ✅ Formater le coût calculé
  const formatCalculatedCost = useCallback((materialId: number, weightInGrams: number): string => {
    const cost = calculateCostForWeight(materialId, weightInGrams);
    return formatPrice(cost);
  }, [calculateCostForWeight, formatPrice]);

  // ✅ Vérifier si un matériau est disponible
  const isMaterialAvailable = useCallback((id: number): boolean => {
    const material = getMaterialById(id);
    return material?.estDisponible || false;
  }, [getMaterialById]);

  // ✅ Obtenir les statistiques des matériaux (utilise le service)
  const getMaterialsStats = useCallback(() => {
    return materialsService.getMaterialsStats(materials);
  }, [materials]);

  // ✅ Rechercher des matériaux (utilise le service)
  const searchMaterials = useCallback((query: string): Material[] => {
    return materialsService.searchInMaterials(materials, query);
  }, [materials]);

  // ✅ Trier les matériaux (utilise le service)
  const sortMaterials = useCallback((sortBy: 'nom' | 'prix' | 'type' | 'disponibilite' = 'nom'): Material[] => {
    return materialsService.sortMaterials(materials, sortBy);
  }, [materials]);

  // ✅ Obtenir les matériaux par type
  const getMaterialsByType = useCallback((type: string): Material[] => {
    return materials.filter(material => material.type === type);
  }, [materials]);

  // ✅ Obtenir les types de matériaux uniques (utilise le service)
  const getUniqueTypes = useCallback((): string[] => {
    return materialsService.getUniqueTypes(materials);
  }, [materials]);

  // ✅ Obtenir les couleurs uniques (utilise le service)
  const getUniqueColors = useCallback((): string[] => {
    return materialsService.getUniqueColors(materials);
  }, [materials]);

  // ✅ Grouper les matériaux par type (utilise le service)
  const groupMaterialsByType = useCallback((): Record<string, Material[]> => {
    return materialsService.groupMaterialsByType(materials);
  }, [materials]);

  // ✅ Grouper les matériaux par couleur (utilise le service)
  const groupMaterialsByColor = useCallback((): Record<string, Material[]> => {
    return materialsService.groupMaterialsByColor(materials);
  }, [materials]);

  // ✅ Calculer le poids de matériau nécessaire (utilise le service)
  const calculateMaterialWeight = useCallback((
    materialId: number,
    volumeCm3: number,
    fillRate: number = 0.2,
    withSupports: boolean = false
  ): number => {
    const material = getMaterialById(materialId);
    if (!material) return 0;

    return materialsService.calculateMaterialWeight(material, volumeCm3, fillRate, withSupports);
  }, [getMaterialById]);

  // ✅ Calculer le prix total pour une quantité (utilise le service)
  const calculateTotalPrice = useCallback((materialId: number, quantityInGrams: number): number => {
    const material = getMaterialById(materialId);
    if (!material) return 0;
    
    return materialsService.calculateTotalPrice(material, quantityInGrams);
  }, [getMaterialById]);

  // ✅ Formater le prix total (utilise le service)
  const formatTotalPrice = useCallback((materialId: number, quantityInGrams: number): string => {
    const material = getMaterialById(materialId);
    if (!material) return materialsService.formatPrice(0);
    
    return materialsService.formatTotalPrice(material, quantityInGrams);
  }, [getMaterialById]);

  // ✅ Obtenir les matériaux par difficulté
  const getMaterialsByDifficulty = useCallback((difficulty: 'facile' | 'moyen' | 'difficile'): Material[] => {
    return materials.filter(material => material.difficulteImpression === difficulty);
  }, [materials]);

  // ✅ Obtenir les matériaux qui nécessitent des supports
  const getMaterialsWithSupports = useCallback((): Material[] => {
    return materials.filter(material => material.necessiteSupports);
  }, [materials]);

  // ✅ Obtenir les matériaux sans supports
  const getMaterialsWithoutSupports = useCallback((): Material[] => {
    return materials.filter(material => !material.necessiteSupports);
  }, [materials]);

  // ✅ Obtenir les matériaux par plage de prix
  const getMaterialsByPriceRange = useCallback((minPrice: number, maxPrice: number): Material[] => {
    return materials.filter(material => {
      const price = getPrixParGramme(material);
      return price >= minPrice && price <= maxPrice;
    });
  }, [materials, getPrixParGramme]);

  // ✅ Obtenir les matériaux par température d'impression
  const getMaterialsByTemperature = useCallback((minTemp: number, maxTemp: number): Material[] => {
    return materials.filter(material => 
      material.temperatureImpression >= minTemp && material.temperatureImpression <= maxTemp
    );
  }, [materials]);

  // ✅ Obtenir le matériau le moins cher
  const getCheapestMaterial = useCallback((): Material | null => {
    if (materials.length === 0) return null;
    
    return materials.reduce((cheapest, current) => {
      const cheapestPrice = getPrixParGramme(cheapest);
      const currentPrice = getPrixParGramme(current);
      return currentPrice < cheapestPrice ? current : cheapest;
    });
  }, [materials, getPrixParGramme]);

  // ✅ Obtenir le matériau le plus cher
  const getMostExpensiveMaterial = useCallback((): Material | null => {
    if (materials.length === 0) return null;
    
    return materials.reduce((expensive, current) => {
      const expensivePrice = getPrixParGramme(expensive);
      const currentPrice = getPrixParGramme(current);
      return currentPrice > expensivePrice ? current : expensive;
    });
  }, [materials, getPrixParGramme]);

  // ✅ Vérifier si un matériau nécessite un plateau chauffant
  const requiresHeatedBed = useCallback((materialId: number): boolean => {
    const material = getMaterialById(materialId);
    return material?.temperatureLit !== null && (material?.temperatureLit || 0) > 0;
  }, [getMaterialById]);

  // ✅ Obtenir les recommandations pour un matériau
  const getMaterialRecommendations = useCallback((materialId: number) => {
    const material = getMaterialById(materialId);
    if (!material) return null;

    return {
      material,
      temperatureImpression: material.temperatureImpression,
      temperatureLit: material.temperatureLit,
      tauxRemplissage: material.tauxRemplissageRecommande,
      necessiteSupports: material.necessiteSupports,
      difficulte: material.difficulteImpression,
      notes: material.notes,
      densite: getDensite(material),
      prixParGramme: getPrixParGramme(material),
      coefficientSupports: materialsService.getCoefficientSupports(material),
      perteMateriau: materialsService.getPerteMateriauNumber(material)
    };
  }, [getMaterialById, getDensite, getPrixParGramme]);

  // ✅ Charger les matériaux au montage
  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  return {
    // État
    materials,
    loading,
    error,
    
    // Actions
    loadMaterials,
    loadAllMaterials,
    refetch,
    
    // Sélecteurs de base
    getMaterialById,
    getAvailableMaterials,
    getMaterialsByType,
    getMaterialsByDifficulty,
    getMaterialsWithSupports,
    getMaterialsWithoutSupports,
    getMaterialsByPriceRange,
    getMaterialsByTemperature,
    
    // Sélecteurs avancés
    getCheapestMaterial,
    getMostExpensiveMaterial,
    getMaterialRecommendations,
    
    // Utilitaires types et couleurs
    getUniqueTypes,
    getUniqueColors,
    groupMaterialsByType,
    groupMaterialsByColor,
    
    // Utilitaires prix et calculs
    formatPrice,
    getPrixParGramme,
    getDensite,
    calculateCostForWeight,
    formatCalculatedCost,
    calculateTotalPrice,
    formatTotalPrice,
    
    // Calculs matériaux
    calculateMaterialWeight,
    
    // Vérifications
    isMaterialAvailable,
    requiresHeatedBed,
    
    // Fonctions avancées
    getMaterialsStats,
    searchMaterials,
    sortMaterials,
    
    // Propriétés calculées
    hasError: !!error,
    isEmpty: materials.length === 0,
    availableCount: materials.filter(m => m.estDisponible).length,
    totalCount: materials.length,
    
    // Statistiques rapides
    typeCount: getUniqueTypes().length,
    colorCount: getUniqueColors().length,
    supportsRequiredCount: materials.filter(m => m.necessiteSupports).length,
    easyMaterialsCount: materials.filter(m => m.difficulteImpression === 'facile').length,
    difficultMaterialsCount: materials.filter(m => m.difficulteImpression === 'difficile').length
  };
};

export default useMaterials;
