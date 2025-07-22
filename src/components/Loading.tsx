// src/components/Loading.tsx
/**
 * Componente de Loading reutilizável
 * Diferentes tamanhos e estilos de loading
 */

import React from 'react';

interface LoadingProps {
  /**
   * Tamanho do loading
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Texto a ser exibido abaixo do spinner
   */
  text?: string;
  /**
   * Se deve ocupar a tela inteira
   * @default false
   */
  fullScreen?: boolean;
  /**
   * Se deve centralizar no container pai
   * @default true
   */
  center?: boolean;
  /**
   * Cor do spinner
   * @default 'blue'
   */
  color?: 'blue' | 'gray' | 'white';
  /**
   * Tipo de loading
   * @default 'spinner'
   */
  type?: 'spinner' | 'dots' | 'bars';
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  text,
  fullScreen = false,
  center = true,
  color = 'blue',
  type = 'spinner'
}) => {
  // Tamanhos do spinner
  const sizes = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  // Cores do spinner
  const colors = {
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    white: 'border-white'
  };

  // Tamanhos de texto
  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  /**
   * Renderiza o spinner padrão
   */
  const renderSpinner = () => (
    <div
      className={`
        animate-spin rounded-full border-b-2
        ${sizes[size]} ${colors[color]}
      `}
    />
  );

  /**
   * Renderiza loading com dots
   */
  const renderDots = () => (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`
            rounded-full bg-current animate-pulse
            ${size === 'small' ? 'h-2 w-2' : size === 'large' ? 'h-4 w-4' : 'h-3 w-3'}
            ${color === 'blue' ? 'text-blue-600' : color === 'white' ? 'text-white' : 'text-gray-600'}
          `}
          style={{
            animationDelay: `${i * 150}ms`
          }}
        />
      ))}
    </div>
  );

  /**
   * Renderiza loading com barras
   */
  const renderBars = () => (
    <div className="flex space-x-1">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`
            bg-current animate-pulse rounded
            ${size === 'small' ? 'h-4 w-1' : size === 'large' ? 'h-8 w-2' : 'h-6 w-1.5'}
            ${color === 'blue' ? 'text-blue-600' : color === 'white' ? 'text-white' : 'text-gray-600'}
          `}
          style={{
            animationDelay: `${i * 100}ms`,
            animationDuration: '0.8s'
          }}
        />
      ))}
    </div>
  );

  /**
   * Renderiza o tipo de loading apropriado
   */
  const renderLoadingType = () => {
    switch (type) {
      case 'dots':
        return renderDots();
      case 'bars':
        return renderBars();
      default:
        return renderSpinner();
    }
  };

  // Container classes
  const containerClasses = [
    'flex flex-col items-center justify-center',
    center && !fullScreen && 'mx-auto',
    fullScreen && 'fixed inset-0 bg-white bg-opacity-75 z-50'
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {renderLoadingType()}
      {text && (
        <p
          className={`
            mt-4 font-medium
            ${textSizes[size]}
            ${color === 'blue' ? 'text-blue-600' : color === 'white' ? 'text-white' : 'text-gray-600'}
          `}
        >
          {text}
        </p>
      )}
    </div>
  );
};

// Componente de loading inline para uso em botões
interface InlineLoadingProps {
  className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({ className = '' }) => (
  <svg
    className={`animate-spin h-4 w-4 ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);