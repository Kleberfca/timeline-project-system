// src/lib/supabase-queries/users.ts
/**
 * Queries para tabela de usuários
 * Gerencia operações relacionadas aos usuários
 */

import { supabase } from '../supabase';
import type { User, UserRole } from '../../types';

/**
 * Interface para criar usuário
 */
export interface CreateUserData {
  email: string;
  nome: string;
  role: UserRole;
  cliente_id?: string;
}

/**
 * Interface para atualizar usuário
 */
export interface UpdateUserData {
  nome?: string;
  role?: UserRole;
  cliente_id?: string | null;
}

/**
 * Queries de usuários
 */
export const userQueries = {
  /**
   * Lista todos os usuários
   */
  async listar(role?: UserRole) {
    let query = supabase
      .from('users')
      .select(`
        *,
        cliente:clientes(id, nome)
      `)
      .order('nome');

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Busca usuário por ID
   */
  async buscarPorId(id: string) {
    const { data, error } = await supabase
      .from('users')
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
   * Busca usuário por email
   */
  async buscarPorEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Busca perfil do usuário atual
   */
  async buscarPerfil() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    return this.buscarPorId(user.id);
  },

  /**
   * Cria novo usuário
   */
  async criar(data: CreateUserData, password: string) {
    // Cria usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        nome: data.nome
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Erro ao criar usuário');

    // Cria perfil na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        ...data
      })
      .select()
      .single();

    if (userError) {
      // Se falhar, remove usuário do Auth
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw userError;
    }

    return userData;
  },

  /**
   * Atualiza usuário
   */
  async atualizar(id: string, data: UpdateUserData) {
    const { data: user, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return user;
  },

  /**
   * Remove usuário
   */
  async remover(id: string) {
    // Remove da tabela users
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (userError) throw userError;

    // Remove do Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) throw authError;
  },

  /**
   * Lista usuários por cliente
   */
  async listarPorCliente(clienteId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('nome');

    if (error) throw error;
    return data || [];
  },

  /**
   * Altera senha do usuário
   */
  async alterarSenha(userId: string, novaSenha: string) {
    const { error } = await supabase.auth.admin.updateUserById(
      userId,
      { password: novaSenha }
    );

    if (error) throw error;
  },

  /**
   * Verifica se é o primeiro usuário (para criar admin)
   */
  async isPrimeiroUsuario(): Promise<boolean> {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count === 0;
  },

  /**
   * Estatísticas de usuários
   */
  async obterEstatisticas() {
    const { data, error } = await supabase
      .from('users')
      .select('role');

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      admins: 0,
      clientes: 0
    };

    data?.forEach(user => {
      if (user.role === 'admin') {
        stats.admins++;
      } else if (user.role === 'cliente') {
        stats.clientes++;
      }
    });

    return stats;
  }
};