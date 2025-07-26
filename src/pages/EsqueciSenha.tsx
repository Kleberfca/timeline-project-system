// src/pages/EsqueciSenha.tsx
/**
 * Página de recuperação de senha
 * Envia email para redefinir senha
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
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      showNotification('error', 'Digite seu e-mail');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/resetar-senha`,
      });

      if (error) throw error;

      setEmailSent(true);
      showNotification('success', 'E-mail de recuperação enviado!');
    } catch (error: any) {
      showNotification('error', error.message || 'Erro ao enviar e-mail de recuperação');
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
          Recuperar Senha
        </h2>
        <p className="mt-2 text-center text-sm text-brand-gray">
          {emailSent 
            ? 'Verifique seu e-mail para continuar'
            : 'Digite seu e-mail para receber as instruções'
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-brand-lighter">
          {!emailSent ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-brand-dark">
                  E-mail cadastrado
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

              {/* Botões */}
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar instruções'
                  )}
                </button>

                <Link
                  to="/login"
                  className="w-full flex justify-center items-center py-3 px-4 border border-brand-light rounded-lg shadow-sm text-sm font-medium text-brand-gray hover:bg-brand-lighter transition-all"
                >
                  Voltar ao login
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-6">
              {/* Ícone de sucesso */}
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Mensagem */}
              <div>
                <h3 className="text-lg font-medium text-brand-dark">
                  E-mail enviado!
                </h3>
                <p className="mt-2 text-sm text-brand-gray">
                  Enviamos as instruções para redefinir sua senha para:
                </p>
                <p className="mt-1 text-sm font-medium text-brand-dark">
                  {email}
                </p>
              </div>

              {/* Informações adicionais */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  Próximos passos:
                </h4>
                <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Verifique sua caixa de entrada</li>
                  <li>Clique no link enviado por e-mail</li>
                  <li>Crie uma nova senha</li>
                  <li>Faça login com a nova senha</li>
                </ol>
                <p className="mt-3 text-xs text-blue-600">
                  Não recebeu o e-mail? Verifique a pasta de spam ou aguarde alguns minutos.
                </p>
              </div>

              {/* Botões */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                  className="w-full py-2 px-4 border border-brand-light text-brand-gray rounded-lg hover:bg-brand-lighter transition-all text-sm"
                >
                  Tentar outro e-mail
                </button>
                <Link
                  to="/login"
                  className="block w-full py-2 px-4 bg-brand-blue text-white rounded-lg hover:bg-blue-700 transition-all text-sm text-center"
                >
                  Voltar ao login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};