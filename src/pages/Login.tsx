// src/pages/Login.tsx
/**
 * Página de Login
 * Design profissional com paleta de cores da marca
 * Totalmente responsiva
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { useDevice } from '../hooks/useDevice';

export const Login: React.FC = () => {
  const { signIn } = useAuth();
  const { showNotification } = useNotification();
  const { logo } = useSystemConfig();
  const { isMobile } = useDevice();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!email || !password) {
      showNotification('error', 'Preencha todos os campos');
      return;
    }

    if (!email.includes('@')) {
      showNotification('error', 'Email inválido');
      return;
    }

    if (password.length < 6) {
      showNotification('error', 'A senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      
      // O redirecionamento é feito automaticamente pelo AuthContext
      showNotification('success', 'Login realizado com sucesso!');
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      // Mensagens de erro mais amigáveis
      if (error.message?.includes('Invalid login credentials')) {
        showNotification('error', 'Email ou senha incorretos');
      } else if (error.message?.includes('Email not confirmed')) {
        showNotification('error', 'Por favor, confirme seu email antes de fazer login');
      } else {
        showNotification('error', error.message || 'Erro ao fazer login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-lighter via-white to-brand-blue/5 flex flex-col justify-center">
      {/* Container principal */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo e título */}
          <div className="text-center">
            {logo ? (
              <img 
                src={logo} 
                alt="Timeline Project System" 
                className="mx-auto h-16 sm:h-20 w-auto"
              />
            ) : (
              <div className="flex justify-center items-center space-x-3">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand-blue rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
                  <span className="text-white font-bold text-2xl sm:text-3xl">T</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-brand-dark">
                  Timeline
                </h1>
              </div>
            )}
            
            <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-brand-dark">
              Bem-vindo
            </h2>
          </div>

          {/* Card do formulário */}
          <div className="mt-8 bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="px-6 py-8 sm:px-10">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Campo de Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-brand-dark">
                    Email
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-brand-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-brand-light rounded-lg placeholder-brand-light focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all text-brand-dark"
                      placeholder="seu@email.com"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Campo de Senha */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-brand-dark">
                    Senha
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-brand-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-10 py-3 border border-brand-light rounded-lg placeholder-brand-light focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all text-brand-dark"
                      placeholder="••••••••"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5 text-brand-gray hover:text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-brand-gray hover:text-brand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Opções adicionais */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-brand-blue focus:ring-brand-blue border-brand-light rounded transition-all"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-brand-gray">
                      Lembrar de mim
                    </label>
                  </div>

                  <Link
                    to="/esqueci-senha"
                    className="text-sm text-brand-blue hover:text-blue-700 font-medium transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>

                {/* Botão de submit */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" color="white" className="mr-2" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Footer do card */}
            <div className="px-6 py-4 bg-brand-lighter/30 sm:px-10">
              <p className="text-xs text-center text-brand-gray">
                Ao fazer login, você concorda com nossos{' '}
                <a href="#" className="text-brand-blue hover:text-blue-700">
                  Termos de Uso
                </a>{' '}
                e{' '}
                <a href="#" className="text-brand-blue hover:text-blue-700">
                  Política de Privacidade
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-brand-gray">
        <p>&copy; 2025 Timeline Project System. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};