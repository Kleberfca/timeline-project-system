// src/components/SystemConfig/SimpleLogoUpload.tsx
/**
 * Componente simplificado para upload de logo/favicon
 * Armazena imagens em base64 no banco de dados
 * Sem necessidade de Google Drive
 */

import React, { useState, useRef } from 'react';
import { useSystemConfig } from '../../hooks/useSystemConfig';
import { useNotification } from '../../contexts/NotificationContext';
import { LoadingSpinner } from '../LoadingSpinner';

interface SimpleLogoUploadProps {
  type: 'logo' | 'favicon';
  currentImage?: string | null;
}

export const SimpleLogoUpload: React.FC<SimpleLogoUploadProps> = ({ 
  type, 
  currentImage 
}) => {
  const { updateLogoBase64, updateFaviconBase64 } = useSystemConfig();
  const { showNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Configurações por tipo
  const config = {
    logo: {
      maxSize: 500 * 1024, // 500KB
      accept: 'image/png,image/jpeg,image/svg+xml',
      dimensions: { width: 200, height: 60 },
      title: 'Logo do Sistema'
    },
    favicon: {
      maxSize: 100 * 1024, // 100KB
      accept: 'image/png,image/x-icon,image/ico',
      dimensions: { width: 32, height: 32 },
      title: 'Favicon'
    }
  };

  const currentConfig = config[type];

  /**
   * Converte arquivo para base64
   */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  /**
   * Redimensiona imagem se necessário
   */
  const resizeImage = (base64: string, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcula dimensões mantendo proporção
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = base64;
    });
  };

  /**
   * Handle de seleção de arquivo
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de tamanho
    if (file.size > currentConfig.maxSize) {
      showNotification('error', `O arquivo deve ter no máximo ${currentConfig.maxSize / 1024}KB`);
      return;
    }

    try {
      // Converte para base64
      let base64 = await fileToBase64(file);
      
      // Redimensiona se for muito grande
      if (type === 'logo') {
        base64 = await resizeImage(base64, 400, 120); // Dobro do tamanho de exibição
      } else {
        base64 = await resizeImage(base64, 64, 64); // Favicon em alta resolução
      }
      
      setPreview(base64);
    } catch (error) {
      showNotification('error', 'Erro ao processar imagem');
    }
  };

  /**
   * Aplica a imagem
   */
  const handleApply = async () => {
    if (!preview) return;

    try {
      setUploading(true);
      
      if (type === 'logo') {
        await updateLogoBase64(preview);
      } else {
        await updateFaviconBase64(preview);
      }
      
      showNotification('success', `${currentConfig.title} atualizado com sucesso!`);
      
      // Limpa preview
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      showNotification('error', error.message || `Erro ao atualizar ${type}`);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Remove imagem atual
   */
  const handleRemove = async () => {
    if (!confirm(`Deseja remover o ${currentConfig.title} atual?`)) return;

    try {
      setUploading(true);
      
      if (type === 'logo') {
        await updateLogoBase64(null);
      } else {
        await updateFaviconBase64(null);
      }
      
      showNotification('success', `${currentConfig.title} removido!`);
    } catch (error: any) {
      showNotification('error', error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preview atual */}
      <div>
        <h3 className="text-lg font-medium text-brand-dark mb-4">
          {currentConfig.title} Atual
        </h3>
        <div className="bg-brand-lighter rounded-lg p-8 text-center">
          {currentImage ? (
            <div className="space-y-4">
              <img
                src={currentImage}
                alt={`${type} atual`}
                className={type === 'logo' 
                  ? "max-h-20 mx-auto object-contain" 
                  : "w-8 h-8 mx-auto"
                }
              />
              <button
                onClick={handleRemove}
                disabled={uploading}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remover {currentConfig.title}
              </button>
            </div>
          ) : (
            <div className="text-brand-gray">
              <svg className="mx-auto h-12 w-12 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm">Nenhum {type} configurado</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload novo */}
      <div>
        <h3 className="text-lg font-medium text-brand-dark mb-4">
          Alterar {currentConfig.title}
        </h3>
        
        {!preview ? (
          <div className="space-y-4">
            {/* Área de upload */}
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept={currentConfig.accept}
                onChange={handleFileSelect}
                className="hidden"
                id={`${type}-upload`}
              />
              <label
                htmlFor={`${type}-upload`}
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-brand-light rounded-lg cursor-pointer hover:border-brand-blue transition-colors"
              >
                <svg className="w-8 h-8 text-brand-gray mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm text-brand-gray">
                  Clique para selecionar ou arraste a imagem aqui
                </span>
                <span className="text-xs text-brand-light mt-1">
                  Máximo {currentConfig.maxSize / 1024}KB
                </span>
              </label>
            </div>

            {/* Dicas */}
            <div className="text-sm text-brand-gray">
              <p className="font-medium mb-1">Dicas:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Use imagens com fundo transparente (PNG)</li>
                <li>Dimensões recomendadas: {currentConfig.dimensions.width}x{currentConfig.dimensions.height}px</li>
                <li>A imagem será redimensionada automaticamente se necessário</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="bg-gray-100 rounded-lg p-6 text-center">
              <img
                src={preview}
                alt="Preview"
                className={type === 'logo' 
                  ? "max-h-24 mx-auto object-contain" 
                  : "w-12 h-12 mx-auto"
                }
              />
            </div>

            {/* Ações */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={uploading}
                className="flex-1 px-4 py-2 border border-brand-gray text-brand-dark rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleApply}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                {uploading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Aplicando...
                  </>
                ) : (
                  'Aplicar'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};