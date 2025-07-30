// src/components/SystemConfig/LogoUpload.tsx
/**
 * Componente para upload e gestão do logo do sistema
 * ATUALIZADO: Usa Supabase Storage ao invés do Google Drive
 */

import React, { useState, useRef } from 'react';
import { useSystemConfig } from '../../hooks/useSystemConfig';
import { useNotification } from '../../contexts/NotificationContext';
import { uploadSystemImage } from '../../services/storage';
import { LoadingSpinner } from '../LoadingSpinner';

interface LogoUploadProps {
  currentLogo: string | null;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({ currentLogo }) => {
  const { updateLogo } = useSystemConfig();
  const { showNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Handle de seleção de arquivo
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações
    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Por favor, selecione uma imagem');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      showNotification('error', 'A imagem deve ter no máximo 2MB');
      return;
    }

    // Cria preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
  };

  /**
   * Handle de upload
   */
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      // Upload para Supabase Storage
      const result = await uploadSystemImage(
        selectedFile,
        'logo',
        (progress) => {
          setUploadProgress(Math.round(progress.percentage));
        }
      );

      // Atualiza no banco
      await updateLogo(result.url, result.path);

      showNotification('success', 'Logo atualizado com sucesso!');
      
      // Reset
      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Erro ao atualizar logo');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  /**
   * Handle de cancelamento
   */
  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo atual */}
      <div>
        <h3 className="text-sm font-medium text-brand-dark mb-3">Logo Atual</h3>
        <div className="bg-brand-lighter rounded-lg p-4 flex items-center justify-center h-32">
          {currentLogo ? (
            <img 
              src={currentLogo} 
              alt="Logo atual" 
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-blue rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-2xl">T</span>
              </div>
              <p className="text-sm text-brand-gray">Nenhum logo configurado</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload de novo logo */}
      <div>
        <h3 className="text-sm font-medium text-brand-dark mb-3">Novo Logo</h3>
        
        {!selectedFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-brand-light rounded-lg p-6 text-center cursor-pointer hover:border-brand-gray transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <svg className="mx-auto h-12 w-12 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
            </svg>
            
            <p className="mt-2 text-sm text-brand-gray">
              Clique para selecionar uma imagem
            </p>
            <p className="text-xs text-brand-light mt-1">
              PNG recomendado, máximo 2MB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="bg-brand-lighter rounded-lg p-4 flex items-center justify-center h-32">
              {preview && (
                <img 
                  src={preview} 
                  alt="Preview do novo logo" 
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>

            {/* Informações do arquivo */}
            <div className="text-sm text-brand-gray">
              <p>Arquivo: {selectedFile.name}</p>
              <p>Tamanho: {(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>

            {/* Progress bar */}
            {uploading && uploadProgress > 0 && (
              <div>
                <div className="bg-brand-lighter rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-brand-blue h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-brand-gray mt-1">{uploadProgress}% enviado</p>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex space-x-3">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? <LoadingSpinner size="sm" /> : 'Aplicar Logo'}
              </button>
              <button
                onClick={handleCancel}
                disabled={uploading}
                className="flex-1 border border-brand-light text-brand-gray px-4 py-2 rounded-lg hover:bg-brand-lighter transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Dica:</strong> Use um logo com fundo transparente em formato PNG para melhor resultado. 
          O logo será exibido no header do sistema em todos os dispositivos.
        </p>
      </div>
    </div>
  );
};