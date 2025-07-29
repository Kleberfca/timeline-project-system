// src/components/Layout/MobileMenu.tsx
/**
 * Menu mobile slide-in
 * Atualizado com novas opções
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();

  // Links do menu baseados no tipo de usuário
  const menuLinks = isAdmin ? [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/clientes', label: 'Clientes', icon: '👥' },
    { path: '/admin/projetos', label: 'Projetos', icon: '📁' },
    { path: '/admin/config', label: 'Configurações', icon: '⚙️' },
  ] : [
    { path: '/cliente/projetos', label: 'Meus Projetos', icon: '📁' },
  ];

  const isActiveLink = (path: string) => location.pathname.startsWith(path);

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  return (
    <>
      {/* Overlay com fade */}
      <div
        className={`
          fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* Menu slide-in */}
      <div
        className={`
          fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 lg:hidden
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header do menu */}
        <div className="flex items-center justify-between p-4 border-b border-brand-lighter">
          <h2 className="text-lg font-semibold text-brand-dark">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-brand-lighter transition-colors"
            aria-label="Fechar menu"
          >
            <svg className="w-5 h-5 text-brand-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Informações do usuário */}
        {user && (
          <div className="p-4 border-b border-brand-lighter bg-brand-lighter/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {user.nome.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-brand-dark">{user.nome}</p>
                <p className="text-xs text-brand-gray">
                  {isAdmin ? 'Administrador' : 'Cliente'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Links de navegação */}
        <nav className="p-4">
          <ul className="space-y-1">
            {menuLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  onClick={onClose}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${isActiveLink(link.path)
                      ? 'bg-brand-blue text-white'
                      : 'hover:bg-brand-lighter text-brand-dark'
                    }
                  `}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Links da conta */}
        <div className="p-4 border-t border-brand-lighter">
          <ul className="space-y-1">
            <li>
              <Link
                to="/perfil"
                onClick={onClose}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-brand-lighter text-brand-dark transition-all"
              >
                <svg className="w-5 h-5 text-brand-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">Meu Perfil</span>
              </Link>
            </li>
            <li>
              <Link
                to="/alterar-senha"
                onClick={onClose}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-brand-lighter text-brand-dark transition-all"
              >
                <svg className="w-5 h-5 text-brand-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span className="font-medium">Alterar Senha</span>
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-brand-lighter text-red-600 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Sair</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Footer do menu */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-brand-lighter bg-brand-lighter/30">
          <p className="text-xs text-brand-gray text-center">
            Timeline Project System
          </p>
          <p className="text-xs text-brand-light text-center mt-1">
            Versão 1.0.0
          </p>
        </div>
      </div>
    </>
  );
};