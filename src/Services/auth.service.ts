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
