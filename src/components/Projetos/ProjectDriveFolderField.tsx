// src/components/Projetos/ProjectDriveFolderField.tsx
/**
 * Componente helper para configurar pasta em formulário de projeto
 * Wrapper do GoogleDriveFolderInput com lógica específica do projeto
 */

import React, { useState, useEffect } from 'react';
import { GoogleDriveFolderInput } from './GoogleDriveFolderInput';
import { getProjectFolderId } from '../../services/googleDriveWithProjectFolder';

interface ProjectDriveFolderFieldProps {
  projectId?: string;
  value?: string | null;
  onChange: (folderId: string | null) => void;
}

export const ProjectDriveFolderField: React.FC<ProjectDriveFolderFieldProps> = ({ 
  projectId, 
  value, 
  onChange 
}) => {
  const [loading, setLoading] = useState(false);
  
  // Se está editando, carrega pasta atual
  useEffect(() => {
    if (projectId && !value) {
      loadCurrentFolder();
    }
  }, [projectId]);

  const loadCurrentFolder = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const folderId = await getProjectFolderId(projectId);
      if (folderId) {
        onChange(folderId);
      }
    } catch (error) {
      console.error('Erro ao carregar pasta:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleDriveFolderInput
      value={value}
      onChange={onChange}
      disabled={loading}
    />
  );
};