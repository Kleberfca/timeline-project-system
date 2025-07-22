// src/utils/formatters.ts
/**
 * Funções de formatação
 * Centraliza formatações de dados para exibição
 */

import { ETAPA_STATUS, USER_ROLES } from './constants';

/**
 * Formata CPF
 */
export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Formata CNPJ
 */
export const formatCNPJ = (cnpj: string): string => {
  const cleaned = cnpj.replace(/\D/g, '');
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

/**
 * Formata telefone
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

/**
 * Formata CEP
 */
export const formatCEP = (cep: string): string => {
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
};

/**
 * Formata data para exibição
 */
export const formatDate = (date: string | Date, includeTime = false): string => {
  const d = date instanceof Date ? date : new Date(date);
  
  if (isNaN(d.getTime())) {
    return 'Data inválida';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return d.toLocaleDateString('pt-BR', options);
};

/**
 * Formata data relativa (ex: há 2 dias)
 */
export const formatRelativeDate = (date: string | Date): string => {
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'agora mesmo';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `há ${days} ${days === 1 ? 'dia' : 'dias'}`;
  } else if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `há ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `há ${months} ${months === 1 ? 'mês' : 'meses'}`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `há ${years} ${years === 1 ? 'ano' : 'anos'}`;
  }
};

/**
 * Formata moeda brasileira
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Formata número com separadores
 */
export const formatNumber = (value: number, decimals = 0): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Formata porcentagem
 */
export const formatPercentage = (value: number, decimals = 0): string => {
  return `${formatNumber(value, decimals)}%`;
};

/**
 * Formata tamanho de arquivo
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Formata status da etapa para exibição
 */
export const formatStatus = (status: string): string => {
  const statusMap = {
    [ETAPA_STATUS.PENDENTE]: 'Pendente',
    [ETAPA_STATUS.EM_ANDAMENTO]: 'Em Andamento',
    [ETAPA_STATUS.CONCLUIDO]: 'Concluído'
  };
  
  return statusMap[status] || status;
};

/**
 * Formata role do usuário para exibição
 */
export const formatUserRole = (role: string): string => {
  const roleMap = {
    [USER_ROLES.ADMIN]: 'Administrador',
    [USER_ROLES.CLIENTE]: 'Cliente'
  };
  
  return roleMap[role] || role;
};

/**
 * Trunca texto com reticências
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Capitaliza primeira letra
 */
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Capitaliza cada palavra
 */
export const capitalizeWords = (text: string): string => {
  return text
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Remove acentos
 */
export const removeAccents = (text: string): string => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Formata nome de arquivo para URL
 */
export const slugify = (text: string): string => {
  return removeAccents(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Extrai iniciais do nome
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Formata tempo decorrido
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs}s`);
  }
  
  return parts.join(' ');
};

/**
 * Formata intervalo de datas
 */
export const formatDateRange = (startDate: string | Date, endDate: string | Date): string => {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  
  if (start === end) {
    return start;
  }
  
  return `${start} - ${end}`;
};

/**
 * Remove formatação de valores numéricos
 */
export const unformatNumber = (value: string): number => {
  return parseFloat(value.replace(/\./g, '').replace(',', '.'));
};

/**
 * Remove formatação de documentos
 */
export const unformatDocument = (document: string): string => {
  return document.replace(/\D/g, '');
};