// src/examples/CompleteUsageExample.tsx
/**
 * Exemplo completo de uso da integração Google Drive
 * Demonstra todos os componentes e funcionalidades
 */

import React, { useState } from 'react';

// Importações organizadas
import { 
  FileUploadSmart,
  GoogleDriveFolderInput,
  ProjectDriveFolderField,
  GoogleDriveAuth,
  GoogleDriveStatus,
  useSmartGoogleDriveUpload
} from '../services/googleDrive/exports';

import { SimpleLogoUpload } from '../components/SystemConfig/SimpleLogoUpload';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { useNotification } from '../contexts/NotificationContext';

/**
 * Exemplo 1: Upload de arquivo para projeto
 */
export const ProjectFileUploadExample: React.FC<{ projetoTimelineId: string }> = ({ 
  projetoTimelineId 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Upload de Arquivos do Projeto</h3>
      
      {/* Status da conexão */}
      <GoogleDriveStatus />
      
      {/* Autorização se necessário */}
      <GoogleDriveAuth />
      
      {/* Upload inteligente */}
      <FileUploadSmart 
        projetoTimelineId={projetoTimelineId}
        onUploadComplete={() => console.log('Upload concluído!')}
      />
    </div>
  );
};

/**
 * Exemplo 2: Configuração de pasta do projeto
 */
export const ProjectFolderConfigExample: React.FC = () => {
  const [folderId, setFolderId] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const handleSave = () => {
    if (folderId) {
      showNotification('success', 'Pasta do projeto configurada!');
      console.log('Pasta configurada:', folderId);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Configurar Pasta do Drive</h3>
      
      <GoogleDriveFolderInput
        value={folderId}
        onChange={setFolderId}
      />
      
      <button
        onClick={handleSave}
        disabled={!folderId}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        Salvar Configuração
      </button>
    </div>
  );
};

/**
 * Exemplo 3: Upload de logo/favicon simplificado
 */
export const SystemBrandingExample: React.FC = () => {
  const { logo, favicon } = useSystemConfig();

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-medium">Identidade Visual do Sistema</h3>
      
      {/* Upload de Logo */}
      <div className="border rounded-lg p-6">
        <SimpleLogoUpload type="logo" currentImage={logo} />
      </div>
      
      {/* Upload de Favicon */}
      <div className="border rounded-lg p-6">
        <SimpleLogoUpload type="favicon" currentImage={favicon} />
      </div>
    </div>
  );
};

/**
 * Exemplo 4: Upload programático
 */
export const ProgrammaticUploadExample: React.FC = () => {
  const { upload, uploading, progress } = useSmartGoogleDriveUpload();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const result = await upload(selectedFile, 'projeto-timeline-id-aqui');
      console.log('Arquivo enviado:', result);
    } catch (error) {
      console.error('Erro no upload:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Upload Programático</h3>
      
      <input
        type="file"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      
      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? `Enviando... ${progress?.percentage}%` : 'Enviar Arquivo'}
      </button>
    </div>
  );
};

/**
 * Exemplo completo integrado
 */
export const CompleteIntegrationExample: React.FC = () => {
  const [activeExample, setActiveExample] = useState<string>('upload');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Exemplos de Integração Google Drive</h2>
      
      {/* Navegação */}
      <div className="flex space-x-4 mb-6 border-b">
        {[
          { id: 'upload', label: 'Upload de Arquivos' },
          { id: 'folder', label: 'Configurar Pasta' },
          { id: 'branding', label: 'Logo/Favicon' },
          { id: 'programmatic', label: 'Upload Programático' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveExample(tab.id)}
            className={`pb-2 px-1 border-b-2 transition-colors ${
              activeExample === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Conteúdo */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeExample === 'upload' && (
          <ProjectFileUploadExample projetoTimelineId="exemplo-id" />
        )}
        {activeExample === 'folder' && (
          <ProjectFolderConfigExample />
        )}
        {activeExample === 'branding' && (
          <SystemBrandingExample />
        )}
        {activeExample === 'programmatic' && (
          <ProgrammaticUploadExample />
        )}
      </div>
    </div>
  );
};