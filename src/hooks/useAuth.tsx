// src/hooks/useAuth.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import type { AuthUser, AuthContextType } from '../services/base.service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true); // ✅ État authLoading
  const [error, setError] = useState<string | null>(null);

  // ✅ Fonction de vérification d'authentification utilisant votre authService
  const refreshAuth = async (): Promise<void> => {
    try {
      setAuthLoading(true);
      setError(null);
      
      console.log('🔄 Vérification de l\'authentification...');
      
      // ✅ Utiliser votre méthode checkSession
      const sessionValid = await authService.checkSession();
      
      if (sessionValid) {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
          console.log('✅ Authentification confirmée:', currentUser);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('❌ Session invalide');
      }
    } catch (error: any) {
      console.warn('⚠️ Erreur lors de la vérification auth:', error.message);
      setUser(null);
      setIsAuthenticated(false);
      setError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // ✅ Fonction login utilisant votre authService
  const login = async (email: string, motDePasse: string): Promise<void> => {
    try {
      setAuthLoading(true);
      setError(null);
      
      console.log('🔑 Tentative de connexion...');
      
      // ✅ Utiliser votre méthode login (qui prend password comme 2ème param)
      const response = await authService.login(email, motDePasse);
      
      if (response.success && response.utilisateur) {
        setUser(response.utilisateur);
        setIsAuthenticated(true);
        console.log('✅ Connexion réussie:', response.utilisateur);
      } else {
        throw new Error(response.message || 'Échec de la connexion');
      }
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error);
      setError(error.message || 'Erreur de connexion');
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // ✅ Fonction logout utilisant votre authService
  const logout = async (): Promise<void> => {
    try {
      setAuthLoading(true);
      console.log('🚪 Déconnexion...');
      
      // ✅ Utiliser votre méthode logout
      await authService.logout();
      
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      console.log('✅ Déconnexion réussie');
    } catch (error: any) {
      console.error('❌ Erreur déconnexion:', error);
      // Même en cas d'erreur, on déconnecte localement
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } finally {
      setAuthLoading(false);
    }
  };

  // ✅ Vérification initiale au chargement
  useEffect(() => {
    // Vérifier d'abord si on a un utilisateur en localStorage
    const localUser = authService.getCurrentUser();
    if (localUser) {
      console.log('👤 Utilisateur trouvé dans localStorage:', localUser);
      setUser(localUser);
      setIsAuthenticated(true);
      setAuthLoading(false);
      
      // Puis vérifier la session en arrière-plan
      authService.checkSession().then(sessionValid => {
        if (!sessionValid) {
          console.log('⚠️ Session expirée, déconnexion...');
          setUser(null);
          setIsAuthenticated(false);
        }
      }).catch(() => {
        // Ignorer les erreurs de vérification en arrière-plan
      });
    } else {
      // Pas d'utilisateur local, vérifier la session
      refreshAuth();
    }
  }, []);

  // ✅ Valeur du contexte avec tous les champs requis
  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    authLoading, // ✅ Maintenant disponible
    error,
    login,
    logout,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook useAuth
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
