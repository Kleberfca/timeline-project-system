// src/pages/EsqueciSenha.tsx
/**
 * Página de Recuperação de Senha
 * Design profissional com paleta de cores
 * Responsiva e acessível
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useSystemConfig } from '../hooks/useSystemConfig';

export const EsqueciSenha: React.FC = () => {
  const { showNotification } = useNotification();
  const { logo } = useSystemConfig();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      showNotification('error', 'Digite seu email');
      return;
    }

    if (!email.includes('@')) {
      showNotification('error', 'Email inválido');
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSent(true);
      showNotification('success', 'Email de recuperação enviado!');
    } catch (error: any) {
      console.error('Erro ao enviar email:', error);
      showNotification('error', error.message || 'Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-lighter via-white to-brand-blue/5 flex flex-col justify-center">
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
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-brand-blue rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl sm:text-3xl">T</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-brand-dark">
                  Timeline
                </h1>
              </div>
            )}
            
            <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-brand-dark">
              Esqueceu sua senha?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-brand-gray">
              Não se preocupe, vamos ajudá-lo a recuperar o acesso
            </p>
          </div>

          {/* Card do formulário */}
          <div className="mt-8 bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="px-6 py-8 sm:px-10">
              {!sent ? (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* Instruções */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      Digite o email cadastrado em sua conta. Enviaremos instruções 
                      para redefinir sua senha.
                    </p>
                  </div>

                  {/* Campo de Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-brand-dark">
                      Email cadastrado
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
                          Enviando...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Enviar Email de Recuperação
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Mensagem de sucesso */
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  <h3 className="mt-4 text-lg font-medium text-brand-dark">
                    Email enviado!
                  </h3>
                  
                  <p className="mt-2 text-sm text-brand-gray">
                    Verifique sua caixa de entrada. Enviamos as instruções para{' '}
                    <span className="font-medium text-brand-dark">{email}</span>
                  </p>

                  <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Não recebeu o email?</strong> Verifique sua pasta de spam 
                      ou lixo eletrônico. O email pode levar alguns minutos para chegar.
                    </p>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => {
                        setSent(false);
                        setEmail('');
                      }}
                      className="text-sm font-medium text-brand-blue hover:text-blue-700"
                    >
                      Tentar com outro email
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer do card */}
            {!sent && (
              <div className="px-6 py-4 bg-brand-lighter/30 sm:px-10">
                <div className="flex items-center justify-center">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-brand-blue hover:text-blue-700 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Voltar para o login
                  </Link>
                </div>
              </div>
            )}
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