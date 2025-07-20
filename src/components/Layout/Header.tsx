// src/components/Layout/Header.tsx
/**
 * Header principal da aplicação
 * Mostra navegação e informações do usuário
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e navegação principal */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Timeline</h1>
            </Link>
            
            {user && (
              <nav className="ml-10 flex items-baseline space-x-4">
                {isAdmin ? (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/clientes"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Clientes
                    </Link>
                    <Link
                      to="/admin/projetos"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Projetos
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/cliente/projetos"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Meus Projetos
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* Informações do usuário e logout */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <p className="font-medium">{user.nome}</p>
                <p className="text-xs text-gray-500">
                  {isAdmin ? 'Administrador' : 'Cliente'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
