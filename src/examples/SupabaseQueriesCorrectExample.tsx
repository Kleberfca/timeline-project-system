// src/examples/SupabaseQueriesCorrectExample.tsx
/**
 * Exemplos de uso das queries do Supabase
 * Usando o arquivo existente src/lib/supabase-queries.ts
 */

import React, { useState, useEffect } from 'react';
import {
  arquivoQueries,
  projetoQueries,
  clienteQueries,
  timelineQueries,
  realtimeSubscriptions,
  sistemaConfigQueries
} from '../lib/supabase-queries'; // Importa do arquivo correto
import type { Cliente, Projeto, Arquivo } from '../types';

/**
 * Exemplo 1: CRUD de Clientes
 */
export const ClientesExample: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const data = await clienteQueries.listarTodos();
      setClientes(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const novoCliente = await clienteQueries.criar({
        nome: 'Novo Cliente',
        email: `cliente${Date.now()}@example.com`,
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
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">Clientes ({clientes.length})</h3>
      <button 
        onClick={handleCreate}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Criar Cliente
      </button>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <ul className="space-y-2">
          {clientes.map(cliente => (
            <li key={cliente.id} className="p-2 bg-gray-100 rounded">
              <strong>{cliente.nome}</strong> - {cliente.email}
              {cliente.empresa && <span className="text-gray-600"> ({cliente.empresa})</span>}
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
export const ProjetosExample: React.FC<{ clienteId?: string }> = ({ clienteId }) => {
  const [projeto, setProjeto] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadProjeto = async (projetoId: string) => {
    try {
      setLoading(true);
      const data = await projetoQueries.buscarComTimeline(projetoId);
      setProjeto(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (timelineId: string, novoStatus: 'pendente' | 'em_andamento' | 'concluido') => {
    try {
      await timelineQueries.atualizarStatus(timelineId, novoStatus, 'Atualizado via exemplo');
      
      if (projeto) {
        await loadProjeto(projeto.id);
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">Projeto e Timeline</h3>
      
      {!projeto ? (
        <p className="text-gray-600">Selecione um projeto para visualizar a timeline</p>
      ) : (
        <div>
          <h4 className="font-semibold mb-2">{projeto.nome}</h4>
          <div className="space-y-2">
            {projeto.timeline?.map((item: any) => (
              <div key={item.id} className="p-3 bg-gray-50 rounded flex justify-between items-center">
                <span>
                  <strong>{item.etapa?.fase?.nome}</strong> - {item.etapa?.nome}: 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    item.status === 'concluido' ? 'bg-green-100 text-green-800' :
                    item.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status}
                  </span>
                </span>
                <div className="space-x-2">
                  {item.status !== 'em_andamento' && (
                    <button 
                      onClick={() => updateStatus(item.id, 'em_andamento')}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Iniciar
                    </button>
                  )}
                  {item.status !== 'concluido' && (
                    <button 
                      onClick={() => updateStatus(item.id, 'concluido')}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      Concluir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Exemplo 3: Arquivos
 */
export const ArquivosExample: React.FC<{ projetoTimelineId: string }> = ({ 
  projetoTimelineId 
}) => {
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [loading, setLoading] = useState(false);

  const loadArquivos = async () => {
    try {
      setLoading(true);
      const data = await arquivoQueries.listarPorTimeline(projetoTimelineId);
      setArquivos(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Confirma a exclusão?')) return;
    
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
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">Arquivos da Etapa</h3>
      {loading ? (
        <p>Carregando...</p>
      ) : arquivos.length === 0 ? (
        <p className="text-gray-600">Nenhum arquivo nesta etapa</p>
      ) : (
        <ul className="space-y-2">
          {arquivos.map(arquivo => (
            <li key={arquivo.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>
                {arquivo.nome} 
                <span className="ml-2 text-sm text-gray-600">({arquivo.tipo})</span>
              </span>
              <button 
                onClick={() => handleDelete(arquivo.id)}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Exemplo 4: Realtime
 */
export const RealtimeExample: React.FC<{ projetoId: string }> = ({ projetoId }) => {
  const [updates, setUpdates] = useState<string[]>([]);

  useEffect(() => {
    const subscription = realtimeSubscriptions.subscribeToProjectTimeline(
      projetoId,
      (payload) => {
        const msg = `[${new Date().toLocaleTimeString()}] ${payload.eventType} na timeline`;
        setUpdates(prev => [msg, ...prev].slice(0, 10)); // Mantém apenas últimas 10
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [projetoId]);

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">Atualizações em Tempo Real</h3>
      {updates.length === 0 ? (
        <p className="text-gray-600">Aguardando atualizações...</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {updates.map((update, index) => (
            <li key={index} className="text-gray-700">{update}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Exemplo 5: Timeline por Fase
 */
export const TimelinePorFaseExample: React.FC<{ projetoId: string }> = ({ projetoId }) => {
  const [fases, setFases] = useState<{ [key: string]: any[] }>({
    'Diagnóstico': [],
    'Posicionamento': [],
    'Tração': []
  });
  const [loading, setLoading] = useState(false);

  const loadTimelines = async () => {
    try {
      setLoading(true);
      
      const results = await Promise.all([
        timelineQueries.buscarPorProjetoFase(projetoId, 'Diagnóstico'),
        timelineQueries.buscarPorProjetoFase(projetoId, 'Posicionamento'),
        timelineQueries.buscarPorProjetoFase(projetoId, 'Tração')
      ]);

      setFases({
        'Diagnóstico': results[0] || [],
        'Posicionamento': results[1] || [],
        'Tração': results[2] || []
      });
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
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">Timeline por Fase</h3>
      
      {Object.entries(fases).map(([fase, items]) => (
        <div key={fase} className="mb-4">
          <h4 className="font-semibold mb-2">{fase}</h4>
          {items.length === 0 ? (
            <p className="text-gray-600 text-sm">Nenhuma etapa encontrada</p>
          ) : (
            <ul className="space-y-1 ml-4">
              {items.map((item: any) => (
                <li key={item.id} className="text-sm">
                  {item.etapa?.nome}: 
                  <span className={`ml-2 font-semibold ${
                    item.status === 'concluido' ? 'text-green-600' :
                    item.status === 'em_andamento' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Exemplo 6: Configurações do Sistema
 */
export const SistemaConfigExample: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await sistemaConfigQueries.buscar();
      setConfig(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">Configurações do Sistema</h3>
      {loading ? (
        <p>Carregando...</p>
      ) : config ? (
        <div className="space-y-2 text-sm">
          <p><strong>Logo URL:</strong> {config.logo_url || 'Não configurado'}</p>
          <p><strong>Favicon URL:</strong> {config.favicon_url || 'Não configurado'}</p>
          <p><strong>Última atualização:</strong> {new Date(config.updated_at).toLocaleString()}</p>
        </div>
      ) : (
        <p className="text-gray-600">Erro ao carregar configurações</p>
      )}
    </div>
  );
};