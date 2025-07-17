// src/hooks/useAuth.tsx - CORRIGÉ
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { AuthUser } from '../services/base.service';

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

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAuth = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Refresh auth...');
      
      const ok = await authService.checkSession();
      console.log('📡 Session check result:', ok);
      
      if (ok) {
        const u = authService.getCurrentUser();
        console.log('👤 User from service:', u);
        setUser(u);
        setIsAuthenticated(true);
      } else {
        console.log('❌ Session invalide');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Error in refreshAuth:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };



  // ✅ CORRECTION : Gestion d'erreur dans login
  const login = async (email: string, motDePasse: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔑 Hook login attempt:', email);
      
      const response = await authService.login(email, motDePasse);
      console.log('✅ AuthService login response:', response);
      
      if (response.success && response.utilisateur) {
        setUser(response.utilisateur);
        setIsAuthenticated(true);
        console.log('✅ Hook login success:', response.utilisateur);
      } else {
        throw new Error(response.message || 'Échec de la connexion');
      }
      
    } catch (error: any) {
      console.error('❌ Hook login error:', error);
      setError(error.message || 'Erreur de connexion');
      setUser(null);
      setIsAuthenticated(false);
      
      // ✅ IMPORTANT : Rethrow pour que LoginPage puisse récupérer l'erreur
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('❌ Error in logout:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      error, 
      login, 
      logout, 
      refreshAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};