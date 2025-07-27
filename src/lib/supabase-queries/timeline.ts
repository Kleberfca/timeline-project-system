// src/lib/supabase-queries/timeline.ts
/**
 * Queries para tabela projeto_timeline
 * Gerencia status e progresso das etapas
 */

import { supabase } from '../supabase';
import type { ProjetoTimeline, StatusEtapa } from '../../types';

/**
 * Interface para criar/atualizar timeline
 */
export interface CreateTimelineData {
  projeto_id: string;
  status_etapa_id: string;
  status: StatusEtapa;
  observacoes?: string;
  data_inicio?: string;
  data_conclusao?: string;
}

/**
 * Queries de timeline
 */
export const timelineQueries = {
  /**
   * Lista timeline de um projeto
   */
  async listarPorProjeto(projetoId: string) {
    const { data, error } = await supabase
      .from('projeto_timeline')
      .select(`
        *,
        status_etapa:status_etapas(
          id,
          nome,
          ordem,
          fase:fases(id, nome, ordem)
        ),
        arquivos(count)
      `)
      .eq('projeto_id', projetoId)
      .order('status_etapa.fase.ordem')
      .order('status_etapa.ordem');

    if (error) throw error;
    return data || [];
  },

  /**
   * Busca timeline por ID
   */
  async buscarPorId(id: string) {
    const { data, error } = await supabase
      .from('projeto_timeline')
      .select(`
        *,
        projeto:projetos(
          id,
          nome,
          cliente:clientes(id, nome)
        ),
        status_etapa:status_etapas(
          id,
          nome,
          ordem,
          fase:fases(id, nome)
        ),
        arquivos(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Cria timeline para todas as etapas de um projeto
   */
  async criarTimelineCompleta(projetoId: string) {
    // Busca todas as etapas
    const { data: etapas, error: etapasError } = await supabase
      .from('status_etapas')
      .select('id')
      .order('ordem');

    if (etapasError) throw etapasError;
    if (!etapas || etapas.length === 0) {
      throw new Error('Nenhuma etapa encontrada');
    }

    // Cria timeline para cada etapa
    const timelines = etapas.map(etapa => ({
      projeto_id: projetoId,
      status_etapa_id: etapa.id,
      status: 'pendente' as StatusEtapa
    }));

    const { data, error } = await supabase
      .from('projeto_timeline')
      .insert(timelines)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Atualiza status de uma etapa
   */
  async atualizarStatus(
    id: string, 
    status: StatusEtapa,
    observacoes?: string
  ) {
    const updateData: any = { status };
    
    if (observacoes !== undefined) {
      updateData.observacoes = observacoes;
    }

    // Se concluído, adiciona data de conclusão
    if (status === 'concluido') {
      updateData.data_conclusao = new Date().toISOString();
    } else if (status === 'em_andamento' && !updateData.data_inicio) {
      updateData.data_inicio = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('projeto_timeline')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Busca estatísticas do projeto
   */
  async obterEstatisticas(projetoId: string) {
    const { data, error } = await supabase
      .from('projeto_timeline')
      .select('status')
      .eq('projeto_id', projetoId);

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      pendentes: 0,
      em_andamento: 0,
      concluidos: 0
    };

    data?.forEach(item => {
      switch (item.status) {
        case 'pendente':
          stats.pendentes++;
          break;
        case 'em_andamento':
          stats.em_andamento++;
          break;
        case 'concluido':
          stats.concluidos++;
          break;
      }
    });

    return stats;
  },

  /**
   * Lista timeline por fase
   */
  async listarPorFase(projetoId: string, faseId: string) {
    const { data, error } = await supabase
      .from('projeto_timeline')
      .select(`
        *,
        status_etapa:status_etapas!inner(
          id,
          nome,
          ordem,
          fase_id
        ),
        arquivos(count)
      `)
      .eq('projeto_id', projetoId)
      .eq('status_etapa.fase_id', faseId)
      .order('status_etapa.ordem');

    if (error) throw error;
    return data || [];
  },

  /**
   * Verifica se pode avançar para próxima etapa
   */
  async podeAvancar(projetoTimelineId: string): Promise<boolean> {
    // Busca a etapa atual
    const { data: atual, error: atualError } = await supabase
      .from('projeto_timeline')
      .select(`
        projeto_id,
        status,
        status_etapa:status_etapas(ordem, fase_id)
      `)
      .eq('id', projetoTimelineId)
      .single();

    if (atualError || !atual) return false;

    // Se não está concluído, não pode avançar
    if (atual.status !== 'concluido') return false;

    // Busca etapas anteriores na mesma fase
    const { data: anteriores, error: anterioresError } = await supabase
      .from('projeto_timeline')
      .select(`
        status,
        status_etapa:status_etapas!inner(ordem, fase_id)
      `)
      .eq('projeto_id', atual.projeto_id)
      .eq('status_etapa.fase_id', atual.status_etapa.fase_id)
      .lt('status_etapa.ordem', atual.status_etapa.ordem);

    if (anterioresError) return false;

    // Verifica se todas as anteriores estão concluídas
    return anteriores?.every(item => item.status === 'concluido') ?? true;
  }
};