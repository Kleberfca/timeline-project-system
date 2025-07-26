// src/pages/admin/SystemConfig.tsx
/**
 * Página de configurações do sistema
 * Permite alterar logo e favicon
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useSystemConfig } from '../../hooks/useSystemConfig';
import { LogoUpload } from '../../components/SystemConfig/LogoUpload';
import { FaviconUpload } from '../../components/SystemConfig/FaviconUpload';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const SystemConfig: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { showNotification } = useNotification();
  const { config, loading, error } = useSystemConfig();
  const [activeTab, setActiveTab] = useState<'logo' | 'favicon'>('logo');

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

        {/* Conteúdo das tabs */}
        <div className="p-6">
          {activeTab === 'logo' ? (
            <LogoUpload currentLogo={config?.logo_url || null} />
          ) : (
            <FaviconUpload currentFavicon={config?.favicon_url || null} />
          )}
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Dicas para melhores resultados
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Logo: Use imagens PNG com fundo transparente</li>
                <li>Favicon: Prefira ícones quadrados simples (32x32px)</li>
                <li>As alterações são aplicadas em tempo real para todos os usuários</li>
                <li>Mantenha backup das versões anteriores por segurança</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Informações de última atualização */}
      {config && config.updated_at && (
        <div className="mt-4 text-sm text-brand-gray text-center">
          Última atualização: {new Date(config.updated_at).toLocaleString('pt-BR')}
        </div>
      )}
    </div>
  );
};