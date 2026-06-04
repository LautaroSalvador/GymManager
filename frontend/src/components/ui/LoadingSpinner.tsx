import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-7 h-7 border-2',
  lg: 'w-10 h-10 border-[3px]',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => (
  <div
    role="status"
    aria-label="Cargando"
    className={`
      inline-block rounded-full
      border-neutral-200 border-t-primary-600
      animate-spin
      ${sizeClasses[size]}
      ${className}
    `}
  />
);
