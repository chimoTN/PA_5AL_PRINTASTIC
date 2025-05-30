// src/hooks/useAuth.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../Services/auth.service';

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, motDePasse: string) => Promise<any>;
  logout: () => Promise<void>;
  // Autres méthodes...
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Vérifier l'authentification via l'API
        const isLoggedIn = await apiService.auth.checkAuth();
        
        if (isLoggedIn) {
          // Si authentifié, récupérer les infos du profil
          const profileResponse = await apiService.auth.getProfile();
          
          if (profileResponse.success && profileResponse.utilisateur) {
            setUser(profileResponse.utilisateur);
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification d\'authentification:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, motDePasse: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.auth.login(email, motDePasse);
      
      if (response.success && response.utilisateur) {
        // Stocker l'utilisateur mais pas de token (cookies gérés par le navigateur)
        setUser(response.utilisateur);
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
      return response;
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      setIsLoading(false);
      
      // Retourner un objet de réponse d'erreur formaté
      return {
        success: false,
        message: error.message || 'Erreur lors de la connexion'
      };
    }
  };

  const logout = async () => {
    try {
      await apiService.auth.logout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      // Pas besoin de supprimer de token, le serveur gère les cookies de session
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    // Ajoutez d'autres méthodes au besoin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};