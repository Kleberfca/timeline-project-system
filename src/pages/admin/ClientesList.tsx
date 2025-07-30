// src/pages/admin/ClientesList.tsx
/**
 * Listagem de Clientes
 * Design profissional com tabela responsiva
 * Filtros e busca
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clienteQueries } from '../../lib/supabase-queries';
import { useNotification } from '../../contexts/NotificationContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useDevice } from '../../hooks/useDevice';
import type { Cliente } from '../../types';

export const ClientesList: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { isMobile } = useDevice();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortField, setSortField] = useState<'nome' | 'empresa' | 'created_at'>('nome');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  /**
   * Carrega lista de clientes
   */
  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const data = await clienteQueries.listarTodos();
      setClientes(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      showNotification('error', 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtra e ordena clientes
   */
  const filteredAndSortedClientes = useMemo(() => {
    let filtered = [...clientes];

    // Filtro por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => filterStatus === 'active' ? c.ativo : !c.ativo);
    }

    // Filtro por busca
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.nome.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        (c.empresa && c.empresa.toLowerCase().includes(search)) ||
        (c.telefone && c.telefone.includes(search))
      );
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';
      
      if (sortField === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [clientes, filterStatus, searchTerm, sortField, sortOrder]);

  /**
   * Toggle de ordenação
   */
  const handleSort = (field: typeof sortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark">
              Clientes
            </h1>
            <p className="mt-1 text-sm text-brand-gray">
              Gerencie os clientes do sistema
            </p>
          </div>
          
          <Link
            to="/admin/clientes/novo"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue font-medium transition-all"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Novo Cliente
          </Link>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Busca */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-brand-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, email, empresa ou telefone..."
              className="block w-full pl-10 pr-3 py-2 border border-brand-light rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent placeholder-brand-light transition-all"
            />
          </div>
        </div>

        {/* Filtro de Status */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-brand-blue text-white'
                : 'bg-white border border-brand-light text-brand-gray hover:bg-brand-lighter'
            }`}
          >
            Todos ({clientes.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-white border border-brand-light text-brand-gray hover:bg-brand-lighter'
            }`}
          >
            Ativos ({clientes.filter(c => c.ativo).length})
          </button>
          <button
            onClick={() => setFilterStatus('inactive')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === 'inactive'
                ? 'bg-red-600 text-white'
                : 'bg-white border border-brand-light text-brand-gray hover:bg-brand-lighter'
            }`}
          >
            Inativos ({clientes.filter(c => !c.ativo).length})
          </button>
        </div>
      </div>

      {/* Tabela/Cards */}
      <div className="bg-white shadow-sm rounded-xl border border-brand-lighter overflow-hidden">
        {filteredAndSortedClientes.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-brand-dark">Nenhum cliente encontrado</h3>
            <p className="mt-1 text-sm text-brand-gray">
              {searchTerm ? 'Tente ajustar sua busca' : 'Comece criando um novo cliente'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link
                  to="/admin/clientes/novo"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-brand-blue hover:bg-blue-700"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Criar Primeiro Cliente
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Desktop: Tabela */}
            <div className="hidden sm:block">
              <table className="min-w-full divide-y divide-brand-lighter">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('nome')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Nome</span>
                        {sortField === 'nome' && (
                          <svg className={`w-4 h-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('empresa')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Empresa</span>
                        {sortField === 'empresa' && (
                          <svg className={`w-4 h-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">
                      Telefone
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-gray uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-brand-lighter">
                  {filteredAndSortedClientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-brand-dark">{cliente.nome}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-brand-gray">{cliente.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-brand-gray">{cliente.empresa || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-brand-gray">{cliente.telefone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          cliente.ativo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {cliente.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/admin/clientes/${cliente.id}`}
                          className="text-brand-blue hover:text-blue-700 mr-4"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => navigate(`/admin/projetos?cliente=${cliente.id}`)}
                          className="text-brand-gray hover:text-brand-dark"
                        >
                          Ver Projetos
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: Cards */}
            <div className="sm:hidden divide-y divide-brand-lighter">
              {filteredAndSortedClientes.map((cliente) => (
                <div key={cliente.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-brand-dark truncate">
                        {cliente.nome}
                      </h3>
                      <p className="text-sm text-brand-gray truncate">{cliente.email}</p>
                      {cliente.empresa && (
                        <p className="text-sm text-brand-gray">{cliente.empresa}</p>
                      )}
                      {cliente.telefone && (
                        <p className="text-sm text-brand-gray">{cliente.telefone}</p>
                      )}
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      cliente.ativo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {cliente.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="mt-3 flex space-x-3">
                    <Link
                      to={`/admin/clientes/${cliente.id}`}
                      className="flex-1 text-center px-3 py-2 text-sm font-medium text-brand-blue border border-brand-blue rounded-lg hover:bg-blue-50"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => navigate(`/admin/projetos?cliente=${cliente.id}`)}
                      className="flex-1 text-center px-3 py-2 text-sm font-medium text-brand-gray border border-brand-light rounded-lg hover:bg-brand-lighter"
                    >
                      Ver Projetos
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Resumo */}
      {filteredAndSortedClientes.length > 0 && (
        <div className="mt-4 text-sm text-brand-gray text-center">
          Mostrando {filteredAndSortedClientes.length} de {clientes.length} clientes
        </div>
      )}
    </div>
  );
};