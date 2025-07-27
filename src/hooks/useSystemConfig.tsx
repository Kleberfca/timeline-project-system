// src/hooks/useSystemConfig.tsx
/**
 * Hook para gerenciar configurações do sistema
 * Suporta tanto Google Drive quanto base64
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SystemConfig {
  id: string;
  logo_url: string | null;
  logo_drive_id: string | null;
  logo_base64: string | null;
  favicon_url: string | null;
  favicon_drive_id: string | null;
  favicon_base64: string | null;
  updated_at: string;
  updated_by: string | null;
}

interface UseSystemConfigReturn {
  config: SystemConfig | null;
  logo: string | null;
  favicon: string | null;
  logoSource: 'base64' | 'drive' | null;
  faviconSource: 'base64' | 'drive' | null;
  loading: boolean;
  error: string | null;
  updateLogo: (url: string, driveId: string) => Promise<void>;
  updateFavicon: (url: string, driveId: string) => Promise<void>;
  updateLogoBase64: (base64: string | null) => Promise<void>;
  updateFaviconBase64: (base64: string | null) => Promise<void>;
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
            const newConfig = payload.new as SystemConfig;
            setConfig(newConfig);
            
            // Atualiza favicon no DOM
            const favicon = newConfig.favicon_base64 || newConfig.favicon_url;
            if (favicon) {
              updateFaviconInDOM(favicon);
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
      
      // Aplica favicon se existir (prioriza base64)
      const favicon = data?.favicon_base64 || data?.favicon_url;
      if (favicon) {
        updateFaviconInDOM(favicon);
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
  const updateFaviconInDOM = (favicon: string) => {
    // Remove favicons existentes
    const existingFavicons = document.querySelectorAll("link[rel*='icon']");
    existingFavicons.forEach(f => f.remove());

    // Se for base64, usa direto
    if (favicon.startsWith('data:')) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = favicon;
      document.head.appendChild(link);
    } else {
      // Se for URL, cria link normal
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = favicon;
      document.head.appendChild(link);
    }
  };

  /**
   * Atualiza logo via Google Drive
   */
  const updateLogo = async (url: string, driveId: string) => {
    try {
      const { error } = await supabase
        .from('sistema_config')
        .update({
          logo_url: url,
          logo_drive_id: driveId,
          logo_base64: null // Remove base64 se estiver usando Drive
        })
        .eq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;
      await loadConfig();
    } catch (err: any) {
      throw new Error(`Erro ao atualizar logo: ${err.message}`);
    }
  };

  /**
   * Atualiza favicon via Google Drive
   */
  const updateFavicon = async (url: string, driveId: string) => {
    try {
      const { error } = await supabase
        .from('sistema_config')
        .update({
          favicon_url: url,
          favicon_drive_id: driveId,
          favicon_base64: null // Remove base64 se estiver usando Drive
        })
        .eq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;
      await loadConfig();
    } catch (err: any) {
      throw new Error(`Erro ao atualizar favicon: ${err.message}`);
    }
  };

  /**
   * Atualiza logo via base64
   */
  const updateLogoBase64 = async (base64: string | null) => {
    try {
      const { error } = await supabase
        .from('sistema_config')
        .update({
          logo_base64: base64,
          logo_url: null, // Remove URL se estiver usando base64
          logo_drive_id: null
        })
        .eq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;
      await loadConfig();
    } catch (err: any) {
      throw new Error(`Erro ao atualizar logo: ${err.message}`);
    }
  };

  /**
   * Atualiza favicon via base64
   */
  const updateFaviconBase64 = async (base64: string | null) => {
    try {
      const { error } = await supabase
        .from('sistema_config')
        .update({
          favicon_base64: base64,
          favicon_url: null, // Remove URL se estiver usando base64
          favicon_drive_id: null
        })
        .eq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;
      await loadConfig();
    } catch (err: any) {
      throw new Error(`Erro ao atualizar favicon: ${err.message}`);
    }
  };

  // Determina fonte e valor atual
  const logo = config?.logo_base64 || config?.logo_url || null;
  const favicon = config?.favicon_base64 || config?.favicon_url || null;
  
  const logoSource = config?.logo_base64 ? 'base64' : config?.logo_url ? 'drive' : null;
  const faviconSource = config?.favicon_base64 ? 'base64' : config?.favicon_url ? 'drive' : null;

  return {
    config,
    logo,
    favicon,
    logoSource,
    faviconSource,
    loading,
    error,
    updateLogo,
    updateFavicon,
    updateLogoBase64,
    updateFaviconBase64,
  };
};