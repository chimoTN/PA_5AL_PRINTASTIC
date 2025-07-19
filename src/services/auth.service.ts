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
      
      // ✅ DÉCONNEXION AUTOMATIQUE AVANT CONNEXION
      console.log('🔄 Déconnexion automatique avant nouvelle connexion...');
      await this.logout();
      
      const response = await baseService.post<AuthResponse>('/auth/connexion', {
        email,
        motDePasse: password
      });

      console.log('🔍 Réponse de connexion:', response);

      if (response.success && response.utilisateur) {
        // ✅ PAS de manipulation cookie - le navigateur gère automatiquement
        this.currentUser = response.utilisateur;
        localStorage.setItem('user', JSON.stringify(response.utilisateur));
        console.log('✅ Utilisateur connecté:', this.currentUser);
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
      // ✅ Appel au backend pour invalider la session
      await baseService.post('/auth/deconnexion', {});
    } catch (error) {
      console.warn('⚠️ Erreur déconnexion serveur:', error);
    } finally {
      // ✅ Nettoyage complet côté frontend
      this.currentUser = null;
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      
      // ✅ Supprimer tous les cookies liés à l'authentification
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        if (name.startsWith('connect.sid') || name.startsWith('debug_session') || name.startsWith('test_')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.onrender.com;`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
      
      console.log('✅ Déconnexion complète effectuée (session + cookies + localStorage)');
    }
  }

  getCurrentUser(): AuthUser | null {
    if (!this.currentUser) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          this.currentUser = JSON.parse(userData);
        } catch (e) {
          console.error('❌ Erreur parsing user data:', e);
          localStorage.removeItem('user');
        }
      }
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  async checkSession(): Promise<boolean> {
    try {
      console.log('🔍 Vérification session...');
      
      const response = await baseService.get<ProfilResponse>('/auth/profil');
      
      if (response.success && response.utilisateur) {
        this.currentUser = response.utilisateur;
        localStorage.setItem('user', JSON.stringify(response.utilisateur));
        console.log('✅ Session valide');
        return true;
      }
      
      this.logout();
      return false;
    } catch (error: any) {
      console.warn('⚠️ Session invalide:', error.message);
      this.logout();
      return false;
    }
  }

  async refreshUserData(): Promise<AuthUser> {
    const sessionValid = await this.checkSession();
    if (!sessionValid || !this.currentUser) {
      throw new Error('Session expirée - veuillez vous reconnecter');
    }
    return this.currentUser;
  }
}

export const authService = new AuthService();
