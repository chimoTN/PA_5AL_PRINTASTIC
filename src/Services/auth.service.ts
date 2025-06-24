<<<<<<< HEAD:src/services/auth.service.ts
// src/services/auth.service.ts
import { baseService, type AuthResponse, type AuthUser } from './base.service';

interface ProfilResponse {
  success: boolean;
  utilisateur?: AuthUser;
  message?: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('👤 Tentative de connexion pour:', email);
      
      const response = await baseService.post<AuthResponse>('/auth/connexion', {
        email,
        motDePasse: password
      });

      console.log('🔍 Réponse de connexion:', response);

      if (response.success && response.utilisateur) {
        this.currentUser = response.utilisateur;
        localStorage.setItem('user', JSON.stringify(response.utilisateur));
        console.log('✅ Utilisateur connecté et stocké:', this.currentUser);
        return response;
      }

      throw new Error(response.message || 'Échec de la connexion');
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      this.logout();
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Tentative de déconnexion côté serveur
      await baseService.post('/auth/deconnexion', {});
    } catch (error) {
      console.warn('⚠️ Erreur lors de la déconnexion serveur:', error);
    } finally {
      // Nettoyage côté client
      this.currentUser = null;
      localStorage.removeItem('user');
      console.log('✅ Déconnexion locale effectuée');
    }
  }

  getCurrentUser(): AuthUser | null {
    if (!this.currentUser) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          this.currentUser = JSON.parse(userData);
          console.log('👤 Utilisateur récupéré du localStorage:', this.currentUser);
        } catch (e) {
          console.error('❌ Erreur parsing user data:', e);
          localStorage.removeItem('user');
        }
      }
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    const isAuth = !!user;
    console.log('🔍 Vérification authentification locale:', { isAuth, user: user?.email });
    return isAuth;
  }

  // ✅ CORRECTION : Utilisation de la route /api/auth/profil
  async checkSession(): Promise<boolean> {
    try {
      console.log('🔍 Vérification de la session serveur...');
      
      const response = await baseService.get<ProfilResponse>('/auth/profil');
      
      console.log('📡 Réponse session:', response);

      if (response.success && response.utilisateur) {
        // Mettre à jour les infos utilisateur
        this.currentUser = response.utilisateur;
        localStorage.setItem('user', JSON.stringify(response.utilisateur));
        console.log('✅ Session valide, utilisateur mis à jour:', this.currentUser);
        return true;
      }
      
      console.warn('⚠️ Session invalide');
      this.logout();
      return false;
    } catch (error: any) {
      console.warn('⚠️ Erreur vérification session:', error.message);
      
      // Si erreur 401, session expirée
      if (error.message?.includes('401') || error.message?.includes('Non authentifié')) {
        console.log('🔒 Session expirée (401)');
        this.logout();
      }
      
      return false;
    }
  }

  // ✅ AJOUT : Rafraîchir les données utilisateur
  async refreshUserData(): Promise<AuthUser> {
    const sessionValid = await this.checkSession();
    if (!sessionValid || !this.currentUser) {
      throw new Error('Session expirée - veuillez vous reconnecter');
    }
    return this.currentUser;
  }

  // ✅ AJOUT : Vérification avec gestion d'erreur spécifique
  async ensureAuthenticated(): Promise<void> {
    const isValid = await this.checkSession();
    if (!isValid) {
      throw new Error('Votre session a expiré. Veuillez vous reconnecter.');
    }
  }
}

export const authService = new AuthService();
=======
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
>>>>>>> feat/integration_produits:src/Services/auth.service.ts
