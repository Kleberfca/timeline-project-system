// src/services/storage.ts
/**
 * Serviço de Storage do Supabase
 * Substitui completamente o Google Drive
 * Implementação SIMPLES e direta
 */

import { supabase } from '../lib/supabase';
import type { UploadProgress } from '../types';

/**
 * Serviço para gerenciar uploads e downloads de arquivos
 */
class StorageService {
  /**
   * Faz upload de arquivo para o Supabase Storage
   * @param file - Arquivo para upload
   * @param bucket - Nome do bucket ('arquivos' ou 'sistema')
   * @param path - Caminho no storage
   * @param onProgress - Callback de progresso
   * @returns Dados do arquivo uploaded
   */
  async uploadFile(
    file: File,
    bucket: string,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ path: string; url: string }> {
    try {
      // Simula progresso inicial
      if (onProgress) {
        onProgress({ loaded: 0, total: file.size, percentage: 0 });
      }

      // Upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Simula progresso completo
      if (onProgress) {
        onProgress({ loaded: file.size, total: file.size, percentage: 100 });
      }

      // Gera URL pública ou signed URL
      const url = bucket === 'sistema' 
        ? this.getPublicUrl(bucket, data.path)
        : await this.getSignedUrl(bucket, data.path);

      return {
        path: data.path,
        url
      };
    } catch (error: any) {
      console.error('Erro no upload:', error);
      throw new Error(`Erro ao fazer upload: ${error.message}`);
    }
  }

  /**
   * Gera URL pública para arquivos
   * @param bucket - Nome do bucket
   * @param path - Caminho do arquivo
   * @returns URL pública
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  /**
   * Gera URL assinada para download privado
   * @param bucket - Nome do bucket
   * @param path - Caminho do arquivo
   * @param expiresIn - Tempo de expiração em segundos (padrão: 1 hora)
   * @returns URL assinada
   */
  async getSignedUrl(
    bucket: string, 
    path: string, 
    expiresIn: number = 3600
  ): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  }

  /**
   * Deleta arquivo do storage
   * @param bucket - Nome do bucket
   * @param path - Caminho do arquivo
   */
  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  }

  /**
   * Lista arquivos em um diretório
   * @param bucket - Nome do bucket
   * @param path - Caminho do diretório
   * @returns Lista de arquivos
   */
  async listFiles(bucket: string, path: string = '') {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path, {
        limit: 100,
        offset: 0
      });

    if (error) throw error;
    return data;
  }

  /**
   * Move ou renomeia arquivo
   * @param bucket - Nome do bucket
   * @param fromPath - Caminho original
   * @param toPath - Novo caminho
   */
  async moveFile(bucket: string, fromPath: string, toPath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .move(fromPath, toPath);

    if (error) throw error;
  }

  /**
   * Faz download de arquivo
   * @param bucket - Nome do bucket
   * @param path - Caminho do arquivo
   * @returns Blob do arquivo
   */
  async downloadFile(bucket: string, path: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) throw error;
    return data;
  }
}

// Instância única do serviço
export const storageService = new StorageService();

/**
 * Função helper para upload de arquivo do projeto
 * @param file - Arquivo para upload
 * @param projetoTimelineId - ID da timeline do projeto
 * @param onProgress - Callback de progresso
 * @returns Dados do arquivo uploaded
 */
export async function uploadProjectFile(
  file: File,
  projetoTimelineId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ path: string; url: string }> {
  // Gera caminho único para o arquivo
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `projetos/${projetoTimelineId}/${timestamp}_${safeName}`;

  return storageService.uploadFile(file, 'arquivos', path, onProgress);
}

/**
 * Função helper para upload de imagem do sistema (logo/favicon)
 * @param file - Arquivo de imagem
 * @param type - Tipo ('logo' ou 'favicon')
 * @param onProgress - Callback de progresso
 * @returns Dados da imagem uploaded
 */
export async function uploadSystemImage(
  file: File,
  type: 'logo' | 'favicon',
  onProgress?: (progress: UploadProgress) => void
): Promise<{ path: string; url: string }> {
  // Validação básica de imagem
  if (!file.type.startsWith('image/')) {
    throw new Error('Arquivo deve ser uma imagem');
  }

  // Limites de tamanho
  const maxSize = type === 'logo' ? 2 * 1024 * 1024 : 500 * 1024; // 2MB logo, 500KB favicon
  if (file.size > maxSize) {
    throw new Error(`Arquivo muito grande. Máximo: ${maxSize / 1024 / 1024}MB`);
  }

  // Gera nome único
  const timestamp = Date.now();
  const extension = file.name.split('.').pop() || 'png';
  const path = `${type}/${type}_${timestamp}.${extension}`;

  return storageService.uploadFile(file, 'sistema', path, onProgress);
}