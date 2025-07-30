// src/components/FileUpload/FileUpload.tsx
/**
 * Componente de upload de arquivos
 * Atualizado para usar Supabase Storage
 * Remove completamente dependência do Google Drive
 */

import React, { useState, useRef } from 'react';
import { arquivoQueries } from '../../lib/supabase-queries';
import { uploadProjectFile } from '../../services/storage';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import type { TipoArquivo, UploadProgress } from '../../types';

interface FileUploadProps {
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

export const FileUpload: React.FC<FileUploadProps> = ({
  projetoTimelineId,
  onUploadComplete
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { showNotification } = useNotification();

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
      showNotification('error', 'Tipo de arquivo não permitido. Use PDF, Word, Excel ou CSV.');
      return;
    }

    // Limite de tamanho: 10MB
    if (file.size > 10 * 1024 * 1024) {
      showNotification('error', 'Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });

      // Upload para Supabase Storage
      const uploadResult = await uploadProjectFile(
        file,
        projetoTimelineId,
        (progress) => setUploadProgress(progress)
      );

      // Registra no banco
      await arquivoQueries.criar({
        projeto_timeline_id: projetoTimelineId,
        nome: file.name,
        tipo: fileType,
        tamanho: file.size,
        storage_path: uploadResult.path,
        storage_url: uploadResult.url,
        bucket_name: 'arquivos',
        uploaded_by: user!.id
      });

      showNotification('success', 'Arquivo enviado com sucesso!');
      onUploadComplete?.();
      
      // Reset do input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Erro no upload:', err);
      showNotification('error', err.message || 'Erro ao fazer upload do arquivo');
    } finally {
      setUploading(false);
      setUploadProgress(null);
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

    // Validação básica de URL
    try {
      new URL(url);
    } catch {
      showNotification('error', 'URL inválida');
      return;
    }

    try {
      setUploading(true);

      // Cria um "arquivo" virtual para links
      await arquivoQueries.criar({
        projeto_timeline_id: projetoTimelineId,
        nome: url,
        tipo: 'link' as TipoArquivo,
        storage_url: url,
        bucket_name: 'links',
        uploaded_by: user!.id
      });

      showNotification('success', 'Link adicionado com sucesso!');
      onUploadComplete?.();
    } catch (err: any) {
      showNotification('error', err.message || 'Erro ao salvar link');
    } finally {
      setUploading(false);
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
          relative border-2 border-dashed rounded-lg p-6 text-center
          transition-all duration-200
          ${isDragging 
            ? 'border-brand-blue bg-blue-50' 
            : 'border-brand-light hover:border-brand-gray'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.xlsx,.xls,.csv"
          onChange={handleFileSelect}
          disabled={uploading}
        />

        {/* Ícone de upload */}
        <svg
          className={`mx-auto h-12 w-12 ${isDragging ? 'text-brand-blue' : 'text-brand-light'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 48 48"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M24 14v14m0 0l-5-5m5 5l5-5m-5 14c-7.732 0-14-6.268-14-14s6.268-14 14-14 14 6.268 14 14-6.268 14-14 14z"
          />
        </svg>

        <p className="mt-2 text-sm text-brand-gray">
          {isDragging 
            ? 'Solte o arquivo aqui' 
            : 'Clique ou arraste arquivos para fazer upload'
          }
        </p>
        <p className="text-xs text-brand-light mt-1">
          PDF, Word, Excel ou CSV (máx. 10MB)
        </p>

        {/* Barra de progresso */}
        {uploadProgress && (
          <div className="mt-4">
            <div className="bg-brand-lighter rounded-full h-2 overflow-hidden">
              <div
                className="bg-brand-blue h-full transition-all duration-300"
                style={{ width: `${uploadProgress.percentage}%` }}
              />
            </div>
            <p className="text-xs text-brand-gray mt-1">
              {uploadProgress.percentage}% enviado
            </p>
          </div>
        )}
      </div>

      {/* Botão para adicionar link */}
      <button
        type="button"
        onClick={handleLinkUpload}
        disabled={uploading}
        className="w-full py-2 px-4 border border-brand-light rounded-lg text-sm text-brand-gray hover:bg-brand-lighter transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center justify-center space-x-2">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span>Adicionar link de repositório</span>
        </div>
      </button>

      {/* Loading spinner */}
      {uploading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
        </div>
      )}
    </div>
  );
};