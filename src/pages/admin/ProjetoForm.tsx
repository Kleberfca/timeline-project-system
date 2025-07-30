// src/pages/admin/ProjetoForm.tsx
/**
 * Formulário de Projeto - CRUD
 * Design profissional com paleta de cores
 * Inclui suporte para as 3 fases
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { projetoQueries, clienteQueries } from '../../lib/supabase-queries';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ETAPAS_DIAGNOSTICO, ETAPAS_POSICIONAMENTO, ETAPAS_TRACAO } from '../../types';
import type { Cliente, Projeto } from '../../types';

export const ProjetoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showNotification } = useNotification();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [formData, setFormData] = useState({
    cliente_id: '',
    nome: '',
    descricao: '',
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim_prevista: '',
    ativo: true
  });

  const [errors, setErrors] = useState<Partial<typeof formData>>({});

  /**
   * Carrega dados necessários
   */
  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      
      // Carrega lista de clientes ativos
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
      showNotification('error', 'Erro ao carregar dados');
      navigate('/admin/projetos');
    } finally {
      setLoadingData(false);
    }
  };

  /**
   * Valida formulário
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<typeof formData> = {};

    if (!formData.cliente_id) {
      newErrors.cliente_id = 'Selecione um cliente';
    }

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do projeto é obrigatório';
    }

    if (!formData.data_inicio) {
      newErrors.data_inicio = 'Data de início é obrigatória';
    }

    if (formData.data_fim_prevista && formData.data_fim_prevista < formData.data_inicio) {
      newErrors.data_fim_prevista = 'Data de fim deve ser posterior à data de início';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    const faseTracao = fases?.find(f => f.nome === 'tracao');

    if (!faseDiagnostico || !fasePosicionamento || !faseTracao) {
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
    
    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isEdit) {
        // Atualiza projeto existente
        const { error } = await supabase
          .from('projetos')
          .update(formData)
          .eq('id', id);

        if (error) throw error;

        showNotification('success', 'Projeto atualizado com sucesso!');
        navigate('/admin/projetos');
      } else {
        // Cria novo projeto
        const projeto = await projetoQueries.criar(formData);
        
        // Cria estrutura inicial da timeline
        await createInitialTimeline(projeto.id);

        showNotification('success', 'Projeto criado com sucesso!');
        navigate(`/admin/projetos/${projeto.id}`);
      }
    } catch (err: any) {
      console.error('Erro ao salvar projeto:', err);
      showNotification('error', err.message || 'Erro ao salvar projeto');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calcula total de etapas
   */
  const getTotalEtapas = () => {
    return ETAPAS_DIAGNOSTICO.length + ETAPAS_POSICIONAMENTO.length + ETAPAS_TRACAO.length;
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
              {isEdit ? 'Editar Projeto' : 'Novo Projeto'}
            </h1>
            <p className="mt-1 text-sm text-brand-gray">
              {isEdit ? 'Atualize as informações do projeto' : 'Configure um novo projeto com timeline completa'}
            </p>
          </div>
          
          <Link
            to="/admin/projetos"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-brand-gray border border-brand-light rounded-lg hover:bg-brand-lighter transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </Link>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-lighter">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Cliente */}
          <div>
            <label htmlFor="cliente_id" className="block text-sm font-medium text-brand-dark mb-1">
              Cliente <span className="text-red-500">*</span>
            </label>
            <select
              id="cliente_id"
              value={formData.cliente_id}
              onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
              disabled={isEdit}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all ${
                errors.cliente_id ? 'border-red-500' : 'border-brand-light'
              } ${isEdit ? 'bg-brand-lighter cursor-not-allowed' : ''}`}
            >
              <option value="">Selecione um cliente</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} {cliente.empresa && `- ${cliente.empresa}`}
                </option>
              ))}
            </select>
            {errors.cliente_id && (
              <p className="mt-1 text-sm text-red-600">{errors.cliente_id}</p>
            )}
            {isEdit && (
              <p className="mt-1 text-xs text-brand-gray">Cliente não pode ser alterado após criação</p>
            )}
          </div>

          {/* Nome do Projeto */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-brand-dark mb-1">
              Nome do Projeto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all ${
                errors.nome ? 'border-red-500' : 'border-brand-light'
              }`}
              placeholder="Ex: Projeto de Marketing Digital 2024"
            />
            {errors.nome && (
              <p className="mt-1 text-sm text-red-600">{errors.nome}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-brand-dark mb-1">
              Descrição
            </label>
            <textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-brand-light rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all resize-none"
              placeholder="Descreva os objetivos e escopo do projeto (opcional)"
            />
            <p className="mt-1 text-xs text-brand-gray">
              Uma boa descrição ajuda no acompanhamento do projeto
            </p>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="data_inicio" className="block text-sm font-medium text-brand-dark mb-1">
                Data de Início <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="data_inicio"
                value={formData.data_inicio}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all ${
                  errors.data_inicio ? 'border-red-500' : 'border-brand-light'
                }`}
              />
              {errors.data_inicio && (
                <p className="mt-1 text-sm text-red-600">{errors.data_inicio}</p>
              )}
            </div>

            <div>
              <label htmlFor="data_fim_prevista" className="block text-sm font-medium text-brand-dark mb-1">
                Previsão de Término
              </label>
              <input
                type="date"
                id="data_fim_prevista"
                value={formData.data_fim_prevista}
                onChange={(e) => setFormData({ ...formData, data_fim_prevista: e.target.value })}
                min={formData.data_inicio || new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all ${
                  errors.data_fim_prevista ? 'border-red-500' : 'border-brand-light'
                }`}
              />
              {errors.data_fim_prevista && (
                <p className="mt-1 text-sm text-red-600">{errors.data_fim_prevista}</p>
              )}
            </div>
          </div>

          {/* Status (apenas edição) */}
          {isEdit && (
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="w-4 h-4 text-brand-blue border-brand-light rounded focus:ring-brand-blue transition-all"
                />
                <span className="text-sm font-medium text-brand-dark">
                  Projeto ativo
                </span>
              </label>
              <p className="mt-1 text-xs text-brand-gray ml-7">
                Projetos inativos não aparecem na listagem principal
              </p>
            </div>
          )}

          {/* Informação sobre Timeline */}
          {!isEdit && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Timeline Automática
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Ao criar o projeto, uma timeline completa será gerada automaticamente com {getTotalEtapas()} etapas divididas em 3 fases:
                  </p>
                  <ul className="mt-2 text-sm text-blue-600 space-y-1">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      <strong>Diagnóstico:</strong>&nbsp;{ETAPAS_DIAGNOSTICO.length} etapas de análise
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      <strong>Posicionamento:</strong>&nbsp;{ETAPAS_POSICIONAMENTO.length} etapas estratégicas
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      <strong>Tração:</strong>&nbsp;{ETAPAS_TRACAO.length} etapas de execução
                    </li>
                  </ul>
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
                  {isEdit ? 'Salvar Alterações' : 'Criar Projeto'}
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/admin/projetos')}
              disabled={loading}
              className="flex-1 sm:flex-initial px-6 py-3 border border-brand-light rounded-lg text-brand-gray hover:bg-brand-lighter focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-light font-medium transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};