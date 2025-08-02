// src/contexts/AuthContext.tsx
/**
 * Contexto de autenticação
 * Gerencia estado de autenticação e informações do usuário
 * Corrigido: Problema de tela branca ao retornar à aba
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  
  // Refs para controlar estado
  const isLoadingUser = useRef(false);
  const hasInitialLoad = useRef(false);

  // Verifica se o usuário é admin
  const isAdmin = user?.role === 'admin';

  /**
   * Carrega dados do usuário autenticado
   * Corrigido: Previne múltiplas execuções simultâneas
   */
  const loadUser = async () => {
    // Se já está carregando, não faz nada
    if (isLoadingUser.current) {
      console.log('[Auth] Já está carregando usuário, ignorando...');
      return;
    }

    try {
      isLoadingUser.current = true;
      
      // Só mostra loading na primeira vez
      if (!hasInitialLoad.current) {
        setLoading(true);
      }
      
      console.log('[Auth] Carregando usuário...');
      
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
      
      hasInitialLoad.current = true;
    } catch (error) {
      console.error('[Auth] Erro ao carregar usuário:', error);
      setUser(null);
    } finally {
      isLoadingUser.current = false;
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
        hasInitialLoad.current = true;
        
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
      hasInitialLoad.current = false;
      navigate('/login');
    } catch (error) {
      console.error('[Auth] Erro no logout:', error);
    }
  };

  /**
   * Gerencia mudanças de visibilidade da página
   * Corrigido: Apenas verifica sessão, não recarrega usuário
   */
  useEffect(() => {
    const handleVisibilityChange = async () => {
      console.log('[Auth] Visibilidade mudou:', document.visibilityState);
      
      // Só verifica se tem usuário e a aba voltou a ficar visível
      if (document.visibilityState === 'visible' && user) {
        try {
          // Apenas verifica se a sessão ainda é válida
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            console.log('[Auth] Sessão expirou, fazendo logout');
            setUser(null);
            hasInitialLoad.current = false;
            navigate('/login');
          }
        } catch (error) {
          console.error('[Auth] Erro ao verificar sessão:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, navigate]);

  /**
   * Monitora mudanças na autenticação
   * Corrigido: Ignora SIGNED_IN duplicados
   */
  useEffect(() => {
    let mounted = true;
    
    // Carrega usuário inicial
    loadUser();

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, _session) => {
        console.log('[Auth] Auth state changed:', event);
        
        // Apenas processa se o componente ainda está montado
        if (!mounted) return;
        
        // Processa apenas eventos relevantes
        if (event === 'SIGNED_IN') {
          // Se já tem usuário carregado, ignora
          if (user || hasInitialLoad.current) {
            console.log('[Auth] Ignorando SIGNED_IN - usuário já carregado');
            return;
          }
          // Só carrega se realmente não tem usuário
          if (!isLoadingUser.current) {
            await loadUser();
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
          hasInitialLoad.current = false;
          isLoadingUser.current = false;
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('[Auth] Token atualizado - mantendo sessão');
          // Não faz nada, apenas log
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Removido dependências para evitar re-criação

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