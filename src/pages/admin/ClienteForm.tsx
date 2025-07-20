// src/pages/admin/ClienteForm.tsx
/**
 * Formulário para criar/editar clientes
 * Gera credenciais automaticamente para novos clientes
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clienteQueries } from '../../lib/supabase-queries';
import { supabase } from '../../lib/supabase';
import type { Cliente } from '../../types';

export const ClienteForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingCliente, setLoadingCliente] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState({
    email: '',
    password: ''
  });

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    ativo: true
  });

  /**
   * Carrega dados do cliente se for edição
   */
  useEffect(() => {
    if (isEdit && id) {
      loadCliente();
    }
  }, [id, isEdit]);

  const loadCliente = async () => {
    try {
      setLoadingCliente(true);
      const cliente = await clienteQueries.buscarPorId(id!);
      setFormData({
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone || '',
        empresa: cliente.empresa || '',
        ativo: cliente.ativo
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingCliente(false);
    }
  };

  /**
   * Gera senha aleatória
   */
  const generatePassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  /**
   * Handle do formulário
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEdit) {
        // Atualiza cliente existente
        await clienteQueries.atualizar(id!, formData);
        navigate('/admin/clientes');
      } else {
        // Cria novo cliente
        const cliente = await clienteQueries.criar(formData);
        
        // Gera credenciais de acesso
        const password = generatePassword();
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: password,
          options: {
            data: {
              nome: formData.nome,
              role: 'cliente',
              cliente_id: cliente.id
            }
          }
        });

        if (authError) throw authError;

        // Cria registro na tabela users
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user!.id,
            email: formData.email,
            nome: formData.nome,
            role: 'cliente',
            cliente_id: cliente.id
          });

        if (userError) throw userError;

        // Mostra credenciais geradas
        setGeneratedCredentials({
          email: formData.email,
          password: password
        });
        setShowCredentials(true);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar cliente');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Copia credenciais para clipboard
   */
  const copyCredentials = () => {
    const text = `Credenciais de acesso ao sistema Timeline:\n\nURL: ${window.location.origin}\nEmail: ${generatedCredentials.email}\nSenha: ${generatedCredentials.password}`;
    navigator.clipboard.writeText(text);
    alert('Credenciais copiadas para a área de transferência!');
  };

  if (loadingCliente) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
        </div>

        {!showCredentials ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isEdit}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
                />
                {isEdit && (
                  <p className="mt-1 text-sm text-gray-500">
                    Email não pode ser alterado após criação
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="empresa" className="block text-sm font-medium text-gray-700">
                  Empresa
                </label>
                <input
                  type="text"
                  id="empresa"
                  value={formData.empresa}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              {isEdit && (
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.ativo}
                      onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Cliente ativo</span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/admin/clientes')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Cliente'}
              </button>
            </div>
          </form>
        ) : (
          // Tela de credenciais geradas
          <div className="p-6 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Cliente criado com sucesso!
                  </h3>
                  <p className="mt-2 text-sm text-green-700">
                    As credenciais de acesso foram geradas. Envie-as ao cliente de forma segura.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-900">Credenciais de Acesso</h4>
              
              <div>
                <label className="text-sm text-gray-500">URL do Sistema</label>
                <p className="font-mono text-sm bg-white px-3 py-2 rounded border border-gray-200">
                  {window.location.origin}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-mono text-sm bg-white px-3 py-2 rounded border border-gray-200">
                  {generatedCredentials.email}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Senha</label>
                <p className="font-mono text-sm bg-white px-3 py-2 rounded border border-gray-200">
                  {generatedCredentials.password}
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Importante:</strong> Salve estas credenciais em local seguro. 
                    A senha não poderá ser recuperada posteriormente.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={copyCredentials}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <svg className="inline-block w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copiar Credenciais
              </button>
              <button
                onClick={() => navigate('/admin/clientes')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Concluir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
