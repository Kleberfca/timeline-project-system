// src/pages/cliente/ProjetoDetailsCliente.tsx
/**
 * Visualização de projeto para cliente (read-only)
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { projetoQueries } from '../../lib/supabase-queries';
import { Timeline } from '../../components/Timeline/Timeline';
import type { Projeto } from '../../types';

export const ProjetoDetailsCliente: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && user) {
      loadProjeto();
    }
  }, [id, user]);

  const loadProjeto = async () => {
    try {
      setLoading(true);
      const data = await projetoQueries.buscarComTimeline(id!);
      
      // Verifica se o cliente tem acesso ao projeto
      if (data.cliente_id !== user?.cliente_id) {
        setError('Você não tem permissão para acessar este projeto.');
        return;
      }
      
      setProjeto(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !projeto) {
    return (
      <div className="max-w-lg mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error || 'Projeto não encontrado'}</p>
          <button
            onClick={() => navigate('/cliente/projetos')}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
          >
            Voltar para meus projetos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com informações do projeto */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <button
                onClick={() => navigate('/cliente/projetos')}
                className="mb-2 text-sm text-gray-600 hover:text-gray-900 flex items-center"
              >
                <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{projeto.nome}</h1>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Data de Início</h3>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}
              </p>
            </div>
            {projeto.data_fim_prevista && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Previsão de Término</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(projeto.data_fim_prevista).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
            {projeto.descricao && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Descrição</h3>
                <p className="mt-1 text-sm text-gray-900">{projeto.descricao}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informativo para cliente */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Você pode acompanhar o progresso do projeto e visualizar os arquivos disponíveis em cada etapa.
              Clique nas etapas para expandir e ver mais detalhes.
            </p>
          </div>
        </div>
      </div>

      {/* Timeline do projeto (read-only para cliente) */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Progresso do Projeto</h2>
        <Timeline projetoId={projeto.id} />
      </div>
    </div>
  );
};
