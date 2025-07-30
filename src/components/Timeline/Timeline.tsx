// src/components/Timeline/Timeline.tsx
/**
 * Componente principal de Timeline
 * TOTALMENTE RESPONSIVO para todos os dispositivos
 * Suporta as 3 fases: Diagnóstico, Posicionamento e Tração
 */

import React, { useState, useEffect } from 'react';
import { timelineQueries, realtimeSubscriptions } from '../../lib/supabase-queries';
import { usePermissions } from '../../hooks/usePermissions';
import { useNotification } from '../../contexts/NotificationContext';
import { TimelineCard } from './TimelineCard';
import { LoadingSpinner } from '../LoadingSpinner';
import { ETAPAS_DIAGNOSTICO, ETAPAS_POSICIONAMENTO, ETAPAS_TRACAO } from '../../types';
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
  const { showNotification } = useNotification();

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
      setError(null);
      const data = await timelineQueries.buscarPorProjetoFase(projetoId, activeTab);
      setTimelineData(data || []);
    } catch (err: any) {
      setError(err.message);
      showNotification('error', 'Erro ao carregar timeline');
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
   * Retorna informações da fase
   */
  const getFaseInfo = (fase: FaseNome) => {
    const info = {
      diagnostico: {
        nome: 'Diagnóstico',
        etapas: ETAPAS_DIAGNOSTICO.length,
        descricao: 'Análise completa da situação atual',
        icon: '🔍'
      },
      posicionamento: {
        nome: 'Posicionamento',
        etapas: ETAPAS_POSICIONAMENTO.length,
        descricao: 'Estratégia e planejamento',
        icon: '🎯'
      },
      tracao: {
        nome: 'Tração',
        etapas: ETAPAS_TRACAO.length,
        descricao: 'Execução e resultados',
        icon: '🚀'
      }
    };
    return info[fase];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Erro ao carregar timeline</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const progress = calculateProgress();
  const faseInfo = getFaseInfo(activeTab);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Responsivo */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-brand-dark mb-4">
          Timeline do Projeto
        </h2>

        {/* Tabs Responsivas - Scroll horizontal no mobile */}
        <div className="border-b border-brand-lighter -mx-4 sm:-mx-6 px-4 sm:px-6">
          <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide -mb-px" aria-label="Fases">
            {(['diagnostico', 'posicionamento', 'tracao'] as FaseNome[]).map((fase) => {
              const info = getFaseInfo(fase);
              return (
                <button
                  key={fase}
                  onClick={() => setActiveTab(fase)}
                  className={`
                    whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors
                    flex items-center space-x-2 min-w-fit
                    ${activeTab === fase
                      ? 'border-brand-blue text-brand-blue'
                      : 'border-transparent text-brand-gray hover:text-brand-dark hover:border-brand-light'
                    }
                  `}
                >
                  <span className="text-lg hidden sm:inline">{info.icon}</span>
                  <span>Fase {fase === 'diagnostico' ? '1' : fase === 'posicionamento' ? '2' : '3'}</span>
                  <span className="hidden sm:inline">- {info.nome}</span>
                  <span className="text-xs text-brand-gray">({info.etapas})</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Info da Fase - Responsiva */}
        <div className="mt-4 p-3 sm:p-4 bg-brand-lighter/50 rounded-lg">
          <div className="flex items-start space-x-3">
            <span className="text-2xl hidden sm:block">{faseInfo.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-brand-dark text-sm sm:text-base">
                Fase {activeTab === 'diagnostico' ? '1' : activeTab === 'posicionamento' ? '2' : '3'}: {faseInfo.nome}
              </h3>
              <p className="text-xs sm:text-sm text-brand-gray mt-1">
                {faseInfo.descricao} • {faseInfo.etapas} etapas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Progresso - Responsiva */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <h3 className="text-sm font-medium text-brand-dark">
            Progresso da Fase
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-brand-blue">{progress}%</span>
            <span className="text-xs text-brand-gray">
              ({timelineData.filter(item => item.status === 'concluido').length} de {timelineData.length} concluídas)
            </span>
          </div>
        </div>
        <div className="w-full bg-brand-lighter rounded-full h-2 sm:h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-brand-blue to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Timeline Visual - Grid Super Responsivo */}
      <div className="space-y-4">
        {/* Desktop: Linha horizontal de conexão */}
        <div className="hidden lg:block relative h-24 mb-8">
          <div className="absolute top-12 left-0 right-0 h-0.5 bg-brand-light" />
        </div>

        {/* Cards Grid - Totalmente Responsivo */}
        <div className={`
          grid gap-4 
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
          ${timelineData.length > 8 ? '2xl:grid-cols-5' : ''}
        `}>
          {timelineData.map((item, index) => (
            <TimelineCard
              key={item.id}
              data={item}
              index={index}
              isEditable={canUpdateTimeline}
              onUpdate={loadTimelineData}
              totalItems={timelineData.length}
            />
          ))}
        </div>

        {/* Mensagem se não houver etapas */}
        {timelineData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-brand-gray">Nenhuma etapa encontrada para esta fase.</p>
          </div>
        )}
      </div>

      {/* Legenda - Responsiva */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h4 className="text-sm font-medium text-brand-dark mb-3">Legenda de Status</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded-full bg-brand-lighter border-2 border-brand-light" />
            <div>
              <span className="text-sm font-medium text-brand-dark">Pendente</span>
              <p className="text-xs text-brand-gray">Ainda não iniciada</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded-full bg-blue-100 border-2 border-brand-blue" />
            <div>
              <span className="text-sm font-medium text-brand-dark">Em Andamento</span>
              <p className="text-xs text-brand-gray">Sendo executada</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded-full bg-green-100 border-2 border-green-500" />
            <div>
              <span className="text-sm font-medium text-brand-dark">Concluída</span>
              <p className="text-xs text-brand-gray">Finalizada com sucesso</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dica Mobile */}
      <div className="sm:hidden bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          💡 <strong>Dica:</strong> Toque nos cards para ver mais detalhes e opções.
        </p>
      </div>
    </div>
  );
};