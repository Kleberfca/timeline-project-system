// src/lib/supabase-queries/clientes.ts
/**
 * Queries para tabela de clientes
 * Gerencia operações CRUD de clientes
 */

import { supabase } from '../supabase';

/**
 * Interface para criar/atualizar cliente
 */
export interface CreateClienteData {
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  ativo?: boolean;
}

/**
 * Queries de clientes
 */
export const clienteQueries = {
  /**
   * Lista todos os clientes
   */
  
  async listar(ativos?: boolean) {
    let query = supabase
      .from('clientes')
      .select('*')
      .order('nome');

    if (ativos !== undefined) {
      query = query.eq('ativo', ativos);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
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

    if (error) throw error;
    return data;
  },

  /**
   * Busca cliente por email
   */
  async buscarPorEmail(email: string) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Cria novo cliente
   */
  async criar(data: CreateClienteData) {
    // Verifica se email já existe
    const existente = await this.buscarPorEmail(data.email);
    if (existente) {
      throw new Error('Email já cadastrado');
    }

    const { data: cliente, error } = await supabase
      .from('clientes')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return cliente;
  },

  /**
   * Atualiza cliente
   */
  async atualizar(id: string, data: Partial<CreateClienteData>) {
    // Se está alterando email, verifica duplicação
    if (data.email) {
      const existente = await this.buscarPorEmail(data.email);
      if (existente && existente.id !== id) {
        throw new Error('Email já cadastrado');
      }
    }

    const { data: cliente, error } = await supabase
      .from('clientes')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return cliente;
  },

  /**
   * Remove cliente
   */
  async remover(id: string) {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Ativa/desativa cliente
   */
  async alterarStatus(id: string, ativo: boolean) {
    const { error } = await supabase
      .from('clientes')
      .update({ ativo })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Lista clientes com contagem de projetos
   */
  async listarComProjetos() {
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        projetos(count)
      `)
      .order('nome');

    if (error) throw error;
    return data || [];
  },

  /**
   * Busca cliente com todos os dados relacionados
   */
  async buscarCompleto(id: string) {
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        projetos(
          id,
          nome,
          ativo,
          data_inicio,
          data_fim,
          projeto_timeline(
            id,
            status,
            status_etapa:status_etapas(id, nome)
          )
        ),
        users!cliente_id(
          id,
          nome,
          email,
          role
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
};