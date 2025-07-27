// src/components/FileUpload/FileUploadSmart.tsx
/**
 * Componente de upload de arquivos com suporte a pasta configurada do projeto
 * Usa pasta do Drive se configurada, senão cria estrutura padrão
 */

import React, { useState, useRef } from 'react';
import { arquivoQueries } from '../../lib/supabase-queries';
import { useSmartGoogleDriveUpload } from '../../hooks/useSmartGoogleDriveUpload';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import type { TipoArquivo, UploadProgress } from '../../types';

interface FileUploadSmartProps {
  projetoTimelineId: string;
  onUploadComplete?: () => void;
}

const ALLOWED_FILE_TYPES = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xlsx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/csv': 'csv'
} as const;

export const FileUploadSmart: React.FC<FileUploadSmartProps> = ({
  projetoTimelineId,
  onUploadComplete
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  // Usa o hook de upload inteligente
  const { upload, uploading, progress } = useSmartGoogleDriveUpload((file) => {
    showNotification('success', `Arquivo ${file.name} enviado com sucesso!`);
  });

  /**
   * Valida tipo de arquivo
   */
  const validateFileType = (file: File): TipoArquivo | null => {
    const mimeType = file.type as keyof typeof ALLOWED_FILE_TYPES;
    return ALLOWED_FILE_TYPES[mimeType] || null;
  };

  /**
   * Processa upload do arquivo
   */
  const handleFileUpload = async (file: File) => {
    const fileType = validateFileType(file);
    
    if (!fileType) {
      setError('Tipo de arquivo não permitido. Use PDF, Word, Excel ou CSV.');
      return;
    }

    // Limite de tamanho: 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    try {
      setError(null);

      // Upload inteligente para Google Drive
      const googleDriveData = await upload(file, projetoTimelineId);
      
      if (!googleDriveData) {
        throw new Error('Falha no upload');
      }

      // Registra no banco
      await arquivoQueries.criar({
        projeto_timeline_id: projetoTimelineId,
        nome: file.name,
        tipo: fileType,
        tamanho: file.size,
        url_google_drive: googleDriveData.webViewLink,
        google_drive_id: googleDriveData.id,
        uploaded_by: user!.id
      });

      // Callback de sucesso
      onUploadComplete?.();
      
      // Reset do input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Erro no upload:', err);
      setError(err.message || 'Erro ao fazer upload do arquivo');
    }
  };

  /**
   * Handle de arquivos selecionados
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  /**
   * Drag and drop handlers
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  /**
   * Handle de upload de link
   */
  const handleLinkUpload = async () => {
    const url = prompt('Digite o URL do repositório ou documento:');
    if (!url) return;

    try {
      setError(null);

      // Cria um "arquivo" virtual para links
      await arquivoQueries.criar({
        projeto_timeline_id: projetoTimelineId,
        nome: url,
        tipo: 'link' as TipoArquivo,
        url_google_drive: url,
        google_drive_id: 'link-' + Date.now(),
        uploaded_by: user!.id
      });

      showNotification('success', 'Link adicionado com sucesso!');
      onUploadComplete?.();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar link');
    }
  };

  return (
    <div className="space-y-3">
      {/* Área de drag and drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.xlsx,.xls,.csv"
          className="hidden"
          disabled={uploading}
        />

        {uploading && progress ? (
          <div className="space-y-3">
            <svg className="mx-auto h-12 w-12 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div className="text-sm text-gray-600">
              Enviando... {progress.percentage}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              Arraste arquivos aqui ou{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                clique para selecionar
              </button>
            </p>
            <p className="text-xs text-gray-500">
              PDF, Word, Excel ou CSV até 10MB
            </p>
          </>
        )}
      </div>

      {/* Botão para adicionar link */}
      <button
        type="button"
        onClick={handleLinkUpload}
        disabled={uploading}
        className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        <svg className="inline-block w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        Adicionar Link
      </button>

      {/* Mensagem de erro */}
      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Informação sobre pasta do Drive */}
      <div className="text-xs text-gray-500 text-center">
        <svg className="inline-block w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.71 3.52L1.15 15l4.58 7.5 2.36-4.78H4.58L10 7l2.14 3.5L15 5.5z"/>
          <path d="M13.21 7l-1.64 3.5 5.49 9 2.36-4.5z"/>
          <path d="M16.57 3.5L8.5 3.52l4.35 7 4.58-7.5z"/>
        </svg>
        Os arquivos serão salvos na pasta configurada do projeto ou na estrutura padrão
      </div>
    </div>
  );
};