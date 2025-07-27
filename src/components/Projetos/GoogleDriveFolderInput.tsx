// src/components/Projetos/GoogleDriveFolderInput.tsx
/**
 * Componente para configurar pasta do Google Drive do projeto
 * Permite inserir URL ou ID da pasta
 */

import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';

interface GoogleDriveFolderInputProps {
  value?: string | null;
  onChange: (folderId: string | null) => void;
  disabled?: boolean;
}

export const GoogleDriveFolderInput: React.FC<GoogleDriveFolderInputProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const { showNotification } = useNotification();
  const [inputValue, setInputValue] = useState(value || '');
  const [isValid, setIsValid] = useState(true);

  /**
   * Extrai ID da pasta do Google Drive a partir de URL ou ID
   */
  const extractFolderId = (input: string): string | null => {
    if (!input.trim()) return null;

    // Se já é um ID (caracteres alfanuméricos e - ou _)
    if (/^[a-zA-Z0-9_-]+$/.test(input) && input.length > 20) {
      return input;
    }

    // Tenta extrair de URLs do Google Drive
    const patterns = [
      // https://drive.google.com/drive/folders/FOLDER_ID
      /drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]+)/,
      // https://drive.google.com/drive/u/0/folders/FOLDER_ID
      /drive\.google\.com\/drive\/u\/\d+\/folders\/([a-zA-Z0-9_-]+)/,
      // https://drive.google.com/folderview?id=FOLDER_ID
      /drive\.google\.com\/folderview\?id=([a-zA-Z0-9_-]+)/,
      // https://drive.google.com/open?id=FOLDER_ID
      /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  /**
   * Valida e formata o input
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (!value.trim()) {
      setIsValid(true);
      onChange(null);
      return;
    }

    const folderId = extractFolderId(value);
    if (folderId) {
      setIsValid(true);
      onChange(folderId);
    } else {
      setIsValid(false);
      onChange(null);
    }
  };

  /**
   * Abre pasta no Google Drive
   */
  const openInDrive = () => {
    if (value) {
      window.open(`https://drive.google.com/drive/folders/${value}`, '_blank');
    }
  };

  /**
   * Dicas de uso
   */
  const showHelp = () => {
    showNotification('info', 
      'Cole o link da pasta do Google Drive ou o ID da pasta. ' +
      'Exemplo: https://drive.google.com/drive/folders/abc123...'
    );
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-brand-dark">
        Pasta do Google Drive
        <button
          type="button"
          onClick={showHelp}
          className="ml-2 text-brand-gray hover:text-brand-blue"
        >
          <svg className="inline-block w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-brand-gray" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.71 3.52L1.15 15l4.58 7.5 2.36-4.78H4.58L10 7l2.14 3.5L15 5.5z"/>
            <path d="M13.21 7l-1.64 3.5 5.49 9 2.36-4.5z"/>
            <path d="M16.57 3.5L8.5 3.52l4.35 7 4.58-7.5z"/>
          </svg>
        </div>
        
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          placeholder="Cole o link ou ID da pasta aqui"
          className={`
            pl-10 pr-20 py-2 w-full border rounded-md
            ${isValid 
              ? 'border-brand-light focus:border-brand-blue' 
              : 'border-red-300 focus:border-red-500'
            }
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
            focus:outline-none focus:ring-1 focus:ring-brand-blue
          `}
        />

        {value && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={openInDrive}
              disabled={disabled}
              className="text-brand-blue hover:text-blue-700 text-sm font-medium disabled:opacity-50"
            >
              Abrir
            </button>
          </div>
        )}
      </div>

      {!isValid && inputValue && (
        <p className="text-sm text-red-600">
          Link ou ID inválido. Cole o link completo da pasta do Google Drive.
        </p>
      )}

      {value && isValid && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Pasta configurada: {value.substring(0, 15)}...</span>
        </div>
      )}

      <div className="text-xs text-brand-gray space-y-1">
        <p>• Os arquivos serão salvos diretamente nesta pasta</p>
        <p>• Certifique-se de que o sistema tem permissão de escrita</p>
        <p>• Deixe em branco para usar a estrutura padrão de pastas</p>
      </div>
    </div>
  );
};