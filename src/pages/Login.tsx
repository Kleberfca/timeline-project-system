// src/pages/Login.tsx
/**
 * Página de Login
 * Design profissional e responsivo
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useSystemConfig } from '../hooks/useSystemConfig';

export const Login: React.FC = () => {
  const { signIn } = useAuth();
  const { showNotification } = useNotification();
  const { logo } = useSystemConfig();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  console.log('Tentando fazer login com:', email); // ADICIONE ESTE LOG
  
  if (!email || !password) {
    showNotification('error', 'Preencha todos os campos');
    return;
  }

  try {
    setLoading(true);
    console.log('Chamando signIn...'); // ADICIONE ESTE LOG
    await signIn(email, password);
    showNotification('success', 'Login realizado com sucesso!');
  } catch (error: any) {
    console.error('Erro no login:', error); // ADICIONE ESTE LOG
    showNotification('error', error.message || 'Erro ao fazer login');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue/5 to-brand-blue/10 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          {logo ? (
            <img 
              src={logo} 
              alt="Timeline Project System" 
              className="h-16 w-auto"
            />
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-brand-blue rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">T</span>
              </div>
              <h1 className="text-3xl font-bold text-brand-dark">Timeline</h1>
            </div>
          )}
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-extrabold text-brand-dark">
          Acesse sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-brand-gray">
          Sistema de Acompanhamento de Projetos
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-brand-lighter">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-dark">
                E-mail
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 pl-10 border border-brand-light rounded-lg shadow-sm placeholder-brand-light focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                  placeholder="seu@email.com"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-brand-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-dark">
                Senha
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 pl-10 pr-10 border border-brand-light rounded-lg shadow-sm placeholder-brand-light focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-brand-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
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

            {/* Link esqueci senha */}
            <div className="flex items-center justify-end">
              <Link
                to="/esqueci-senha"
                className="text-sm text-brand-blue hover:text-blue-700 transition-colors"
              >
                Esqueceu sua senha?
              </Link>
            </div>

            {/* Botão de login */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};