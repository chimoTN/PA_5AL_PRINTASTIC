// src/services/base.service.ts
import { API_BASE_URL } from '../config/env';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  utilisateur?: any;
}

export const baseService = {
  // Obtenir l'URL de base
  getBaseUrl(): string {
    return API_BASE_URL;
  },

  // Méthode générique pour les requêtes
  async request<T>(endpoint: string, options: RequestInit & { silent?: boolean } = {}): Promise<T> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const { silent, ...fetchOptions } = options;

      if (!silent) {
        console.log(`🚀 Requête API: ${fetchOptions.method || 'GET'} ${url}`);
        if (fetchOptions.body && typeof fetchOptions.body === 'string') {
          console.log('📦 Données envoyées:', JSON.parse(fetchOptions.body));
        }
      }
      
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          ...(fetchOptions.headers || {}),
        },
        // CRITICAL: inclure les cookies avec les requêtes
        credentials: 'include',
      });

      if (!response.ok) {
        // Ne pas afficher d'erreur pour les 401 pendant la vérification d'authentification silencieuse
        if (response.status === 401 && endpoint === '/api/auth/profil' && silent) {
          throw new Error('Non authentifié');
        }
        
        const errorText = await response.text();
        if (!silent) {
          console.error(`❌ Erreur API (${response.status}):`, errorText);
        }
        throw new Error(`Erreur API (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      // Ne pas afficher d'erreur de connexion pour les vérifications silencieuses
      if (!options.silent) {
        console.error('❌ Erreur de connexion:', error);
      }
      throw error;
    }
  },

  // Méthode pour les uploads de fichiers (sans Content-Type)
  async uploadRequest<T>(endpoint: string, formData: FormData): Promise<T> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      
      console.log(`📤 Upload vers: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur upload (${response.status}):`, errorText);
        throw new Error(`Erreur upload (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error('❌ Erreur upload:', error);
      throw error;
    }
  }
};
