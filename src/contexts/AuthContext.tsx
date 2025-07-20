// src/contexts/AuthContext.tsx
/**
 * Contexto de autenticação
 * Gerencia estado do usuário e operações de login/logout
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getUserProfile } from '../lib/supabase';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider de autenticação
 * Envolve toda a aplicação para fornecer contexto de auth
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * Carrega dados do usuário do perfil
   */
  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await getUserProfile(userId);
      setUser(profile);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      // Se falhar ao carregar perfil, faz logout
      await signOut();
    }
  };

  /**
   * Verifica sessão ativa ao carregar
   */
  useEffect(() => {
    // Verifica sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate('/login');
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  /**
   * Realiza login
   */
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        await loadUserProfile(data.user.id);
        
        // Redireciona baseado no tipo de usuário
        const profile = await getUserProfile(data.user.id);
        if (profile.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/cliente/projetos');
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Realiza logout
   */
  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      navigate('/login');
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      throw new Error(error.message || 'Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  // Computed: verifica se é admin
  const isAdmin = user?.role === 'admin';

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar o contexto de autenticação
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};