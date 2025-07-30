// src/components/Timeline/TimelineCard.tsx
/**
 * Card individual de etapa na timeline
 * TOTALMENTE RESPONSIVO - conteúdo nunca vaza
 * Funciona perfeitamente em todos os dispositivos
 */

import React, { useState } from 'react';
import { timelineQueries } from '../../lib/supabase-queries';
import { useNotification } from '../../contexts/NotificationContext';
import { FileUpload } from '../FileUpload/FileUpload';
import { FileList } from '../FileUpload/FileList';
import type { ProjetoTimeline, StatusEtapa } from '../../types';

interface TimelineCardProps {
  data: ProjetoTimeline;
  index: number;
  isEditable: boolean;
  onUpdate: () => void;
  totalItems: number;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({
  data,
  index,
  isEditable,
  onUpdate,
  totalItems
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [observacoes, setObservacoes] = useState(data.observacoes || '');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const { showNotification } = useNotification();

  /**
   * Cores e estilos baseados no status
   */
  const getStatusStyles = (status: StatusEtapa) => {
    switch (status) {
      case 'pendente':
        return {
          bg: 'bg-brand-lighter',
          border: 'border-brand-light',
          text: 'text-brand-gray',
          icon: '○',
          label: 'Pendente'
        };
      case 'em_andamento':
        return {
          bg: 'bg-blue-50',
          border: 'border-brand-blue',
          text: 'text-brand-blue',
          icon: '◐',
          label: 'Em Andamento'
        };
      case 'concluido':
        return {
          bg: 'bg-green-50',
          border: 'border-green-500',
          text: 'text-green-700',
          icon: '●',
          label: 'Concluída'
        };
    }
  };

  const statusStyle = getStatusStyles(data.status);

  /**
   * Atualiza status da etapa
   */
  const handleStatusUpdate = async (newStatus: StatusEtapa) => {
    if (!isEditable || isUpdating) return;

    try {
      setIsUpdating(true);
      await timelineQueries.atualizarStatus(data.id, newStatus, observacoes);
      showNotification('success', 'Status atualizado com sucesso!');
      onUpdate();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      showNotification('error', 'Erro ao atualizar status');
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Salva observações
   */
  const handleSaveObservacoes = async () => {
    if (!isEditable || isUpdating || observacoes === data.observacoes) return;

    try {
      setIsUpdating(true);
      await timelineQueries.atualizarStatus(data.id, data.status, observacoes);
      showNotification('success', 'Observações salvas!');
      onUpdate();
    } catch (error: any) {
      console.error('Erro ao salvar observações:', error);
      showNotification('error', 'Erro ao salvar observações');
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Formata data para exibição
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="relative group">
      {/* Indicador de posição desktop */}
      <div className="hidden lg:block absolute -top-8 left-1/2 transform -translate-x-1/2">
        <div className="relative">
          <div className="w-4 h-4 bg-white border-2 border-brand-gray rounded-full" />
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-brand-light" />
        </div>
      </div>

      {/* Card Principal - Totalmente Responsivo */}
      <div
        className={`
          relative bg-white rounded-lg shadow-md hover:shadow-lg
          transition-all duration-200 border-2
          ${statusStyle.border}
          ${isExpanded ? 'ring-2 ring-brand-blue ring-opacity-50' : ''}
          overflow-hidden
        `}
      >
        {/* Header do Card - Clicável */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left p-4 focus:outline-none focus:bg-brand-lighter/20"
          aria-expanded={isExpanded}
          aria-label={`Expandir detalhes da etapa ${data.etapa?.nome}`}
        >
          {/* Número da etapa e status */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-brand-gray bg-brand-lighter px-2 py-1 rounded">
                Etapa {index + 1}
              </span>
              <span className={`text-lg ${statusStyle.text}`}>
                {statusStyle.icon}
              </span>
            </div>
            <div className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${statusStyle.bg} ${statusStyle.text}
              flex items-center space-x-1
            `}>
              <span className="hidden sm:inline">{statusStyle.label}</span>
              <span className="sm:hidden">{statusStyle.icon}</span>
            </div>
          </div>

          {/* Nome da etapa - Com quebra de linha responsiva */}
          <h3 className="text-sm sm:text-base font-semibold text-brand-dark mb-2 line-clamp-2">
            {data.etapa?.nome || 'Etapa sem nome'}
          </h3>

          {/* Info resumida */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-brand-gray">
              {data.data_inicio ? (
                <span>Iniciada em {formatDate(data.data_inicio)}</span>
              ) : (
                <span>Não iniciada</span>
              )}
            </div>
            
            {/* Ícone de expansão */}
            <svg
              className={`w-5 h-5 text-brand-gray transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Conteúdo Expandido - Responsivo */}
        {isExpanded && (
          <div className="border-t border-brand-lighter">
            <div className="p-4 space-y-4">
              {/* Botões de Status - Responsivos */}
              {isEditable && (
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">
                    Alterar Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleStatusUpdate('pendente')}
                      disabled={isUpdating || data.status === 'pendente'}
                      className={`
                        px-2 py-2 text-xs sm:text-sm font-medium rounded-lg
                        transition-all flex items-center justify-center space-x-1
                        ${data.status === 'pendente'
                          ? 'bg-brand-lighter text-brand-gray cursor-not-allowed opacity-50'
                          : 'bg-brand-lighter/50 text-brand-gray hover:bg-brand-lighter'
                        }
                      `}
                    >
                      <span>○</span>
                      <span className="hidden sm:inline">Pendente</span>
                    </button>
                    
                    <button
                      onClick={() => handleStatusUpdate('em_andamento')}
                      disabled={isUpdating || data.status === 'em_andamento'}
                      className={`
                        px-2 py-2 text-xs sm:text-sm font-medium rounded-lg
                        transition-all flex items-center justify-center space-x-1
                        ${data.status === 'em_andamento'
                          ? 'bg-blue-100 text-brand-blue cursor-not-allowed opacity-50'
                          : 'bg-blue-50 text-brand-blue hover:bg-blue-100'
                        }
                      `}
                    >
                      <span>◐</span>
                      <span className="hidden sm:inline">Andamento</span>
                    </button>
                    
                    <button
                      onClick={() => handleStatusUpdate('concluido')}
                      disabled={isUpdating || data.status === 'concluido'}
                      className={`
                        px-2 py-2 text-xs sm:text-sm font-medium rounded-lg
                        transition-all flex items-center justify-center space-x-1
                        ${data.status === 'concluido'
                          ? 'bg-green-100 text-green-700 cursor-not-allowed opacity-50'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }
                      `}
                    >
                      <span>●</span>
                      <span className="hidden sm:inline">Concluído</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Datas - Responsivas */}
              <div className="grid grid-cols-2 gap-3">
                {data.data_inicio && (
                  <div className="bg-brand-lighter/50 rounded-lg p-2">
                    <p className="text-xs text-brand-gray">Início</p>
                    <p className="text-sm font-medium text-brand-dark">
                      {formatDate(data.data_inicio)}
                    </p>
                  </div>
                )}
                {data.data_conclusao && (
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-xs text-green-600">Conclusão</p>
                    <p className="text-sm font-medium text-green-700">
                      {formatDate(data.data_conclusao)}
                    </p>
                  </div>
                )}
              </div>

              {/* Observações - Responsivas */}
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">
                  Observações
                </label>
                {isEditable ? (
                  <div className="space-y-2">
                    <textarea
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Adicione observações sobre esta etapa..."
                      className="w-full px-3 py-2 text-sm border border-brand-light rounded-lg 
                               focus:ring-2 focus:ring-brand-blue focus:border-transparent
                               resize-none"
                      rows={3}
                    />
                    <button
                      onClick={handleSaveObservacoes}
                      disabled={isUpdating || observacoes === data.observacoes}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white 
                               bg-brand-blue rounded-lg hover:bg-blue-700 
                               disabled:opacity-50 disabled:cursor-not-allowed
                               transition-colors"
                    >
                      Salvar Observações
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-brand-gray bg-brand-lighter/50 rounded-lg p-3">
                    {observacoes || 'Nenhuma observação registrada.'}
                  </p>
                )}
              </div>

              {/* Arquivos - Responsivos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-brand-dark">Arquivos</h4>
                  {isEditable && (
                    <button
                      onClick={() => setShowFileUpload(!showFileUpload)}
                      className="text-xs text-brand-blue hover:text-blue-700 font-medium"
                    >
                      {showFileUpload ? 'Cancelar' : '+ Adicionar'}
                    </button>
                  )}
                </div>

                {/* Upload de arquivos */}
                {showFileUpload && isEditable && (
                  <div className="mb-3">
                    <FileUpload
                      projetoTimelineId={data.id}
                      onUploadComplete={() => {
                        setShowFileUpload(false);
                        onUpdate();
                      }}
                    />
                  </div>
                )}

                {/* Lista de arquivos */}
                <FileList
                  projetoTimelineId={data.id}
                  canDelete={isEditable}
                  onDelete={onUpdate}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Indicador de progresso mobile */}
      <div className="lg:hidden mt-2 text-center">
        <span className="text-xs text-brand-gray">
          {index + 1} de {totalItems}
        </span>
      </div>
    </div>
  );
};