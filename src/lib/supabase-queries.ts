// src/lib/supabase-queries.ts
/**
 * Queries reutilizáveis do Supabase
 */

import { supabase, handleSupabaseError } from './supabase';
import { storageService } from '../services/storage';
import type { 
  Cliente, 
  Projeto, 
  ProjetoTimeline, 
  Arquivo,
  CreateArquivoData,
  StatusEtapa,
  SistemaConfig
} from '../types';

// Queries para Clientes
export const clienteQueries = {
  /**
   * Lista todos os clientes (apenas admin)
   */
  async listarTodos() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nome');
    
    if (error) handleSupabaseError(error);
    return data as Cliente[];
  },

  /**
   * Busca cliente por ID
   */
  async buscarPorId(id: string) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) handleSupabaseError(error);
    return data as Cliente;
  },

  /**
   * Cria novo cliente
   */
  async criar(cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('clientes')
      .insert(cliente)
      .select()
      .single();
    
    if (error) handleSupabaseError(error);
    return data as Cliente;
  },

  /**
   * Atualiza cliente
   */
  async atualizar(id: string, updates: Partial<Cliente>) {
    const { data, error } = await supabase
      .from('clientes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleSupabaseError(error);
    return data as Cliente;
  }
};

// Queries para Projetos
export const projetoQueries = {
  /**
   * Lista projetos por cliente
   */
  async listarPorCliente(clienteId: string) {
    const { data, error } = await supabase
      .from('projetos')
      .select(`
        *,
        cliente:clientes(*)
      `)
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error);
    return data as Projeto[];
  },

  /**
   * Busca projeto por ID (dados básicos)
   */
  async buscarPorId(id: string) {
    const { data, error } = await supabase
      .from('projetos')
      .select(`
        *,
        cliente:clientes(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) handleSupabaseError(error);
    return data as Projeto;
  },

  /**
   * Busca projeto por ID com timeline
   */
  async buscarComTimeline(id: string) {
    const { data, error } = await supabase
      .from('projetos')
      .select(`
        *,
        cliente:clientes(*),
        timeline:projeto_timeline(
          *,
          etapa:etapas(
            *,
            fase:fases(*)
          ),
          arquivos(*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) handleSupabaseError(error);
    
    // Ordena a timeline por fase.ordem e depois por etapa.ordem
    if (data?.timeline) {
      data.timeline.sort((a: any, b: any) => {
        // Primeiro ordena por fase
        const faseComparison = (a.etapa?.fase?.ordem || 0) - (b.etapa?.fase?.ordem || 0);
        if (faseComparison !== 0) return faseComparison;
        
        // Depois ordena por etapa dentro da mesma fase
        return (a.etapa?.ordem || 0) - (b.etapa?.ordem || 0);
      });
    }
    
    return data;
  },

  /**
   * Cria novo projeto
   */
  async criar(projeto: Omit<Projeto, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('projetos')
      .insert(projeto)
      .select()
      .single();
    
    if (error) handleSupabaseError(error);
    return data as Projeto;
  }
};

// Queries para Timeline
export const timelineQueries = {
  /**
   * Atualiza status de uma etapa
   */
  async atualizarStatus(
    projetoTimelineId: string, 
    status: StatusEtapa,
    observacoes?: string
  ) {
    const updates: any = { status };
    
    if (observacoes !== undefined) {
      updates.observacoes = observacoes;
    }
    
    if (status === 'em_andamento' && !updates.data_inicio) {
      updates.data_inicio = new Date().toISOString();
    }
    
    if (status === 'concluido') {
      updates.data_conclusao = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('projeto_timeline')
      .update(updates)
      .eq('id', projetoTimelineId)
      .select()
      .single();
    
    if (error) handleSupabaseError(error);
    return data as ProjetoTimeline;
  },

  /**
   * Busca timeline por projeto e fase - CORRIGIDO
   */
  async buscarPorProjetoFase(projetoId: string, faseNome: string) {
    const { data, error } = await supabase
      .from('projeto_timeline')
      .select(`
        *,
        etapa:etapas!inner(
          *,
          fase:fases!inner(*)
        ),
        arquivos(*)
      `)
      .eq('projeto_id', projetoId)
      .eq('etapa.fase.nome', faseNome);
    
    if (error) handleSupabaseError(error);
    
    // Ordena por etapa.ordem no JavaScript
    const sortedData = data?.sort((a: any, b: any) => {
      return (a.etapa?.ordem || 0) - (b.etapa?.ordem || 0);
    });
    
    return sortedData;
  }
};

// Queries para Arquivos - ATUALIZADO SEM GOOGLE DRIVE
export const arquivoQueries = {
  /**
   * Lista arquivos por timeline
   */
  async listarPorTimeline(projetoTimelineId: string) {
    const { data, error } = await supabase
      .from('arquivos')
      .select('*')
      .eq('projeto_timeline_id', projetoTimelineId)
      .order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error);
    
    // Para cada arquivo com storage_path, gera URL assinada se necessário
    const arquivosComUrls = await Promise.all(
      (data || []).map(async (arquivo) => {
        // Se é um link externo, mantém a URL original
        if (arquivo.tipo === 'link' || arquivo.bucket_name === 'links') {
          return arquivo;
        }
        
        // Se tem storage_path mas não tem URL válida, gera nova URL assinada
        if (arquivo.storage_path && arquivo.bucket_name) {
          try {
            const url = await storageService.getSignedUrl(
              arquivo.bucket_name,
              arquivo.storage_path,
              3600 // 1 hora
            );
            return { ...arquivo, storage_url: url };
          } catch (err) {
            console.error('Erro ao gerar URL assinada:', err);
            return arquivo;
          }
        }
        
        return arquivo;
      })
    );
    
    return arquivosComUrls as Arquivo[];
  },

  /**
   * Busca arquivo por ID
   */
  async buscarPorId(id: string) {
    const { data, error } = await supabase
      .from('arquivos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) handleSupabaseError(error);
    
    // Gera URL assinada se necessário
    if (data && data.storage_path && data.bucket_name && data.tipo !== 'link') {
      try {
        const url = await storageService.getSignedUrl(
          data.bucket_name,
          data.storage_path,
          3600
        );
        data.storage_url = url;
      } catch (err) {
        console.error('Erro ao gerar URL assinada:', err);
      }
    }
    
    return data as Arquivo;
  },

  /**
   * Cria novo arquivo
   */
  async criar(arquivo: CreateArquivoData) {
    const { data, error } = await supabase
      .from('arquivos')
      .insert(arquivo)
      .select()
      .single();
    
    if (error) handleSupabaseError(error);
    return data as Arquivo;
  },

  /**
   * Remove arquivo
   */
  async remover(id: string) {
    // Busca o arquivo primeiro para deletar do storage
    const arquivo = await this.buscarPorId(id);
    
    // Se tem arquivo no storage, deleta
    if (arquivo && arquivo.storage_path && arquivo.bucket_name && arquivo.tipo !== 'link') {
      try {
        await storageService.deleteFile(arquivo.bucket_name, arquivo.storage_path);
      } catch (err) {
        console.error('Erro ao deletar arquivo do storage:', err);
      }
    }
    
    // Deleta do banco
    const { error } = await supabase
      .from('arquivos')
      .delete()
      .eq('id', id);
    
    if (error) handleSupabaseError(error);
  },

  /**
   * Atualiza arquivo
   */
  async atualizar(id: string, updates: Partial<Arquivo>) {
    const { data, error } = await supabase
      .from('arquivos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) handleSupabaseError(error);
    return data as Arquivo;
  }
};

// Subscriptions em tempo real
export const realtimeSubscriptions = {
  /**
   * Observa mudanças na timeline de um projeto
   */
  subscribeToProjectTimeline(
    projetoId: string, 
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`projeto-timeline-${projetoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projeto_timeline',
          filter: `projeto_id=eq.${projetoId}`
        },
        callback
      )
      .subscribe();
  },

  /**
   * Observa novos arquivos
   */
  subscribeToNewFiles(
    projetoId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`projeto-arquivos-${projetoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'arquivos'
        },
        callback
      )
      .subscribe();
  }
  
};

// Queries para configurações do sistema
export const sistemaConfigQueries = {
  /**
   * Busca configurações do sistema
   */
  async buscar() {
    const { data, error } = await supabase
      .from('sistema_config')
      .select('*')
      .single();
    
    if (error) handleSupabaseError(error);
    return data as SistemaConfig;
  },

  /**
   * Atualiza logo
   */
  async atualizarLogo(logoUrl: string, logoDriveId: string) {
    const { data, error } = await supabase
      .from('sistema_config')
      .update({
        logo_url: logoUrl,
        logo_drive_id: logoDriveId,
      })
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .select()
      .single();
    
    if (error) handleSupabaseError(error);
    return data as SistemaConfig;
  },

  /**
   * Atualiza favicon
   */
  async atualizarFavicon(faviconUrl: string, faviconDriveId: string) {
    const { data, error } = await supabase
      .from('sistema_config')
      .update({
        favicon_url: faviconUrl,
        favicon_drive_id: faviconDriveId,
      })
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .select()
      .single();
    
    if (error) handleSupabaseError(error);
    return data as SistemaConfig;
  }
};