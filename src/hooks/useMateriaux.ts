// src/hooks/useMateriaux.ts
import { useState, useEffect } from 'react';
import { materialsService, Material, MaterialsResponse } from '../services/materials.service';

export const useMateriaux = () => {
  const [materiaux, setMateriaux] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMateriaux = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Récupération des matériaux...');
      const response: MaterialsResponse = await materialsService.getAvailableMaterials();
      console.log('📦 Réponse API:', response);
      
      if (response.success && response.data) {
        setMateriaux(response.data);
        console.log('📋 Matériaux reçus:', response.data);
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des matériaux');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des matériaux');
      console.error('Erreur matériaux:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMateriaux();
  }, []);

  const refetch = () => {
    fetchMateriaux();
  };

  return { materiaux, loading, error, refetch };
};
