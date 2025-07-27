// src/services/googleDrive/exports.ts
/**
 * Arquivo centralizado de exportações do Google Drive
 * Organiza todos os serviços, hooks e componentes relacionados
 */

// Serviços principais
export { googleDriveService } from '../googleDrive';
export { googleDriveFolderService } from '../googleDriveFolder';
export { 
  smartUploadToGoogleDrive,
  getProjectFolderId,
  validateGoogleDriveFolder,
  listProjectFiles
} from '../googleDriveWithProjectFolder';

// Funções helpers do serviço principal
export { 
  uploadToGoogleDrive,
  deleteFromGoogleDrive 
} from '../googleDrive';

// Hooks
export { useGoogleDrive, useGoogleDriveUpload } from '../../hooks/useGoogleDrive';
export { useSmartGoogleDriveUpload } from '../../hooks/useSmartGoogleDriveUpload';

// Componentes
export { GoogleDriveAuth, GoogleDriveStatus } from '../../components/GoogleDrive/GoogleDriveAuth';
export { GoogleDriveFolderInput } from '../../components/Projetos/GoogleDriveFolderInput';
export { ProjectDriveFolderField } from '../../components/Projetos/ProjectDriveFolderField';
export { FileUploadSmart } from '../../components/FileUpload/FileUploadSmart';

// Tipos
export type {
  GoogleDriveFile,
  GoogleAuthResponse,
  GoogleTokenClient,
  GoogleDriveFileMetadata,
  GoogleDriveUploadOptions,
  UploadProgress,
  ProjectFolderStructure,
  GoogleDriveSearchOptions,
  GoogleDriveListResponse,
  GoogleDriveMimeType
} from '../../types/googleDrive';

// Configurações e utilitários
export { 
  GOOGLE_DRIVE_CONFIG,
  validateGoogleDriveConfig,
  getMimeTypeFromExtension,
  isFileTypeAllowed,
  formatFileSize
} from '../../config/googleDrive';

// Utilitários de projeto
export {
  getProjectTimelineInfo,
  getProjectInfo,
  getEtapaInfo,
  getCachedProjectTimelineInfo,
  formatFolderName,
  sanitizeFolderName,
  clearProjectInfoCache,
  type ProjectInfo
} from '../../utils/projectInfo';