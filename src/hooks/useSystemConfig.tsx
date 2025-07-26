// src/hooks/useSystemConfig.tsx
/**
 * Hook para gerenciar configurações do sistema
 * Inclui logo, favicon e outras configurações globais
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { realtimeSubscriptions } from '../lib/supabase-queries';

interface SystemConfig {
  id: string;
  logo_url: string | null;
  logo_drive_id: string | null;
  favicon_url: string | null;
  favicon_drive_id: string | null;
  updated_at: string;
  updated_by: string | null;
}

interface UseSystemConfigReturn {
  config: SystemConfig | null;
  logo: string | null;
  favicon: string | null;
  loading: boolean;
  error: string | null;
  updateLogo: (url: string, driveId: string) => Promise<void>;
  updateFavicon: (url: string, driveId: string) => Promise<void>;
}

export const useSystemConfig = (): UseSystemConfigReturn => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega configurações
  useEffect(() => {
    loadConfig();

    // Inscreve para atualizações em tempo real
    const subscription = supabase
      .channel('sistema_config_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sistema_config',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setConfig(payload.new as SystemConfig);
            // Atualiza favicon no DOM se mudou
            if (payload.new.favicon_url) {
              updateFaviconInDOM(payload.new.favicon_url);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sistema_config')
        .select('*')
        .single();

      if (error) throw error;

      setConfig(data);
      
      // Aplica favicon se existir
      if (data?.favicon_url) {
        updateFaviconInDOM(data.favicon_url);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atualiza o favicon no DOM
   */
  const updateFaviconInDOM = (faviconUrl: string) => {
    // Remove favicons existentes
    const existingFavicons = document.querySelectorAll("link[rel*='icon']");
    existingFavicons.forEach(favicon => favicon.remove());

    // Adiciona novo favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = faviconUrl;
    document.head.appendChild(link);
  };

  /**
   * Atualiza logo do sistema
   */
  const updateLogo = async (url: string, driveId: string) => {
    try {
      const { error } = await supabase
        .from('sistema_config')
        .update({
          logo_url: url,
          logo_drive_id: driveId,
        })
        .eq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      await loadConfig();
    } catch (err: any) {
      throw new Error(`Erro ao atualizar logo: ${err.message}`);
    }
  };

  /**
   * Atualiza favicon do sistema
   */
  const updateFavicon = async (url: string, driveId: string) => {
    try {
      const { error } = await supabase
        .from('sistema_config')
        .update({
          favicon_url: url,
          favicon_drive_id: driveId,
        })
        .eq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      await loadConfig();
    } catch (err: any) {
      throw new Error(`Erro ao atualizar favicon: ${err.message}`);
    }
  };

  return {
    config,
    logo: config?.logo_url || null,
    favicon: config?.favicon_url || null,
    loading,
    error,
    updateLogo,
    updateFavicon,
  };
};