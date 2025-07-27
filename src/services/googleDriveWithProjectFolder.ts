// src/services/googleDriveWithProjectFolder.ts
/**
 * Upload para Google Drive usando pasta configurada do projeto
 * Se o projeto tem pasta configurada, usa ela diretamente
 * Caso contrário, cria estrutura de pastas padrão
 */

import { supabase } from '../lib/supabase';
import { googleDriveService } from './googleDrive';
import { googleDriveFolderService } from './googleDriveFolder';
import { getCachedProjectTimelineInfo } from '../utils/projectInfo';
import type { GoogleDriveFile, UploadProgress } from '../types/googleDrive';

/**
 * Busca pasta configurada do projeto
 */
export async function getProjectFolderId(projetoId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('projetos')
      .select('google_drive_folder_id')
      .eq('id', projetoId)
      .single();

    if (error || !data) return null;
    
    return data.google_drive_folder_id;
  } catch (error) {
    console.error('Erro ao buscar pasta do projeto:', error);
    return null;
  }
}

/**
 * Upload inteligente para Google Drive
 * Usa pasta do projeto se configurada, senão cria estrutura padrão
 */
export async function smartUploadToGoogleDrive(
  file: File,
  projetoTimelineId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<GoogleDriveFile> {
  try {
    // Busca informações do projeto timeline
    const projectInfo = await getCachedProjectTimelineInfo(projetoTimelineId);
    
    // Busca ID do projeto através do projeto_timeline
    const { data: timelineData } = await supabase
      .from('projeto_timeline')
      .select('projeto_id')
      .eq('id', projetoTimelineId)
      .single();

    if (!timelineData?.projeto_id) {
      throw new Error('Projeto não encontrado');
    }

    // Verifica se o projeto tem pasta configurada
    const projectFolderId = await getProjectFolderId(timelineData.projeto_id);
    
    let targetFolderId: string;
    
    if (projectFolderId) {
      // Usa pasta configurada do projeto
      console.log('Usando pasta configurada do projeto:', projectFolderId);
      targetFolderId = projectFolderId;
    } else {
      // Cria estrutura de pastas padrão
      console.log('Criando estrutura de pastas padrão');
      const folderStructure = await googleDriveFolderService.createProjectFolderStructure(
        projectInfo.clienteNome,
        projectInfo.projetoNome,
        projectInfo.etapaNome
      );
      targetFolderId = folderStructure.etapaFolderId;
    }

    // Faz upload para a pasta determinada
    return await googleDriveService.uploadFile(
      file, 
      targetFolderId, 
      onProgress
    );
  } catch (error: any) {
    console.error('Erro no upload para Google Drive:', error);
    throw new Error(error.message || 'Erro ao fazer upload para Google Drive');
  }
}

/**
 * Verifica se uma pasta existe e é acessível
 */
export async function validateGoogleDriveFolder(folderId: string): Promise<boolean> {
  try {
    // Garante que o serviço está inicializado
    await googleDriveService.initialize();
    
    // Verifica se está autorizado
    if (!googleDriveService.isAuthorized()) {
      await googleDriveService.authorize();
    }
    
    // Tenta acessar a pasta
    const response = await gapi.client.drive.files.get({
      fileId: folderId,
      fields: 'id,name,mimeType'
    });
    
    // Verifica se é uma pasta
    return response.result.mimeType === 'application/vnd.google-apps.folder';
  } catch (error) {
    console.error('Erro ao validar pasta:', error);
    return false;
  }
}

/**
 * Lista arquivos de uma pasta específica do projeto
 */
export async function listProjectFiles(
  projetoId: string,
  pageSize: number = 100
): Promise<GoogleDriveFile[]> {
  try {
    const folderId = await getProjectFolderId(projetoId);
    
    if (!folderId) {
      return [];
    }
    
    return await googleDriveFolderService.listFilesInFolder(folderId, pageSize);
  } catch (error) {
    console.error('Erro ao listar arquivos do projeto:', error);
    return [];
  }
}