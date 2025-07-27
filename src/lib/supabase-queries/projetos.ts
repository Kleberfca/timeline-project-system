// src/lib/supabase-queries/projetos.ts
/**
 * Queries para tabela de projetos
 * Gerencia operações CRUD de projetos
 */

import { supabase } from '../supabase';
import type { Projeto } from '../../types';

/**
 * Interface para criar/atualizar projeto
 */
export interface CreateProjetoData {
  cliente_id: string;
  nome: string;
  descricao?: string;
  data_inicio: string;
  data_fim?: string;
  google_drive_folder_id?: string | null;
  ativo?: boolean;
}

/**
 * Queries de projetos
 */
export const projetoQueries = {
  /**
   * Lista todos os projetos
   */
  async listar(clienteId?: string) {
    let query = supabase
      .from('projetos')
      .select(`
        *,
        cliente:clientes(id, nome, email)
      `)
      .order('created_at', { ascending: false });

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Busca projeto por ID
   */
  async buscarPorId(id: string) {
    const { data, error } = await supabase
      .from('projetos')
      .select(`
        *,
        cliente:clientes(id, nome, email, empresa)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Cria novo projeto
   */
  async criar(data: CreateProjetoData) {
    const { data: projeto, error } = await supabase
      .from('projetos')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return projeto;
  },

  /**
   * Atualiza projeto
   */
  async atualizar(id: string, data: Partial<CreateProjetoData>) {
    const { data: projeto, error } = await supabase
      .from('projetos')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return projeto;
  },

  /**
   * Remove projeto
   */
  async remover(id: string) {
    const { error } = await supabase
      .from('projetos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Lista projetos ativos
   */
  async listarAtivos() {
    const { data, error } = await supabase
      .from('projetos')
      .select(`
        *,
        cliente:clientes(id, nome)
      `)
      .eq('ativo', true)
      .order('nome');

    if (error) throw error;
    return data || [];
  },

  /**
   * Conta projetos por cliente
   */
  async contarPorCliente(clienteId: string) {
    const { count, error } = await supabase
      .from('projetos')
      .select('*', { count: 'exact', head: true })
      .eq('cliente_id', clienteId);

    if (error) throw error;
    return count || 0;
  },

  /**
   * Busca projetos com timeline
   */
  async listarComTimeline(clienteId?: string) {
    let query = supabase
      .from('projetos')
      .select(`
        *,
        cliente:clientes(id, nome),
        projeto_timeline(
          id,
          status,
          status_etapa:status_etapas(id, nome, ordem, fase:fases(id, nome))
        )
      `)
      .order('created_at', { ascending: false });

    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
};