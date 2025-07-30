// src/pages/admin/ClienteForm.tsx
/**
 * Formulário de Cliente - CRUD
 * Design profissional com paleta de cores
 * Totalmente responsivo
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { clienteQueries } from '../../lib/supabase-queries';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useDevice } from '../../hooks/useDevice';
import type { Cliente } from '../../types';

export const ClienteForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showNotification } = useNotification();
  const { isMobile } = useDevice();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
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

  const [errors, setErrors] = useState<Partial<typeof formData>>({});

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
      setLoadingData(true);
      const cliente = await clienteQueries.buscarPorId(id!);
      setFormData({
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone || '',
        empresa: cliente.empresa || '',
        ativo: cliente.ativo
      });
    } catch (err: any) {
      showNotification('error', 'Erro ao carregar cliente');
      navigate('/admin/clientes');
    } finally {
      setLoadingData(false);
    }
  };

  /**
   * Valida formulário
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<typeof formData> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.telefone && !/^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/.test(formData.telefone.replace(/\D/g, ''))) {
      newErrors.telefone = 'Telefone inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Formata telefone
   */
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
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
    
    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isEdit) {
        // Atualiza cliente existente
        await clienteQueries.atualizar(id!, formData);
        showNotification('success', 'Cliente atualizado com sucesso!');
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
        showNotification('success', 'Cliente criado com sucesso!');
      }
    } catch (err: any) {
      console.error('Erro ao salvar cliente:', err);
      showNotification('error', err.message || 'Erro ao salvar cliente');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Copia credenciais
   */
  const copyCredentials = () => {
    const text = `Credenciais de acesso ao Timeline Project System:\n\nURL: ${window.location.origin}\nEmail: ${generatedCredentials.email}\nSenha: ${generatedCredentials.password}`;
    navigator.clipboard.writeText(text);
    showNotification('success', 'Credenciais copiadas!');
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark">
              {isEdit ? 'Editar Cliente' : 'Novo Cliente'}
            </h1>
            <p className="mt-1 text-sm text-brand-gray">
              {isEdit ? 'Atualize as informações do cliente' : 'Cadastre um novo cliente no sistema'}
            </p>
          </div>
          
          <Link
            to="/admin/clientes"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-brand-gray border border-brand-light rounded-lg hover:bg-brand-lighter transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </Link>
        </div>
      </div>

      {/* Formulário ou Credenciais */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-lighter">
        {!showCredentials ? (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Grid de campos */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Nome */}
              <div className="sm:col-span-2">
                <label htmlFor="nome" className="block text-sm font-medium text-brand-dark mb-1">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all ${
                    errors.nome ? 'border-red-500' : 'border-brand-light'
                  }`}
                  placeholder="Digite o nome completo"
                />
                {errors.nome && (
                  <p className="mt-1 text-sm text-red-600">{errors.nome}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isEdit}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all ${
                    errors.email ? 'border-red-500' : 'border-brand-light'
                  } ${isEdit ? 'bg-brand-lighter cursor-not-allowed' : ''}`}
                  placeholder="email@exemplo.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
                {isEdit && (
                  <p className="mt-1 text-xs text-brand-gray">Email não pode ser alterado</p>
                )}
              </div>

              {/* Telefone */}
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-brand-dark mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all ${
                    errors.telefone ? 'border-red-500' : 'border-brand-light'
                  }`}
                  placeholder="(11) 98765-4321"
                  maxLength={15}
                />
                {errors.telefone && (
                  <p className="mt-1 text-sm text-red-600">{errors.telefone}</p>
                )}
              </div>

              {/* Empresa */}
              <div className="sm:col-span-2">
                <label htmlFor="empresa" className="block text-sm font-medium text-brand-dark mb-1">
                  Empresa
                </label>
                <input
                  type="text"
                  id="empresa"
                  value={formData.empresa}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                  className="w-full px-4 py-2 border border-brand-light rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
                  placeholder="Nome da empresa"
                />
              </div>

              {/* Status (apenas edição) */}
              {isEdit && (
                <div className="sm:col-span-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.ativo}
                      onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                      className="w-4 h-4 text-brand-blue border-brand-light rounded focus:ring-brand-blue transition-all"
                    />
                    <span className="text-sm font-medium text-brand-dark">
                      Cliente ativo
                    </span>
                  </label>
                  <p className="mt-1 text-xs text-brand-gray">
                    Clientes inativos não podem acessar o sistema
                  </p>
                </div>
              )}
            </div>

            {/* Informação adicional */}
            {!isEdit && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      Ao criar o cliente, as credenciais de acesso serão geradas automaticamente.
                      Você poderá copiá-las e enviar ao cliente de forma segura.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-initial inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" className="mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isEdit ? 'Salvar Alterações' : 'Criar Cliente'}
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/admin/clientes')}
                className="flex-1 sm:flex-initial px-6 py-3 border border-brand-light rounded-lg text-brand-gray hover:bg-brand-lighter focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light font-medium transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          /* Tela de credenciais geradas */
          <div className="p-6 sm:p-8 space-y-6">
            {/* Sucesso */}
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-brand-dark">
                Cliente criado com sucesso!
              </h3>
              <p className="mt-2 text-sm text-brand-gray">
                As credenciais de acesso foram geradas. Envie-as ao cliente de forma segura.
              </p>
            </div>

            {/* Credenciais */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h4 className="font-medium text-brand-dark">Credenciais de Acesso</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-brand-gray mb-1">URL do Sistema</label>
                  <p className="font-mono text-sm bg-white px-3 py-2 rounded border border-brand-light">
                    {window.location.origin}
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-brand-gray mb-1">Email</label>
                  <p className="font-mono text-sm bg-white px-3 py-2 rounded border border-brand-light">
                    {generatedCredentials.email}
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-brand-gray mb-1">Senha</label>
                  <p className="font-mono text-sm bg-white px-3 py-2 rounded border border-brand-light">
                    {generatedCredentials.password}
                  </p>
                </div>
              </div>

              <button
                onClick={copyCredentials}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-brand-blue text-brand-blue rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue text-sm font-medium transition-all"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copiar Credenciais
              </button>
            </div>

            {/* Aviso importante */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Importante
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    Salve estas credenciais em local seguro. A senha não poderá ser recuperada posteriormente.
                  </p>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowCredentials(false);
                  setFormData({
                    nome: '',
                    email: '',
                    telefone: '',
                    empresa: '',
                    ativo: true
                  });
                }}
                className="flex-1 px-6 py-3 border border-transparent rounded-lg shadow-sm text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue font-medium transition-all"
              >
                Criar Outro Cliente
              </button>
              
              <button
                onClick={() => navigate('/admin/clientes')}
                className="flex-1 px-6 py-3 border border-brand-light rounded-lg text-brand-gray hover:bg-brand-lighter focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light font-medium transition-all"
              >
                Voltar para Lista
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};