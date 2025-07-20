// src/pages/admin/Dashboard.tsx
/**
 * Dashboard principal do administrador
 * Mostra resumo e métricas dos projetos
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { DashboardData, Cliente, Projeto } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalProjetos: 0,
    projetosAtivos: 0,
    etapasConcluidas: 0,
    etapasPendentes: 0,
    etapasEmAndamento: 0
  });
  const [recentProjects, setRecentProjects] = useState<Projeto[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carrega dados do dashboard
   */
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Busca contadores
      const [
        { count: totalProjetos },
        { count: projetosAtivos },
        { data: timelineData }
      ] = await Promise.all([
        supabase.from('projetos').select('*', { count: 'exact', head: true }),
        supabase.from('projetos').select('*', { count: 'exact', head: true }).eq('ativo', true),
        supabase.from('projeto_timeline').select('status')
      ]);

      // Conta status das etapas
      const statusCount = timelineData?.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Busca projetos recentes
      const { data: projetos } = await supabase
        .from('projetos')
        .select(`
          *,
          cliente:clientes(nome)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setDashboardData({
        totalProjetos: totalProjetos || 0,
        projetosAtivos: projetosAtivos || 0,
        etapasConcluidas: statusCount.concluido || 0,
        etapasPendentes: statusCount.pendente || 0,
        etapasEmAndamento: statusCount.em_andamento || 0
      });

      setRecentProjects(projetos || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        Erro ao carregar dashboard: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="space-x-4">
          <Link
            to="/admin/clientes/novo"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Novo Cliente
          </Link>
          <Link
            to="/admin/projetos/novo"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Novo Projeto
          </Link>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Total de Projetos"
          value={dashboardData.totalProjetos}
          color="blue"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <MetricCard
          title="Projetos Ativos"
          value={dashboardData.projetosAtivos}
          color="green"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <MetricCard
          title="Etapas Concluídas"
          value={dashboardData.etapasConcluidas}
          color="green"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricCard
          title="Em Andamento"
          value={dashboardData.etapasEmAndamento}
          color="yellow"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricCard
          title="Pendentes"
          value={dashboardData.etapasPendentes}
          color="gray"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Lista de projetos recentes */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Projetos Recentes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentProjects.length === 0 ? (
            <div className="px-6 py-4 text-center text-gray-500">
              Nenhum projeto cadastrado ainda.
            </div>
          ) : (
            recentProjects.map((projeto) => (
              <div key={projeto.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <Link
                      to={`/admin/projetos/${projeto.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      {projeto.nome}
                    </Link>
                    <p className="text-sm text-gray-500">
                      Cliente: {projeto.cliente?.nome}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(projeto.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Componente de card de métrica
 */
interface MetricCardProps {
  title: string;
  value: number;
  color: 'blue' | 'green' | 'yellow' | 'gray';
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, color, icon }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    gray: 'text-gray-600 bg-gray-100'
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${colorClasses[color]}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-2xl font-semibold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};
