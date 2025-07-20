// src/pages/admin/ProjetosList.tsx
/**
 * Lista de projetos para o administrador
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Projeto } from '../../types';

export const ProjetosList: React.FC = () => {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAtivo, setFilterAtivo] = useState<boolean | null>(null);

  useEffect(() => {
    loadProjetos();
  }, []);

  const loadProjetos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projetos')
        .select(`
          *,
          cliente:clientes(nome, empresa)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjetos(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtra projetos
  const filteredProjetos = projetos.filter(projeto => {
    const matchesSearch = 
      projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projeto.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projeto.cliente?.empresa?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterAtivo === null || projeto.ativo === filterAtivo;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Erro ao carregar projetos: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
        <Link
          to="/admin/projetos/novo"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg className="mr-2 -ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Novo Projeto
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Buscar por nome, cliente ou empresa..."
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setFilterAtivo(null)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                filterAtivo === null
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterAtivo(true)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                filterAtivo === true
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => setFilterAtivo(false)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                filterAtivo === false
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Inativos
            </button>
          </div>
        </div>
      </div>

      {/* Lista de projetos */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredProjetos.length === 0 ? (
          <div className="px-6 py-4 text-center text-gray-500">
            {searchTerm || filterAtivo !== null ? 
              'Nenhum projeto encontrado com os critérios de busca.' : 
              'Nenhum projeto cadastrado ainda.'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredProjetos.map((projeto) => (
              <li key={projeto.id}>
                <Link
                  to={`/admin/projetos/${projeto.id}`}
                  className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {projeto.nome}
                        </p>
                        <div className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          projeto.ativo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {projeto.ativo ? 'Ativo' : 'Inativo'}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {projeto.cliente?.nome}
                        {projeto.cliente?.empresa && ` - ${projeto.cliente.empresa}`}
                      </div>
                      {projeto.descricao && (
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {projeto.descricao}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-900">
                          Início: {new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}
                        </p>
                        {projeto.data_fim_prevista && (
                          <p className="text-sm text-gray-500">
                            Previsão: {new Date(projeto.data_fim_prevista).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
