// src/components/FileUpload/FileUpload.tsx
/**
 * Componente de upload de arquivos
 * Integração com Google Drive
 */

import React, { useState, useRef } from 'react';
import { arquivoQueries } from '../../lib/supabase-queries';
import { uploadToGoogleDrive } from '../../services/googleDrive';
import { useAuth } from '../../contexts/AuthContext';
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
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

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
      setUploading(true);
      setError(null);
      setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });

      // Upload para Google Drive
      const googleDriveData = await uploadToGoogleDrive(
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

    try {
      setUploading(true);
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

      onUploadComplete?.();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar link');
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
          ${isDragging 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.xlsx,.xls,.csv"
          disabled={uploading}
          className="sr-only"
        />

        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <p className="mt-2 text-sm text-gray-600">
          {uploading ? (
            'Fazendo upload...'
          ) : (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Clique para enviar
              </button>
              {' ou arraste um arquivo aqui'}
            </>
          )}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          PDF, Word, Excel ou CSV até 10MB
        </p>
      </div>

      {/* Botão de adicionar link */}
      <button
        type="button"
        onClick={handleLinkUpload}
        disabled={uploading}
        className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="inline-block w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        Adicionar Link de Repositório
      </button>

      {/* Barra de progresso */}
      {uploadProgress && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Enviando arquivo...</span>
            <span>{uploadProgress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
