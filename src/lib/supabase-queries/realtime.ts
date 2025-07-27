// src/lib/supabase-queries/realtime.ts
/**
 * Configurações e helpers para Realtime do Supabase
 * Gerencia subscriptions e atualizações em tempo real
 */

import { supabase } from '../supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Tipos de eventos do Realtime
 */
export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

/**
 * Interface para callbacks de mudanças
 */
export interface RealtimeCallback<T = any> {
  (payload: RealtimePostgresChangesPayload<T>): void;
}

/**
 * Gerenciador de subscriptions realtime
 */
class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();

  /**
   * Inscreve em mudanças de uma tabela
   */
  subscribe<T = any>(
    table: string,
    callback: RealtimeCallback<T>,
    options?: {
      event?: RealtimeEvent;
      filter?: string;
      schema?: string;
    }
  ): RealtimeChannel {
    const channelName = `${table}_${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: options?.event || '*',
          schema: options?.schema || 'public',
          table: table,
          filter: options?.filter
        },
        callback
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  /**
   * Remove subscription
   */
  unsubscribe(channel: RealtimeChannel | string) {
    const channelObj = typeof channel === 'string' 
      ? this.channels.get(channel) 
      : channel;

    if (channelObj) {
      channelObj.unsubscribe();
      
      // Remove do mapa
      for (const [key, value] of this.channels.entries()) {
        if (value === channelObj) {
          this.channels.delete(key);
          break;
        }
      }
    }
  }

  /**
   * Remove todas as subscriptions
   */
  unsubscribeAll() {
    for (const channel of this.channels.values()) {
      channel.unsubscribe();
    }
    this.channels.clear();
  }
}

// Instância singleton
const realtimeManager = new RealtimeManager();

/**
 * Subscriptions pré-configuradas
 */
export const realtimeSubscriptions = {
  /**
   * Mudanças em projetos
   */
  onProjetosChange(
    callback: RealtimeCallback,
    clienteId?: string
  ): RealtimeChannel {
    return realtimeManager.subscribe(
      'projetos',
      callback,
      {
        filter: clienteId ? `cliente_id=eq.${clienteId}` : undefined
      }
    );
  },

  /**
   * Mudanças em timeline
   */
  onTimelineChange(
    callback: RealtimeCallback,
    projetoId?: string
  ): RealtimeChannel {
    return realtimeManager.subscribe(
      'projeto_timeline',
      callback,
      {
        filter: projetoId ? `projeto_id=eq.${projetoId}` : undefined
      }
    );
  },

  /**
   * Mudanças em arquivos
   */
  onArquivosChange(
    callback: RealtimeCallback,
    projetoTimelineId?: string
  ): RealtimeChannel {
    return realtimeManager.subscribe(
      'arquivos',
      callback,
      {
        filter: projetoTimelineId ? `projeto_timeline_id=eq.${projetoTimelineId}` : undefined
      }
    );
  },

  /**
   * Mudanças em clientes
   */
  onClientesChange(callback: RealtimeCallback): RealtimeChannel {
    return realtimeManager.subscribe('clientes', callback);
  },

  /**
   * Mudanças em configurações do sistema
   */
  onSistemaConfigChange(callback: RealtimeCallback): RealtimeChannel {
    return realtimeManager.subscribe('sistema_config', callback);
  },

  /**
   * Mudanças específicas por evento
   */
  onInsert<T = any>(
    table: string,
    callback: RealtimeCallback<T>
  ): RealtimeChannel {
    return realtimeManager.subscribe(table, callback, { event: 'INSERT' });
  },

  onUpdate<T = any>(
    table: string,
    callback: RealtimeCallback<T>
  ): RealtimeChannel {
    return realtimeManager.subscribe(table, callback, { event: 'UPDATE' });
  },

  onDelete<T = any>(
    table: string,
    callback: RealtimeCallback<T>
  ): RealtimeChannel {
    return realtimeManager.subscribe(table, callback, { event: 'DELETE' });
  },

  /**
   * Remove subscription
   */
  unsubscribe(channel: RealtimeChannel | string) {
    realtimeManager.unsubscribe(channel);
  },

  /**
   * Remove todas as subscriptions
   */
  unsubscribeAll() {
    realtimeManager.unsubscribeAll();
  }
};

/**
 * Hook helper para React
 */
export function useRealtimeSubscription<T = any>(
  subscribeFn: () => RealtimeChannel,
  deps: React.DependencyList = []
) {
  const channelRef = React.useRef<RealtimeChannel | null>(null);

  React.useEffect(() => {
    // Inscreve
    channelRef.current = subscribeFn();

    // Cleanup
    return () => {
      if (channelRef.current) {
        realtimeSubscriptions.unsubscribe(channelRef.current);
      }
    };
  }, deps);
}

// Importação necessária para o hook
import React from 'react';