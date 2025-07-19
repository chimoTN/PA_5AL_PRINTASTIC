// src/services/auth.service.ts
import { baseService, type AuthResponse, type AuthUser } from './base.service';

interface ProfilResponse {
  success: boolean;
  utilisateur?: AuthUser;
  message?: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;

  // ✅ NOUVELLES FONCTIONS : Gestion manuelle des cookies
  private getSessionCookie(): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'connect.sid') {
        return value;
      }
    }
    return null;
  }

  private setSessionCookie(sessionId: string): void {
    // Supprimer l'ancien cookie d'abord
    this.removeSessionCookie();
    
    // Créer le nouveau cookie avec les bons paramètres
    const cookieValue = `connect.sid=${sessionId}; Max-Age=86400; Path=/; Domain=.onrender.com; Secure; SameSite=None`;
    document.cookie = cookieValue;
    
    console.log('🍪 Cookie de session défini manuellement:', sessionId);
  }

  private removeSessionCookie(): void {
    // Supprimer avec différents domaines et chemins
    const domains = ['.onrender.com', 'pa-5al-printastic.onrender.com', 'projet3dback.onrender.com', ''];
    const paths = ['/', '/api'];
    
    domains.forEach(domain => {
      paths.forEach(path => {
        const domainPart = domain ? `; domain=${domain}` : '';
        document.cookie = `connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}${domainPart}`;
      });
    });
    
    console.log('🍪 Cookie de session supprimé manuellement');
  }

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
        // ✅ GESTION MANUELLE DU COOKIE DE SESSION
        if (response.sessionId) {
          console.log('🔑 Session ID reçu du backend:', response.sessionId);
          this.setSessionCookie(response.sessionId);
        } else {
          console.warn('⚠️ Aucun sessionId reçu du backend');
        }
        
        // Vérifier que le cookie a été défini
        const sessionCookie = this.getSessionCookie();
        console.log('🍪 Cookie de session après connexion:', sessionCookie);
        
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
      
      // ✅ SUPPRESSION MANUELLE DU COOKIE DE SESSION
      this.removeSessionCookie();
      
      // ✅ Supprimer tous les autres cookies liés à l'authentification
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        if (name.startsWith('debug_session') || name.startsWith('test_')) {
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
