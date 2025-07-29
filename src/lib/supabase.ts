// src/lib/supabase.ts
/**
 * Configuração e cliente do Supabase
 * Gerencia conexão com banco de dados e autenticação
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Variáveis de ambiente - devem ser configuradas no .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ADICIONE ESTE CONSOLE.LOG PARA DEBUG
console.log('Supabase Config:', {
  url: supabaseUrl,
  key: supabaseAnonKey ? 'Key exists' : 'Key missing'
});

// ... resto do código ...

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL e Anon Key são obrigatórios!');
}

// Cliente Supabase com tipagem TypeScript
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helpers para operações comuns

/**
 * Verifica se o usuário está autenticado
 */
export const checkAuth = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Busca dados do perfil do usuário
 */
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Helpers para Row Level Security (RLS)
 */
export const enableRLS = async (tableName: string) => {
  // Este código seria executado apenas no setup inicial
  // RLS deve ser configurado diretamente no Supabase Dashboard
  console.log(`RLS deve ser habilitado para a tabela ${tableName} no Supabase Dashboard`);
};

// Tipos de erro personalizados
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

/**
 * Wrapper para tratamento de erros do Supabase
 */
export const handleSupabaseError = (error: any): never => {
  if (error.code === 'PGRST116') {
    throw new SupabaseError('Registro não encontrado', error.code, error);
  }
  if (error.code === '23505') {
    throw new SupabaseError('Registro duplicado', error.code, error);
  }
  if (error.code === '42501') {
    throw new SupabaseError('Permissão negada', error.code, error);
  }
  
  throw new SupabaseError(error.message || 'Erro desconhecido', error.code, error);
};
