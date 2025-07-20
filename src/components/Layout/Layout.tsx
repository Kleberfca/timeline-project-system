// src/components/Layout/Layout.tsx
/**
 * Layout principal da aplicação
 * Wrapper com header e área de conteúdo
 */

import React from 'react';
import { Header } from './Header';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();

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
};
