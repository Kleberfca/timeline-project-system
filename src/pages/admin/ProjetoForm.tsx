// src/pages/admin/ProjetoForm.tsx
/**
 * Formulário para criar/editar projetos
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projetoQueries, clienteQueries } from '../../lib/supabase-queries';
import { supabase } from '../../lib/supabase';
import { ETAPAS_DIAGNOSTICO, ETAPAS_POSICIONAMENTO } from '../../types';
import type { Cliente, Projeto } from '../../types';

export const ProjetoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [formData, setFormData] = useState({
    cliente_id: '',
    nome: '',
    descricao: '',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim_prevista: '',
    ativo: true
  });

  /**
   * Carrega dados necessários
   */
  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      
      // Carrega lista de clientes
      const clientesData = await clienteQueries.listarTodos();
      setClientes(clientesData.filter(c => c.ativo));

      // Se for edição, carrega dados do projeto
      if (isEdit && id) {
        const projeto = await projetoQueries.buscarComTimeline(id);
        setFormData({
          cliente_id: projeto.cliente_id,
          nome: projeto.nome,
          descricao: projeto.descricao || '',
          data_inicio: projeto.data_inicio.split('T')[0],
          data_fim_prevista: projeto.data_fim_prevista?.split('T')[0] || '',
          ativo: projeto.ativo
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingData(false);
    }
  };

  /**
   * Cria estrutura inicial da timeline
   */
  const createInitialTimeline = async (projetoId: string) => {
    // Busca IDs das fases
    const { data: fases } = await supabase
      .from('fases')
      .select('id, nome');

    const faseDiagnostico = fases?.find(f => f.nome === 'diagnostico');
    const fasePosicionamento = fases?.find(f => f.nome === 'posicionamento');

    if (!faseDiagnostico || !fasePosicionamento) {
      throw new Error('Fases não encontradas no banco');
    }

    // Busca etapas de cada fase
    const { data: etapas } = await supabase
      .from('etapas')
      .select('id, fase_id, nome, ordem');

    // Cria registros na timeline para cada etapa
    const timelineRecords = etapas?.map(etapa => ({
      projeto_id: projetoId,
      etapa_id: etapa.id,
      status: 'pendente' as const,
      observacoes: ''
    })) || [];

    if (timelineRecords.length > 0) {
      const { error } = await supabase
        .from('projeto_timeline')
        .insert(timelineRecords);

      if (error) throw error;
    }
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
        // Atualiza projeto existente
        const { data, error } = await supabase
          .from('projetos')
          .update(formData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
      } else {
        // Cria novo projeto
        const projeto = await projetoQueries.criar(formData);
        
        // Cria estrutura inicial da timeline
        await createInitialTimeline(projeto.id);
      }

      navigate('/admin/projetos');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar projeto');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
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
            {isEdit ? 'Editar Projeto' : 'Novo Projeto'}
          </h2>
        </div>

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
              <label htmlFor="cliente_id" className="block text-sm font-medium text-gray-700">
                Cliente *
              </label>
              <select
                id="cliente_id"
                value={formData.cliente_id}
                onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                required
                disabled={isEdit}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100"
              >
                <option value="">Selecione um cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome} {cliente.empresa && `- ${cliente.empresa}`}
                  </option>
                ))}
              </select>
              {isEdit && (
                <p className="mt-1 text-sm text-gray-500">
                  Cliente não pode ser alterado após criação
                </p>
              )}
            </div>

            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                Nome do Projeto *
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
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                id="descricao"
                rows={3}
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="data_inicio" className="block text-sm font-medium text-gray-700">
                  Data de Início *
                </label>
                <input
                  type="date"
                  id="data_inicio"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="data_fim_prevista" className="block text-sm font-medium text-gray-700">
                  Data de Término Prevista
                </label>
                <input
                  type="date"
                  id="data_fim_prevista"
                  value={formData.data_fim_prevista}
                  onChange={(e) => setFormData({ ...formData, data_fim_prevista: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
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
                  <span className="ml-2 text-sm text-gray-700">Projeto ativo</span>
                </label>
              </div>
            )}
          </div>

          {!isEdit && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Ao criar o projeto, a timeline será criada automaticamente com todas as etapas das duas fases:
                  </p>
                  <ul className="mt-2 text-sm text-blue-600 list-disc list-inside">
                    <li>Fase 1 - Diagnóstico: {ETAPAS_DIAGNOSTICO.length} etapas</li>
                    <li>Fase 2 - Posicionamento: {ETAPAS_POSICIONAMENTO.length} etapas</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/projetos')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
