// src/pages/Perfil.tsx
/**
 * Página de perfil do usuário
 * Permite visualizar e editar informações pessoais
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Perfil: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    telefone: user?.telefone || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome) {
      showNotification('error', 'Nome é obrigatório');
      return;
    }

    try {
      setLoading(true);

      // Atualiza dados do usuário
      const { error } = await supabase
        .from('users')
        .update({
          nome: formData.nome,
          telefone: formData.telefone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;

      // Atualiza o contexto
      await refreshUser();
      
      showNotification('success', 'Perfil atualizado com sucesso!');
    } catch (error: any) {
      showNotification('error', error.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-dark">Meu Perfil</h1>
        <p className="mt-2 text-brand-gray">
          Gerencie suas informações pessoais
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card de informações */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-brand-lighter p-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-brand-blue rounded-full flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-3xl">
                  {user?.nome.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-brand-dark">
                {user?.nome}
              </h3>
              <p className="text-sm text-brand-gray">
                {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
              </p>
              <div className="mt-4 pt-4 border-t border-brand-lighter">
                <p className="text-xs text-brand-gray">
                  Membro desde
                </p>
                <p className="text-sm font-medium text-brand-dark">
                  {user?.created_at 
                    ? new Date(user.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de edição */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-brand-lighter">
            <div className="px-6 py-4 border-b border-brand-lighter">
              <h2 className="text-lg font-medium text-brand-dark">
                Informações Pessoais
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Nome */}
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-brand-dark mb-1">
                  Nome completo
                </label>
                <input
                  id="nome"
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-brand-light rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                  placeholder="Seu nome completo"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-1">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-brand-light rounded-lg bg-brand-lighter text-brand-gray cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-brand-gray">
                  O e-mail não pode ser alterado
                </p>
              </div>

              {/* Telefone */}
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-brand-dark mb-1">
                  Telefone
                </label>
                <input
                  id="telefone"
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-4 py-2 border border-brand-light rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                  placeholder="(00) 00000-0000"
                />
              </div>

              {/* Botões */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar alterações'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Card de segurança */}
          <div className="bg-white rounded-lg shadow-sm border border-brand-lighter mt-6">
            <div className="px-6 py-4 border-b border-brand-lighter">
              <h2 className="text-lg font-medium text-brand-dark">
                Segurança
              </h2>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-brand-dark">
                    Senha de acesso
                  </h3>
                  <p className="text-sm text-brand-gray mt-1">
                    Altere sua senha regularmente para maior segurança
                  </p>
                </div>
                <Link
                  to="/alterar-senha"
                  className="px-4 py-2 border border-brand-light text-brand-gray rounded-lg hover:bg-brand-lighter transition-colors text-sm"
                >
                  Alterar senha
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};