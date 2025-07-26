// src/components/Layout/Header.tsx
/**
 * Header principal da aplicação
 * Atualizado com design profissional e link de configurações
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MobileMenu } from './MobileMenu';
import { useSystemConfig } from '../../hooks/useSystemConfig';

export const Header: React.FC = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { logo, loading: configLoading } = useSystemConfig();

  // Fecha menus ao mudar de rota
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const isActiveLink = (path: string) => location.pathname.startsWith(path);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-brand-lighter sticky top-0 z-30">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
            
            {/* Mobile: Menu Hamburger (esquerda) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-brand-lighter transition-colors"
              aria-label="Abrir menu"
            >
              <svg className="w-6 h-6 text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo (centro no mobile, esquerda no desktop) */}
            <div className="flex items-center lg:flex-1">
              <Link to="/" className="flex items-center">
                {logo && !configLoading ? (
                  <img 
                    src={logo} 
                    alt="Timeline Project System" 
                    className="h-10 w-auto object-contain"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-brand-blue rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xl">T</span>
                    </div>
                    <span className="hidden sm:block text-xl font-bold text-brand-dark">Timeline</span>
                  </div>
                )}
              </Link>
              
              {/* Desktop: Navegação principal */}
              {user && (
                <nav className="hidden lg:flex items-center space-x-1 ml-10">
                  {isAdmin ? (
                    <>
                      <Link
                        to="/admin/dashboard"
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${isActiveLink('/admin/dashboard')
                            ? 'bg-brand-blue text-white'
                            : 'text-brand-gray hover:text-brand-dark hover:bg-brand-lighter'
                          }
                        `}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/admin/clientes"
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${isActiveLink('/admin/clientes')
                            ? 'bg-brand-blue text-white'
                            : 'text-brand-gray hover:text-brand-dark hover:bg-brand-lighter'
                          }
                        `}
                      >
                        Clientes
                      </Link>
                      <Link
                        to="/admin/projetos"
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${isActiveLink('/admin/projetos')
                            ? 'bg-brand-blue text-white'
                            : 'text-brand-gray hover:text-brand-dark hover:bg-brand-lighter'
                          }
                        `}
                      >
                        Projetos
                      </Link>
                      <Link
                        to="/admin/config"
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${isActiveLink('/admin/config')
                            ? 'bg-brand-blue text-white'
                            : 'text-brand-gray hover:text-brand-dark hover:bg-brand-lighter'
                          }
                        `}
                      >
                        Configurações
                      </Link>
                    </>
                  ) : (
                    <Link
                      to="/cliente/projetos"
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${isActiveLink('/cliente/projetos')
                          ? 'bg-brand-blue text-white'
                          : 'text-brand-gray hover:text-brand-dark hover:bg-brand-lighter'
                        }
                      `}
                    >
                      Meus Projetos
                    </Link>
                  )}
                </nav>
              )}
            </div>

            {/* Desktop: Menu do usuário */}
            {user && (
              <div className="hidden lg:block relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-brand-lighter transition-colors"
                >
                  <div className="text-right">
                    <p className="text-sm font-medium text-brand-dark">{user.nome}</p>
                    <p className="text-xs text-brand-gray">
                      {isAdmin ? 'Administrador' : 'Cliente'}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-brand-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown do perfil */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-brand-lighter py-1">
                    <div className="px-4 py-3 border-b border-brand-lighter">
                      <p className="text-sm font-medium text-brand-dark">{user.nome}</p>
                      <p className="text-xs text-brand-gray">{user.email}</p>
                    </div>
                    
                    <Link
                      to="/perfil"
                      className="block px-4 py-2 text-sm text-brand-gray hover:bg-brand-lighter hover:text-brand-dark transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Meu Perfil</span>
                      </div>
                    </Link>
                    
                    <Link
                      to="/alterar-senha"
                      className="block px-4 py-2 text-sm text-brand-gray hover:bg-brand-lighter hover:text-brand-dark transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        <span>Alterar Senha</span>
                      </div>
                    </Link>
                    
                    <div className="border-t border-brand-lighter mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-brand-gray hover:bg-brand-lighter hover:text-brand-dark transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sair</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile: Avatar/Logout (direita) */}
            {user && (
              <div className="lg:hidden flex items-center space-x-2">
                <Link
                  to="/perfil"
                  className="p-2 rounded-lg hover:bg-brand-lighter transition-colors"
                >
                  <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-brand-lighter transition-colors"
                  aria-label="Sair"
                >
                  <svg className="w-5 h-5 text-brand-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Overlay para fechar dropdown */}
      {isProfileMenuOpen && (
        <div 
          className="fixed inset-0 z-20" 
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </>
  );
};