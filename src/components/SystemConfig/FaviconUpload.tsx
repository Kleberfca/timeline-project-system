// ============================================
// src/components/SystemConfig/FaviconUpload.tsx
// ============================================

/**
 * Componente para upload e gestão do favicon do sistema
 * ATUALIZADO: Usa Supabase Storage ao invés do Google Drive
 */

import React, { useState, useRef } from 'react';
import { useSystemConfig } from '../../hooks/useSystemConfig';
import { useNotification } from '../../contexts/NotificationContext';
import { uploadSystemImage } from '../../services/storage';
import { LoadingSpinner } from '../LoadingSpinner';

interface FaviconUploadProps {
  currentFavicon: string | null;
}

export const FaviconUpload: React.FC<FaviconUploadProps> = ({ currentFavicon }) => {
  const { updateFavicon } = useSystemConfig();
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

    if (file.size > 500 * 1024) { // 500KB
      showNotification('error', 'O favicon deve ter no máximo 500KB');
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
        'favicon',
        (progress) => {
          setUploadProgress(Math.round(progress.percentage));
        }
      );

      // Atualiza no banco
      await updateFavicon(result.url, result.path);

      showNotification('success', 'Favicon atualizado com sucesso!');
      
      // Reset
      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Erro ao atualizar favicon');
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
      {/* Favicon atual */}
      <div>
        <h3 className="text-sm font-medium text-brand-dark mb-3">Favicon Atual</h3>
        <div className="bg-brand-lighter rounded-lg p-4 flex items-center justify-center">
          {currentFavicon ? (
            <div className="flex items-center space-x-4">
              <img 
                src={currentFavicon} 
                alt="Favicon atual" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-sm text-brand-gray">Favicon configurado</span>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-8 h-8 bg-brand-blue rounded flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-xs">T</span>
              </div>
              <p className="text-sm text-brand-gray">Nenhum favicon configurado</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload de novo favicon */}
      <div>
        <h3 className="text-sm font-medium text-brand-dark mb-3">Novo Favicon</h3>
        
        {!selectedFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-brand-light rounded-lg p-6 text-center cursor-pointer hover:border-brand-gray transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.ico"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <svg className="mx-auto h-12 w-12 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h8m-4-4v8m-12 4h.02" />
            </svg>
            
            <p className="mt-2 text-sm text-brand-gray">
              Clique para selecionar um ícone
            </p>
            <p className="text-xs text-brand-light mt-1">
              PNG ou ICO, 32x32px recomendado, máximo 500KB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="bg-brand-lighter rounded-lg p-4 flex items-center justify-center">
              {preview && (
                <div className="flex items-center space-x-4">
                  <img 
                    src={preview} 
                    alt="Preview do novo favicon" 
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-sm text-brand-gray">Preview do favicon</span>
                </div>
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
                {uploading ? <LoadingSpinner size="sm" /> : 'Aplicar Favicon'}
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
          <strong>Dica:</strong> Use um ícone quadrado simples em 32x32 pixels. 
          O favicon aparece na aba do navegador e nos favoritos.
        </p>
      </div>
    </div>
  );
};