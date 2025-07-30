// src/components/FileUpload/FileList.tsx
/**
 * Lista de arquivos com opções de visualização e download
 * ATUALIZADO: Remove dependência do Google Drive
 */

import React, { useEffect, useState } from 'react';
import { arquivoQueries } from '../../lib/supabase-queries';
import { useNotification } from '../../contexts/NotificationContext';
import type { Arquivo } from '../../types';

interface FileListProps {
  projetoTimelineId: string;
  canDelete?: boolean;
  onDelete?: () => void;
}

export const FileList: React.FC<FileListProps> = ({
  projetoTimelineId,
  canDelete = false,
  onDelete
}) => {
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadArquivos();
  }, [projetoTimelineId]);

  const loadArquivos = async () => {
    try {
      setLoading(true);
      const data = await arquivoQueries.listarPorTimeline(projetoTimelineId);
      setArquivos(data);
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
      showNotification('error', 'Erro ao carregar arquivos');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove arquivo
   */
  const handleDelete = async (arquivo: Arquivo) => {
    if (!confirm(`Deseja remover o arquivo "${arquivo.nome}"?`)) return;

    try {
      setDeletingId(arquivo.id);
      await arquivoQueries.remover(arquivo.id);
      showNotification('success', 'Arquivo removido com sucesso');
      await loadArquivos();
      onDelete?.();
    } catch (error: any) {
      showNotification('error', error.message || 'Erro ao remover arquivo');
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Formata tamanho do arquivo
   */
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '-';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  /**
   * Retorna ícone baseado no tipo do arquivo
   */
  const getFileIcon = (tipo: string) => {
    const icons: Record<string, JSX.Element> = {
      pdf: (
        <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4z" clipRule="evenodd" />
        </svg>
      ),
      doc: (
        <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4z" clipRule="evenodd" />
        </svg>
      ),
      docx: (
        <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4z" clipRule="evenodd" />
        </svg>
      ),
      xlsx: (
        <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4z" clipRule="evenodd" />
        </svg>
      ),
      csv: (
        <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      ),
      link: (
        <svg className="h-5 w-5 text-brand-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    };
    return icons[tipo] || icons.link;
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue mx-auto"></div>
      </div>
    );
  }

  if (arquivos.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-brand-gray">
        Nenhum arquivo anexado ainda
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {arquivos.map((arquivo) => (
        <div
          key={arquivo.id}
          className="flex items-center justify-between p-3 bg-brand-lighter rounded-lg hover:bg-gray-100 transition-colors group"
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {getFileIcon(arquivo.tipo)}
            <div className="flex-1 min-w-0">
              <a
                href={arquivo.storage_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-brand-dark hover:text-brand-blue truncate block"
                title={arquivo.nome}
              >
                {arquivo.nome}
              </a>
              <p className="text-xs text-brand-gray">
                {arquivo.tipo === 'link' ? 'Link externo' : formatFileSize(arquivo.tamanho)}
                {arquivo.created_at && (
                  <span className="ml-2">
                    • {new Date(arquivo.created_at).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            {/* Botão de visualizar/baixar */}
            <a
              href={arquivo.storage_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-brand-gray hover:text-brand-blue hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
              title={arquivo.tipo === 'link' ? 'Abrir link' : 'Visualizar arquivo'}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </a>

            {/* Botão de deletar */}
            {canDelete && (
              <button
                onClick={() => handleDelete(arquivo)}
                disabled={deletingId === arquivo.id}
                className="p-2 text-brand-gray hover:text-red-600 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remover arquivo"
              >
                {deletingId === arquivo.id ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};