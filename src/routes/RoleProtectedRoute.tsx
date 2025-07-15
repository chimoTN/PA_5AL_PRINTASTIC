// src/routes/RoleProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  roles: Array<'PROPRIETAIRE' | 'CLIENT' | 'IMPRIMEUR'>;
  redirectTo?: string;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  roles,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Chargement…</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  if (!user || !roles.includes(user.role as any)) {
    // Ici tu peux rediriger vers une 403, /erreur, ou la home
    return <Navigate to="/erreur" replace />;
  }
  return <>{children}</>;
};

export default RoleProtectedRoute;
