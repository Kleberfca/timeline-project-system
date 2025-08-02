// src/contexts/AuthContext.tsx
/**
 * Contexto de autenticação
 * Gerencia estado de autenticação e informações do usuário
 * Corrigido: Problema de tela branca ao retornar à aba
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Timeout para evitar loading infinito
const LOADING_TIMEOUT = 5000; // 5 segundos

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verifica se o usuário é admin
  const isAdmin = user?.role === 'admin';

  /**
   * Carrega dados do usuário autenticado
   * Corrigido: Adiciona timeout para evitar loading infinito
   */
  const loadUser = async () => {
    let timeoutId: NodeJS.Timeout;
    
    try {
      setLoading(true);
      
      // Adicionar timeout para evitar loading infinito
      timeoutId = setTimeout(() => {
        setLoading(false);
        console.warn('[Auth] Loading timeout - forçando loading=false');
      }, LOADING_TIMEOUT);
      
      // Obtém usuário autenticado do Supabase
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        // Busca dados completos do usuário no banco
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (error) {
          console.error('[Auth] Erro ao buscar dados do usuário:', error);
          throw error;
        }
        
        setUser(userData);
        console.log('[Auth] Usuário carregado:', userData.email);
      } else {
        setUser(null);
        console.log('[Auth] Nenhum usuário autenticado');
      }
      
      // Limpar timeout se completou com sucesso
      clearTimeout(timeoutId);
    } catch (error) {
      console.error('[Auth] Erro ao carregar usuário:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atualiza dados do usuário sem alterar loading
   */
  const refreshUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (error) {
          console.error('[Auth] Erro ao atualizar usuário:', error);
          throw error;
        }
        
        if (userData) {
          setUser(userData);
          console.log('[Auth] Usuário atualizado:', userData.email);
        }
      }
    } catch (error) {
      console.error('[Auth] Erro ao atualizar usuário:', error);
    }
  };

  /**
   * Realiza login
   */
  const signIn = async (email: string, password: string) => {
    try {
      // Autentica com Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Busca dados completos do usuário
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        if (userError) throw userError;
        
        setUser(userData);
        
        // Redireciona baseado no tipo de usuário
        if (userData.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/cliente/projetos');
        }
      }
    } catch (error: any) {
      console.error('[Auth] Erro no login:', error);
      throw new Error(error.message || 'Erro ao fazer login');
    }
  };

  /**
   * Realiza logout
   */
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('[Auth] Erro no logout:', error);
    }
  };

  /**
   * Gerencia mudanças de visibilidade da página
   * Corrigido: Evita re-loading desnecessário ao voltar à aba
   */
  useEffect(() => {
    const handleVisibilityChange = async () => {
      console.log('[Auth] Visibilidade mudou:', document.visibilityState);
      
      if (document.visibilityState === 'visible' && user) {
        // Quando a aba volta a ficar visível
        try {
          // Verifica se a sessão ainda é válida sem setar loading
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            // Sessão expirou - fazer logout
            console.log('[Auth] Sessão expirou, fazendo logout');
            setUser(null);
            navigate('/login');
          } else {
            console.log('[Auth] Sessão ainda válida');
          }
          // Se a sessão é válida, não faz nada (evita re-loading)
        } catch (error) {
          console.error('[Auth] Erro ao verificar sessão:', error);
        }
      }
    };

    // Adiciona listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Remove listener no cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, navigate]);

  /**
   * Monitora mudanças na autenticação
   * Corrigido: Evita re-loading em TOKEN_REFRESHED
   */
  useEffect(() => {
    let mounted = true;
    
    // Carrega usuário inicial
    loadUser();

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Auth state changed:', event);
        
        // Apenas processa se o componente ainda está montado
        if (!mounted) return;
        
        // Evita re-loading desnecessário
        if (event === 'TOKEN_REFRESHED' && user) {
          // Token foi atualizado mas usuário já está logado
          console.log('[Auth] Token atualizado, mantendo usuário atual');
          return;
        }
        
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false); // Garante que loading seja false
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Removido 'user' das dependências para evitar loops

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAdmin, 
      signIn, 
      signOut,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};