// src/services/auth.service.ts

import { baseService } from "./base.service";

export interface AuthResponse {
  success: boolean;
  message?: string;
  utilisateur?: any;
}

export interface RegisterData {
  email: string;
  motDePasse: string;
  nom: string;
  prenom: string;
}

export const authService = {
  // Connexion de l'utilisateur
  async login(email: string, motDePasse: string): Promise<AuthResponse> {
    console.log('👤 Tentative de connexion pour:', email);
    
    return baseService.request<AuthResponse>('/api/auth/connexion', {
      method: 'POST',
      body: JSON.stringify({ email, motDePasse }),
    });
  },

  // Inscription d'un nouvel utilisateur
  async register(userData: RegisterData): Promise<AuthResponse> {
    return baseService.request<AuthResponse>('/api/auth/inscription', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Récupération du profil de l'utilisateur connecté
  async getProfile(silent: boolean = false): Promise<AuthResponse> {
    return baseService.request<AuthResponse>('/api/auth/profil', {
      silent,
    } as any);
  },

  // Déconnexion de l'utilisateur
  async logout(): Promise<void> {
    try {
      await baseService.request<AuthResponse>('/api/auth/deconnexion', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  },
  
  // Vérification de l'authentification
  async checkAuth(): Promise<boolean> {
    try {
      // Vérifier si un cookie d'authentification existe
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
};