// src/types/index.ts
/**
 * Tipos e interfaces principais do sistema de timeline de projetos
 * Atualizado com a fase Tração
 */

// Tipos de usuário
export type UserRole = 'admin' | 'cliente';

// Interface de usuário
export interface User {
  id: string;
  email: string;
  nome: string;
  role: UserRole;
  cliente_id?: string; // Apenas para usuários do tipo cliente
  created_at: string;
  updated_at: string;
}

// Interface de cliente
export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Interface de projeto
export interface Projeto {
  id: string;
  cliente_id: string;
  nome: string;
  descricao?: string;
  data_inicio: string;
  data_fim_prevista?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  cliente?: Cliente;
}

// Tipos de fases - ATUALIZADO COM TRAÇÃO
export type FaseNome = 'diagnostico' | 'posicionamento' | 'tracao';

// Interface de fase
export interface Fase {
  id: string;
  nome: FaseNome;
  ordem: number;
}

// Status possíveis das etapas
export type StatusEtapa = 'pendente' | 'em_andamento' | 'concluido';

// Interface de etapa
export interface Etapa {
  id: string;
  fase_id: string;
  nome: string;
  descricao?: string;
  ordem: number;
  fase?: Fase;
}

// Etapas da fase Diagnóstico
export const ETAPAS_DIAGNOSTICO = [
  'Análise da situação atual',
  'Análise de mercado',
  'Diagnóstico do processo comercial',
  'Mapeamento da jornada do cliente',
  'Avaliação de canais ativos e funil atual',
  'Persona',
  'Matriz SWOT',
  'Benchmark com concorrentes'
] as const;

// Etapas da fase Posicionamento
export const ETAPAS_POSICIONAMENTO = [
  'Proposta de valor',
  'Visão de futuro',
  'Plano de ação',
  'Criação de linha editorial',
  'Posicionamento'
] as const;

// NOVO: Etapas da fase Tração
export const ETAPAS_TRACAO = [
  'Tráfego e Comercial - Construção do funil',
  'Tráfego e Comercial - Planejamento de campanha',
  'Gestor de tráfego - Anúncios com foco em performance',
  'Comercial - Implantação ou reestruturação de CRM',
  'Comercial - Script de prospecção',
  'Comercial - Estruturação de pitch comercial por persona',
  'Comercial - Diretrizes de argumentação de vendas',
  'Comercial - Treinamento de time comercial',
  'Comercial - CRM (trabalho de base/conversão)',
  'Comercial - Pesquisa com clientes'
] as const;

// Interface de timeline do projeto
export interface ProjetoTimeline {
  id: string;
  projeto_id: string;
  etapa_id: string;
  status: StatusEtapa;
  observacoes?: string;
  data_inicio?: string;
  data_conclusao?: string;
  created_at: string;
  updated_at: string;
  projeto?: Projeto;
  etapa?: Etapa;
}

// Tipos de arquivo suportados
export type TipoArquivo = 'pdf' | 'doc' | 'docx' | 'xlsx' | 'csv' | 'link';

// Interface de arquivo
export interface Arquivo {
  id: string;
  projeto_timeline_id: string;
  nome: string;
  tipo: TipoArquivo;
  tamanho?: number;
  url_google_drive: string;
  google_drive_id: string;
  uploaded_by: string;
  created_at: string;
  projeto_timeline?: ProjetoTimeline;
}

// Interface para credenciais do Supabase
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Interface para respostas da API
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: 'success' | 'error';
}

// Interface para contexto de autenticação
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

// Interface para filtros da timeline
export interface TimelineFilters {
  fase?: FaseNome;
  status?: StatusEtapa;
}

// Interface para dados do dashboard
export interface DashboardData {
  totalProjetos: number;
  projetosAtivos: number;
  etapasConcluidas: number;
  etapasPendentes: number;
  etapasEmAndamento: number;
}

// Cores para os status
export const STATUS_COLORS = {
  pendente: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300'
  },
  em_andamento: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-300'
  },
  concluido: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300'
  }
} as const;

// Interface para upload de arquivo
export interface FileUploadData {
  file: File;
  projetoTimelineId: string;
  tipo: TipoArquivo;
}

// Interface para progresso de upload
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Tipo para notificações
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}