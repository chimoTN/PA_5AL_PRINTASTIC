// src/hooks/useAuth.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services';

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, motDePasse: string) => Promise<any>;
  logout: () => Promise<void>;
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
        const isLoggedIn = await authService.checkAuth();
        
        if (isLoggedIn) {
          // Si authentifié, récupérer les infos du profil
          const profileResponse = await authService.getProfile();
          
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
      const response = await authService.login(email, motDePasse);
      
      if (response.success && response.utilisateur) {
        setUser(response.utilisateur);
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
      return response;
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      setIsLoading(false);
      
      return {
        success: false,
        message: error.message || 'Erreur lors de la connexion'
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
