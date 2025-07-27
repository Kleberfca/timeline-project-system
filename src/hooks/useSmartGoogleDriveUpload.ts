// src/hooks/useSmartGoogleDriveUpload.ts
/**
 * Hook para usar upload inteligente do Google Drive
 * Detecta se o projeto tem pasta configurada e usa ela
 */

import { useState, useCallback } from 'react';
import { useGoogleDrive } from './useGoogleDrive';
import { smartUploadToGoogleDrive } from '../services/googleDriveWithProjectFolder';
import type { GoogleDriveFile, UploadProgress } from '../types/googleDrive';

interface UseSmartGoogleDriveUploadReturn {
  upload: (file: File, projetoTimelineId: string) => Promise<GoogleDriveFile | null>;
  uploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
}

/**
 * Hook para usar upload inteligente
 */
export function useSmartGoogleDriveUpload(
  onSuccess?: (file: GoogleDriveFile) => void
): UseSmartGoogleDriveUploadReturn {
  const { isAuthorized, authorize } = useGoogleDrive();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const upload = useCallback(async (
    file: File,
    projetoTimelineId: string
  ): Promise<GoogleDriveFile | null> => {
    try {
      setUploading(true);
      setProgress({ loaded: 0, total: file.size, percentage: 0 });
      setError(null);
      
      // Autoriza se necessário
      if (!isAuthorized) {
        await authorize();
      }
      
      // Faz upload inteligente
      const result = await smartUploadToGoogleDrive(
        file,
        projetoTimelineId,
        (p) => setProgress(p)
      );
      
      onSuccess?.(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro no upload';
      setError(errorMessage);
      console.error('Erro no upload:', err);
      throw err;
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }, [isAuthorized, authorize, onSuccess]);
  
  return {
    upload,
    uploading,
    progress,
    error
  };
}