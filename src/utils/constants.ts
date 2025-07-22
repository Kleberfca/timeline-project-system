// src/utils/constants.ts
/**
 * Constantes globais do sistema
 * Centraliza valores fixos utilizados em toda a aplicação
 */

// Configurações de paginação
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 100
} as const;

// Timeouts e delays
export const TIMEOUTS = {
  DEBOUNCE_SEARCH: 300,
  NOTIFICATION_DURATION: 5000,
  API_TIMEOUT: 30000,
  UPLOAD_TIMEOUT: 120000
} as const;

// Tamanhos de arquivo
export const FILE_SIZES = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  CHUNK_SIZE: 1024 * 1024 // 1MB para upload em chunks
} as const;

// Tipos de arquivo permitidos
export const ALLOWED_FILE_TYPES = {
  documents: ['.pdf', '.doc', '.docx', '.xlsx', '.csv'],
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  all: ['.pdf', '.doc', '.docx', '.xlsx', '.csv', '.jpg', '.jpeg', '.png']
} as const;

// MIME types
export const MIME_TYPES = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xlsx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'text/csv': 'csv',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp'
} as const;

// Status das etapas
export const ETAPA_STATUS = {
  PENDENTE: 'pendente',
  EM_ANDAMENTO: 'em_andamento',
  CONCLUIDO: 'concluido'
} as const;

// Tipos de usuário
export const USER_ROLES = {
  ADMIN: 'admin',
  CLIENTE: 'cliente'
} as const;

// Fases do projeto
export const FASES = {
  DIAGNOSTICO: 'diagnostico',
  POSICIONAMENTO: 'posicionamento'
} as const;

// Etapas por fase
export const ETAPAS_POR_FASE = {
  [FASES.DIAGNOSTICO]: [
    'Análise da situação atual',
    'Análise de mercado',
    'Diagnóstico do processo comercial',
    'Mapeamento da jornada do cliente',
    'Avaliação de canais ativos e funil atual',
    'Persona',
    'Matriz SWOT',
    'Benchmark com concorrentes'
  ],
  [FASES.POSICIONAMENTO]: [
    'Proposta de valor',
    'Visão de futuro',
    'Plano de ação',
    'Criação de linha editorial',
    'Posicionamento'
  ]
} as const;

// Mensagens de erro padrão
export const ERROR_MESSAGES = {
  GENERIC: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
  NETWORK: 'Erro de conexão. Verifique sua internet e tente novamente.',
  UNAUTHORIZED: 'Você não tem permissão para realizar esta ação.',
  NOT_FOUND: 'Recurso não encontrado.',
  VALIDATION: 'Por favor, verifique os dados informados.',
  FILE_TOO_LARGE: 'O arquivo é muito grande. Tamanho máximo permitido: 10MB',
  INVALID_FILE_TYPE: 'Tipo de arquivo não permitido.',
  SESSION_EXPIRED: 'Sua sessão expirou. Por favor, faça login novamente.'
} as const;

// Mensagens de sucesso padrão
export const SUCCESS_MESSAGES = {
  SAVED: 'Dados salvos com sucesso!',
  UPDATED: 'Atualização realizada com sucesso!',
  DELETED: 'Registro removido com sucesso!',
  UPLOADED: 'Arquivo enviado com sucesso!',
  COPIED: 'Copiado para a área de transferência!'
} as const;

// Rotas da aplicação
export const ROUTES = {
  // Públicas
  LOGIN: '/login',
  
  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_CLIENTES: '/admin/clientes',
  ADMIN_CLIENTE_NOVO: '/admin/clientes/novo',
  ADMIN_CLIENTE_EDIT: '/admin/clientes/:id',
  ADMIN_PROJETOS: '/admin/projetos',
  ADMIN_PROJETO_NOVO: '/admin/projetos/novo',
  ADMIN_PROJETO_EDIT: '/admin/projetos/:id/editar',
  ADMIN_PROJETO_DETAILS: '/admin/projetos/:id',
  
  // Cliente
  CLIENTE_PROJETOS: '/cliente/projetos',
  CLIENTE_PROJETO_DETAILS: '/cliente/projetos/:id'
} as const;

// Configurações de data
export const DATE_FORMATS = {
  DEFAULT: 'DD/MM/YYYY',
  WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  DISPLAY: 'DD de MMMM de YYYY'
} as const;

// Breakpoints para responsividade
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
} as const;

// Configurações de animação
export const ANIMATION = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: {
    DEFAULT: 'ease-in-out',
    SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
} as const;

// Regex patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/,
  CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/,
  CPF: /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/,
  CEP: /^\d{5}-?\d{3}$/
} as const;

// Configurações de localStorage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@timeline:token',
  USER_DATA: '@timeline:user',
  THEME: '@timeline:theme',
  LANGUAGE: '@timeline:language'
} as const;

// Configurações de API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
} as const;