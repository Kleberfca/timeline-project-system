// src/components/LoadingSpinner.tsx
/**
 * Componente de loading spinner reutilizável
 * Usa as cores da marca
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`inline-flex ${className}`}>
      <div className={`
        animate-spin rounded-full border-2 border-brand-lighter
        border-t-brand-blue ${sizeClasses[size]}
      `} />
    </div>
  );
};