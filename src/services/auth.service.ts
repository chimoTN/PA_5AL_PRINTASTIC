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
      console.log('👤 === DÉBUT CONNEXION ===');
      console.log('👤 Tentative de connexion pour:', email);
      
      // ✅ DÉCONNEXION AUTOMATIQUE AVANT CONNEXION
      console.log('🔄 Déconnexion automatique avant nouvelle connexion...');
      await this.logout();
      
      console.log('📡 Envoi de la requête de connexion...');
      const response = await baseService.post<AuthResponse>('/auth/connexion', {
        email,
        motDePasse: password
      });

      console.log('🔍 Réponse de connexion reçue:', response);

      if (response.success && response.utilisateur) {
        // ✅ LAISSER LE NAVIGATEUR GÉRER LES COOKIES AUTOMATIQUEMENT
        console.log('✅ Connexion réussie - cookies gérés par le navigateur');
        console.log('🔑 Session ID reçu:', response.sessionId);
        
        // Vérifier les cookies après connexion
        console.log('🍪 === VÉRIFICATION COOKIES APRÈS CONNEXION ===');
        console.log('🍪 Cookies disponibles:', document.cookie);
        
        // Chercher spécifiquement le cookie de session
        const cookies = document.cookie.split(';');
        const sessionCookie = cookies.find(cookie => 
          cookie.trim().startsWith('connect.sid=')
        );
        
        if (sessionCookie) {
          console.log('✅ Cookie de session trouvé:', sessionCookie.trim());
          const sessionId = sessionCookie.split('=')[1];
          console.log('🔑 Session ID dans le cookie:', sessionId);
        } else {
          console.warn('⚠️ Cookie de session non trouvé dans document.cookie');
        }
        console.log('🍪 ===========================================');
        
        this.currentUser = response.utilisateur;
        localStorage.setItem('user', JSON.stringify(response.utilisateur));
        console.log('✅ Utilisateur connecté:', this.currentUser);
        console.log('👤 === FIN CONNEXION ===');
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
      
      // ✅ LAISSER LE NAVIGATEUR GÉRER LA SUPPRESSION DES COOKIES
      console.log('✅ Déconnexion complète effectuée (session + localStorage)');
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
      console.log('🔍 === VÉRIFICATION SESSION ===');
      console.log('🔍 Envoi de la requête de vérification...');
      
      // Vérifier les cookies avant l'envoi
      console.log('🍪 Cookies avant vérification session:', document.cookie);
      const sessionCookie = document.cookie.split(';').find(cookie => 
        cookie.trim().startsWith('connect.sid=')
      );
      if (sessionCookie) {
        console.log('✅ Cookie de session présent avant requête:', sessionCookie.trim());
      } else {
        console.warn('⚠️ Aucun cookie de session trouvé avant requête');
      }
      
      const response = await baseService.get<ProfilResponse>('/auth/profil');
      
      if (response.success && response.utilisateur) {
        this.currentUser = response.utilisateur;
        localStorage.setItem('user', JSON.stringify(response.utilisateur));
        console.log('✅ Session valide - utilisateur récupéré:', response.utilisateur.email);
        console.log('🔍 === FIN VÉRIFICATION SESSION ===');
        return true;
      }
      
      console.log('❌ Session invalide - réponse échouée');
      this.logout();
      return false;
    } catch (error: any) {
      console.warn('⚠️ Session invalide - erreur:', error.message);
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
