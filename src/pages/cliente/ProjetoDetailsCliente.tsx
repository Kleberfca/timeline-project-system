// src/pages/cliente/ProjetoDetailsCliente.tsx
/**
 * Página de visualização do projeto para clientes
 * Read-only, totalmente responsiva
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projetoQueries } from '../../lib/supabase-queries';
import { Timeline } from '../../components/Timeline/Timeline';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useDevice } from '../../hooks/useDevice';
import type { Projeto } from '../../types';

export const ProjetoDetailsCliente: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isMobile, isSmallMobile } = useDevice();
  
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
        
        {/* Header simplificado para cliente - Responsivo */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-4">
            {/* Título e voltar */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-dark">
                  {projeto.nome}
                </h1>
              </div>
              <button
                onClick={() => navigate('/cliente/projetos')}
                className="flex-shrink-0 ml-4 p-2 text-brand-gray hover:text-brand-dark 
                         hover:bg-brand-lighter rounded-lg transition-all"
                aria-label="Voltar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {projeto.descricao && (
              <p className="text-sm sm:text-base text-brand-gray">
                {projeto.descricao}
              </p>
            )}
            
            {/* Informações básicas - Grid responsivo */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-brand-gray">Início</p>
                <p className="text-sm font-medium text-brand-dark">
                  {new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              {projeto.data_fim_prevista && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-brand-gray">Previsão</p>
                  <p className="text-sm font-medium text-brand-dark">
                    {new Date(projeto.data_fim_prevista).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
              
              <div className={`bg-blue-50 rounded-lg p-3 ${isSmallMobile ? 'col-span-2' : ''}`}>
                <p className="text-xs text-brand-gray">Status do Projeto</p>
                <p className="text-sm font-medium">
                  <span className="text-green-700">
                    {projeto.ativo ? 'Em Andamento' : 'Finalizado'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Aviso de visualização - Mobile */}
        {isMobile && (
          <div className="mb-4 p-3 bg-brand-lighter/50 border border-brand-light rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-brand-gray mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-brand-gray">
                Você está visualizando o progresso do seu projeto. 
                Para dúvidas, entre em contato com seu gerente de projetos.
              </p>
            </div>
          </div>
        )}

        {/* Timeline - Read Only */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-brand-dark">
              Acompanhe o Progresso
            </h2>
            <p className="text-sm text-brand-gray mt-1">
              Veja o status atual de cada etapa do seu projeto
            </p>
          </div>
          
          {/* Timeline Component (já é read-only para clientes) */}
          <Timeline projetoId={projeto.id} />
        </div>

        {/* Informações de contato - Responsiva */}
        <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-brand-dark mb-3">
            Precisa de Ajuda?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-brand-dark">Email</p>
                <p className="text-sm text-brand-gray">suporte@empresa.com</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-brand-dark">Telefone</p>
                <p className="text-sm text-brand-gray">(11) 1234-5678</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botão voltar - Mobile */}
        {isMobile && (
          <div className="mt-6 pb-6">
            <button
              onClick={() => navigate('/cliente/projetos')}
              className="w-full px-4 py-3 bg-brand-blue text-white font-medium 
                       rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar para Meus Projetos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};