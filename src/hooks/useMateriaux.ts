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

  // ✅ Formater le prix d'un matériau
  const formatPrice = useCallback((coutParGramme: string | number): string => {
    const price = typeof coutParGramme === 'string' 
      ? parseFloat(coutParGramme) 
      : coutParGramme;
    
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(price);
  }, []);

  // ✅ Calculer le coût pour un poids donné
  const calculateCostForWeight = useCallback((materialId: number, weightInGrams: number): number => {
    const material = getMaterialById(materialId);
    if (!material) return 0;
    
    const pricePerGram = typeof material.coutParGramme === 'string' 
      ? parseFloat(material.coutParGramme) 
      : material.coutParGramme;
    
    return pricePerGram * weightInGrams;
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

  // ✅ Obtenir les statistiques des matériaux
  const getMaterialsStats = useCallback(() => {
    const total = materials.length;
    const available = materials.filter(m => m.estDisponible).length;
    const unavailable = total - available;
    
    const priceRange = materials.reduce((acc, material) => {
      const price = typeof material.coutParGramme === 'string' 
        ? parseFloat(material.coutParGramme) 
        : material.coutParGramme;
      
      if (acc.min === null || price < acc.min) acc.min = price;
      if (acc.max === null || price > acc.max) acc.max = price;
      
      return acc;
    }, { min: null as number | null, max: null as number | null });

    return {
      total,
      available,
      unavailable,
      priceRange: {
        min: priceRange.min ? formatPrice(priceRange.min) : 'N/A',
        max: priceRange.max ? formatPrice(priceRange.max) : 'N/A'
      }
    };
  }, [materials, formatPrice]);

  // ✅ Rechercher des matériaux
  const searchMaterials = useCallback((query: string): Material[] => {
    if (!query.trim()) return materials;
    
    const searchTerm = query.toLowerCase().trim();
    
    return materials.filter(material => 
      material.nom.toLowerCase().includes(searchTerm) ||
      material.description?.toLowerCase().includes(searchTerm)
    );
  }, [materials]);

  // ✅ Trier les matériaux
  const sortMaterials = useCallback((sortBy: 'nom' | 'prix' | 'disponibilite', order: 'asc' | 'desc' = 'asc'): Material[] => {
    const sorted = [...materials].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'nom':
          comparison = a.nom.localeCompare(b.nom, 'fr-FR');
          break;
        case 'prix':
          const priceA = typeof a.coutParGramme === 'string' ? parseFloat(a.coutParGramme) : a.coutParGramme;
          const priceB = typeof b.coutParGramme === 'string' ? parseFloat(b.coutParGramme) : b.coutParGramme;
          comparison = priceA - priceB;
          break;
        case 'disponibilite':
          comparison = (b.estDisponible ? 1 : 0) - (a.estDisponible ? 1 : 0);
          break;
        default:
          return 0;
      }
      
      return order === 'desc' ? -comparison : comparison;
    });
    
    return sorted;
  }, [materials]);

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
    
    // Sélecteurs
    getMaterialById,
    getAvailableMaterials,
    
    // Utilitaires prix
    formatPrice,
    calculateCostForWeight,
    formatCalculatedCost,
    
    // Vérifications
    isMaterialAvailable,
    
    // Fonctions avancées
    getMaterialsStats,
    searchMaterials,
    sortMaterials,
    
    // Propriétés calculées
    hasError: !!error,
    isEmpty: materials.length === 0,
    availableCount: materials.filter(m => m.estDisponible).length,
    totalCount: materials.length
  };
};

export default useMaterials;
