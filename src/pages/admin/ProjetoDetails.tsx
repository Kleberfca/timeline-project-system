// src/pages/admin/ProjetoDetails.tsx (EXEMPLO ATUALIZADO)
/**
 * Página de detalhes do projeto
 * Mostra como integrar a Timeline responsiva
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projetoQueries } from '../../lib/supabase-queries';
import { Timeline } from '../../components/Timeline/Timeline';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useDevice } from '../../hooks/useDevice';
import type { Projeto } from '../../types';

export const ProjetoDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useDevice();
  
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
      const data = await projetoQueries.buscarPorId(id!);
      setProjeto(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !projeto) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Erro ao carregar projeto</p>
          <p className="text-sm mt-1">{error || 'Projeto não encontrado'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Container responsivo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Breadcrumb responsivo */}
        <nav className="mb-4 sm:mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link 
                to="/admin/projetos" 
                className="text-brand-gray hover:text-brand-blue transition-colors"
              >
                Projetos
              </Link>
            </li>
            <li>
              <span className="text-brand-light">/</span>
            </li>
            <li className="text-brand-dark font-medium truncate max-w-[200px] sm:max-w-none">
              {projeto.nome}
            </li>
          </ol>
        </nav>

        {/* Header do projeto - Responsivo */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-dark truncate">
                {projeto.nome}
              </h1>
              
              {projeto.descricao && (
                <p className="mt-2 text-sm sm:text-base text-brand-gray line-clamp-2">
                  {projeto.descricao}
                </p>
              )}
              
              {/* Informações do projeto - Grid responsivo */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-brand-lighter/50 rounded-lg p-3">
                  <p className="text-xs text-brand-gray">Cliente</p>
                  <p className="text-sm font-medium text-brand-dark truncate">
                    {projeto.cliente?.nome || 'Sem cliente'}
                  </p>
                </div>
                
                <div className="bg-brand-lighter/50 rounded-lg p-3">
                  <p className="text-xs text-brand-gray">Início</p>
                  <p className="text-sm font-medium text-brand-dark">
                    {new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                {projeto.data_fim_prevista && (
                  <div className="bg-brand-lighter/50 rounded-lg p-3">
                    <p className="text-xs text-brand-gray">Previsão</p>
                    <p className="text-sm font-medium text-brand-dark">
                      {new Date(projeto.data_fim_prevista).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
                
                <div className="bg-brand-lighter/50 rounded-lg p-3">
                  <p className="text-xs text-brand-gray">Status</p>
                  <p className="text-sm font-medium">
                    <span className={`
                      inline-flex items-center px-2 py-1 rounded-full text-xs
                      ${projeto.ativo 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                      }
                    `}>
                      {projeto.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Ações - Responsivas */}
            <div className="flex flex-row sm:flex-col gap-2">
              <Link
                to={`/admin/projetos/${id}/editar`}
                className="flex-1 sm:flex-initial px-4 py-2 text-sm font-medium text-brand-blue 
                         border border-brand-blue rounded-lg hover:bg-blue-50 
                         transition-colors text-center"
              >
                Editar
              </Link>
              <button
                onClick={() => navigate('/admin/projetos')}
                className="flex-1 sm:flex-initial px-4 py-2 text-sm font-medium text-brand-gray 
                         border border-brand-light rounded-lg hover:bg-brand-lighter 
                         transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>

        {/* Timeline Section - Totalmente Responsiva */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-brand-dark mb-4 sm:mb-6">
            Timeline do Projeto
          </h2>
          
          {/* Dica para mobile */}
          {isMobile && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                💡 <strong>Dica:</strong> Deslize as abas para navegar entre as fases
              </p>
            </div>
          )}
          
          {/* Timeline Component */}
          <Timeline projetoId={projeto.id} />
        </div>

        {/* Informações adicionais - Mobile */}
        {isMobile && (
          <div className="mt-4 p-4 bg-brand-lighter/30 rounded-lg">
            <p className="text-xs text-brand-gray text-center">
              Visualizando no modo mobile • Timeline otimizada para toque
            </p>
          </div>
        )}
      </div>
    </div>
  );
};