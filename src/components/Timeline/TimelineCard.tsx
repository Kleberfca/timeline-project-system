// src/components/Timeline/TimelineCard.tsx
/**
 * Card individual de etapa na timeline
 * Expansível com detalhes e upload de arquivos
 */

import React, { useState } from 'react';
import { timelineQueries } from '../../lib/supabase-queries';
import { FileUpload } from '../FileUpload/FileUpload';
import { FileList } from '../FileUpload/FileList';
import { STATUS_COLORS } from '../../types';
import type { ProjetoTimeline, StatusEtapa } from '../../types';

interface TimelineCardProps {
  data: ProjetoTimeline;
  index: number;
  isEditable: boolean;
  onUpdate: () => void;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({
  data,
  index,
  isEditable,
  onUpdate
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [observacoes, setObservacoes] = useState(data.observacoes || '');

  const statusColor = STATUS_COLORS[data.status];

  /**
   * Atualiza status da etapa
   */
  const handleStatusUpdate = async (newStatus: StatusEtapa) => {
    if (!isEditable || isUpdating) return;

    try {
      setIsUpdating(true);
      await timelineQueries.atualizarStatus(data.id, newStatus, observacoes);
      onUpdate();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Salva observações
   */
  const handleSaveObservacoes = async () => {
    if (!isEditable || isUpdating) return;

    try {
      setIsUpdating(true);
      await timelineQueries.atualizarStatus(data.id, data.status, observacoes);
      onUpdate();
    } catch (error: any) {
      console.error('Erro ao salvar observações:', error);
      alert('Erro ao salvar observações: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      {/* Indicador de posição na timeline */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full z-10" />
      
      {/* Card da etapa */}
      <div className={`
        bg-white rounded-lg shadow-lg p-4 mt-8 border-2 transition-all
        ${statusColor.border} ${isExpanded ? 'ring-2 ring-blue-400' : ''}
      `}>
        {/* Header do card */}
        <div
          className="cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-semibold text-gray-900 pr-2">
              {data.etapa?.nome}
            </h3>
            <div className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${statusColor.bg} ${statusColor.text}
            `}>
              {data.status.replace('_', ' ').charAt(0).toUpperCase() + data.status.slice(1).replace('_', ' ')}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Etapa {index + 1}</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Conteúdo expandido */}
        {isExpanded && (
          <div className="mt-4 space-y-4 border-t pt-4">
            {/* Botões de status */}
            {isEditable && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Alterar Status
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStatusUpdate('pendente')}
                    disabled={isUpdating || data.status === 'pendente'}
                    className={`
                      px-3 py-1 text-xs font-medium rounded-md transition-colors
                      ${data.status === 'pendente'
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    Pendente
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('em_andamento')}
                    disabled={isUpdating || data.status === 'em_andamento'}
                    className={`
                      px-3 py-1 text-xs font-medium rounded-md transition-colors
                      ${data.status === 'em_andamento'
                        ? 'bg-yellow-200 text-yellow-700 cursor-not-allowed'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }
                    `}
                  >
                    Em Andamento
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('concluido')}
                    disabled={isUpdating || data.status === 'concluido'}
                    className={`
                      px-3 py-1 text-xs font-medium rounded-md transition-colors
                      ${data.status === 'concluido'
                        ? 'bg-green-200 text-green-700 cursor-not-allowed'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }
                    `}
                  >
                    Concluído
                  </button>
                </div>
              </div>
            )}

            {/* Datas */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {data.data_inicio && (
                <div>
                  <span className="text-gray-500">Iniciado em:</span>
                  <p className="font-medium">
                    {new Date(data.data_inicio).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
              {data.data_conclusao && (
                <div>
                  <span className="text-gray-500">Concluído em:</span>
                  <p className="font-medium">
                    {new Date(data.data_conclusao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              {isEditable ? (
                <div className="space-y-2">
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Adicione observações sobre esta etapa..."
                  />
                  <button
                    onClick={handleSaveObservacoes}
                    disabled={isUpdating || observacoes === data.observacoes}
                    className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Salvar Observações
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-700">
                  {data.observacoes || 'Sem observações'}
                </p>
              )}
            </div>

            {/* Upload e lista de arquivos */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Arquivos</h4>
              {isEditable && (
                <FileUpload
                  projetoTimelineId={data.id}
                  onUploadComplete={onUpdate}
                />
              )}
              <FileList
                projetoTimelineId={data.id}
                canDelete={isEditable}
                onDelete={onUpdate}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
