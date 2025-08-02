// src/components/Layout/Layout.tsx
/**
 * Layout principal da aplicação
 * Wrapper com header e área de conteúdo
 * Otimizado: Evita re-renders desnecessários
 */

import React, { memo } from 'react';
import { Header } from './Header';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

// Usa memo para evitar re-renders desnecessários
export const Layout: React.FC<LayoutProps> = memo(({ children }) => {
  const { user, loading } = useAuth();

  // Durante o loading inicial, não renderiza nada
  if (loading && !user) {
    return <>{children}</>;
  }

  // Se não há usuário logado, não mostra o layout completo
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
});

Layout.displayName = 'Layout';