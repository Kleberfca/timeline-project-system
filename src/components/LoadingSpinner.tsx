// src/components/LoadingSpinner.tsx
/**
 * Componente de loading spinner
 * Implementação SIMPLES e reutilizável
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'brand-blue',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3'
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div
        className={`
          animate-spin rounded-full
          ${sizeClasses[size]}
          border-t-transparent
          border-${color}
        `}
        role="status"
        aria-label="Carregando"
      >
        <span className="sr-only">Carregando...</span>
      </div>
    </div>
  );
};