// src/components/PrivateRoute.tsx
/**
 * Componente para proteger rotas privadas
 * Redireciona para login se não autenticado
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redireciona para login se não autenticado
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verifica permissão de admin se necessário
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/cliente/projetos" replace />;
  }

  // Renderiza o conteúdo protegido
  return <>{children}</>;
};
