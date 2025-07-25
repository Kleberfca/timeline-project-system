// src/components/Timeline/Timeline.tsx
/**
 * Componente principal de Timeline
 * Visualização interativa das etapas do projeto
 * Atualizado para incluir a fase Tração
 */

import React, { useState, useEffect } from 'react';
import { timelineQueries, realtimeSubscriptions } from '../../lib/supabase-queries';
import { usePermissions } from '../../hooks/usePermissions';
import { TimelineCard } from './TimelineCard';
import { STATUS_COLORS, ETAPAS_DIAGNOSTICO, ETAPAS_POSICIONAMENTO, ETAPAS_TRACAO } from '../../types';
import type { ProjetoTimeline, FaseNome } from '../../types';

interface TimelineProps {
  projetoId: string;
}

export const Timeline: React.FC<TimelineProps> = ({ projetoId }) => {
  const [activeTab, setActiveTab] = useState<FaseNome>('diagnostico');
  const [timelineData, setTimelineData] = useState<ProjetoTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { canUpdateTimeline } = usePermissions();

  /**
   * Carrega dados da timeline
   */
  useEffect(() => {
    loadTimelineData();
    
    // Inscreve para atualizações em tempo real
    const subscription = realtimeSubscriptions.subscribeToProjectTimeline(
      projetoId,
      handleRealtimeUpdate
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [projetoId, activeTab]);

  const loadTimelineData = async () => {
    try {
      setLoading(true);
      const data = await timelineQueries.buscarPorProjetoFase(projetoId, activeTab);
      setTimelineData(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle de atualização em tempo real
   */
  const handleRealtimeUpdate = (payload: any) => {
    if (payload.eventType === 'UPDATE') {
      setTimelineData(prev => 
        prev.map(item => 
          item.id === payload.new.id ? { ...item, ...payload.new } : item
        )
      );
    }
  };

  /**
   * Calcula progresso da fase
   */
  const calculateProgress = () => {
    const completed = timelineData.filter(item => item.status === 'concluido').length;
    const total = timelineData.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  /**
   * Retorna o número de etapas por fase
   */
  const getEtapasByFase = (fase: FaseNome): number => {
    switch (fase) {
      case 'diagnostico':
        return ETAPAS_DIAGNOSTICO.length;
      case 'posicionamento':
        return ETAPAS_POSICIONAMENTO.length;
      case 'tracao':
        return ETAPAS_TRACAO.length;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Erro ao carregar timeline: {error}
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="space-y-6">
      {/* Tabs de navegação */}
      <div className="border-b border-brand-lighter">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('diagnostico')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'diagnostico'
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-brand-gray hover:text-brand-dark hover:border-brand-light'
              }
            `}
          >
            Fase 1: Diagnóstico
            <span className="ml-2 text-xs text-brand-gray">
              ({getEtapasByFase('diagnostico')} etapas)
            </span>
          </button>
          <button
            onClick={() => setActiveTab('posicionamento')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'posicionamento'
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-brand-gray hover:text-brand-dark hover:border-brand-light'
              }
            `}
          >
            Fase 2: Posicionamento
            <span className="ml-2 text-xs text-brand-gray">
              ({getEtapasByFase('posicionamento')} etapas)
            </span>
          </button>
          <button
            onClick={() => setActiveTab('tracao')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'tracao'
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-brand-gray hover:text-brand-dark hover:border-brand-light'
              }
            `}
          >
            Fase 3: Tração
            <span className="ml-2 text-xs text-brand-gray">
              ({getEtapasByFase('tracao')} etapas)
            </span>
          </button>
        </nav>
      </div>

      {/* Barra de progresso */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-brand-dark">
            Progresso da Fase {activeTab === 'diagnostico' ? 'Diagnóstico' : activeTab === 'posicionamento' ? 'Posicionamento' : 'Tração'}
          </h3>
          <span className="text-sm font-semibold text-brand-dark">{progress}%</span>
        </div>
        <div className="w-full bg-brand-lighter rounded-full h-2">
          <div
            className="bg-brand-blue h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Timeline visual */}
      <div className="relative">
        {/* Linha horizontal de conexão */}
        <div className="absolute top-20 left-0 right-0 h-0.5 bg-brand-light" />
        
        {/* Cards das etapas - Responsivo */}
        <div className={`
          grid gap-6
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
          ${timelineData.length > 6 ? '2xl:grid-cols-5' : ''}
        `}>
          {timelineData.map((item, index) => (
            <TimelineCard
              key={item.id}
              data={item}
              index={index}
              isEditable={canUpdateTimeline}
              onUpdate={loadTimelineData}
            />
          ))}
        </div>
      </div>

      {/* Informação adicional para fase Tração */}
      {activeTab === 'tracao' && (
        <div className="bg-blue-50 border border-brand-blue/20 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-brand-blue" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-brand-dark">
                Fase de Tração
              </h3>
              <div className="mt-2 text-sm text-brand-gray">
                <p>Esta fase foca em ações práticas para gerar resultados, incluindo:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Estratégias de tráfego e funil de vendas</li>
                  <li>Gestão de anúncios com foco em performance</li>
                  <li>Estruturação completa do processo comercial</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legenda - Responsiva */}
      <div className="bg-white rounded-lg shadow p-4">
        <h4 className="text-sm font-medium text-brand-dark mb-3">Legenda</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded ${STATUS_COLORS.pendente.bg} ${STATUS_COLORS.pendente.border} border mr-2`} />
            <span className="text-sm text-brand-gray">Pendente</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded ${STATUS_COLORS.em_andamento.bg} ${STATUS_COLORS.em_andamento.border} border mr-2`} />
            <span className="text-sm text-brand-gray">Em Andamento</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded ${STATUS_COLORS.concluido.bg} ${STATUS_COLORS.concluido.border} border mr-2`} />
            <span className="text-sm text-brand-gray">Concluído</span>
          </div>
        </div>
      </div>
    </div>
  );
};