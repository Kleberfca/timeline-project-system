// src/lib/supabase-queries/arquivos.ts
/**
 * Queries para tabela de arquivos
 * Gerencia operações CRUD de arquivos
 */

import { supabase } from '../supabase';
import type { Arquivo } from '../../types';

/**
 * Interface para criar arquivo
 */
export interface CreateArquivoData {
  projeto_timeline_id: string;
  nome: string;
  tipo: Arquivo['tipo'];
  tamanho?: number;
  url_google_drive: string;
  google_drive_id: string;
  uploaded_by: string;
}

/**
 * Queries de arquivos
 */
export const arquivoQueries = {
  /**
   * Lista arquivos de um projeto timeline
   */
  async listarPorProjetoTimeline(projetoTimelineId: string) {
    const { data, error } = await supabase
      .from('arquivos')
      .select(`
        *,
        usuario:users!uploaded_by(id, nome, email)
      `)
      .eq('projeto_timeline_id', projetoTimelineId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Busca arquivo por ID
   */
  async buscarPorId(id: string) {
    const { data, error } = await supabase
      .from('arquivos')
      .select(`
        *,
        usuario:users!uploaded_by(id, nome, email),
        projeto_timeline(
          id,
          projeto:projetos(id, nome),
          status_etapa:status_etapas(id, nome)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Cria novo arquivo
   */
  async criar(data: CreateArquivoData) {
    const { data: arquivo, error } = await supabase
      .from('arquivos')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return arquivo;
  },

  /**
   * Remove arquivo
   */
  async remover(id: string) {
    const { error } = await supabase
      .from('arquivos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Atualiza arquivo
   */
  async atualizar(id: string, data: Partial<CreateArquivoData>) {
    const { data: arquivo, error } = await supabase
      .from('arquivos')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return arquivo;
  },

  /**
   * Lista arquivos por projeto (todos os timelines)
   */
  async listarPorProjeto(projetoId: string) {
    const { data, error } = await supabase
      .from('arquivos')
      .select(`
        *,
        usuario:users!uploaded_by(id, nome, email),
        projeto_timeline!inner(
          id,
          projeto_id,
          status_etapa:status_etapas(id, nome, ordem)
        )
      `)
      .eq('projeto_timeline.projeto_id', projetoId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Conta arquivos por tipo
   */
  async contarPorTipo(projetoTimelineId?: string) {
    let query = supabase
      .from('arquivos')
      .select('tipo', { count: 'exact', head: true });

    if (projetoTimelineId) {
      query = query.eq('projeto_timeline_id', projetoTimelineId);
    }

    const { count, error } = await query;

    if (error) throw error;
    return count || 0;
  },

  /**
   * Busca por Google Drive ID
   */
  async buscarPorGoogleDriveId(googleDriveId: string) {
    const { data, error } = await supabase
      .from('arquivos')
      .select('*')
      .eq('google_drive_id', googleDriveId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignora erro de não encontrado
    return data;
  }
};