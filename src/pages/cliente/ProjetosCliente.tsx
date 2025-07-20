// src/pages/cliente/ProjetosCliente.tsx
/**
 * Lista de projetos do cliente logado
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { projetoQueries } from '../../lib/supabase-queries';
import type { Projeto } from '../../types';

export const ProjetosCliente: React.FC = () => {
  const { user } = useAuth();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.cliente_id) {
      loadProjetos();
    }
  }, [user]);

  const loadProjetos = async () => {
    try {
      setLoading(true);
      const data = await projetoQueries.listarPorCliente(user!.cliente_id!);
      setProjetos(data.filter(p => p.ativo));
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Erro ao carregar projetos: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meus Projetos</h1>
        <p className="mt-2 text-sm text-gray-600">
          Acompanhe o progresso de seus projetos e acesse os arquivos disponíveis.
        </p>
      </div>

      {projetos.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum projeto</h3>
          <p className="mt-1 text-sm text-gray-500">
            Você ainda não possui projetos ativos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projetos.map((projeto) => (
            <Link
              key={projeto.id}
              to={`/cliente/projetos/${projeto.id}`}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {projeto.nome}
                </h3>
                {projeto.descricao && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {projeto.descricao}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Início: {new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}
                  </div>
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
