// src/components/SystemConfig/FaviconUpload.tsx
/**
 * Componente para upload e gestão do favicon do sistema
 * Corrigido com a assinatura correta do uploadFile
 */

import React, { useState, useRef } from 'react';
import { useSystemConfig } from '../../hooks/useSystemConfig';
import { useNotification } from '../../contexts/NotificationContext';
import { googleDriveService } from '../../services/googleDrive';
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

      // Renomeia o arquivo
      const timestamp = Date.now();
      const extension = selectedFile.name.split('.').pop() || 'png';
      const newFile = new File([selectedFile], `favicon_${timestamp}.${extension}`, {
        type: selectedFile.type
      });

      // Upload para o Google Drive com callback de progresso
      const result = await googleDriveService.uploadFile(
        newFile,
        'sistema/favicons', // ID da pasta ou caminho
        (progress) => {
          setUploadProgress(progress.loaded / progress.total * 100);
        }
      );

      // Atualiza no banco
      await updateFavicon(result.webViewLink, result.id);

      showNotification('success', 'Favicon atualizado com sucesso!');
      
      // Limpa estado
      setPreview(null);
      setSelectedFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      showNotification('error', error.message || 'Erro ao atualizar favicon');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Cancela seleção
   */
  const handleCancel = () => {
    setPreview(null);
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Preview atual */}
      <div>
        <h3 className="text-lg font-medium text-brand-dark mb-4">Favicon Atual</h3>
        <div className="bg-brand-lighter rounded-lg p-8 text-center">
          {currentFavicon ? (
            <div className="flex items-center justify-center space-x-4">
              <div>
                <p className="text-xs text-brand-gray mb-2">16x16</p>
                <div className="w-16 h-16 bg-white border border-brand-light rounded flex items-center justify-center">
                  <img src={currentFavicon} alt="Favicon 16x16" className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-xs text-brand-gray mb-2">32x32</p>
                <div className="w-16 h-16 bg-white border border-brand-light rounded flex items-center justify-center">
                  <img src={currentFavicon} alt="Favicon 32x32" className="w-8 h-8" />
                </div>
              </div>
              <div>
                <p className="text-xs text-brand-gray mb-2">48x48</p>
                <div className="w-16 h-16 bg-white border border-brand-light rounded flex items-center justify-center">
                  <img src={currentFavicon} alt="Favicon 48x48" className="w-12 h-12" />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-brand-gray">
              <svg className="mx-auto h-12 w-12 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm">Nenhum favicon configurado</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload de novo favicon */}
      <div>
        <h3 className="text-lg font-medium text-brand-dark mb-4">Alterar Favicon</h3>
        
        {!preview ? (
          <div className="border-2 border-dashed border-brand-light rounded-lg p-6">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2 text-sm text-brand-gray">
                Arraste uma imagem ou clique para selecionar
              </p>
              <p className="text-xs text-brand-light mt-1">
                PNG ou ICO, quadrado, máximo 500KB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/x-icon,image/vnd.microsoft.icon"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Selecionar Arquivo
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-brand-light rounded-lg p-6">
            <div className="space-y-4">
              {/* Preview */}
              <div className="bg-brand-lighter rounded-lg p-8">
                <div className="flex items-center justify-center space-x-4">
                  <div>
                    <p className="text-xs text-brand-gray mb-2">Preview 16x16</p>
                    <div className="w-16 h-16 bg-white border border-brand-light rounded flex items-center justify-center">
                      <img src={preview} alt="Preview 16x16" className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-brand-gray mb-2">Preview 32x32</p>
                    <div className="w-16 h-16 bg-white border border-brand-light rounded flex items-center justify-center">
                      <img src={preview} alt="Preview 32x32" className="w-8 h-8" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-brand-gray mb-2">Preview 48x48</p>
                    <div className="w-16 h-16 bg-white border border-brand-light rounded flex items-center justify-center">
                      <img src={preview} alt="Preview 48x48" className="w-12 h-12" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra de progresso durante upload */}
              {uploading && uploadProgress > 0 && (
                <div className="w-full bg-brand-lighter rounded-full h-2">
                  <div
                    className="bg-brand-blue h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {/* Ações */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancel}
                  disabled={uploading}
                  className="px-4 py-2 border border-brand-light text-brand-gray rounded-lg hover:bg-brand-lighter transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {uploading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      {uploadProgress > 0 ? `Enviando ${Math.round(uploadProgress)}%...` : 'Enviando...'}
                    </>
                  ) : (
                    'Aplicar Favicon'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Especificações */}
      <div className="text-sm text-brand-gray">
        <h4 className="font-medium text-brand-dark mb-2">Especificações recomendadas:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Formato: PNG ou ICO</li>
          <li>Dimensões: 32x32px (quadrado)</li>
          <li>Tamanho máximo: 500KB</li>
          <li>Design simples e reconhecível em tamanho pequeno</li>
          <li>Preferencialmente com fundo transparente</li>
        </ul>
      </div>
    </div>
  );
};