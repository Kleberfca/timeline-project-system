// src/utils/validators.ts
/**
 * Funções de validação
 * Centraliza validações comuns utilizadas no sistema
 */

import { PATTERNS, FILE_SIZES, ALLOWED_FILE_TYPES } from './constants';

/**
 * Valida email
 */
export const isValidEmail = (email: string): boolean => {
  return PATTERNS.EMAIL.test(email.trim());
};

/**
 * Valida telefone brasileiro
 */
export const isValidPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length === 10 || cleanPhone.length === 11;
};

/**
 * Valida CNPJ
 */
export const isValidCNPJ = (cnpj: string): boolean => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  if (cleanCNPJ.length !== 14) return false;
  
  // Elimina CNPJs inválidos conhecidos
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;
  
  // Valida DVs
  let tamanho = cleanCNPJ.length - 2;
  let numeros = cleanCNPJ.substring(0, tamanho);
  const digitos = cleanCNPJ.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  tamanho = tamanho + 1;
  numeros = cleanCNPJ.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(1))) return false;
  
  return true;
};

/**
 * Valida CPF
 */
export const isValidCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  
  // Elimina CPFs inválidos conhecidos
  if (/^(\d)\1+$/.test(cleanCPF)) return false;
  
  // Valida 1º dígito
  let add = 0;
  for (let i = 0; i < 9; i++) {
    add += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(9))) return false;
  
  // Valida 2º dígito
  add = 0;
  for (let i = 0; i < 10; i++) {
    add += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};

/**
 * Valida CEP
 */
export const isValidCEP = (cep: string): boolean => {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.length === 8;
};

/**
 * Valida se é uma URL válida
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida tamanho de arquivo
 */
export const isValidFileSize = (size: number, maxSize: number = FILE_SIZES.MAX_FILE_SIZE): boolean => {
  return size <= maxSize;
};

/**
 * Valida tipo de arquivo
 */
export const isValidFileType = (filename: string, allowedTypes: readonly string[] = ALLOWED_FILE_TYPES.all): boolean => {
  const extension = filename.toLowerCase().substr(filename.lastIndexOf('.'));
  return allowedTypes.includes(extension);
};

/**
 * Valida data
 */
export const isValidDate = (date: string | Date): boolean => {
  const d = date instanceof Date ? date : new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

/**
 * Valida se data é futura
 */
export const isFutureDate = (date: string | Date): boolean => {
  if (!isValidDate(date)) return false;
  const d = date instanceof Date ? date : new Date(date);
  return d > new Date();
};

/**
 * Valida se data é passada
 */
export const isPastDate = (date: string | Date): boolean => {
  if (!isValidDate(date)) return false;
  const d = date instanceof Date ? date : new Date(date);
  return d < new Date();
};

/**
 * Valida range de datas
 */
export const isValidDateRange = (startDate: string | Date, endDate: string | Date): boolean => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return false;
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  return start <= end;
};

/**
 * Valida senha forte
 */
export const isStrongPassword = (password: string): boolean => {
  // Mínimo 8 caracteres, pelo menos 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

/**
 * Valida campo obrigatório
 */
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

/**
 * Valida comprimento mínimo
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength;
};

/**
 * Valida comprimento máximo
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.trim().length <= maxLength;
};

/**
 * Valida se é número
 */
export const isNumber = (value: any): boolean => {
  return !isNaN(value) && !isNaN(parseFloat(value));
};

/**
 * Valida se está dentro de um range numérico
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Validação customizada com mensagens
 */
export interface ValidationRule {
  validator: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Executa múltiplas validações
 */
export const validate = (value: any, rules: ValidationRule[]): ValidationResult => {
  const errors: string[] = [];
  
  for (const rule of rules) {
    if (!rule.validator(value)) {
      errors.push(rule.message);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validações de formulário predefinidas
 */
export const formValidations = {
  email: (value: string): ValidationResult => {
    return validate(value, [
      { validator: isRequired, message: 'Email é obrigatório' },
      { validator: isValidEmail, message: 'Email inválido' }
    ]);
  },
  
  password: (value: string): ValidationResult => {
    return validate(value, [
      { validator: isRequired, message: 'Senha é obrigatória' },
      { validator: (v) => hasMinLength(v, 8), message: 'Senha deve ter no mínimo 8 caracteres' },
      { validator: isStrongPassword, message: 'Senha deve conter maiúsculas, minúsculas, números e caracteres especiais' }
    ]);
  },
  
  phone: (value: string): ValidationResult => {
    return validate(value, [
      { validator: isRequired, message: 'Telefone é obrigatório' },
      { validator: isValidPhone, message: 'Telefone inválido' }
    ]);
  },
  
  cpf: (value: string): ValidationResult => {
    return validate(value, [
      { validator: isRequired, message: 'CPF é obrigatório' },
      { validator: isValidCPF, message: 'CPF inválido' }
    ]);
  },
  
  cnpj: (value: string): ValidationResult => {
    return validate(value, [
      { validator: isRequired, message: 'CNPJ é obrigatório' },
      { validator: isValidCNPJ, message: 'CNPJ inválido' }
    ]);
  }
};