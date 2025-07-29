// src/contexts/AuthContext.tsx
/**
 * Contexto de autenticação
 * Gerencia estado de autenticação e informações do usuário
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
  refreshUser: () => Promise<void>; // ADICIONAR ESTA LINHA
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

  // Verifica se o usuário é admin
  const isAdmin = user?.role === 'admin';

  /**
   * Carrega dados do usuário autenticado
   */
  const loadUser = async () => {
    try {
      setLoading(true);
      
      // Obtém usuário autenticado do Supabase
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        // Busca dados completos do usuário no banco
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (error) throw error;
        
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ADICIONAR ESTA FUNÇÃO - Atualiza dados do usuário
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
        
        if (error) throw error;
        
        if (userData) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
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
      console.error('Erro no login:', error);
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
      console.error('Erro no logout:', error);
    }
  };

  /**
   * Monitora mudanças na autenticação
   */
  useEffect(() => {
    // Carrega usuário inicial
    loadUser();

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAdmin, 
      signIn, 
      signOut,
      refreshUser // ADICIONAR AQUI
    }}>
      {children}
    </AuthContext.Provider>
  );
};