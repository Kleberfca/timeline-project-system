// src/pages/admin/SystemConfigUpdated.tsx
/**
 * Página de configurações do sistema
 * Permite escolher entre upload simples (base64) ou Google Drive
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSystemConfig } from '../../hooks/useSystemConfig';
import { SimpleLogoUpload } from '../../components/SystemConfig/SimpleLogoUpload';
import { LogoUpload } from '../../components/SystemConfig/LogoUpload';
import { FaviconUpload } from '../../components/SystemConfig/FaviconUpload';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const SystemConfigUpdated: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { config, logo, favicon, logoSource, faviconSource, loading, error } = useSystemConfig();
  
  const [activeTab, setActiveTab] = useState<'logo' | 'favicon'>('logo');
  const [uploadMethod, setUploadMethod] = useState<'simple' | 'drive'>('simple');

  // Verifica se é admin
  if (!isAdmin) {
    navigate('/');
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Erro ao carregar configurações: {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-dark">Configurações do Sistema</h1>
        <p className="mt-2 text-brand-gray">
          Gerencie a identidade visual do sistema
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-brand-lighter">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('logo')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'logo'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-brand-gray hover:text-brand-dark hover:border-brand-light'
                }
              `}
            >
              Logo do Sistema
            </button>
            <button
              onClick={() => setActiveTab('favicon')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'favicon'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-brand-gray hover:text-brand-dark hover:border-brand-light'
                }
              `}
            >
              Favicon
            </button>
          </nav>
        </div>

        {/* Método de Upload */}
        <div className="p-6 border-b border-brand-lighter">
          <div className="flex items-center space-x-6">
            <span className="text-sm font-medium text-brand-dark">Método de upload:</span>
            
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="simple"
                checked={uploadMethod === 'simple'}
                onChange={(e) => setUploadMethod(e.target.value as 'simple' | 'drive')}
                className="text-brand-blue focus:ring-brand-blue"
              />
              <span className="ml-2 text-sm text-brand-dark">
                Upload Simples
                <span className="text-xs text-brand-gray ml-1">(Recomendado)</span>
              </span>
            </label>
            
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="drive"
                checked={uploadMethod === 'drive'}
                onChange={(e) => setUploadMethod(e.target.value as 'simple' | 'drive')}
                className="text-brand-blue focus:ring-brand-blue"
              />
              <span className="ml-2 text-sm text-brand-dark">
                Google Drive
                <span className="text-xs text-brand-gray ml-1">(Requer autorização)</span>
              </span>
            </label>
          </div>

          {/* Info sobre método atual */}
          {(logoSource || faviconSource) && (
            <div className="mt-3 text-xs text-brand-gray">
              {activeTab === 'logo' && logoSource && (
                <p>Logo atual armazenado via: <strong>{logoSource === 'base64' ? 'Upload Simples' : 'Google Drive'}</strong></p>
              )}
              {activeTab === 'favicon' && faviconSource && (
                <p>Favicon atual armazenado via: <strong>{faviconSource === 'base64' ? 'Upload Simples' : 'Google Drive'}</strong></p>
              )}
            </div>
          )}
        </div>

        {/* Conteúdo das tabs */}
        <div className="p-6">
          {activeTab === 'logo' ? (
            uploadMethod === 'simple' ? (
              <SimpleLogoUpload type="logo" currentImage={logo} />
            ) : (
              <LogoUpload currentLogo={logo} />
            )
          ) : (
            uploadMethod === 'simple' ? (
              <SimpleLogoUpload type="favicon" currentImage={favicon} />
            ) : (
              <FaviconUpload currentFavicon={favicon} />
            )
          )}
        </div>

        {/* Dicas */}
        <div className="px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              💡 Dicas sobre métodos de upload
            </h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p>
                <strong>Upload Simples:</strong> Mais rápido e prático. Ideal para logos e favicons pequenos.
                As imagens são armazenadas diretamente no banco de dados.
              </p>
              <p>
                <strong>Google Drive:</strong> Útil para compartilhamento e backup. Requer autorização
                e conexão com internet para exibir as imagens.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};