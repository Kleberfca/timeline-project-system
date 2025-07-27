// src/lib/supabase.ts
/**
 * Configuração e inicialização do cliente Supabase
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias'
  );
}

// Cliente Supabase tipado
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helpers de autenticação
export const auth = {
  /**
   * Faz login com email e senha
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  /**
   * Faz logout
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Obtém sessão atual
   */
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Obtém usuário atual
   */
  async getUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  /**
   * Reseta senha
   */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/resetar-senha`
    });
    
    if (error) throw error;
  },

  /**
   * Atualiza senha
   */
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
  }
};

// Helpers de storage
export const storage = {
  /**
   * Faz upload de arquivo
   */
  async upload(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) throw error;
    return data;
  },

  /**
   * Obtém URL pública
   */
  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  /**
   * Remove arquivo
   */
  async remove(bucket: string, paths: string[]) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths);
    
    if (error) throw error;
  }
};