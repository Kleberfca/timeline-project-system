// src/services/googleDrive.ts
/**
 * Serviço de integração com Google Drive API
 * Gerencia upload e organização de arquivos
 */

import type { UploadProgress } from '../types';

// Configurações da API (devem vir do .env)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_DRIVE_FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID;

// Escopos necessários
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

interface GoogleDriveFile {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink: string;
}

/**
 * Classe para gerenciar operações do Google Drive
 */
class GoogleDriveService {
  private accessToken: string | null = null;
  private tokenClient: any = null;
  private gapiInited = false;
  private gisInited = false;

  /**
   * Inicializa o serviço
   */
  async initialize(): Promise<void> {
    // Carrega scripts do Google
    await this.loadGoogleScripts();
    
    // Inicializa GAPI
    await new Promise<void>((resolve) => {
      gapi.load('client', async () => {
        await gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        });
        this.gapiInited = true;
        resolve();
      });
    });

    // Inicializa GIS (Google Identity Services)
    this.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (response: any) => {
        this.accessToken = response.access_token;
      },
    });
    this.gisInited = true;
  }

  /**
   * Carrega scripts do Google dinamicamente
   */
  private loadGoogleScripts(): Promise<void> {
    return new Promise((resolve) => {
      // Verifica se já foram carregados
      if (window.gapi && window.google) {
        resolve();
        return;
      }

      let scriptsLoaded = 0;
      const checkLoaded = () => {
        scriptsLoaded++;
        if (scriptsLoaded === 2) resolve();
      };

      // Script GAPI
      const gapiScript = document.createElement('script');
      gapiScript.src = 'https://apis.google.com/js/api.js';
      gapiScript.onload = checkLoaded;
      document.body.appendChild(gapiScript);

      // Script GIS
      const gisScript = document.createElement('script');
      gisScript.src = 'https://accounts.google.com/gsi/client';
      gisScript.onload = checkLoaded;
      document.body.appendChild(gisScript);
    });
  }

  /**
   * Solicita autorização do usuário
   */
  async authorize(): Promise<void> {
    if (!this.tokenClient) {
      throw new Error('Google Drive não inicializado');
    }

    return new Promise((resolve, reject) => {
      try {
        // Configura callback para quando receber o token
        this.tokenClient.callback = (response: any) => {
          if (response.error) {
            reject(response);
            return;
          }
          this.accessToken = response.access_token;
          resolve();
        };

        // Solicita token
        if (this.accessToken === null) {
          this.tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
          this.tokenClient.requestAccessToken({ prompt: '' });
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Cria estrutura de pastas no Drive
   */
  async createFolderStructure(
    clienteNome: string,
    projetoNome: string,
    etapaNome: string
  ): Promise<string> {
    if (!this.accessToken) {
      throw new Error('Não autorizado. Faça login no Google Drive primeiro.');
    }

    // Cria pasta do cliente
    const clienteFolderId = await this.createOrGetFolder(
      clienteNome,
      GOOGLE_DRIVE_FOLDER_ID
    );

    // Cria pasta do projeto
    const projetoFolderId = await this.createOrGetFolder(
      projetoNome,
      clienteFolderId
    );

    // Cria pasta da etapa
    const etapaFolderId = await this.createOrGetFolder(
      etapaNome,
      projetoFolderId
    );

    return etapaFolderId;
  }

  /**
   * Cria ou obtém uma pasta
   */
  private async createOrGetFolder(
    name: string,
    parentId?: string
  ): Promise<string> {
    // Busca se a pasta já existe
    const query = `name='${name}' and mimeType='application/vnd.google-apps.folder'${
      parentId ? ` and '${parentId}' in parents` : ''
    } and trashed=false`;

    const response = await gapi.client.drive.files.list({
      q: query,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    if (response.result.files && response.result.files.length > 0) {
      return response.result.files[0].id!;
    }

    // Cria nova pasta
    const fileMetadata = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    };

    const createResponse = await gapi.client.drive.files.create({
      resource: fileMetadata,
      fields: 'id',
    });

    return createResponse.result.id!;
  }

  /**
   * Faz upload de arquivo
   */
  async uploadFile(
    file: File,
    folderId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<GoogleDriveFile> {
    if (!this.accessToken) {
      throw new Error('Não autorizado. Faça login no Google Drive primeiro.');
    }

    const metadata = {
      name: file.name,
      parents: [folderId],
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    // Upload com progresso
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress: UploadProgress = {
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100),
          };
          onProgress(progress);
        }
      });

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          
          // Busca informações completas do arquivo
          const fileInfo = await gapi.client.drive.files.get({
            fileId: response.id,
            fields: 'id,name,webViewLink,webContentLink',
          });

          resolve({
            id: fileInfo.result.id!,
            name: fileInfo.result.name!,
            webViewLink: fileInfo.result.webViewLink!,
            webContentLink: fileInfo.result.webContentLink!,
          });
        } else {
          reject(new Error('Erro no upload: ' + xhr.statusText));
        }
      };

      xhr.onerror = () => reject(new Error('Erro de rede no upload'));

      xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id');
      xhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`);
      xhr.send(form);
    });
  }

  /**
   * Remove arquivo do Drive
   */
  async deleteFile(fileId: string): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Não autorizado');
    }

    await gapi.client.drive.files.delete({
      fileId: fileId,
    });
  }
}

// Instância singleton
export const googleDriveService = new GoogleDriveService();

/**
 * Função helper para upload completo
 */
export async function uploadToGoogleDrive(
  file: File,
  projetoTimelineId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<GoogleDriveFile> {
  try {
    // Inicializa se necessário
    if (!googleDriveService['gapiInited']) {
      await googleDriveService.initialize();
    }

    // Autoriza se necessário
    if (!googleDriveService['accessToken']) {
      await googleDriveService.authorize();
    }

    // TODO: Buscar informações do projeto/cliente/etapa do banco
    // Por ora, usamos valores temporários
    const clienteNome = 'Cliente Teste';
    const projetoNome = 'Projeto Teste';
    const etapaNome = 'Etapa Teste';

    // Cria estrutura de pastas
    const folderId = await googleDriveService.createFolderStructure(
      clienteNome,
      projetoNome,
      etapaNome
    );

    // Faz upload
    return await googleDriveService.uploadFile(file, folderId, onProgress);
  } catch (error: any) {
    console.error('Erro no upload para Google Drive:', error);
    throw new Error(error.message || 'Erro ao fazer upload para Google Drive');
  }
}

/**
 * Remove arquivo do Google Drive
 */
export async function deleteFromGoogleDrive(fileId: string): Promise<void> {
  try {
    await googleDriveService.deleteFile(fileId);
  } catch (error: any) {
    console.error('Erro ao deletar do Google Drive:', error);
    throw new Error(error.message || 'Erro ao deletar arquivo');
  }
}

// Declarações de tipos globais para as APIs do Google
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
  const gapi: any;
  const google: any;
}
