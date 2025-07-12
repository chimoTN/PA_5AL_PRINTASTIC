// src/hooks/useAuth.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const refreshAuth = async () => {
    setIsLoading(true);
    try {
      const ok = await authService.checkSession();
      if (ok) {
        const u = authService.getCurrentUser();
        setUser(u);
        setIsAuthenticated(true);
      }  else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, motDePasse: string) => {
    setIsLoading(true);
    try {
      await authService.login(email, motDePasse);
      const u = authService.getCurrentUser();
      setUser(u);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, error, login, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
