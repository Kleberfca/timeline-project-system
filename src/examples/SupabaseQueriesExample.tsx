// src/examples/SupabaseQueriesExample.tsx
/**
 * Exemplos de uso das queries do Supabase
 * Corrigido para usar os métodos existentes no projeto
 */

import React, { useState, useEffect } from 'react';
import {
  arquivoQueries,
  projetoQueries,
  clienteQueries,
  timelineQueries,
  realtimeSubscriptions
} from '../lib/supabase-queries';
import type { Cliente, Projeto, Arquivo } from '../types';

/**
 * Exemplo 1: CRUD de Clientes
 */
export const ClientesExample: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);

  // Carrega clientes
  const loadClientes = async () => {
    try {
      setLoading(true);
      const data = await clienteQueries.listarTodos(); // Método correto
      setClientes(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cria novo cliente
  const handleCreate = async () => {
    try {
      const novoCliente = await clienteQueries.criar({
        nome: 'Novo Cliente',
        email: 'cliente@example.com',
        telefone: '(11) 98765-4321',
        empresa: 'Empresa XYZ',
        ativo: true
      });
      
      console.log('Cliente criado:', novoCliente);
      await loadClientes();
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
    }
  };

  useEffect(() => {
    loadClientes();
  }, []);

  return (
    <div>
      <h3>Clientes ({clientes.length})</h3>
      <button onClick={handleCreate}>Criar Cliente</button>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <ul>
          {clientes.map(cliente => (
            <li key={cliente.id}>
              {cliente.nome} - {cliente.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Exemplo 2: Projetos com Timeline
 */
export const ProjetosTimelineExample: React.FC<{ clienteId: string }> = ({ clienteId }) => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState<any>(null);

  const loadProjetos = async () => {
    try {
      // Carrega projetos do cliente
      const data = await projetoQueries.listarPorCliente(clienteId);
      setProjetos(data);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const loadProjetoComTimeline = async (projetoId: string) => {
    try {
      // Busca projeto com timeline completa
      const data = await projetoQueries.buscarComTimeline(projetoId);
      setProjetoSelecionado(data);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const updateStatus = async (timelineId: string, novoStatus: 'pendente' | 'em_andamento' | 'concluido') => {
    try {
      await timelineQueries.atualizarStatus(
        timelineId,
        novoStatus,
        'Atualizado via exemplo'
      );
      
      // Recarrega projeto
      if (projetoSelecionado) {
        await loadProjetoComTimeline(projetoSelecionado.id);
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    }
  };

  useEffect(() => {
    loadProjetos();
  }, [clienteId]);

  return (
    <div>
      <h3>Projetos do Cliente</h3>
      
      {/* Lista de projetos */}
      <ul>
        {projetos.map(projeto => (
          <li key={projeto.id}>
            <button onClick={() => loadProjetoComTimeline(projeto.id)}>
              {projeto.nome}
            </button>
          </li>
        ))}
      </ul>

      {/* Timeline do projeto selecionado */}
      {projetoSelecionado && (
        <div>
          <h4>{projetoSelecionado.nome}</h4>
          <ul>
            {projetoSelecionado.timeline?.map((timeline: any) => (
              <li key={timeline.id}>
                {timeline.etapa?.nome}: {timeline.status}
                <button onClick={() => updateStatus(timeline.id, 'em_andamento')}>
                  Em Andamento
                </button>
                <button onClick={() => updateStatus(timeline.id, 'concluido')}>
                  Concluir
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * Exemplo 3: Upload e Listagem de Arquivos
 */
export const ArquivosExample: React.FC<{ projetoTimelineId: string }> = ({ 
  projetoTimelineId 
}) => {
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);

  const loadArquivos = async () => {
    try {
      // Método correto: listarPorTimeline
      const data = await arquivoQueries.listarPorTimeline(projetoTimelineId);
      setArquivos(data);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await arquivoQueries.remover(id);
      await loadArquivos();
    } catch (error) {
      console.error('Erro ao remover:', error);
    }
  };

  useEffect(() => {
    loadArquivos();
  }, [projetoTimelineId]);

  return (
    <div>
      <h3>Arquivos da Etapa</h3>
      <ul>
        {arquivos.map(arquivo => (
          <li key={arquivo.id}>
            {arquivo.nome} ({arquivo.tipo})
            <button onClick={() => handleDelete(arquivo.id)}>
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Exemplo 4: Realtime Updates
 */
export const RealtimeExample: React.FC<{ projetoId: string }> = ({ 
  projetoId 
}) => {
  const [updates, setUpdates] = useState<string[]>([]);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    // Método correto: subscribeToProjectTimeline
    const sub = realtimeSubscriptions.subscribeToProjectTimeline(
      projetoId,
      (payload) => {
        const msg = `${payload.eventType} em timeline: ${JSON.stringify(payload.new)}`;
        setUpdates(prev => [...prev, msg]);
      }
    );

    setSubscription(sub);

    // Cleanup
    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, [projetoId]);

  return (
    <div>
      <h3>Atualizações em Tempo Real</h3>
      <ul>
        {updates.map((update, index) => (
          <li key={index}>{update}</li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Exemplo 5: Busca Timeline por Fase
 */
export const TimelinePorFaseExample: React.FC<{ projetoId: string }> = ({ 
  projetoId 
}) => {
  const [diagnostico, setDiagnostico] = useState<any[]>([]);
  const [posicionamento, setPosicionamento] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTimelines = async () => {
    try {
      setLoading(true);
      
      // Busca timeline por fase
      const [diag, pos] = await Promise.all([
        timelineQueries.buscarPorProjetoFase(projetoId, 'Diagnóstico'),
        timelineQueries.buscarPorProjetoFase(projetoId, 'Posicionamento')
      ]);

      setDiagnostico(diag || []);
      setPosicionamento(pos || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimelines();
  }, [projetoId]);

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <h3>Timeline por Fase</h3>
      
      <div>
        <h4>Diagnóstico</h4>
        <ul>
          {diagnostico.map(item => (
            <li key={item.id}>
              {item.etapa?.nome}: {item.status}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4>Posicionamento</h4>
        <ul>
          {posicionamento.map(item => (
            <li key={item.id}>
              {item.etapa?.nome}: {item.status}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/**
 * Hook customizado para Realtime
 */
export function useProjectTimeline(projetoId: string) {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: any;

    const loadAndSubscribe = async () => {
      try {
        // Carrega dados iniciais
        const projeto = await projetoQueries.buscarComTimeline(projetoId);
        setTimeline(projeto.timeline || []);
        
        // Inscreve para mudanças
        subscription = realtimeSubscriptions.subscribeToProjectTimeline(
          projetoId,
          async (payload) => {
            // Recarrega dados quando houver mudança
            const updated = await projetoQueries.buscarComTimeline(projetoId);
            setTimeline(updated.timeline || []);
          }
        );
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAndSubscribe();

    // Cleanup
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [projetoId]);

  return { timeline, loading };
}

/**
 * Exemplo completo integrado
 */
export const ExemploCompleto: React.FC = () => {
  const [clienteId] = useState('exemplo-cliente-id');
  const [projetoId] = useState('exemplo-projeto-id');
  const [timelineId] = useState('exemplo-timeline-id');

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold">Exemplos de Queries Supabase</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-4 rounded">
          <ClientesExample />
        </div>
        
        <div className="border p-4 rounded">
          <ProjetosTimelineExample clienteId={clienteId} />
        </div>
        
        <div className="border p-4 rounded">
          <ArquivosExample projetoTimelineId={timelineId} />
        </div>
        
        <div className="border p-4 rounded">
          <RealtimeExample projetoId={projetoId} />
        </div>
      </div>
    </div>
  );
};