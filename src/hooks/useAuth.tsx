// src/hooks/useAuth.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authService } from '../Services/auth.service';
import { AuthUser } from '../Services/base.service';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, motDePasse: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ useCallback pour éviter les re-renders inutiles
  const refreshAuth = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Vérification de l\'authentification...');
      
      const sessionValid = await authService.checkSession();
      
      if (sessionValid) {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
          console.log('✅ Authentification confirmée:', currentUser);
        } else {
          console.log('⚠️ Session valide mais pas de données utilisateur');
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
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, motDePasse: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔑 Tentative de connexion...');
      
      const response = await authService.login(email, motDePasse);
      
      // ✅ Gestion flexible des noms de propriétés
      const userData = response.utilisateur || response.user;
      
      if (response.success && userData) {
        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ Connexion réussie:', userData);
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
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🚪 Déconnexion...');
      
      await authService.logout();
      
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      console.log('✅ Déconnexion réussie');
    } catch (error: any) {
      console.error('❌ Erreur déconnexion:', error);
      // ✅ Forcer la déconnexion locale même en cas d'erreur
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ useEffect optimisé
  useEffect(() => {
    let isMounted = true; // ✅ Éviter les updates sur composant démonté
    
    const initializeAuth = async () => {
      try {
        const localUser = authService.getCurrentUser();
        
        if (localUser && isMounted) {
          console.log('👤 Utilisateur trouvé dans localStorage:', localUser);
          setUser(localUser);
          setIsAuthenticated(true);
          
          // ✅ Vérifier en arrière-plan si la session est toujours valide
          try {
            const sessionValid = await authService.checkSession();
            if (!sessionValid && isMounted) {
              console.log('⚠️ Session expirée, nettoyage...');
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (sessionError) {
            console.warn('⚠️ Erreur vérification session arrière-plan:', sessionError);
            // Ne pas déconnecter sur les erreurs réseau temporaires
          }
        } else {
          // ✅ Pas d'utilisateur local, vérifier le serveur
          await refreshAuth();
        }
      } catch (error) {
        console.warn('⚠️ Erreur initialisation auth:', error);
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
    
    // ✅ Cleanup function
    return () => {
      isMounted = false;
    };
  }, [refreshAuth]);

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
