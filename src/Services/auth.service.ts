// src/services/api.service.ts
import { API_BASE_URL } from '../config/env';

// Type pour les réponses de l'API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  utilisateur?: any;
}

// Version simplifiée pour l'utilisateur
export interface UserInfo {
  id: number;
  email: string;
  nom?: string;
  prenom?: string;
  role: string;
}

export const apiService = {
  // Méthode générique pour les requêtes
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;

      console.log(`🚀 Requête API: ${options.method || 'GET'} ${url}`);
      if (options.body) {
        console.log('📦 Données envoyées:', JSON.parse(options.body as string));
      }
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          ...(options.headers || {}),
        },
        // CRITICAL: inclure les cookies avec les requêtes
        credentials: 'include',
      });

      if (!response.ok) {
        // Ne pas afficher d'erreur pour les 401 pendant la vérification d'authentification silencieuse
        if (response.status === 401 && endpoint === '/api/auth/profil' && options.silent) {
          throw new Error('Non authentifié');
        }
        
        const errorText = await response.text();
        console.error(`❌ Erreur API (${response.status}):`, errorText);
        throw new Error(`Erreur API (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      // Ne pas afficher d'erreur de connexion pour les vérifications silencieuses
      if (!(options as any).silent) {
        console.error('❌ Erreur de connexion:', error);
      }
      throw error;
    }
  },

  auth: {
    // Connexion de l'utilisateur
    async login(email: string, motDePasse: string): Promise<ApiResponse> {
      console.log('👤 Tentative de connexion pour:', email);
      
      return apiService.request<ApiResponse>('/api/auth/connexion', {
        method: 'POST',
        body: JSON.stringify({ email, motDePasse }),
      });
    },

    // Inscription d'un nouvel utilisateur
    async register(userData: { 
      email: string, 
      motDePasse: string, 
      nom: string, 
      prenom: string 
    }): Promise<ApiResponse> {
      return apiService.request<ApiResponse>('/api/auth/inscription', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },

    // Récupération du profil de l'utilisateur connecté
    async getProfile(silent: boolean = false): Promise<ApiResponse> {
      return apiService.request<ApiResponse>('/api/auth/profil', {
        silent, // Passer l'option pour les appels silencieux
      } as any);
    },

    // Déconnexion de l'utilisateur
    async logout(): Promise<void> {
      try {
        await apiService.request<ApiResponse>('/api/auth/deconnexion', {
          method: 'POST',
        });
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
    },
    
    // Vérification de l'authentification - MÉTHODE AMÉLIORÉE
    async checkAuth(): Promise<boolean> {
      try {
        // Vérifier si un cookie d'authentification existe
        // Note: pour Express/connect.sid qui est le cookie standard de session Express
        const cookies = document.cookie.split(';');
        const authCookieExists = cookies.some(cookie => 
          cookie.trim().startsWith('connect.sid='));
          
        // Si aucun cookie de session, éviter l'appel API inutile
        if (!authCookieExists) {
          console.log('Aucun cookie de session trouvé');
          return false;
        }
    
        // Appel API silencieux pour vérifier l'authentification
        const response = await this.getProfile(true);
        return response.success === true;
      } catch (error) {
        return false;
      }
    }    
  }
};
