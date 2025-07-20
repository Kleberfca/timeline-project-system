// src/pages/admin/ProjetoDetails.tsx
/**
 * Página de detalhes do projeto com timeline
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projetoQueries } from '../../lib/supabase-queries';
import { Timeline } from '../../components/Timeline/Timeline';
import type { Projeto } from '../../types';

export const ProjetoDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProjeto();
    }
  }, [id]);

  const loadProjeto = async () => {
    try {
      setLoading(true);
      const data = await projetoQueries.buscarComTimeline(id!);
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
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error || 'Projeto não encontrado'}
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
              <h1 className="text-2xl font-bold text-gray-900">{projeto.nome}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Cliente: {projeto.cliente?.nome}
                {projeto.cliente?.empresa && ` - ${projeto.cliente.empresa}`}
              </p>
            </div>
            <div className="flex space-x-2">
              <Link
                to={`/admin/projetos/${projeto.id}/editar`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </Link>
              <div className={`px-3 py-2 text-sm font-medium rounded-md ${
                projeto.ativo 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {projeto.ativo ? 'Ativo' : 'Inativo'}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className="md:col-span-3">
                <h3 className="text-sm font-medium text-gray-500">Descrição</h3>
                <p className="mt-1 text-sm text-gray-900">{projeto.descricao}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline do projeto */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Timeline do Projeto</h2>
        <Timeline projetoId={projeto.id} />
      </div>
    </div>
  );
};
